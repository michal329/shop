import { Routes } from '@angular/router';
import { ProductListComponent }   from './components/product-list/product-list';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { CartComponent }          from './components/cart/cart';
import { HomeComponent }          from './components/home/home';
import { LoginComponent }         from './components/login/login';
import { RegisterComponent }      from './components/register/register';
import { ProfileComponent }       from './components/profile/profile';
import { OrderHistoryComponent }  from './components/order-history/order-history';
import { AdminProductsComponent } from './components/admin-products/admin-products';
import { AdminOrdersComponent }   from './components/admin-orders/admin-orders';
import { authGuard, adminGuard }  from './guards/Auth.guard';

export const routes: Routes = [
  { path: '',         component: HomeComponent,        pathMatch: 'full' },
  { path: 'home',     component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart',     component: CartComponent },

  // Auth
  { path: 'login',    component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Customer (protected)
  { path: 'profile',  component: ProfileComponent,     canActivate: [authGuard] },
  { path: 'orders',   component: OrderHistoryComponent, canActivate: [authGuard] },

  // Admin (protected — admin only)
  { path: 'admin/products', component: AdminProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/orders',   component: AdminOrdersComponent,   canActivate: [adminGuard] },
  { path: 'admin',          redirectTo: 'admin/products',      pathMatch: 'full' },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];