import axios from 'axios';
import { API_BASE } from '../config';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${API_BASE}/leads`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔍 LeadsApi - Token from localStorage:', token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔍 LeadsApi - Authorization header set:', config.headers.Authorization);
  } else {
    console.log('❌ LeadsApi - No token found in localStorage');
  }
  return config;
});

// Leads API functions
export const leadsApi = {
  // Get all leads with pagination and filters
  getAllLeads: async (params = {}) => {
    const response = await api.get('/', { params });
    return response.data;
  },

  // Get lead by ID
  getLeadById: async (leadId) => {
    const response = await api.get(`/${leadId}`);
    return response.data;
  },

  // Create new lead
  createLead: async (leadData) => {
    const response = await api.post('/', leadData);
    return response.data;
  },

  // Update lead
  updateLead: async (leadId, leadData) => {
    const response = await api.put(`/${leadId}`, leadData);
    return response.data;
  },

  // Delete lead
  deleteLead: async (leadId) => {
    const response = await api.delete(`/${leadId}`);
    return response.data;
  },

  // Get leads statistics
  getLeadsStats: async (params = {}) => {
    const response = await api.get('/stats', { params });
    return response.data;
  },

  // Admin: Assign lead to user
  assignLead: async (leadId, userId) => {
    const response = await api.put(`/${leadId}/assign`, { assigned_to: userId });
    return response.data;
  },

  // Admin: Get leads by user
  getLeadsByUser: async (userId, params = {}) => {
    const response = await api.get(`/user/${userId}`, { params });
    return response.data;
  },
};

export default leadsApi;
