import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/Order.service';
import { AuthService } from '../../services/Auth.service';
import { Order } from '../../models/order.model';

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
  allOrders:     Order[] = [];
  pendingOrders: Order[] = [];
  loading = true;
  error   = '';
  success = '';
  statuses = STATUS_OPTIONS;

  constructor(
    private orderService: OrderService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.ngZone.run(() => {
          console.log('all orders:', orders);
          this.allOrders = orders;
          // Admin view shows only non-delivered orders
          this.pendingOrders = orders.filter(o => o.status !== 'Delivered')
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

  changeStatus(order: Order, newStatus: string) {
    const adminId = this.auth.currentUserValue!.id;
    this.orderService.updateStatus(order.orderId!, newStatus, adminId).subscribe({
      next: () => {
        order.status = newStatus;
        this.success = `Order #${order.orderId} updated to "${newStatus}".`;
        if (newStatus === 'Delivered') {
          this.pendingOrders = this.pendingOrders.filter(o => o.orderId !== order.orderId);
        }
      },
      error: () => { this.error = 'Failed to update order status.'; }
    });
  }

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending':   return 'status-pending';
      case 'shipped':   return 'status-shipped';
      case 'delivered': return 'status-delivered';
      default: return '';
    }
  }
}