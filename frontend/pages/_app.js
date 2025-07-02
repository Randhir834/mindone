/**
 * Root Application Component
 * Wraps all pages with common functionality:
 * - Authentication context
 * - Global keyboard shortcuts
 * - Toast notifications
 * - Common layout elements
 */
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../utils/auth';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Head from 'next/head';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if we're already on the search page
      if (router.pathname === '/search') return;

      // Open search with Cmd/Ctrl + K or forward slash
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      } else if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        router.push('/search');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <AuthProvider>
      {/* Global head settings */}
      <Head>
        <title>Knowledge Base Platform</title>
      </Head>
      <div>
        {/* Render current page component */}
        <Component {...pageProps} onOpenSearch={() => router.push('/search')} />
        
        {/* Global toast notifications */}
        <Toaster position="bottom-right" />
        
        {/* Global footer */}
        <footer style={{ textAlign: 'center', padding: '1rem 0', color: '#888', fontSize: '0.95rem' }}>
          &copy; {new Date().getFullYear()} Knowledge Base Platform. All rights reserved.
        </footer>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default MyApp; 