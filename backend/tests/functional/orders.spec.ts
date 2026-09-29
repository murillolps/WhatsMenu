import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import Client from '#models/client'
import Product from '#models/product'
import Order from '#models/order'
import { OrderStatus } from '#enums/order_status'

async function seed() {
  const client = await Client.create({ name: 'Maria', phone: '11999990000' })
  const burger = await Product.create({ name: 'Hambúrguer', price: 25.9, isActive: true })
  const soda = await Product.create({ name: 'Refrigerante', price: 0.1, isActive: true })
  const inactive = await Product.create({ name: 'Descontinuado', price: 10, isActive: false })
  return { client, burger, soda, inactive }
}

test.group('Orders | criação', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('cria pedido calculando o total no backend', async ({ client: http, assert }) => {
    const { client, burger, soda } = await seed()

    const response = await http.post('/orders').json({
      clientId: client.id,
      items: [
        { productId: burger.id, quantity: 2 },
        { productId: soda.id, quantity: 3 },
      ],
      total: 1, // ignorado: o total nunca vem do frontend
    })

    response.assertStatus(201)
    assert.equal(response.body().status, OrderStatus.PENDING)
    assert.equal(response.body().total, 52.1) // 2 × 25.90 + 3 × 0.10, sem erro de ponto flutuante
    assert.lengthOf(response.body().items, 2)
  })

  test('exige cliente', async ({ client: http }) => {
    const { burger } = await seed()

    const response = await http
      .post('/orders')
      .json({ items: [{ productId: burger.id, quantity: 1 }] })

    response.assertStatus(422)
  })

  test('rejeita cliente inexistente', async ({ client: http }) => {
    const { burger } = await seed()

    const response = await http
      .post('/orders')
      .json({ clientId: 9999, items: [{ productId: burger.id, quantity: 1 }] })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ message: 'Cliente não encontrado' }] })
  })

  test('exige pelo menos um item', async ({ client: http }) => {
    const { client } = await seed()

    const response = await http.post('/orders').json({ clientId: client.id, items: [] })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ message: 'O pedido deve ter pelo menos um item' }] })
  })

  test('exige quantidade mínima 1', async ({ client: http }) => {
    const { client, burger } = await seed()

    const response = await http
      .post('/orders')
      .json({ clientId: client.id, items: [{ productId: burger.id, quantity: 0 }] })

    response.assertStatus(422)
    response.assertBodyContains({ errors: [{ message: 'A quantidade mínima por item é 1' }] })
  })

  test('rejeita produto inativo em novo pedido', async ({ client: http, assert }) => {
    const { client, inactive } = await seed()

    const response = await http
      .post('/orders')
      .json({ clientId: client.id, items: [{ productId: inactive.id, quantity: 1 }] })

    response.assertStatus(422)
    assert.include(response.body().errors[0].message, 'Descontinuado')
    assert.lengthOf(await Order.all(), 0)
  })

  test('pedido antigo continua válido após desativar o produto', async ({ client: http }) => {
    const { client, burger } = await seed()
    const created = await http
      .post('/orders')
      .json({ clientId: client.id, items: [{ productId: burger.id, quantity: 1 }] })

    await http.patch(`/products/${burger.id}/deactivate`)
    const response = await http.get(`/orders/${created.body().id}`)

    response.assertStatus(200)
    response.assertBodyContains({ total: 25.9, items: [{ productId: burger.id }] })
  })

  test('mantém o preço histórico mesmo se o produto mudar de preço', async ({ client: http }) => {
    const { client, burger } = await seed()
    const created = await http
      .post('/orders')
      .json({ clientId: client.id, items: [{ productId: burger.id, quantity: 2 }] })

    await http.put(`/products/${burger.id}`).json({ name: burger.name, price: 99.99 })
    const response = await http.get(`/orders/${created.body().id}`)

    response.assertBodyContains({ total: 51.8, items: [{ unitPrice: 25.9, total: 51.8 }] })
  })

  test('agrupa o mesmo produto enviado em linhas diferentes', async ({ client: http }) => {
    const { client, burger } = await seed()

    const response = await http.post('/orders').json({
      clientId: client.id,
      items: [
        { productId: burger.id, quantity: 1 },
        { productId: burger.id, quantity: 2 },
      ],
    })

    response.assertStatus(201)
    response.assertBodyContains({ total: 77.7, items: [{ quantity: 3 }] })
  })

  test('quote calcula o total sem criar pedido', async ({ client: http, assert }) => {
    const { burger } = await seed()

    const response = await http
      .post('/orders/quote')
      .json({ items: [{ productId: burger.id, quantity: 3 }] })

    response.assertStatus(200)
    response.assertBodyContains({ total: 77.7 })
    assert.lengthOf(await Order.all(), 0)
  })
})

test.group('Orders | máquina de estados', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function createOrder() {
    const { client, burger } = await seed()
    const order = await Order.create({
      clientId: client.id,
      status: OrderStatus.PENDING,
      total: 25.9,
    })
    await order
      .related('items')
      .create({ productId: burger.id, quantity: 1, unitPrice: 25.9, total: 25.9 })
    return order
  }

  test('segue o fluxo Pendente → Em preparação → Pronto → Finalizado', async ({ client: http }) => {
    const order = await createOrder()

    for (const status of [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.FINISHED]) {
      const response = await http.patch(`/orders/${order.id}/status`).json({ status })
      response.assertStatus(200)
      response.assertBodyContains({ status })
    }
  })

  test('não permite pular etapas', async ({ client: http }) => {
    const order = await createOrder()

    const response = await http
      .patch(`/orders/${order.id}/status`)
      .json({ status: OrderStatus.FINISHED })

    response.assertStatus(422)
  })

  test('não permite voltar etapas', async ({ client: http }) => {
    const order = await createOrder()
    await order.merge({ status: OrderStatus.READY }).save()

    const response = await http
      .patch(`/orders/${order.id}/status`)
      .json({ status: OrderStatus.PENDING })

    response.assertStatus(422)
  })

  test('Cancelado é estado final', async ({ client: http }) => {
    const order = await createOrder()
    await http.patch(`/orders/${order.id}/status`).json({ status: OrderStatus.CANCELED })

    for (const status of [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.FINISHED]) {
      const response = await http.patch(`/orders/${order.id}/status`).json({ status })
      response.assertStatus(422)
      response.assertBodyContains({
        errors: [{ message: 'Pedido cancelado não pode mudar de status' }],
      })
    }
  })

  test('rejeita status desconhecido', async ({ client: http }) => {
    const order = await createOrder()

    const response = await http.patch(`/orders/${order.id}/status`).json({ status: 'delivered' })

    response.assertStatus(422)
  })

  test('expõe as próximas transições permitidas', async ({ client: http }) => {
    const order = await createOrder()

    const response = await http.get(`/orders/${order.id}`)

    response.assertBodyContains({ nextStatuses: [OrderStatus.PREPARING, OrderStatus.CANCELED] })
  })
})
