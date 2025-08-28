import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { documentService } from '../../services/documentService';
import Editor from '../../components/Editor';
import React from 'react'; // Added missing import for React

export default function CreateDocument() {
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const router = useRouter();
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: { title: '', content: '', visibility: 'private' }
  });

  const watchedContent = watch('content');

  // Calculate word count
  const calculateWordCount = (htmlContent) => {
    if (!htmlContent) return 0;
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return textContent.split(' ').filter(word => word.length > 0).length;
  };

  // Update word count when content changes
  React.useEffect(() => {
    setWordCount(calculateWordCount(watchedContent));
  }, [watchedContent]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const plainTextContent = data.content.replace(/<[^>]*>?/gm, '').trim();
      if (!data.title.trim()) {
        toast.error("Title is required.");
        setIsLoading(false);
        return;
      }
      if (!plainTextContent) {
        toast.error("Content is required.");
        setIsLoading(false);
        return;
      }
      const newDoc = await documentService.createDocument(data.title, data.content, data.visibility);
      if (newDoc && newDoc._id) {
        toast.success('Document created successfully!');
        router.push('/dashboard');
      } else {
        throw new Error('Document creation failed - no document ID returned');
      }
    } catch (error) {
      console.error('Create document error:', error);
      if (error.msg && !error.msg.includes('successfully')) {
        toast.error(error.msg || 'Failed to create document.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-indigo-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Create New Document</h1>
            </div>
            
            {/* Document Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Auto-save enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Document Details Card */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-indigo-100 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Document Title */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">1</span>
                  </div>
                  <div>
                    <label htmlFor="title" className="text-lg font-semibold text-gray-900">
                      Document Title
                    </label>
                    <p className="text-sm text-gray-500">Give your document a descriptive name</p>
                  </div>
                </div>
                <input
                  id="title"
                  type="text"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                  placeholder="Enter a compelling title..."
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Visibility Setting */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-fuchsia-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-fuchsia-600">2</span>
                  </div>
                  <div>
                    <label htmlFor="visibility" className="text-lg font-semibold text-gray-900">
                      Visibility Setting
                    </label>
                    <p className="text-sm text-gray-500">Control who can access your document</p>
                  </div>
                </div>
                <select
                  id="visibility"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition-all duration-200"
                  {...register('visibility')}
                >
                  <option value="private">🔒 Private – Only you can access</option>
                  <option value="shared">👥 Shared – Only invited users</option>
                  <option value="public">🌐 Public – Anyone with the link</option>
                </select>
              </div>
            </div>
          </div>

          {/* Document Content Card */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-indigo-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Document Content</h3>
                <p className="text-sm text-gray-500">Write your story with our professional editor</p>
              </div>
            </div>
            
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Editor content={field.value} onUpdate={field.onChange} />
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Document...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Document
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Enhanced CSS for animations */}
      <style jsx global>{`
        @keyframes gradient-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
        }
        
        .form-button {
          @apply px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105;
        }
        
        .hover-lift {
          @apply transform hover:-translate-y-1 hover:shadow-lg transition-all duration-200;
        }
        
        .error-message {
          @apply mt-2 text-sm text-red-600;
        }
      `}</style>
    </div>
  );
}