import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/Product.service';
import { ProductAdminService } from '../../services/Productadmin.service';
import { CategoryService, Category } from '../../services/Category.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css'
})
export class AdminProductsComponent implements OnInit {
  products:   Product[]  = [];
  categories: Category[] = [];
  loading  = true;
  error    = '';
  success  = '';

  // Form state
  showForm  = false;
  isEditing = false;
  editId: number | null = null;

  form: Partial<Product> = {};

  constructor(
    private productService:      ProductService,
    private productAdminService: ProductAdminService,
    private categoryService:     CategoryService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.categoryService.getCategories().subscribe(c => this.categories = c);
  }

  loadProducts() {
    this.loading = true;
    this.productService.getProducts(1, 100).subscribe({
      next: (res) => {
        this.ngZone.run(() => {
          this.products = res.data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.error = 'Failed to load products.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  openAddForm() {
    this.form = { quantity: 0, categoryId: this.categories[0]?.categoryId };
    this.isEditing = false;
    this.editId    = null;
    this.showForm  = true;
    this.success   = '';
    this.error     = '';
  }

  openEditForm(p: Product) {
    this.form = { ...p };
    this.isEditing = true;
    this.editId    = p.productId;
    this.showForm  = true;
    this.success   = '';
    this.error     = '';
  }

  cancelForm() {
    this.showForm = false;
    this.form     = {};
  }

  submitForm() {
    const payload: any = {
      productId:   this.isEditing ? this.editId! : 0,
      productName: this.form.productName || '',
      price:       Number(this.form.price),
      categoryId:  Number(this.form.categoryId),
      description: this.form.description || '',
      imageUrl:    this.form.imageUrl    || '',
      quantity:    String(this.form.quantity ?? 0),
      isActive:    true
    };

    if (this.isEditing && this.editId != null) {
      this.productAdminService.updateProduct(this.editId, payload).subscribe({
        next: () => { this.success = 'Product updated!'; this.cancelForm(); this.loadProducts(); },
        error: () => { this.error = 'Failed to update product.'; }
      });
    } else {
      this.productAdminService.addProduct(payload).subscribe({
        next: () => { this.success = 'Product added!'; this.cancelForm(); this.loadProducts(); },
        error: () => { this.error = 'Failed to add product.'; }
      });
    }
  }

  deleteProduct(p: Product) {
    if (!confirm(`Delete "${p.productName}"? This may affect existing orders.`)) return;
    this.productAdminService.deleteProduct(p.productId).subscribe({
      next: () => { this.success = 'Product deleted.'; this.loadProducts(); },
      error: () => { this.error = 'Failed to delete. Product may be in an undelivered order.'; }
    });
  }

  categoryName(id: number): string {
    return this.categories.find(c => c.categoryId === id)?.categoryName ?? String(id);
  }
}