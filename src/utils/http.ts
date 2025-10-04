// src/utils/http.ts
import axios from 'axios';
import { authHeader, clearToken } from './auth';

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
});

api.interceptors.request.use((config) => {
  config.headers = { ...(config.headers || {}), ...authHeader() };
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  }
);

export default api;
