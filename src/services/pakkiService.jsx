import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

// --- API Functions ---

async function createPakki(data) {
  try {
    const response = await apiInstance.post('/pakki-sale-purchase', data);
    return response.data;
  } catch (error) {
    console.error('Error creating pakki:', error.response?.data || error.message);
    throw error;
  }
}

async function getChorsaPakkiList() {
  try {
    const response = await apiInstance.get('/pakki-sale-purchase/chorsa');
    return response?.data?.data || response?.data || [];
  } catch (error) {
    console.error('Error fetching chorsa pakki list:', error.response?.data || error.message);
    throw error;
  }
}

async function getBankPakkiList() {
  try {
    const response = await apiInstance.get('/pakki-sale-purchase/bank');
    return response?.data?.data || response?.data || [];
  } catch (error) {
    console.error('Error fetching bank pakki list:', error.response?.data || error.message);
    throw error;
  }
}
async function getPakkiList(filters) {
  try {
    const response = await apiInstance.get('/pakki-sale-purchase', { params: filters });
    return response?.data?.data || response?.data || [];
  } catch (error) {
    console.error('Error fetching pakki list:', error.response?.data || error.message);
    throw error;
  }
}

async function getPakkiById(id) {
  try {
    const response = await apiInstance.get(`/pakki-sale-purchase/${id}`);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error fetching pakki:', error.response?.data || error.message);
    throw error;
  }
}

async function updatePakki(id, data) {
  try {
    const response = await apiInstance.put(`/pakki-sale-purchase/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating pakki:', error.response?.data || error.message);
    throw error;
  }
}

async function deletePakki(id) {
  try {
    const response = await apiInstance.delete(`/pakki-sale-purchase/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting pakki:', error.response?.data || error.message);
    throw error;
  }
}

async function getPakkiStock(date = null) {
  try {
    const url = date ? `/pakki-sale-purchase/stock?date=${date}` : '/pakki-sale-purchase/stock';
    const response = await apiInstance.get(url);
    return response?.data?.data || { chorsaStock: 0, bankStock: 0, latestVerificationDate: null };
  } catch (error) {
    console.error('Error fetching pakki stock:', error.response?.data || error.message);
    throw error;
  }
}

// Show the BR logo loader while requests are in flight
attachLoaderInterceptors(apiInstance);

export default {
  createPakki,
  getPakkiList,
  getPakkiById,
  updatePakki,
  deletePakki,
  getChorsaPakkiList,
  getBankPakkiList,
  getPakkiStock,
};
