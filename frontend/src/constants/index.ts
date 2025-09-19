export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  DASHBOARD: '/',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  USERS: '/users',
  CHAT: '/chat',
  REPORTS: '/reports',
} as const;

export const ORDER_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in-progress',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;