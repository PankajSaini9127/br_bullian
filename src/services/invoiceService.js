import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiInstance = axios.create({
  baseURL: API_URL,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    config.headers['Content-Type'] = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function createInvoice(invoiceData) {
  try {
    const response = await apiInstance.post('/invoices', invoiceData);
    console.log('Invoice Created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Creating Invoice:', error.response?.data || error.message);
    throw error;
  }
}

async function getInvoices(params = {}) {
  try {
    const response = await apiInstance.get('/invoices', { params });
    console.log('Invoices Retrieved:', response?.data?.data);
    return response?.data?.data;
  } catch (error) {
    console.error('Error Retrieving Invoices:', error.response?.data || error.message);
    throw error;
  }
}

async function deleteInvoice(id) {
  try {
    const response = await apiInstance.delete(`/invoices/${id}`);
    console.log('Invoice Deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Deleting Invoice:', error.response?.data || error.message);
    throw error;
  }
}

async function updateInvoiceDetails(id, invoiceData) {
  try {
    const response = await apiInstance.put(`/invoices/${id}`, invoiceData);
    console.log('Invoice Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Updating Invoice:', error.response?.data || error.message);
    throw error;
  }
}

// Show the BR logo loader while requests are in flight
attachLoaderInterceptors(apiInstance);

export default {
  createInvoice,
  getInvoices,
  deleteInvoice,
  updateInvoiceDetails
};
