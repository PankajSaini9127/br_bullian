import axios from 'axios';
import { attachLoaderInterceptors } from '../utils/loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const apiInstance = axios.create({
  baseURL: API_URL,
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

async function getPaggaList(filters = {}, page = 1, limit = 10) {
  try {
    const params = { ...filters, page, limit };
    const response = await apiInstance.get('/puggas', { params });
    console.log('Pagga List Retrieved:', response.data);
    return response?.data?.data || response?.data || [];
  } catch (error) {
    console.error('Error Retrieving Pagga List:', error.response?.data || error.message);
    throw error;
  }
}

async function getPaggaById(id) {
  try {
    const response = await apiInstance.get(`/puggas/${id}`);
    console.log('Pagga Retrieved:', response.data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error Retrieving Pagga:', error.response?.data || error.message);
    throw error;
  }
}

async function addPagga(paggaData) {
  try {
    const response = await apiInstance.post('/puggas', paggaData);
    console.log('Pagga Created:', response.data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error Creating Pagga:', error.response?.data || error.message);
    throw error;
  }
}

async function updatePagga(id, paggaData) {
  try {
    const response = await apiInstance.put(`/puggas/${id}`, paggaData);
    console.log('Pagga Updated:', response.data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error Updating Pagga:', error.response?.data || error.message);
    throw error;
  }
}

async function deletePagga(id) {
  try {
    const response = await apiInstance.delete(`/puggas/${id}`);
    console.log('Pagga Deleted:', response.data);
    return response?.data?.data || response?.data;
  } catch (error) {
    console.error('Error Deleting Pagga:', error.response?.data || error.message);
    throw error;
  }
}

// Show the BR logo loader while requests are in flight
attachLoaderInterceptors(apiInstance);

export default {
  getPaggaList,
  getPaggaById,
  addPagga,
  updatePagga,
  deletePagga,
};
