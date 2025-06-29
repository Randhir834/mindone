import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { documentService } from '../../services/documentService';
import Editor from '../../components/Editor';

export default function CreateDocument() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: { title: '', content: '', visibility: 'private' }
  });

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col items-center py-12">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-pink-500 animate-gradient-text">
            Create New Document
          </h1>
          <p className="mt-2 text-gray-500 text-base">Craft your ideas into beautiful documents ✨</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-indigo-100 p-8 sm:p-10 space-y-8">
            {/* Step 1: Document Details */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 border-b border-gray-100 pb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-indigo-600 tracking-widest">01.</span>
                  <span className="text-sm font-bold text-gray-700 uppercase">Document Title <span className="text-pink-500">*</span></span>
                </div>
                <input
                  id="title"
                  type="text"
                  className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter a descriptive title..."
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <p className="error-message">{errors.title.message}</p>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-fuchsia-500 tracking-widest">02.</span>
                  <span className="text-sm font-bold text-gray-700 uppercase">Visibility Setting <span className="text-pink-500">*</span></span>
                </div>
                <select
                  id="visibility"
                  className="form-input w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-fuchsia-400"
                  {...register('visibility')}
                >
                  <option value="private">Private – Only you can access</option>
                  <option value="shared">Shared – Only invited users</option>
                  <option value="public">Public – Anyone with the link</option>
                </select>
              </div>
            </div>
            {/* Step 2: Document Content */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-purple-500 tracking-widest">03.</span>
                <span className="text-sm font-bold text-gray-700 uppercase">Document Content</span>
                <span className="text-gray-400 italic ml-2">Write your story...</span>
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
            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="form-button bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover-lift w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="form-button bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 text-white font-bold shadow-lg hover:from-indigo-600 hover:to-pink-600 hover-lift w-full sm:w-auto"
              >
                {isLoading ? 'Creating...' : 'Create Document'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}