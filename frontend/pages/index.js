/**
 * Home/Landing Page
 * Handles initial routing based on authentication status:
 * - Redirects to dashboard if user is authenticated
 * - Redirects to login if user is not authenticated
 * - Shows loading state during authentication check
 */
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import authService from '../services/authService';

export default function Home() {
  const router = useRouter();

  // Check authentication status and redirect accordingly
  useEffect(() => {
    // Check if user is authenticated
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  // Show loading spinner while checking auth and redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
