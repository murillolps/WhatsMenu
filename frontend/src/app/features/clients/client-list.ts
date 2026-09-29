import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { extractErrorMessage } from '../../core/api';
import { Client } from '../../core/models';
import { ClientService } from '../../core/services/client.service';

@Component({
  selector: 'app-client-list',
  imports: [RouterLink],
  templateUrl: './client-list.html',
})
export class ClientList implements OnInit {
  private readonly clientService = inject(ClientService);

  protected readonly clients = signal<Client[]>([]);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.clientService.list().subscribe({
      next: (clients) => this.clients.set(clients),
      error: (err) => this.error.set(extractErrorMessage(err)),
    });
  }
}
