import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import OrderService from '#services/order_service'
import {
  createOrderValidator,
  quoteOrderValidator,
  updateOrderStatusValidator,
} from '#validators/order'

@inject()
export default class OrdersController {
  constructor(protected orderService: OrderService) {}

  async index() {
    return Order.query().preload('client').orderBy('id', 'desc')
  }

  async show({ params }: HttpContext) {
    return this.findWithDetails(params.id)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createOrderValidator)
    const order = await this.orderService.create(payload)
    return response.created(await this.findWithDetails(order.id))
  }

  async quote({ request }: HttpContext) {
    const { items } = await request.validateUsing(quoteOrderValidator)
    const quote = await this.orderService.quote(items)

    return {
      items: quote.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      total: quote.total,
    }
  }

  async updateStatus({ params, request }: HttpContext) {
    const order = await Order.findOrFail(params.id)
    const { status } = await request.validateUsing(updateOrderStatusValidator)
    await this.orderService.changeStatus(order, status)
    return this.findWithDetails(order.id)
  }

  private findWithDetails(id: number) {
    return Order.query()
      .where('id', id)
      .preload('client')
      .preload('items', (items) => items.preload('product'))
      .firstOrFail()
  }
}
