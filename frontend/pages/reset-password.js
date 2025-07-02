/**
 * Reset Password Page Component
 * Handles password reset flow:
 * - Validates reset token from URL
 * - New password and confirmation form
 * - Password validation and error handling
 * - Success state and redirection to login
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { useRedirectIfAuthenticated } from '../utils/auth';

export default function ResetPassword() {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  
  // Router and form initialization
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  
  // Redirect if already authenticated
  useRedirectIfAuthenticated();

  // Extract token from URL query parameters
  useEffect(() => {
    // Get token from URL query parameter
    const { token: urlToken } = router.query;
    if (urlToken) {
      setToken(urlToken);
    }
  }, [router.query]);

  // Handle form submission
  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      toast.success('Password reset successful! Please login with your new password.');
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state
  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="auth-card">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-400 to-green-600 mb-6 floating-icon">
                <svg className="h-10 w-10 text-white success-checkmark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                Password reset successful!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show invalid token state
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="auth-card">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-red-400 to-red-600 mb-6 floating-icon">
                <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
                Invalid reset link
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                The password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/forgot-password" className="form-button inline-block">
                <span className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Request new reset link
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show password reset form
  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-card">
          {/* Header Section */}
          <div className="text-center mb-8">
            {/* Lock Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-6 floating-icon pulse-glow">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Reset your password
            </h2>
            <p className="text-sm text-gray-600">
              Enter your new password below to complete the reset process.
            </p>
          </div>

          {/* Password Reset Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* New Password Input */}
            <div className="form-field">
              <label htmlFor="password" className="form-label">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  New Password
                </div>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="form-input"
                placeholder="Enter your new password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="form-field">
              <label htmlFor="confirmPassword" className="form-label">
                <div className="flex items-center">
                  <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Confirm New Password
                </div>
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="form-input"
                placeholder="Confirm your new password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (val) => {
                    if (watch('password') != val) {
                      return "Passwords don't match";
                    }
                  }
                })}
              />
              {errors.confirmPassword && (
                <p className="error-message">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="form-field">
              <button
                type="submit"
                disabled={isLoading}
                className="form-button"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting password...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset password
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Login Link Section */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Remember your password?</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="form-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
