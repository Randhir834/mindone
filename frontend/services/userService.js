/**
 * User Service
 * Handles user-related operations including:
 * - User search functionality
 * - User mention suggestions
 * - User profile operations
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

export const userService = {
  /**
   * Search for users by name or email for mention suggestions
   * Returns empty array on failure to prevent UI breaks
   * 
   * @param {string} query - Search query (name or email)
   * @returns {Promise<Array>} List of matching users with { _id, name, email }
   */
  async searchUsers(query) {
    try {
      const response = await api.get(`/auth/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Failed to search users:', error);
      return []; // Return empty array on failure so the UI doesn't break
    }
  },
};