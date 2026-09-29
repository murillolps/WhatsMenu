import { Routes } from '@angular/router';
import { ClientList } from './features/clients/client-list';
import { ClientForm } from './features/clients/client-form';
import { ProductList } from './features/products/product-list';
import { ProductForm } from './features/products/product-form';
import { OrderList } from './features/orders/order-list';
import { OrderForm } from './features/orders/order-form';
import { OrderDetail } from './features/orders/order-detail';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },

  { path: 'clients', component: ClientList, title: 'Clientes' },
  { path: 'clients/new', component: ClientForm, title: 'Novo cliente' },
  { path: 'clients/:id/edit', component: ClientForm, title: 'Editar cliente' },

  { path: 'products', component: ProductList, title: 'Produtos' },
  { path: 'products/new', component: ProductForm, title: 'Novo produto' },
  { path: 'products/:id/edit', component: ProductForm, title: 'Editar produto' },

  { path: 'orders', component: OrderList, title: 'Pedidos' },
  { path: 'orders/new', component: OrderForm, title: 'Novo pedido' },
  { path: 'orders/:id', component: OrderDetail, title: 'Pedido' },

  { path: '**', redirectTo: 'orders' },
];
