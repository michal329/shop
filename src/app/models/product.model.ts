export interface Product {
  productId: number;
  productName: string;
  price: number;
  categoryId: number;
  description: string;
  quantity: number;
  imageUrl?: string; // nullable — some products may not have an image yet
}

export interface PageResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}