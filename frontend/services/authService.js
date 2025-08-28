/**
 * Authentication Service
 * Handles all authentication-related operations including:
 * - User registration and login
 * - Token management
 * - Password reset flow
 * - User profile management

 */

import axios from 'axios';
import Cookies from 'js-cookie';

// API configuration with fallback URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://mindone-backend.onrender.com/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Enable sending cookies with requests
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
  (error) => Promise.reject(error)
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

export const authService = {
  /**
   * Register a new user
   * @param {string} name - User's full name
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} User data
   */
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  /**
   * Authenticate user and store token
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} Authentication data including token
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      if (token) {
        // Store token with 2-hour expiry
        Cookies.set('token', token, { expires: 2/24, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        
        // Store user data in localStorage for easier access
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * Clear authentication token and redirect to login
   */
  logout() {
    Cookies.remove('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') window.location.href = '/login';
  },

  /**
   * Get current authentication token
   * @returns {string|null} Authentication token
   */
  getToken() {
    return Cookies.get('token');
  },

  /**
   * Get stored user data
   * @returns {Object|null} User data from localStorage
   */
  getUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!Cookies.get('token');
  },

  /**
   * Initiate password reset process
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Reset request confirmation
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset email' };
    }
  },

  /**
   * Complete password reset process
   * @param {string} token - Reset token from email
   * @param {string} password - New password
   * @returns {Promise<Object>} Reset confirmation
   */
  async resetPassword(token, password) {
    try {
      const response = await api.put(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reset password' };
    }
  },

  /**
   * Fetch user notifications
   * @returns {Promise<Array>} List of notifications
   */
  async getNotifications() {
    try {
      const response = await api.get('/auth/notifications');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get notifications' };
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Update confirmation
   */
  async markNotificationsAsRead() {
    try {
      const response = await api.post('/auth/notifications/read');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notifications as read' };
    }
  },

  /**
   * Get current user's profile
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  /**
   * Change user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Update confirmation
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to change password' };
    }
  }
};

export default authService;