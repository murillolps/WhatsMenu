import type { HttpContext } from '@adonisjs/core/http'
import Client from '#models/client'
import { clientValidator } from '#validators/client'

export default class ClientsController {
  async index() {
    return Client.query().orderBy('name')
  }

  async show({ params }: HttpContext) {
    return Client.findOrFail(params.id)
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(clientValidator)
    const client = await Client.create(payload)
    return response.created(client)
  }

  async update({ params, request }: HttpContext) {
    const client = await Client.findOrFail(params.id)
    const payload = await request.validateUsing(clientValidator)
    return client.merge(payload).save()
  }
}
