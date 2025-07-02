/**
 * Notification Service
 * Handles all notification-related operations including:
 * - Fetching user notifications
 * - Marking notifications as read
 * - Real-time notification updates
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// API configuration with fallback URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL|| "https://mindone-backend.onrender.com/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding authentication token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling authentication errors
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

export const notificationService = {
  /**
   * Fetch all notifications for the current user
   * @returns {Promise<Array>} List of notifications
   */
  async getNotifications() {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch notifications' };
    }
  },

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - ID of the notification to mark as read
   * @returns {Promise<Object>} Updated notification data
   */
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to mark notification as read' };
    }
  },
};