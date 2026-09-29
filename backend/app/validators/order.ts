import vine from '@vinejs/vine'
import { OrderStatus } from '#enums/order_status'

const orderItemsSchema = vine
  .array(
    vine.object({
      productId: vine.number().withoutDecimals().positive(),
      quantity: vine.number().withoutDecimals().min(1),
    })
  )
  .minLength(1)

export const createOrderValidator = vine.compile(
  vine.object({
    clientId: vine.number().withoutDecimals().positive(),
    items: orderItemsSchema,
  })
)

export const quoteOrderValidator = vine.compile(
  vine.object({
    items: orderItemsSchema,
  })
)

export const updateOrderStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(OrderStatus),
  })
)
