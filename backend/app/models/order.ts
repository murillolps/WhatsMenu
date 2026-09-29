import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Client from '#models/client'
import OrderItem from '#models/order_item'
import { decimalColumn } from '#utils/money'
import { OrderStatus, nextStatusesOf } from '#enums/order_status'

export default class Order extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare clientId: number

  @column()
  declare status: OrderStatus

  @column(decimalColumn)
  declare total: number

  @belongsTo(() => Client)
  declare client: BelongsTo<typeof Client>

  @hasMany(() => OrderItem)
  declare items: HasMany<typeof OrderItem>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime


  @computed()
  get nextStatuses(): OrderStatus[] {
    return nextStatusesOf(this.status)
  }
}
