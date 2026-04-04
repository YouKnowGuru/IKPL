export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'store_admin' | 'super_admin';
  locationId?: string | any;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  category: string;
  categoryId?: Category;
  description: string;
  nutrients: {
    protein: string;
    fat: string;
    fiber: string;
    moisture: string;
  };
  price: number;
  stock?: number;
  unit?: string;
  images?: string[];
  image?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: Product | any;
  productId?: Product | any;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  userId?: User;
  user?: User; // fallback for older ones
  items: OrderItem[];
  locationId?: any;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  user: User;
  product: Product;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  _id: string;
  key: string;
  value: string;
  title: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
