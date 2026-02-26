import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductService } from '../../services/Product.service';
import { CartService } from '../../services/Cart.service';
import { Product, PageResponse } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  pageInfo: PageResponse<Product> | null = null;
  selectedCategory: number | null = null;

  currentPage = 1;
  pageSize = 12;

  isLoading = false;
  errorMsg = '';

  addedProductId: number | null = null;

  searchTerm = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  sortBy: string = 'default';
  filterPanelOpen = false;

  Math = Math;

  private destroy$ = new Subject<void>();

  get filteredProducts(): Product[] {
    let result = [...this.products];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.productName.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    if (this.minPrice != null) result = result.filter(p => p.price >= this.minPrice!);
    if (this.maxPrice != null) result = result.filter(p => p.price <= this.maxPrice!);
    switch (this.sortBy) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name-asc':   result.sort((a, b) => a.productName.localeCompare(b.productName)); break;
      case 'name-desc':  result.sort((a, b) => b.productName.localeCompare(a.productName)); break;
    }
    return result;
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm.trim() || this.minPrice != null || this.maxPrice != null || this.sortBy !== 'default');
  }

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const cat = params['category'];
        this.selectedCategory = cat ? Number(cat) : null;
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    const categoryIds = this.selectedCategory != null ? [this.selectedCategory] : undefined;

    this.productService.getProducts(this.currentPage, this.pageSize, categoryIds)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.ngZone.run(() => {
            this.products = response.data;
            this.pageInfo = response;
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('ERROR loading products:', err);
            this.errorMsg = 'Failed to load products. Make sure the API is running.';
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        }
      });
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    if (product.quantity <= 0) return;
    const inCart = this.cartService.getQuantityInCart(product.productId);
    if (inCart >= product.quantity) return;
    this.cartService.addToCart(product, 1);
    this.addedProductId = product.productId;
    setTimeout(() => {
      this.addedProductId = null;
      this.cdr.detectChanges();
    }, 1200);
  }

  isMaxInCart(product: Product): boolean {
    if (product.quantity <= 0) return true;
    return this.cartService.getQuantityInCart(product.productId) >= product.quantity;
  }

  viewDetails(product: Product): void {
    this.router.navigate(['/products', product.productId], {
      state: { product }
    });
  }

  nextPage(): void {
    if (this.pageInfo?.hasNextPage) {
      this.currentPage++;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.pageInfo?.hasPreviousPage) {
      this.currentPage--;
      this.loadProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.sortBy = 'default';
  }

  toggleFilterPanel(): void {
    this.filterPanelOpen = !this.filterPanelOpen;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const fallback = document.createElement('span');
      fallback.textContent = '🛍️';
      fallback.style.fontSize = '52px';
      parent.appendChild(fallback);
    }
  }
}