import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Client from '#models/client'
import Order from '#models/order'
import Product from '#models/product'
import BusinessRuleException from '#exceptions/business_rule_exception'
import { OrderStatus, canTransition } from '#enums/order_status'
import { fromCents, toCents } from '#utils/money'

export interface OrderItemInput {
  productId: number
  quantity: number
}

export interface CreateOrderInput {
  clientId: number
  items: OrderItemInput[]
}

export interface PricedItem {
  product: Product
  quantity: number
  unitPrice: number
  total: number
}

export interface OrderQuote {
  items: PricedItem[]
  total: number
}

export default class OrderService {
  /**
   * Calcula itens e total sem persistir nada. Usado pela tela de novo
   * pedido para exibir o valor total calculado pelo backend.
   */
  async quote(items: OrderItemInput[]): Promise<OrderQuote> {
    return this.priceItems(items)
  }

  async create({ clientId, items }: CreateOrderInput): Promise<Order> {
    return db.transaction(async (trx) => {
      const client = await Client.find(clientId, { client: trx })
      if (!client) {
        throw new BusinessRuleException('Cliente não encontrado')
      }

      const quote = await this.priceItems(items, trx)

      const order = await Order.create(
        { clientId: client.id, status: OrderStatus.PENDING, total: quote.total },
        { client: trx }
      )

      await order.related('items').createMany(
        quote.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        }))
      )

      return order
    })
  }

  async changeStatus(order: Order, newStatus: OrderStatus): Promise<Order> {
    if (order.status === OrderStatus.CANCELED) {
      throw new BusinessRuleException('Pedido cancelado não pode mudar de status')
    }

    if (!canTransition(order.status, newStatus)) {
      throw new BusinessRuleException(
        `Transição de status inválida: ${order.status} → ${newStatus}`
      )
    }

    order.status = newStatus
    return order.save()
  }

  /**
   * Busca os produtos, valida que existem e estão ativos, e copia o preço
   * atual de cada produto para o item (preço histórico). O total é sempre
   * calculado aqui, em centavos, nunca recebido do cliente.
   */
  private async priceItems(
    items: OrderItemInput[],
    trx?: TransactionClientContract
  ): Promise<OrderQuote> {
    if (items.length === 0) {
      throw new BusinessRuleException('O pedido deve ter pelo menos um item')
    }

    const quantityByProductId = this.mergeQuantitiesByProduct(items)
    const productIds = [...quantityByProductId.keys()]

    const products = await Product.query({ client: trx }).whereIn('id', productIds)

    const missingIds = productIds.filter((id) => !products.some((product) => product.id === id))
    if (missingIds.length > 0) {
      throw new BusinessRuleException(`Produto(s) não encontrado(s): ${missingIds.join(', ')}`)
    }

    const inactiveProducts = products.filter((product) => !product.isActive)
    if (inactiveProducts.length > 0) {
      const names = inactiveProducts.map((product) => product.name).join(', ')
      throw new BusinessRuleException(
        `Produto(s) inativo(s) não podem ser adicionados ao pedido: ${names}`
      )
    }

    let totalCents = 0
    const pricedItems = productIds.map((productId) => {
      const product = products.find(({ id }) => id === productId)!
      const quantity = quantityByProductId.get(productId)!
      const itemTotalCents = toCents(product.price) * quantity
      totalCents += itemTotalCents

      return {
        product,
        quantity,
        unitPrice: product.price,
        total: fromCents(itemTotalCents),
      }
    })

    return { items: pricedItems, total: fromCents(totalCents) }
  }

  /**
   * O mesmo produto enviado em mais de uma linha vira um único item
   * com as quantidades somadas.
   */
  private mergeQuantitiesByProduct(items: OrderItemInput[]): Map<number, number> {
    const quantities = new Map<number, number>()
    for (const { productId, quantity } of items) {
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new BusinessRuleException('A quantidade mínima por item é 1')
      }
      quantities.set(productId, (quantities.get(productId) ?? 0) + quantity)
    }
    return quantities
  }
}
