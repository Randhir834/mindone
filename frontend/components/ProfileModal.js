/**
 * ProfileModal component displays user profile information and allows password changes.
 * Shows user details like name, email, join date, and ID.
 * Provides functionality to copy user ID and change password.
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 */
import { useEffect, useState } from 'react';
import authService from '../services/authService';
import Link from 'next/link';

export default function ProfileModal({ isOpen, onClose }) {
  // State management for profile data and UI states
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);
  const [changePwdSuccess, setChangePwdSuccess] = useState('');
  const [changePwdError, setChangePwdError] = useState('');

  // Fetch profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      authService.getProfile()
        .then(data => {
          setProfile(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Failed to load profile');
          setLoading(false);
        });
    }
  }, [isOpen]);

  // Copy user ID to clipboard
  const handleCopyId = () => {
    if (profile && (profile._id || profile.id)) {
      navigator.clipboard.writeText(profile._id || profile.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeInUp">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">My Profile</h2>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : profile ? (
          <div className="space-y-4">
            {/* User avatar */}
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                {profile.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>

            {/* User ID section with copy button */}
            <div>
              <span className="block text-gray-500 text-sm">User ID</span>
              <div className="flex items-center gap-2">
                <span className="block font-mono text-gray-800 break-all">{profile._id || profile.id}</span>
                <button
                  onClick={handleCopyId}
                  className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  title="Copy User ID"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* User details sections */}
            <div>
              <span className="block text-gray-500 text-sm">Name</span>
              <span className="block text-lg font-semibold text-gray-900">{profile.name}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-sm">Email</span>
              <span className="block text-lg text-gray-900">{profile.email}</span>
            </div>
            {profile.createdAt && (
              <div>
                <span className="block text-gray-500 text-sm">Joined</span>
                <span className="block text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Password change section */}
            <div className="pt-4">
              {!showChangePassword ? (
                <button
                  onClick={() => {
                    setShowChangePassword(true);
                    setChangePwdSuccess('');
                    setChangePwdError('');
                  }}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Change Password
                </button>
              ) : (
                <form
                  onSubmit={async e => {
                    e.preventDefault();
                    setChangePwdLoading(true);
                    setChangePwdSuccess('');
                    setChangePwdError('');
                    try {
                      await authService.changePassword(currentPassword, newPassword);
                      setChangePwdSuccess('Password changed successfully!');
                      setCurrentPassword('');
                      setNewPassword('');
                    } catch (err) {
                      setChangePwdError(err.message || 'Failed to change password');
                    } finally {
                      setChangePwdLoading(false);
                    }
                  }}
                  className="space-y-3"
                >
                  {/* Current password input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full border rounded px-3 py-2"
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  {/* New password input */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full border rounded px-3 py-2"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Error and success messages */}
                  {changePwdError && <div className="text-red-500 text-sm">{changePwdError}</div>}
                  {changePwdSuccess && <div className="text-green-600 text-sm">{changePwdSuccess}</div>}

                  {/* Form buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
                      disabled={changePwdLoading}
                    >
                      {changePwdLoading ? 'Changing...' : 'Change Password'}
                    </button>
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                      onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setChangePwdError('');
                        setChangePwdSuccess('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 