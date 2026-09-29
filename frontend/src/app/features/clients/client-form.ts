import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { extractErrorMessage } from '../../core/api';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.html',
})
export class ClientForm implements OnInit {
  private readonly clientService = inject(ClientService);
  private readonly router = inject(Router);

  /** Parâmetro de rota `:id` — ausente quando é um novo cliente. */
  readonly id = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9()+\-\s]{8,20}$/)]],
  });

  protected readonly error = signal<string | null>(null);
  protected readonly saving = signal(false);

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.clientService.get(Number(id)).subscribe({
        next: (client) => this.form.patchValue(client),
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
      ? this.clientService.update(Number(id), input)
      : this.clientService.create(input);

    this.saving.set(true);
    request.subscribe({
      next: () => this.router.navigate(['/clients']),
      error: (err) => {
        this.error.set(extractErrorMessage(err));
        this.saving.set(false);
      },
    });
  }
}
