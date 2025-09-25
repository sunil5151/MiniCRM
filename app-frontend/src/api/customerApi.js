import axios from 'axios';
import { API_BASE } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE}/customers`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Customer API functions
export const customerApi = {
  // Get all customers
  getAllCustomers: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get customer by ID
  getCustomerById: async (customerId) => {
    const response = await api.get(`/${customerId}`);
    return response.data;
  },

  // Create new customer
  createCustomer: async (customerData) => {
    const response = await api.post('/', customerData);
    return response.data;
  },

  // Update customer
  updateCustomer: async (customerId, customerData) => {
    const response = await api.put(`/${customerId}`, customerData);
    return response.data;
  },

  // Delete customer
  deleteCustomer: async (customerId) => {
    const response = await api.delete(`/${customerId}`);
    return response.data;
  },
};

export default customerApi;
