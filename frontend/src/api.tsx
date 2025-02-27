import axios from 'axios';

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