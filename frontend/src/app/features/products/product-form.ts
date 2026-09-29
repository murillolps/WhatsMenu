import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { extractErrorMessage } from '../../core/api';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);

  /** Parâmetro de rota `:id` — ausente quando é um novo produto. */
  readonly id = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
  });

  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.productService.get(Number(id)).subscribe({
        next: (product) => this.form.patchValue(product),
        error: (err) => this.error.set(extractErrorMessage(err)),
      });
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.id();
    const input = this.form.getRawValue();
    const request = id
      ? this.productService.update(Number(id), input)
      : this.productService.create(input);

    this.saving.set(true);
    request.subscribe({
      next: () => this.router.navigate(['/products']),
      error: (err) => {
        this.error.set(extractErrorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
