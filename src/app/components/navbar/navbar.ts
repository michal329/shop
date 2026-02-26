import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/Auth.service';
import { CartService } from '../../services/Cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  isCategoriesOpen = signal(false);
  currentCategory = signal<number | 'all' | null>('all');
  cartCount = signal<number>(0);

  // NOTE: category id numbers should match the API categoryId values.
  // If your API uses different ids, update these numbers to match.
  categories = [
    { id: 1, name: 'Living Room', icon: '🛋️', route: '/products' },
    { id: 2, name: 'Kitchen', icon: '🍳', route: '/products' },
    { id: 3, name: 'Bedroom', icon: '🛏️', route: '/products' },
    { id: 4, name: 'Storage', icon: '🗄️', route: '/products' },
    { id: 5, name: 'Lighting', icon: '💡', route: '/products' },
    { id: 6, name: 'Textiles', icon: '🧺', route: '/products' }
  ];

  constructor(
    public authService: AuthService,
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // initialize currentCategory from URL
    this.setCategoryFromUrl();
    // update on navigation
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.setCategoryFromUrl();
      }
    });

    // Keep a local signal for cart count so OnPush template updates immediately
    this.cartCount.set(this.cartService.getTotalItems());
    this.cartService.cart$.subscribe(items => {
      const total = items.reduce((s, it) => s + it.quantity, 0);
      this.cartCount.set(total);
    });
  }

  private setCategoryFromUrl(): void {
    try {
      const url = this.router.url || '';
      const query = url.split('?')[1] || '';
      const params = new URLSearchParams(query);
      const cat = params.get('category');
      this.currentCategory.set(cat ? Number(cat) : 'all');
    } catch {
      this.currentCategory.set('all');
    }
  }

  toggleCategories(): void {
    this.isCategoriesOpen.update(val => !val);
  }

  logout(): void {
    this.authService.logout();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }
}