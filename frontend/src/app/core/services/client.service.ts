import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../api';
import { Client, ClientInput } from '../models';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/clients`;

  list() {
    return this.http.get<Client[]>(this.url);
  }

  get(id: number) {
    return this.http.get<Client>(`${this.url}/${id}`);
  }

  create(input: ClientInput) {
    return this.http.post<Client>(this.url, input);
  }

  update(id: number, input: ClientInput) {
    return this.http.put<Client>(`${this.url}/${id}`, input);
  }
}
