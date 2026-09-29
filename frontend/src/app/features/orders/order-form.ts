import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { extractErrorMessage } from '../../core/api';
import { Client, OrderItemInput, OrderQuote, Product } from '../../core/models';
import { ClientService } from '../../core/services/client.service';
import { OrderService } from '../../core/services/order.service';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-order-form',
  imports: [FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './order-form.html',
})
export class OrderForm implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  protected readonly clients = signal<Client[]>([]);
  /** Apenas produtos ativos podem entrar em novos pedidos. */
  protected readonly activeProducts = signal<Product[]>([]);

  protected readonly clientId = signal<number | null>(null);
  protected readonly productToAdd = signal<number | null>(null);
  protected readonly quantityToAdd = signal(1);

  protected readonly items = signal<OrderItemInput[]>([]);
  /** Valores calculados pelo backend; o frontend nunca soma preços. */
  protected readonly quote = signal<OrderQuote | null>(null);
  protected readonly quoting = signal(false);

  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected readonly canSubmit = computed(
    () =>
      this.clientId() !== null &&
      this.items().length > 0 &&
      this.quote() !== null &&
      !this.quoting() &&
      !this.saving(),
  );

  private readonly quoteRequests = new Subject<OrderItemInput[]>();

  constructor() {
    this.quoteRequests
      .pipe(
        tap(() => this.quoting.set(true)),
        switchMap((items) =>
          items.length === 0
            ? of(null)
            : this.orderService.quote(items).pipe(
                catchError((err) => {
                  this.error.set(extractErrorMessage(err));
                  return of(null);
                }),
              ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((quote) => {
        this.quote.set(quote);
        this.quoting.set(false);
      });
  }

  ngOnInit(): void {
    this.clientService.list().subscribe({
      next: (clients) => this.clients.set(clients),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
    this.productService.list().subscribe({
      next: (products) => this.activeProducts.set(products.filter((p) => p.isActive)),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }

  protected addItem(): void {
    const productId = this.productToAdd();
    const quantity = this.quantityToAdd();
    if (productId === null || !Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    this.items.update((items) =>
      items.some((item) => item.productId === productId)
        ? items.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
          )
        : [...items, { productId, quantity }],
    );
    this.productToAdd.set(null);
    this.quantityToAdd.set(1);
    this.refreshQuote();
  }

  protected changeQuantity(productId: number, quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return;
    }
    this.items.update((items) =>
      items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
    this.refreshQuote();
  }

  protected removeItem(productId: number): void {
    this.items.update((items) => items.filter((item) => item.productId !== productId));
    this.refreshQuote();
  }

  protected quotedItem(productId: number) {
    return this.quote()?.items.find((item) => item.productId === productId);
  }

  protected productName(productId: number): string {
    return this.activeProducts().find((p) => p.id === productId)?.name ?? `#${productId}`;
  }

  protected submit(): void {
    const clientId = this.clientId();
    if (clientId === null || !this.canSubmit()) {
      return;
    }

    this.saving.set(true);
    this.orderService.create({ clientId, items: this.items() }).subscribe({
      next: (order) => this.router.navigate(['/orders', order.id]),
      error: (err) => {
        this.error.set(extractErrorMessage(err));
        this.saving.set(false);
      },
    });
  }

  private refreshQuote(): void {
    this.error.set(null);
    this.quoteRequests.next(this.items());
  }
}
