import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import { productValidator } from '#validators/product'

export default class ProductsController {
  async index() {
    return Product.query().orderBy('name')
  }

  async show({ params }: HttpContext) {
    return Product.findOrFail(params.id)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(productValidator)
    const product = await Product.create({ ...payload, isActive: true })
    return response.created(product)
  }

  /**
   * Alterar o preço aqui não afeta pedidos já criados:
   * os itens guardam o preço histórico.
   */
  async update({ params, request }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    const payload = await request.validateUsing(productValidator)
    return product.merge(payload).save()
  }

  async activate({ params }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    return product.merge({ isActive: true }).save()
  }

  async deactivate({ params }: HttpContext) {
    const product = await Product.findOrFail(params.id)
    return product.merge({ isActive: false }).save()
  }
}
