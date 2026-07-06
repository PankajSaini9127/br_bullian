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
  (error) => Promise.reject(error)
);

attachLoaderInterceptors(apiInstance);

const companyService = {
  getCompanies: (params = {}) => apiInstance.get('/companies', { params }),
  getCompanyById: (id) => apiInstance.get(`/companies/${id}`),
  createCompany: (data) => apiInstance.post('/companies', data),
  updateCompany: (id, data) => apiInstance.put(`/companies/${id}`, data),
  deleteCompany: (id) => apiInstance.delete(`/companies/${id}`),
};

export default companyService;
