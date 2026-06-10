import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with token
const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include token in requests
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get payments
async function getPayments(params = {}, page = 1, limit = 10) {
  try {
    const response = await apiInstance.get('/payments', { params: { ...params, page, limit } });
    console.log('Payments Retrieved:', response?.data?.data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error Retrieving Payments:', error.response?.data || error.message);
    throw error;
  }
}

// Create payment
async function createPayment(paymentData) {
  try {
    const response = await apiInstance.post('/payments', paymentData);
    console.log('Payment Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Creating Payment:', error.response?.data || error.message);
    throw error;
  }
}

// Update payment
async function updatePayment(id, paymentData) {
  try {
    const response = await apiInstance.put(`/payments/${id}`, paymentData);
    console.log('Payment Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Updating Payment:', error.response?.data || error.message);
    throw error;
  }
}

// Delete payment
async function deletePayment(id) {
  try {
    const response = await apiInstance.delete(`/payments/${id}`);
    console.log('Payment Deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Deleting Payment:', error.response?.data || error.message);
    throw error;
  }
}

// Get payment by id
async function getPaymentById(id) {
  try {
    const response = await apiInstance.get(`/payments/${id}`);
    console.log('Payment Retrieved:', response?.data?.data);
    return response?.data?.data;
  } catch (error) {
    console.error('Error Retrieving Payment:', error.response?.data || error.message);
    throw error;
  }
}

// Get cash book
async function getCashBook(params = {}) {
  try {
    const response = await apiInstance.get('/payments/cash-book', { params });
    console.log('Cash Book Retrieved:', response?.data?.data);
    return response?.data?.data;
  } catch (error) {
    console.error('Error Retrieving Cash Book:', error.response?.data || error.message);
    throw error;
  }
}

// Show the BR logo loader while requests are in flight
attachLoaderInterceptors(apiInstance);

export default {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentById,
  getCashBook,
};
