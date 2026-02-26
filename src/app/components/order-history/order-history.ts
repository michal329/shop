import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/Order.service';
import { AuthService } from '../../services/Auth.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css'
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error   = '';

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
      next: (all) => {
        this.ngZone.run(() => {
          const userId = this.auth.currentUserValue?.id ?? (this.auth.currentUserValue as any)?.userId;
          this.orders  = all.filter(o => o.userId === userId)
                            .sort((a, b) => b.orderId! - a.orderId!);
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.error   = 'Failed to load orders.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  // Customer can mark an order as "Delivered" once it arrives
  markDelivered(order: Order) {
    const userId = this.auth.currentUserValue!.id;
    this.orderService.updateStatus(order.orderId!, 'Delivered', userId).subscribe({
      next: () => order.status = 'Delivered',
      error: () => alert('Could not update order status.')
    });
  }

  canMarkDelivered(order: Order): boolean {
    return order.status === 'Shipped';
  }

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':   return 'status-pending';
      case 'shipped':   return 'status-shipped';
      case 'delivered': return 'status-delivered';
      default:          return '';
    }
  }
}