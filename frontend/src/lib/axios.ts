import axios from 'axios';
import { useAuthStore } from '../features/auth/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
