import { BaseSchema } from '@adonisjs/lucid/schema'
import { ORDER_STATUSES, OrderStatus } from '#enums/order_status'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('client_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('clients')
        .onDelete('RESTRICT')
      table.enum('status', ORDER_STATUSES).notNullable().defaultTo(OrderStatus.PENDING)
      table.decimal('total', 10, 2).unsigned().notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
