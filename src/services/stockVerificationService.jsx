import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

async function getVerifications(params = {}) {
  try {
    const response = await apiInstance.get('/physical-stock-verification', { params });
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error fetching stock verifications:', error.response?.data || error.message);
    throw error;
  }
}

async function createVerification(data) {
  try {
    const response = await apiInstance.post('/physical-stock-verification', data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error creating stock verification:', error.response?.data || error.message);
    throw error;
  }
}

async function updateVerification(id, data) {
  try {
    const response = await apiInstance.put(`/physical-stock-verification/${id}`, data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error updating stock verification:', error.response?.data || error.message);
    throw error;
  }
}

async function deleteVerification(id) {
  try {
    const response = await apiInstance.delete(`/physical-stock-verification/${id}`);
    return response?.data;
  } catch (error) {
    console.error('Error deleting stock verification:', error.response?.data || error.message);
    throw error;
  }
}

async function getVerificationById(id) {
  try {
    const response = await apiInstance.get(`/physical-stock-verification/${id}`);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error fetching verification:', error.response?.data || error.message);
    throw error;
  }
}

attachLoaderInterceptors(apiInstance);

export default {
  getVerifications,
  createVerification,
  updateVerification,
  deleteVerification,
  getVerificationById,
};
