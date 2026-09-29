import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../api';
import { CreateOrderInput, Order, OrderItemInput, OrderQuote, OrderStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/orders`;

  list() {
    return this.http.get<Order[]>(this.url);
  }

  get(id: number) {
    return this.http.get<Order>(`${this.url}/${id}`);
  }

  /** Pede ao backend o cálculo do total sem criar o pedido. */
  quote(items: OrderItemInput[]) {
    return this.http.post<OrderQuote>(`${this.url}/quote`, { items });
  }

  create(input: CreateOrderInput) {
    return this.http.post<Order>(this.url, input);
  }

  updateStatus(id: number, status: OrderStatus) {
    return this.http.patch<Order>(`${this.url}/${id}/status`, { status });
  }
}
