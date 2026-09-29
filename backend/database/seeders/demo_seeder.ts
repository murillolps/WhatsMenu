import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Client from '#models/client'
import Product from '#models/product'
import OrderService from '#services/order_service'
import { OrderStatus } from '#enums/order_status'

/**
 * Dados de demonstração. Os pedidos são criados pelo OrderService,
 * passando pelas mesmas regras de negócio da API.
 *
 * Uso: node ace migration:fresh --seed
 */
export default class DemoSeeder extends BaseSeeder {
  static environment = ['development']

  async run() {
    const orderService = new OrderService()

    const [ana, bruno, carla] = await Client.createMany([
      { name: 'Ana Souza', phone: '(11) 91234-5678' },
      { name: 'Bruno Lima', phone: '(21) 99876-5432' },
      { name: 'Carla Mendes', phone: '(31) 98765-4321' },
    ])

    const [burger, fries, soda, juice, milkshake] = await Product.createMany([
      { name: 'X-Burger', price: 29.9, isActive: true },
      { name: 'Batata frita', price: 14.5, isActive: true },
      { name: 'Refrigerante lata', price: 6.0, isActive: true },
      { name: 'Suco natural', price: 9.9, isActive: true },
      { name: 'Milkshake', price: 18.0, isActive: true },
    ])

    const finished = await orderService.create({
      clientId: ana.id,
      items: [
        { productId: burger.id, quantity: 2 },
        { productId: fries.id, quantity: 1 },
        { productId: soda.id, quantity: 2 },
      ],
    })
    for (const status of [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.FINISHED]) {
      await orderService.changeStatus(finished, status)
    }

    const preparing = await orderService.create({
      clientId: bruno.id,
      items: [
        { productId: milkshake.id, quantity: 1 },
        { productId: fries.id, quantity: 2 },
      ],
    })
    await orderService.changeStatus(preparing, OrderStatus.PREPARING)

    const canceled = await orderService.create({
      clientId: carla.id,
      items: [{ productId: juice.id, quantity: 3 }],
    })
    await orderService.changeStatus(canceled, OrderStatus.CANCELED)

    await orderService.create({
      clientId: ana.id,
      items: [
        { productId: burger.id, quantity: 1 },
        { productId: milkshake.id, quantity: 1 },
      ],
    })

    // Depois dos pedidos: demonstra o preço histórico (os pedidos acima
    // mantêm R$ 29,90) e que desativar um produto não invalida pedidos antigos.
    await burger.merge({ price: 32.9 }).save()
    await milkshake.merge({ isActive: false }).save()
  }
}
