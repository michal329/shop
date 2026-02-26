import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/Cart.service';
import { CartItem } from '../../models/cart-item.model';
import { OrderService } from '../../services/Order.service';
import { AuthService } from '../../services/Auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent implements OnInit {
  cartItems:  CartItem[] = [];
  totalPrice = 0;
  totalItems = 0;
  checkoutLoading = false;
  checkoutError   = '';

  constructor(
    private cartService:  CartService,
    private orderService: OrderService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems  = items;
      this.totalPrice = this.cartService.getTotalPrice();
      this.totalItems = this.cartService.getTotalItems();
    });
  }

  increase(item: CartItem): void {
    const max = item.product.quantity;
    const maxAvailable = (max == null || max === 0) ? Infinity : max;
    if (item.quantity < maxAvailable) {
      this.cartService.updateQuantity(item.product.productId, item.quantity + 1);
    }
  }

  decrease(productId: number, currentQty: number): void {
    this.cartService.updateQuantity(productId, currentQty - 1);
  }

  remove(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }

  checkout(): void {
    if (!this.auth.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartItems.length === 0) return;

    const user = this.auth.currentUserValue!;
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const order = {
      orderDate:  today,
      orderSum:   this.totalPrice,
      userId:     user.id,
      status:     'Pending',
      orderItems: this.cartItems.map(item => ({
        orderId:   0,
        productId: item.product.productId,
        quantity:  item.quantity
      }))
    };

    this.checkoutLoading = true;
    this.checkoutError   = '';

    this.orderService.createOrder(order).subscribe({
      next: () => {
        this.cartService.clearCart();
        this.checkoutLoading = false;
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.checkoutError   = 'Checkout failed. Please try again.';
        this.checkoutLoading = false;
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  viewDetails(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  isAtMax(item: CartItem): boolean {
    const max = item.product.quantity;
    const maxAvailable = (max == null || max === 0) ? Infinity : max;
    return item.quantity >= maxAvailable;
  }
}