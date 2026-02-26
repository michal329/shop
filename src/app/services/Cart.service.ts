import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

const CART_KEY = 'shop_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private isBrowser: boolean;

  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadFromStorage();
  }

  getItems(): CartItem[] { return this.items; }

  getTotalItems(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity, 0
    );
  }

  // Returns how many units of a product are already in the cart
  getQuantityInCart(productId: number): number {
    return this.items.find(i => i.product.productId === productId)?.quantity ?? 0;
  }

  addToCart(product: Product, quantity: number = 1): void {
    const existing = this.items.find(i => i.product.productId === product.productId);
    if (existing) {
      // Clamp to available stock
      const newQty = existing.quantity + quantity;
      existing.quantity = product.quantity > 0 ? Math.min(newQty, product.quantity) : newQty;
    } else {
      this.items.push({ product, quantity });
    }
    this.persist();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    const item = this.items.find(i => i.product.productId === productId);
    if (item) {
      // Clamp to available stock
      const max = item.product.quantity;
      item.quantity = max > 0 ? Math.min(quantity, max) : quantity;
      this.persist();
    }
  }

  removeFromCart(productId: number): void {
    this.items = this.items.filter(i => i.product.productId !== productId);
    this.persist();
  }

  clearCart(): void {
    this.items = [];
    this.persist();
  }

  private loadFromStorage(): void {
    if (!this.isBrowser) { this.cartSubject.next([]); return; }
    try {
      const stored = localStorage.getItem(CART_KEY);
      this.items = stored ? JSON.parse(stored) : [];
    } catch {
      this.items = [];
    }
    this.cartSubject.next([...this.items]);
  }

  private persist(): void {
    if (!this.isBrowser) return;
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
    this.cartSubject.next([...this.items]);
  }
}