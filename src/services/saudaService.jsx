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

async function addSauda(saudaData) {
  try {
    const response = await apiInstance.post('/sauda', saudaData);
    console.log('Sauda Saved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Saving Sauda:', error.response?.data || error.message);
    throw error;
  }
}

async function updateSauda(id, saudaData) {
  try {
    const response = await apiInstance.put(`/sauda/${id}`, saudaData);
    console.log('Sauda Updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Updating Sauda:', error.response?.data || error.message);
    throw error;
  }
}

async function deleteSauda(id) {
  try {
    const response = await apiInstance.delete(`/sauda/${id}`);
    console.log('Sauda Deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Deleting Sauda:', error.response?.data || error.message);
    throw error;
  }
}

async function getSaudaList(type, filters = {}) {
  try {
    const params = { ...filters };
    if (type) params.type = type;
    const response = await apiInstance.get('/sauda', { params });
    console.log('Sauda List Retrieved:', response.data);
    return response?.data?.data || response?.data || [];
  } catch (error) {
    console.error('Error Retrieving Sauda List:', error.response?.data || error.message);
    throw error;
  }
}

async function getPartyPendingSaudas(partyId, saudaType, filters = {}) {
  try {
    const params = { partyId, ...filters };
    if (saudaType) params.saudaType = saudaType;
    const response = await apiInstance.get('/sauda/pending', { params });
    console.log('Party Pending Saudas Retrieved:', response.data);
    return response?.data?.data || response?.data || [];
  } catch (error) {
    console.error('Error Retrieving Party Pending Saudas:', error.response?.data || error.message);
    throw error;
  }
}

// Show the BR logo loader while requests are in flight
attachLoaderInterceptors(apiInstance);

export default {
  addSauda,
  updateSauda,
  deleteSauda,
  getSaudaList,
  getPartyPendingSaudas
};
