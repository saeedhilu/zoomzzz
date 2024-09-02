// src/axiosInstance.js
import axios from 'axios';
import { store, persistor } from '../redux/store';
import { clearAuth, updateToken } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const instance = axios.create({
  baseURL: 'https://api.zoomzzz.live/',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;  
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const refreshToken = async () => {
  const state = store.getState();
  const refresh = state.auth.refreshToken;
  
  if (!refresh) {
    console.warn('No refresh token found...');
    return null;
  }
  
  try {
    const response = await axios.post('https://api.zoomzzz.live/accounts/api/token/refresh/', {
      refresh,
    });
    const newToken = response.data.access;
    store.dispatch(updateToken({ accessToken: newToken })); // Removed unnecessary await
    return newToken;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    store.dispatch(clearAuth()); // Clear auth state
    persistor.purge(); // Clear persisted Redux state


    window.location.href = '/session-expired';  

    return null;
  }
};

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      
      if (newToken) {
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return instance(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

export default instance;
