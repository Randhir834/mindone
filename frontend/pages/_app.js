import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../utils/auth';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Head from 'next/head';

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
      <Head>
        <title>Knowledge Base Platform</title>
      </Head>
      <div>
        <Component {...pageProps} onOpenSearch={() => router.push('/search')} />
        <Toaster position="bottom-right" />
      </div>
    </AuthProvider>
  );
}

export default MyApp; 