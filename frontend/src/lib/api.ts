import axios from 'axios';
import { Product, Order } from '../types';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productAPI = {
  getAll: () => api.get<Product[]>('/products'),
  update: (id: string, data: Partial<Product>) => api.put(`/products/${id}`, data),
  create: (data: Omit<Product, 'id'>) => api.post('/products', data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const orderAPI = {
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  updateStatus: (id: string, status: Order['status']) => api.put(`/orders/${id}`, { status }),
};

export const syncAPI = {
  manual: () => api.post('/sync/manual'),
  testConnection: () => api.get('/sync/test'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (id: string) => api.get(`/chat/conversations/${id}/messages`),
  sendMessage: (id: string, data: any) => api.post(`/chat/conversations/${id}/messages`, data),
};

export const reportAPI = {
  getSales: (params: any) => api.get('/reports/sales', { params }),
  getStock: () => api.get('/reports/stock'),
};