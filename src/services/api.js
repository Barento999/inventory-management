import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Change to actual backend when ready
});

// Request interceptor – add auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Simple response interceptor – log errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error);
    return Promise.reject(error);
  }
);

export default api;
