/**
 * Document Detail Page - Main editor/viewer for authenticated users
 * Features:
 * - Real-time document editing with autosave
 * - Version history management
 * - Document sharing and permissions
 * - Public/private visibility controls
 * - Collaborative features
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../utils/auth';
import Editor from '../../components/Editor';
import Notifications from '../../components/Notifications';
import SharingManager from '../../components/SharingManager';
import VersionHistory from '../../components/VersionHistory';

/**
 * Custom hook to debounce value changes
 * Used for autosaving to prevent too frequent API calls
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function DocumentDetail() {
  // Document state management
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const [canEdit, setCanEdit] = useState(false);
  
  // UI state management
  const [showSharing, setShowSharing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Autosave retry management
  const saveAttempts = useRef(0);
  const maxSaveAttempts = 3;

  // Debounce content and title changes for autosave
  const debouncedContent = useDebounce(content, 1500);
  const debouncedTitle = useDebounce(title, 1500);

  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user } = useAuth();

  // Warn user about unsaved changes when leaving page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Load document data and set initial state
  const loadDocument = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const doc = await documentService.getDocumentById(id);
      if (!doc) throw new Error('Document not found');
      
      setDocument(doc);
      setTitle(doc.title || '');
      setContent(doc.content || '');
      setVisibility(doc.visibility || 'private');
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      
      // Check user's permissions for this document
      const isAuthor = doc.author._id === user?.id;
      const hasEditPermission = doc.sharedWith?.some(
        share => share.user._id === user?.id && share.permission === 'edit'
      );
      setCanEdit(isAuthor || hasEditPermission);
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error(error.msg || error.message || 'Failed to load document');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, router, isAuthenticated, user]);

  // Load document on mount and when ID changes
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Handle automatic saving of changes
  const handleAutoSave = useCallback(async () => {
    if (!document || isSaving || !hasUnsavedChanges || !canEdit) return;
    
    setIsSaving(true);
    
    try {
      await documentService.updateDocument(id, { title, content, visibility });
      
      setDocument(prev => ({ ...prev, title, content, visibility }));
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      saveAttempts.current = 0;
      toast.success('Changes saved', { id: 'autosave-toast', duration: 2000, icon: '✓' });
    } catch (error) {
      // Implement exponential backoff for retries
      saveAttempts.current += 1;
      
      if (saveAttempts.current >= maxSaveAttempts) {
        toast.error('Unable to save. Please check connection.', { duration: 5000 });
        return;
      }
      
      setTimeout(() => handleAutoSave(), 2000 * saveAttempts.current);
      toast.error(error.msg || 'Failed to save - retrying...', { id: 'autosave-toast', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  }, [id, title, content, visibility, document, isSaving, hasUnsavedChanges, canEdit]);

  // Trigger autosave when debounced content or title changes
  useEffect(() => {
    if (isLoading || !document || !canEdit) return;
    if (debouncedContent !== document.content || debouncedTitle !== document.title) {
      handleAutoSave();
    }
  }, [debouncedContent, debouncedTitle, document, isLoading, handleAutoSave, canEdit]);

  // Handle manual save button click
  const handleManualSave = async () => {
    if (!hasUnsavedChanges || !canEdit) return;
    await handleAutoSave();
  };

  // Handle editor content updates
  const handleEditorUpdate = (newContent) => {
    if (!canEdit) return;
    setContent(newContent);
    if(newContent !== document.content) setHasUnsavedChanges(true);
  };
  
  // Handle document title changes
  const handleTitleChange = (e) => {
    if (!canEdit) return;
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };
  
  // Handle visibility setting changes
  const handleVisibilityChange = (e) => {
    if (!canEdit) return;
    setVisibility(e.target.value);
    setHasUnsavedChanges(true);
  };

  // Copy public document link to clipboard
  const copyPublicLink = async () => {
    if (visibility !== 'public') {
      toast.error('Document must be public to copy link');
      return;
    }
    
    const publicUrl = `${window.location.origin}/documents/public/${id}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Public link copied to clipboard!');
    } catch (error) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = publicUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Public link copied to clipboard!');
    }
  };

  const isAuthor = document?.author._id === user?.id;

  // Handle version restoration callback
  const handleVersionRestored = () => {
    loadDocument();
    toast.success('Document restored to previous version');
  };

  // Handle document deletion
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      await documentService.deleteDocument(id);
      toast.success('Document deleted successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.msg || 'Failed to delete document.');
    }
  };

  // Loading state
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div></div>;
  }
  
  // Not found or no permission state
  if (!document) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Document not found or you don't have permission.</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation and document controls */}
        <div className="mb-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back button with unsaved changes check */}
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (window.confirm('You have unsaved changes. Are you sure?')) router.push('/dashboard');
                  } else {
                    router.push('/dashboard');
                  }
                }}
                className="p-2 rounded-lg hover:bg-white/50"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              </button>
              {/* Document title and status */}
              <div>
                <input
                  value={title}
                  onChange={handleTitleChange}
                  disabled={!canEdit}
                  className={`text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 focus:outline-none p-0 w-full ${!canEdit ? 'cursor-not-allowed opacity-75' : ''}`}
                  placeholder="Untitled Document"
                />
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 italic">
                  {!canEdit && <span className="text-orange-600 font-medium">Read-only mode</span>}
                  {canEdit && (isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved')}
                  {document && <span>v{document.currentVersion || 1}</span>}
                </div>
              </div>
            </div>

            {/* Document action buttons */}
            <div className="flex items-center space-x-4">
              {/* Version history toggle */}
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700"
              >
                {showVersionHistory ? 'Hide History' : 'Version History'}
              </button>
              {/* Sharing controls (author only) */}
              {isAuthor && (
                <button
                  onClick={() => setShowSharing(!showSharing)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-600 text-white hover:bg-purple-700"
                >
                  {showSharing ? 'Hide Sharing' : 'Manage Sharing'}
                </button>
              )}
              {/* Public link copy button */}
              {visibility === 'public' && (
                <button
                  onClick={copyPublicLink}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                >
                  Copy Link
                </button>
              )}
              {/* Document controls for users with edit permission */}
              {canEdit && (
                <>
                  <select 
                    value={visibility} 
                    onChange={handleVisibilityChange} 
                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="private">🔒 Private</option>
                    <option value="shared">👥 Shared</option>
                    <option value="public">🌍 Public</option>
                  </select>
                  <button
                    onClick={handleManualSave}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300"
                  >Save</button>
                </>
              )}
              {/* Delete button (author only) */}
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-600 text-white hover:bg-red-700"
                  title="Delete Document"
                >
                  Delete
                </button>
              )}
            </div>
          </nav>
        </div>

        {/* Version history panel */}
        {showVersionHistory && (
          <div className="mb-6 bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-indigo-100">
            <VersionHistory 
              documentId={id} 
              onVersionRestored={handleVersionRestored}
            />
          </div>
        )}

        {/* Sharing management panel */}
        {showSharing && isAuthor && (
          <div className="mb-6">
            <SharingManager 
              document={document} 
              onUpdate={loadDocument}
            />
          </div>
        )}

        {/* Document editor */}
        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-indigo-100">
          <div className="p-8">
            <Editor 
              content={content} 
              onUpdate={handleEditorUpdate}
              documentId={id}
              readOnly={!canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}