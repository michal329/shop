export interface OrderItem {
  orderId: number;
  productId: number;
  quantity?: number;
}

export interface Order {
  orderId?:   number;
  orderDate:  string;   // "YYYY-MM-DD"
  orderSum:   number;
  userId:     number;
  status:     string;   // "Pending" | "Shipped" | "Delivered"
  orderItems: OrderItem[];
}