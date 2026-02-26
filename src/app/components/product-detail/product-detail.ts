import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/Product.service';
import { CartService } from '../../services/Cart.service';
import { Product } from '../../models/product.model';

const CATEGORY_NAMES: Record<number, string> = {
  1: 'Living Room',
  2: 'Kitchen',
  3: 'Bedroom',
  4: 'Storage',
  5: 'Lighting',
  6: 'Textiles'
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  quantity = 1;
  isLoading = false;
  errorMsg = '';
  added = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/products']);
      return;
    }

    // PRIMARY: product passed via router state when clicking a card
    const nav = this.router.getCurrentNavigation();
    const stateProduct = nav?.extras?.state?.['product'] as Product | undefined;

    if (stateProduct && stateProduct.productId === id) {
      this.product = stateProduct;
      this.cdr.detectChanges();
      return;
    }

    // FALLBACK: direct URL / refresh
    this.loadProductFallback(id);
  }

  private loadProductFallback(id: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.productService.getProducts(1, 200).subscribe({
      next: (response) => {
        const found = response.data.find(p => p.productId === id);
        if (found) {
          this.product = found;
          this.isLoading = false;
        } else {
          this.tryDirectEndpoint(id);
        }
        this.cdr.detectChanges();
      },
      error: () => this.tryDirectEndpoint(id)
    });
  }

  private tryDirectEndpoint(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (p) => {
        this.product = p;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Product not found.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getCategoryName(categoryId: number): string {
    return CATEGORY_NAMES[categoryId] ?? `Category #${categoryId}`;
  }

  get alreadyInCart(): number {
    if (!this.product) return 0;
    return this.cartService.getQuantityInCart(this.product.productId);
  }

  get maxAvailable(): number {
    const qty = this.product?.quantity;
    if (qty == null || qty === 0) return 999;
    return qty;
  }

  get isOutOfStock(): boolean {
    const qty = this.product?.quantity;
    return qty != null && qty <= 0;
  }

  get canAddMore(): boolean {
    if (this.isOutOfStock) return false;
    return this.alreadyInCart + this.quantity <= this.maxAvailable;
  }

  increaseQty(): void {
    const remaining = this.maxAvailable - this.alreadyInCart;
    if (this.quantity < remaining) this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product || !this.canAddMore) return;
    const available = this.maxAvailable - this.alreadyInCart;
    const toAdd = Math.min(this.quantity, available);
    if (toAdd <= 0) return;
    this.cartService.addToCart(this.product, toAdd);
    this.added = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.added = false;
      this.cdr.detectChanges();
    }, 1500);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const fallback = document.createElement('span');
      fallback.textContent = '🛍️';
      fallback.style.fontSize = '100px';
      parent.appendChild(fallback);
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}