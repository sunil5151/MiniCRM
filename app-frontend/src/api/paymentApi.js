import axios from 'axios';
import { API_BASE } from '../config';

const paymentApi = {
  fetchPayments: async ({ userId, status, paymentMethod }) => {
    try {
      // Build query string
      let url = `${API_BASE}/payments?userId=${userId}`;
      if (status) url += `&status=${encodeURIComponent(status)}`;
      if (paymentMethod) url += `&paymentMethod=${encodeURIComponent(paymentMethod)}`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch payments' };
    }
  },
  
  fetchPaymentStats: async ({ userId }) => {
    try {
      const response = await axios.get(`${API_BASE}/payments/stats?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch payment statistics' };
    }
  },

  fetchPaymentById: async (paymentId) => {
    try {
      const response = await axios.get(`${API_BASE}/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch payment details' };
    }
  },
  
  createPayment: async (paymentData) => {
    try {
      const response = await axios.post(`${API_BASE}/payments`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create payment' };
    }
  },
  
  updatePaymentStatus: async (paymentId, status) => {
    console.log('=== UPDATE PAYMENT STATUS DEBUG ===');
    console.log('Payment ID:', paymentId);
    console.log('Status:', status);
    console.log('Type of paymentId:', typeof paymentId);
    console.log('Type of status:', typeof status);
    
    try {
      const url = `${API_BASE}/payments/${paymentId}/status`;
      const requestBody = { status: status };
      
      console.log('Request URL:', url);
      console.log('Request body:', requestBody);
      console.log('Stringified body:', JSON.stringify(requestBody));
      
      const response = await axios.put(url, requestBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error status:', error.response?.status);
      console.error('Error statusText:', error.response?.statusText);
      console.error('Error data:', error.response?.data);
      console.error('Error headers:', error.response?.headers);
      console.error('Full error:', error);
      
      // Return the actual error message from backend
      if (error.response?.data) {
        throw error.response.data;
      } else {
        throw { error: 'Failed to update payment status' };
      }
    }
  }
};

export default paymentApi;