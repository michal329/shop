import { Product } from './product.model';

// This is what gets stored in localStorage
export interface CartItem {
  product: Product;
  quantity: number;
}