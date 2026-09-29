import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('Clients', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('cadastra, edita e lista clientes', async ({ client: http, assert }) => {
    const created = await http.post('/clients').json({ name: 'João', phone: '(11) 98888-7777' })
    created.assertStatus(201)

    const updated = await http
      .put(`/clients/${created.body().id}`)
      .json({ name: 'João Silva', phone: '(11) 98888-7777' })
    updated.assertBodyContains({ name: 'João Silva' })

    const list = await http.get('/clients')
    assert.lengthOf(list.body(), 1)
  })

  test('valida campos obrigatórios', async ({ client: http }) => {
    const response = await http.post('/clients').json({ name: '' })

    response.assertStatus(422)
  })

  test('retorna 404 para cliente inexistente', async ({ client: http }) => {
    const response = await http.get('/clients/9999')

    response.assertStatus(404)
  })
})

test.group('Products', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('cadastra produto ativo por padrão', async ({ client: http }) => {
    const response = await http.post('/products').json({ name: 'Pizza', price: 45.5 })

    response.assertStatus(201)
    response.assertBodyContains({ name: 'Pizza', price: 45.5, isActive: true })
  })

  test('ativa e desativa produto', async ({ client: http }) => {
    const created = await http.post('/products').json({ name: 'Pizza', price: 45.5 })
    const id = created.body().id

    const deactivated = await http.patch(`/products/${id}/deactivate`)
    deactivated.assertBodyContains({ isActive: false })

    const activated = await http.patch(`/products/${id}/activate`)
    activated.assertBodyContains({ isActive: true })
  })

  test('rejeita preço inválido', async ({ client: http }) => {
    const zero = await http.post('/products').json({ name: 'Pizza', price: 0 })
    zero.assertStatus(422)

    const tooManyDecimals = await http.post('/products').json({ name: 'Pizza', price: 1.999 })
    tooManyDecimals.assertStatus(422)
  })
})
