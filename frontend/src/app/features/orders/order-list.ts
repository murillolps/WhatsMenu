import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { extractErrorMessage } from '../../core/api';
import { ORDER_STATUS_LABELS, Order } from '../../core/models';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-list',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-list.html',
})
export class OrderList implements OnInit {
  private readonly orderService = inject(OrderService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly error = signal<string | null>(null);
  protected readonly statusLabels = ORDER_STATUS_LABELS;

  ngOnInit(): void {
    this.orderService.list().subscribe({
      next: (orders) => this.orders.set(orders),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }
}
