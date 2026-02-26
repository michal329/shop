import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = `${environment.apiUrl}/Orders`;

  constructor(private http: HttpClient) {}

  // GET /api/Orders/{id}
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  // GET /api/Orders  → all orders (admin)
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // POST /api/Orders
  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  // PUT /api/Orders/{id}/status?userId={userId}
  updateStatus(orderId: number, status: string, userId: number): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${orderId}/status?userId=${userId}`,
      JSON.stringify(status),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}