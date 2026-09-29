export enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  FINISHED = 'finished',
  CANCELED = 'canceled',
}

export const ORDER_STATUSES = Object.values(OrderStatus)

const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELED],
  [OrderStatus.READY]: [OrderStatus.FINISHED, OrderStatus.CANCELED],
  [OrderStatus.FINISHED]: [],
  [OrderStatus.CANCELED]: [],
}

export function nextStatusesOf(status: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[status]
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to)
}
