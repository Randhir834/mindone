/**
 * Document Service
 * Handles all document-related operations including:
 * - Document CRUD operations
 * - Document sharing and permissions
 * - Document search functionality
 * - Public document access
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// API configuration with fallback URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://mindone-backend.onrender.com/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
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
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Downloads a document as PDF
 * @param {string} documentId - The ID of the document to download
 * @returns {Promise<Blob>} - Returns a promise that resolves to a PDF blob
 */
const downloadPDF = async (documentId) => {
  try {
    console.log('Starting PDF download for document:', documentId);
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Cookies.get('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PDF download failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.msg || 'Failed to download PDF');
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/pdf')) {
      console.error('Invalid content type received:', contentType);
      throw new Error('Server did not return a PDF file');
    }

    console.log('PDF download successful');
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error in downloadPDF:', error);
    throw error;
  }
};

export const documentService = {
  /**
   * Create a new document
   * @param {string} title - Document title
   * @param {string} content - Document content
   * @param {string} visibility - Document visibility ('private' or 'public')
   * @returns {Promise<Object>} Created document data
   */
  async createDocument(title, content, visibility = 'private') {
    try {
      const response = await api.post('/documents', { title, content, visibility });
      
      // Validate response contains document ID
      if (response.data && response.data._id) {
        return response.data;
      } else {
        throw { msg: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Document creation error:', error);
      
      // Handle various error scenarios
      if (error.response && error.response.status === 201) {
        return error.response.data; // Handle successful creation with warning
      }
      
      if (error.response?.data?.msg) {
        throw error.response.data;
      } else if (error.response?.status === 500) {
        throw { msg: 'Server error occurred while creating document' };
      } else if (error.response?.status === 401) {
        throw { msg: 'Authentication required. Please log in again.' };
      } else if (error.response?.status === 403) {
        throw { msg: 'You do not have permission to create documents' };
      } else if (error.message === 'Network Error') {
        throw { msg: 'Network error. Please check your connection.' };
      } else {
        throw { msg: 'Failed to create document. Please try again.' };
      }
    }
  },

  /**
   * Fetch all documents accessible by the current user
   * @returns {Promise<Array>} List of documents
   */
  async getDocuments() {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch documents' };
    }
  },

  /**
   * Fetch a single document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocumentById(id) {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch document' };
    }
  },

  /**
   * Update an existing document
   * @param {string} id - Document ID
   * @param {Object} updates - Document updates (title, content, visibility)
   * @returns {Promise<Object>} Updated document data
   */
  async updateDocument(id, updates) {
    try {
      const response = await api.put(`/documents/${id}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to update document' };
    }
  },

  /**
   * Delete a document
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteDocument(id) {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to delete document' };
    }
  },

  /**
   * Search documents by query
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of matching documents
   */
  async searchDocuments(query) {
    try {
      const response = await api.get(`/documents/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to search documents' };
    }
  },

  /**
   * Share document with another user
   * @param {string} id - Document ID
   * @param {string} userId - User ID to share with
   * @param {string} permission - Permission level ('view' or 'edit')
   * @returns {Promise<Object>} Share confirmation
   */
  async shareDocument(id, userId, permission = 'view') {
    try {
      const response = await api.post(`/documents/${id}/share`, { userId, permission });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to share document' };
    }
  },

  /**
   * Get a publicly shared document
   * @param {string} id - Document ID
   * @returns {Promise<Object>} Public document data
   */
  async getPublicDocument(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/public/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch public document' };
    }
  },

  /**
   * Remove user access from shared document
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object>} Removal confirmation
   */
  async removeSharedUser(documentId, userId) {
    try {
      const response = await api.delete(`/documents/${documentId}/share/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to remove user from document sharing' };
    }
  },

  downloadPDF
};