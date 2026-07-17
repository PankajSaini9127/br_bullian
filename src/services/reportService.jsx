import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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

// Get report summary
async function getReportSummary(params = {}) {
  try {
    const response = await apiInstance.get('/reports/summary', { params });
    return response?.data?.data;
  } catch (error) {
    console.error('Error fetching report summary:', error.response?.data || error.message);
    throw error;
  }
}

// Show loader
attachLoaderInterceptors(apiInstance);

export default {
  getReportSummary,
};
