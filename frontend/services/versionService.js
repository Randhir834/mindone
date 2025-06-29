import { authHeader } from '../utils/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Get version history for a document
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
 * Get a specific version of a document
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
 * Format date for display
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

/**
 * Get change type display text
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
 * Get change type color for UI
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