import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import authService from '../services/authService';

// Create auth context
const AuthContext = createContext(null);

// Auth Provider component
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

// Hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Hook to check authentication status
export const useAuth = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const token = authService.getToken();
      const userData = getUserFromToken(token);
      setUser(userData);
    }
  }, []);

  // Handle authentication redirect
  useEffect(() => {
    if (isClient && !authService.isAuthenticated()) {
      router.push('/login');
    }
  }, [isClient, router]);

  return {
    isAuthenticated: isClient ? authService.isAuthenticated() : false,
    user,
    logout: authService.logout,
    getToken: authService.getToken
  };
};

// Hook to redirect authenticated users away from auth pages
export const useRedirectIfAuthenticated = (redirectTo = '/dashboard') => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && authService.isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [isClient, router, redirectTo]);
};

// Higher-order component for protected routes
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      return null; // Will redirect to login
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Utility function to get user from token (if needed)
export const getUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    // Note: This is a simple decode, not verification
    // For production, you should verify the token on the server
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Utility function to check if token is expired
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

// Add this if missing
export function authHeader() {
  // Example: get token from localStorage and return header
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
