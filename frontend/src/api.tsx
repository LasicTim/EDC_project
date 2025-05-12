import axios from 'axios';
import { auth } from './utils/auth';
export const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Intercept requests to add JWT token to headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  });

api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-access-token'];
    if (newToken) {
      auth.setToken(newToken);
      console.log('New token set:', newToken);
    }
    return response;
  },
  (error) => Promise.reject(error)
);