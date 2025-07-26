import axios from 'axios';
import { API_BASE_URL } from './api';

// Axios instance for auth-aware requests
export const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // allow cookies for refresh token
});

// No localStorage or Authorization header logic needed for HTTP-only cookies
// All requests will use cookies automatically if withCredentials is true

// Intercept 401s and try to refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

authApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            resolve(authApi(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
        // No need to set access token, handled by HTTP-only cookies
        onRefreshed(res.data.token);
        originalRequest.headers['Authorization'] = 'Bearer ' + res.data.token;
        return authApi(originalRequest);
      } catch (refreshError) {
        // No need to clear access token, handled by HTTP-only cookies
        // Use Vue Router navigation for SPA redirect
        import('../router').then(({ default: router }) => {
          const currentPath = window.location.pathname + window.location.search;
          const urlParams = new URLSearchParams(window.location.search);
          // Only redirect if not already on /
          if (window.location.pathname !== '/') {
            if (!urlParams.has('redirect')) {
              router.push({ path: '/', query: { redirect: currentPath } });
            } else {
              router.push({ path: '/' });
            }
          }
        });
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default authApi;
