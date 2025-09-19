import axios from 'axios';
import { Product, Order } from '../types';
import { API_BASE_URL } from '../constants';

const API_BASE = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);

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