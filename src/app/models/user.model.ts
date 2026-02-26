export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  phone?: string;
  shippingAddress?: string;
  isAdmin?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}