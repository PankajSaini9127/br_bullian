import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

// Get available pagga for sale
async function getAvailablePagga(isReturn = false, partyId = '') {
  try {
    const params = {};
    if (isReturn) params.isReturn = true;
    if (partyId) params.partyId = partyId;
    const response = await apiInstance.get('/puggas/for-sale', { params });
    console.log('Available Pagga Retrieved:', response?.data?.data);
    return response?.data?.data || [];
  } catch (error) {
    console.error('Error Retrieving Available Pagga:', error.response?.data || error.message);
    throw error;
  }
}

// Create sales invoice
async function createSalesInvoice(salesInvoiceData) {
  try {
    const response = await apiInstance.post('/sales-invoices', salesInvoiceData);
    console.log('Sales Invoice Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Creating Sales Invoice:', error.response?.data || error.message);
    throw error;
  }
}

// Get sales invoices
async function getSalesInvoices(params = {}) {
  try {
    const response = await apiInstance.get('/sales-invoices', { params });
    console.log('Sales Invoices Retrieved:', response?.data?.data);
    return response?.data?.data;
  } catch (error) {
    console.error('Error Retrieving Sales Invoices:', error.response?.data || error.message);
    throw error;
  }
}

// Update sales invoice
async function updateSalesInvoiceDetails(id, salesInvoiceData) {
  try {
    const response = await apiInstance.put(`/sales-invoices/${id}`, salesInvoiceData);
    console.log('Sales Invoice Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Updating Sales Invoice:', error.response?.data || error.message);
    throw error;
  }
}

// Mark pagga as dukan stock
async function markDukanStock(paggaIds) {
  try {
    const response = await apiInstance.post('/sales-invoices/mark-dukan-stock', { paggaIds });
    console.log('Pagga marked as Dukan Stock:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error marking Dukan Stock:', error.response?.data || error.message);
    throw error;
  }
}

// Create return invoice
async function createReturnInvoice(returnInvoiceData) {
  try {
    const response = await apiInstance.post('/sales-invoices/return', returnInvoiceData);
    console.log('Return Invoice Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Creating Return Invoice:', error.response?.data || error.message);
    throw error;
  }
}

// Get dashboard data
async function getDashboard() {
  try {
    const response = await apiInstance.get('/dashboard');
    console.log('Dashboard Data Retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error retrieving Dashboard Data:', error.response?.data || error.message);
    throw error;
  }
}

// Show the BR logo loader while requests are in flight
attachLoaderInterceptors(apiInstance);

export default {
  getAvailablePagga,
  createSalesInvoice,
  getSalesInvoices,
  updateSalesInvoiceDetails,
  markDukanStock,
  getDashboard,
  createReturnInvoice,
};
