/**
 * SharingManager component handles document sharing functionality.
 * Allows searching for users, adding them with specific permissions,
 * updating existing permissions, and removing shared users.
 * @param {Object} document - The document being shared
 * @param {Function} onUpdate - Callback when sharing settings are updated
 */
import { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import { userService } from '../services/userService';

export default function SharingManager({ document, onUpdate }) {
  // State management for users and UI
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('view');
  const [message, setMessage] = useState('');

  // Initialize shared users list from document
  useEffect(() => {
    if (document?.sharedWith) {
      setUsers(document.sharedWith);
    }
  }, [document]);

  // Search for users to share with
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await userService.searchUsers(query);
      // Filter out users already shared with
      const filteredResults = results.filter(user => 
        !users.some(sharedUser => sharedUser.user._id === user._id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    }
  };

  // Handle search input changes and trigger user search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  // Add a new user with specified permissions
  const handleAddUser = async () => {
    if (!selectedUser) {
      setMessage('Please select a user');
      return;
    }

    setLoading(true);
    try {
      await documentService.shareDocument(document._id, selectedUser, selectedPermission);
      setMessage('User added successfully!');
      // Reset form state
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUser('');
      setSelectedPermission('view');
      
      // Refresh document data to show updated sharing list
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setMessage(error.msg || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  // Remove a user's access to the document
  const handleRemoveUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user from the document?')) {
      return;
    }

    setLoading(true);
    try {
      await documentService.removeSharedUser(document._id, userId);
      setMessage('User removed successfully!');
      
      // Refresh document data to show updated sharing list
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setMessage(error.msg || 'Failed to remove user');
    } finally {
      setLoading(false);
    }
  };

  // Update a user's permission level
  const handleUpdatePermission = async (userId, newPermission) => {
    setLoading(true);
    try {
      await documentService.shareDocument(document._id, userId, newPermission);
      setMessage('Permission updated successfully!');
      
      // Refresh document data to show updated permissions
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setMessage(error.msg || 'Failed to update permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Sharing</h3>
      
      {/* Status message display */}
      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${
          message.includes('successfully') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Add user section */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">Add User</h4>
        <div className="space-y-3">
          {/* User search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-md max-h-40 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className={`p-2 cursor-pointer hover:bg-gray-50 ${
                    selectedUser === user._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedUser(user._id)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              ))}
            </div>
          )}

          {/* Permission selection and add button */}
          {selectedUser && (
            <div className="flex space-x-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission
                </label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="view">View only</option>
                  <option value="edit">Can edit</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddUser}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current shared users list */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Shared Users ({users.length})
        </h4>
        {users.length === 0 ? (
          <p className="text-gray-500 text-sm">No users are currently shared with this document.</p>
        ) : (
          <div className="space-y-3">
            {users.map((share) => (
              <div key={share.user._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div className="flex-1">
                  <div className="font-medium">{share.user.name}</div>
                  <div className="text-sm text-gray-500">{share.user.email}</div>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Permission update dropdown */}
                  <select
                    value={share.permission}
                    onChange={(e) => handleUpdatePermission(share.user._id, e.target.value)}
                    disabled={loading}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="view">View</option>
                    <option value="edit">Edit</option>
                  </select>
                  {/* Remove user button */}
                  <button
                    onClick={() => handleRemoveUser(share.user._id)}
                    disabled={loading}
                    className="px-3 py-1 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 