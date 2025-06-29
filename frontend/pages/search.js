import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { documentService } from '../services/documentService';
import { formatDistanceToNow } from 'date-fns';

export default function SearchResults() {
  const router = useRouter();
  const { q: initialQuery } = router.query;
  const [query, setQuery] = useState(initialQuery || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Handle search with debounce
  useEffect(() => {
    const fetchResults = async () => {
      if (!query?.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await documentService.searchDocuments(query);
        setResults(data);
        // Update URL without page reload
        router.push(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
      } catch (error) {
        console.error('Search failed:', error);
        setError(error.msg || 'Failed to fetch search results');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Clear existing timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Set new timeout
    searchDebounceRef.current = setTimeout(fetchResults, 300);

    // Cleanup
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(`/documents/${results[selectedIndex]._id}`);
        }
        break;
      case '/':
        if (e.target !== searchInputRef.current) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
        break;
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Highlight matching text
  const highlightMatch = (text, searchQuery) => {
    if (!searchQuery?.trim()) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 text-gray-900">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Search */}
        <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded-lg">
                  /
                </kbd>
                <span className="text-sm text-gray-500">to search</span>
              </div>
            </div>

            {/* Enhanced Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents by title or content..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white/50 backdrop-blur-sm transition-all duration-200"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Stats */}
            {query && !isLoading && results.length > 0 && (
              <p className="text-sm text-gray-500">
                Found {results.length} {results.length === 1 ? 'document' : 'documents'}
              </p>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-gray-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Searching documents...</p>
            </div>
          ) : error ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-gray-100">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-4 text-gray-900">{error}</p>
              <button
                onClick={() => router.reload()}
                className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
              >
                Try again
              </button>
            </div>
          ) : results.length === 0 ? (
            query ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-gray-100">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-4 text-gray-500">No documents found for "{query}"</p>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg border border-gray-100">
                <div className="max-w-sm mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="mt-4 text-gray-500">Start typing to search across your documents</p>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <span>↑↓</span>
                      <span>to navigate</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 rounded-lg">
                      <span>↵</span>
                      <span>to select</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="grid gap-4">
              {results.map((doc, index) => (
                <Link
                  key={doc._id}
                  href={`/documents/${doc._id}`}
                  className={`block bg-white/80 backdrop-blur-sm rounded-2xl p-6 transition-all duration-200 border ${
                    index === selectedIndex 
                      ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200' 
                      : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {highlightMatch(doc.title, query)}
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {doc.visibility === 'private' && '🔒'}
                          {doc.visibility === 'shared' && '👥'}
                          {doc.visibility === 'public' && '🌍'}
                        </span>
                      </div>

                      {doc.content && (
                        <div className="mt-2 prose prose-sm max-w-none text-gray-500">
                          {highlightMatch(doc.content.replace(/<[^>]*>?/gm, '').substring(0, 300), query)}
                          {doc.content.length > 300 && '...'}
                        </div>
                      )}

                      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {doc.author?.name || doc.author?.email || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 