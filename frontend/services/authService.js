import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      if (token) {
        Cookies.set('token', token, { expires: 2/24, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  logout() {
    Cookies.remove('token');
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  getToken() {
    return Cookies.get('token');
  },

  isAuthenticated() {
    return !!Cookies.get('token');
  },

  async forgotPassword(email) {
    try {
      // CORRECTED: Changed endpoint from '/auth/forgot' to '/auth/forgot-password'
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset email' };
    }
  },

  async resetPassword(token, password) {
    try {
      // CORRECTED: Changed endpoint from '/auth/reset/:token' to '/auth/reset-password/:token'
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reset password' };
    }
  },

  // NEW: Fetch notifications
  async getNotifications() {
    try {
      // Assumes backend endpoint GET /api/auth/notifications
      const response = await api.get('/auth/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get notifications' };
    }
  },

  // NEW: Mark all notifications as read
  async markNotificationsAsRead() {
    try {
      // Assumes backend endpoint POST /api/auth/notifications/read
      const response = await api.post('/auth/notifications/read');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notifications as read' };
    }
  }
};

export default authService;