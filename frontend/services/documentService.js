import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  (error) => {
    return Promise.reject(error);
  }
);

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

export const documentService = {
  // Create a new document
  async createDocument(title, content, visibility = 'private') {
    try {
      const response = await api.post('/documents', { title, content, visibility });
      
      // Check if the response contains a valid document
      if (response.data && response.data._id) {
        return response.data;
      } else {
        throw { msg: 'Invalid response from server' };
      }
    } catch (error) {
      console.error('Document creation error:', error);
      
      // If we have a successful response but with an error message, it might be a false positive
      if (error.response && error.response.status === 201) {
        return error.response.data;
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

  // Get all documents accessible by user
  async getDocuments() {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch documents' };
    }
  },

  // Get a single document by ID
  async getDocumentById(id) {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch document' };
    }
  },

  // Update a document
  async updateDocument(id, updates) {
    try {
      const response = await api.put(`/documents/${id}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to update document' };
    }
  },

  // Delete a document
  async deleteDocument(id) {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to delete document' };
    }
  },

  // Search documents
  async searchDocuments(query) {
    try {
      const response = await api.get(`/documents/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to search documents' };
    }
  },

  // Share a document with another user
  async shareDocument(id, userId, permission = 'view') {
    try {
      const response = await api.post(`/documents/${id}/share`, { userId, permission });
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to share document' };
    }
  },

  // Get a public document (no authentication required)
  async getPublicDocument(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/public/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to fetch public document' };
    }
  },

  // Remove a user from document sharing
  async removeSharedUser(documentId, userId) {
    try {
      const response = await api.delete(`/documents/${documentId}/share/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { msg: 'Failed to remove user from document sharing' };
    }
  }
};