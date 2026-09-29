import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { extractErrorMessage } from '../../core/api';
import { ORDER_STATUS_LABELS, Order, OrderStatus } from '../../core/models';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.html',
})
export class OrderDetail implements OnInit {
  private readonly orderService = inject(OrderService);

  /** Parâmetro de rota `:id`. */
  readonly id = input.required<string>();

  protected readonly order = signal<Order | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly updating = signal(false);
  protected readonly statusLabels = ORDER_STATUS_LABELS;

  ngOnInit(): void {
    this.orderService.get(Number(this.id())).subscribe({
      next: (order) => this.order.set(order),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }

  /**
   * As opções exibidas vêm de `nextStatuses`, calculado pelo backend a
   * partir da máquina de estados; o backend valida novamente a transição.
   */
  protected changeStatus(status: OrderStatus): void {
    const order = this.order();
    if (!order) {
      return;
    }
    if (status === 'canceled' && !confirm('Cancelar o pedido? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.error.set(null);
    this.updating.set(true);
    this.orderService.updateStatus(order.id, status).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.updating.set(false);
      },
      error: (err) => {
        this.error.set(extractErrorMessage(err));
        this.updating.set(false);
      },
    });
  }
}
