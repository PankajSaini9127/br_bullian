import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

async function createMetalPalta(data) {
  try {
    const response = await apiInstance.post('/metal-badla', data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error creating metal palta:', error.response?.data || error.message);
    throw error;
  }
}

async function getMetalPaltas(params = {}) {
  try {
    const response = await apiInstance.get('/metal-badla', { params });
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error fetching metal paltas:', error.response?.data || error.message);
    throw error;
  }
}

async function getMetalPaltaById(id) {
  try {
    const response = await apiInstance.get(`/metal-badla/${id}`);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error fetching metal palta:', error.response?.data || error.message);
    throw error;
  }
}

async function updateMetalPalta(id, data) {
  try {
    const response = await apiInstance.put(`/metal-badla/${id}`, data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error updating metal palta:', error.response?.data || error.message);
    throw error;
  }
}

async function deleteMetalPalta(id) {
  try {
    const response = await apiInstance.delete(`/metal-badla/${id}`);
    return response?.data;
  } catch (error) {
    console.error('Error deleting metal palta:', error.response?.data || error.message);
    throw error;
  }
}

attachLoaderInterceptors(apiInstance);

export default {
  createMetalPalta,
  getMetalPaltas,
  getMetalPaltaById,
  updateMetalPalta,
  deleteMetalPalta,
};
