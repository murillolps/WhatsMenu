import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from '../api';
import { Product, ProductInput } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/products`;

  list() {
    return this.http.get<Product[]>(this.url);
  }

  get(id: number) {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  create(input: ProductInput) {
    return this.http.post<Product>(this.url, input);
  }

  update(id: number, input: ProductInput) {
    return this.http.put<Product>(`${this.url}/${id}`, input);
  }

  activate(id: number) {
    return this.http.patch<Product>(`${this.url}/${id}/activate`, {});
  }

  deactivate(id: number) {
    return this.http.patch<Product>(`${this.url}/${id}/deactivate`, {});
  }
}
