export interface Product {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  images: string[];
  description: string;
  attributes: Record<string, any>;
  lastUpdated: Date;
  syncedAt: Date;
}

export interface Order {
  id: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  status: 'new' | 'in-progress' | 'shipped' | 'completed';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}