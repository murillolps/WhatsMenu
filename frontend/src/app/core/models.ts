export interface Client {
  id: number;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export type ClientInput = Pick<Client, 'name' | 'phone'>;

export interface Product {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Pick<Product, 'name' | 'price'>;

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'finished' | 'canceled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Em preparação',
  ready: 'Pronto',
  finished: 'Finalizado',
  canceled: 'Cancelado',
};

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  total: number;
  product: Product;
}

export interface Order {
  id: number;
  clientId: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  client: Client;
  items?: OrderItem[];
  nextStatuses: OrderStatus[];
}

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

export interface CreateOrderInput {
  clientId: number;
  items: OrderItemInput[];
}

export interface OrderQuote {
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  total: number;
}
