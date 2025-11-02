import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 8000,
});

// Basic interceptors to surface network/server errors during development
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (import.meta.env.DEV) {
      // Log a concise error diagnostic
      const status = error?.response?.status;
      const method = error?.config?.method?.toUpperCase?.();
      const url = error?.config?.url;
      // eslint-disable-next-line no-console
      console.error('[API ERROR]', status ? `${status}` : 'NETWORK', method || '', url || '', error?.message);
    }
    return Promise.reject(error);
  }
);

export default api;
