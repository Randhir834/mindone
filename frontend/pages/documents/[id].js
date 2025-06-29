import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../utils/auth';
import Editor from '../../components/Editor';
import Notifications from '../../components/Notifications';

// Debounce hook
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
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const saveAttempts = useRef(0);
  const maxSaveAttempts = 3;

  const debouncedContent = useDebounce(content, 1500);
  const debouncedTitle = useDebounce(title, 1500);

  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated } = useAuth();

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
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error(error.msg || error.message || 'Failed to load document');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, router, isAuthenticated]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleAutoSave = useCallback(async () => {
    if (!document || isSaving || !hasUnsavedChanges) return;
    
    setIsSaving(true);
    
    try {
      await documentService.updateDocument(id, { title, content, visibility });
      
      setDocument(prev => ({ ...prev, title, content, visibility }));
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      saveAttempts.current = 0;
      
      toast.success('Changes saved', { id: 'autosave-toast', duration: 2000, icon: '✓' });
    } catch (error) {
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
  }, [id, title, content, visibility, document, isSaving, hasUnsavedChanges]);

  useEffect(() => {
    if (isLoading || !document) return;
    if (debouncedContent !== document.content || debouncedTitle !== document.title) {
      handleAutoSave();
    }
  }, [debouncedContent, debouncedTitle, document, isLoading, handleAutoSave]);

  const handleManualSave = async () => {
    if (!hasUnsavedChanges) return;
    await handleAutoSave();
  };

  const handleEditorUpdate = (newContent) => {
    setContent(newContent);
    if(newContent !== document.content) setHasUnsavedChanges(true);
  };
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setHasUnsavedChanges(true);
  };
  
  const handleVisibilityChange = (e) => {
    setVisibility(e.target.value);
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div></div>;
  }
  
  if (!document) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p>Document not found or you don't have permission.</p></div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
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
              <div>
                <input
                  value={title}
                  onChange={handleTitleChange}
                  className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 focus:outline-none p-0 w-full"
                  placeholder="Untitled Document"
                />
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 italic">
                  {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Notifications />
              <select value={visibility} onChange={handleVisibilityChange} className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                <option value="private">🔒 Private</option>
                <option value="shared">👥 Shared</option>
                <option value="public">🌍 Public</option>
              </select>
              <button
                onClick={handleManualSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300"
              >Save</button>
            </div>
          </nav>
        </div>

        <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-indigo-100">
          <div className="p-8">
            <Editor 
              content={content} 
              onUpdate={handleEditorUpdate}
              documentId={id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}