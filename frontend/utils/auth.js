/**
 * Authentication Utilities
 * Provides authentication context, hooks, and helper functions for:
 * - User authentication state management
 * - Protected route handling
 * - Token management and validation
 * - Authentication redirects
 */

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import authService from '../services/authService';

// Create authentication context for global state management
const AuthContext = createContext(null);

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication state
 * Handles initial authentication check and user data loading
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const token = authService.getToken();
    if (token) {
      const userData = getUserFromToken(token);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const value = {
    user,
    setUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access authentication context
 * @throws {Error} If used outside of AuthProvider
 * @returns {Object} Authentication context value
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to manage authentication state
 * Provides authentication status, user data, and auth functions
 * Handles automatic redirect to login for unauthenticated users
 * @returns {Object} Authentication state and functions
 */
export const useAuth = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check if we're on the client side and initialize auth state
  useEffect(() => {
    setIsClient(true);
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      // Get user data from storage first
      const storedUser = authService.getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      
      // Also try to get fresh data from API
      authService.getProfile().then(profileData => {
        setUser(profileData);
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(profileData));
      }).catch(error => {
        console.log('Could not fetch fresh profile data:', error);
        // Use stored data if API fails
      });
    }
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    if (isClient && !authService.isAuthenticated()) {
      router.push('/login');
    }
  }, [isClient, router]);

  const logout = () => {
    authService.logout();
  };

  return {
    isAuthenticated: isClient ? authService.isAuthenticated() : false,
    user,
    logout,
    getToken: authService.getToken
  };
};

/**
 * Hook to redirect authenticated users
 * Used on login/register pages to prevent authenticated access
 * @param {string} redirectTo - Path to redirect to (default: '/dashboard')
 */
export const useRedirectIfAuthenticated = (redirectTo = '/dashboard') => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isClient && authService.isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [isClient, router, redirectTo]);
};

/**
 * Higher-order component for protected routes
 * Wraps components that require authentication
 * Automatically handles redirect to login
 * @param {Component} WrappedComponent - Component to protect
 * @returns {Component} Protected component
 */
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      return null; // Will redirect to login
    }
    
    return <WrappedComponent {...props} />;
  };
};

/**
 * Extract user data from JWT token
 * Note: This is a simple decode, not verification
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded user data or null if invalid
 */
export const getUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    // Simple token decode - server should verify
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Generate authorization header with token
 * @returns {Object} Headers object with Authorization if token exists
 */
export function authHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
