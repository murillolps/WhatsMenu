import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { extractErrorMessage } from '../../core/api';
import { Product } from '../../core/models';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-list.html',
})
export class ProductList implements OnInit {
  private readonly productService = inject(ProductService);

  protected readonly products = signal<Product[]>([]);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.productService.list().subscribe({
      next: (products) => this.products.set(products),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }

  protected toggleActive(product: Product): void {
    const request = product.isActive
      ? this.productService.deactivate(product.id)
      : this.productService.activate(product.id);

    request.subscribe({
      next: (updated) =>
        this.products.update((products) =>
          products.map((p) => (p.id === updated.id ? updated : p)),
        ),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }
}
