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

const noteService = {
  createNote: (data) => apiInstance.post('/notes', data),

  getNotes: (params = {}) => apiInstance.get('/notes', { params }),

  getNoteById: (id) => apiInstance.get(`/notes/${id}`),

  updateNote: (id, data) => apiInstance.put(`/notes/${id}`, data),

  deleteNote: (id) => apiInstance.delete(`/notes/${id}`),
};

export default noteService;
