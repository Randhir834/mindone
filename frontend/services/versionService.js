/**
 * Version Service
 * Handles document version control operations including:
 * - Version history tracking
 * - Version comparison
 * - Version restoration
 * - Version metadata formatting
 */

import { authHeader } from '../utils/auth';

// API configuration with fallback URL
const API_URL = process.env.NEXT_PUBLIC_API_URL|| "https://mindone-backend.onrender.com/api";

/**
 * Fetch version history for a document
 * @param {string} documentId - Document ID
 * @param {number} limit - Maximum number of versions to fetch (default: 50)
 * @returns {Promise<Array>} List of document versions
 */
export const getVersionHistory = async (documentId, limit = 50) => {
  try {
    const response = await fetch(`${API_URL}/documents/${documentId}/versions?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || 'Failed to fetch version history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching version history:', error);
    throw error;
  }
};

/**
 * Fetch a specific version of a document
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number to fetch
 * @returns {Promise<Object>} Document version data
 */
export const getVersion = async (documentId, versionNumber) => {
  try {
    const response = await fetch(`${API_URL}/documents/${documentId}/versions/${versionNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch version');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching version:', error);
    throw error;
  }
};

/**
 * Compare two versions of a document
 * @param {string} documentId - Document ID
 * @param {number} version1 - First version number
 * @param {number} version2 - Second version number
 * @returns {Promise<Object>} Version comparison data
 */
export const compareVersions = async (documentId, version1, version2) => {
  try {
    const response = await fetch(`${API_URL}/documents/${documentId}/compare/${version1}/${version2}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to compare versions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error comparing versions:', error);
    throw error;
  }
};

/**
 * Restore a document to a previous version
 * @param {string} documentId - Document ID
 * @param {number} versionNumber - Version number to restore to
 * @returns {Promise<Object>} Restored document data
 */
export const restoreVersion = async (documentId, versionNumber) => {
  try {
    const response = await fetch(`${API_URL}/documents/${documentId}/restore/${versionNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to restore version');
    }

    return await response.json();
  } catch (error) {
    console.error('Error restoring version:', error);
    throw error;
  }
};

/**
 * Format date for display in version history
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Get display text for version change type
 * @param {string} changeType - Type of change made in version
 * @returns {string} Human-readable change type description
 */
export const getChangeTypeText = (changeType) => {
  const changeTypes = {
    created: 'Document Created',
    updated: 'Updated',
    title_changed: 'Title Changed',
    content_changed: 'Content Modified',
    visibility_changed: 'Visibility Changed'
  };
  return changeTypes[changeType] || changeType;
};

/**
 * Get CSS color class for version change type
 * @param {string} changeType - Type of change made in version
 * @returns {string} Tailwind CSS color classes
 */
export const getChangeTypeColor = (changeType) => {
  const colors = {
    created: 'bg-green-100 text-green-800',
    updated: 'bg-blue-100 text-blue-800',
    title_changed: 'bg-yellow-100 text-yellow-800',
    content_changed: 'bg-purple-100 text-purple-800',
    visibility_changed: 'bg-orange-100 text-orange-800'
  };
  return colors[changeType] || 'bg-gray-100 text-gray-800';
}; 