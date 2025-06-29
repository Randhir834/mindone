import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { documentService } from '../../../services/documentService';
import Head from 'next/head';

export default function PublicDocument() {
  const router = useRouter();
  const { id } = router.query;
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadPublicDocument();
    }
  }, [id]);

  const loadPublicDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentService.getPublicDocument(id);
      setDocument(doc);
    } catch (err) {
      setError(err.msg || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-600 text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-600">The document you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{document.title} - Public Document</title>
        <meta name="description" content={`Public document: ${document.title}`} />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
                <p className="text-gray-600 mt-2">
                  By {document.author?.name || 'Unknown Author'} • 
                  Last updated {new Date(document.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  🌍 Public Document
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Created: {new Date(document.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Shared with {document.sharedWith?.length || 0} users</span>
            </div>
          </div>

          {/* Document Content */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: document.content || '<p>No content available.</p>' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-gray-500 text-sm">
            <p>This is a public document. Anyone with this link can view it.</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Sign in to create your own documents
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 