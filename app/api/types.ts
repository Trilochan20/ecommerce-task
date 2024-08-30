export type Product = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export type CartItem = {
  productId: string;
  quantity: number;
  name: string;
  orderedPrice: number;
  currentPrice: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  orderedPrice: number;
  price: number;
}

export interface Order {
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  discountApplied: number;
  finalAmount: number;
  date: string;
  appliedDiscountCode?: string;
}

export type User = {
  name: string;
  email: string;
  userId: string;
  password: string;
  role: string;
  orders: Order[];
}

export type Schema = {
  products: Product[];
  users: User[];
  discountCodes: DiscountCode[];
  discountOrder: number;
}

export type DiscountCode = {
  code: string;
  discount: number;
  isAvailable: boolean;
}
