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
      // Improved validation
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

      // CORRECTED: The createDocument endpoint on the backend will now handle
      // parsing mentions, sharing, and creating notifications automatically.
      const newDoc = await documentService.createDocument(data.title, data.content, data.visibility);
      
      toast.success('Document created successfully!');
      // Navigate to the new document's page for a better user experience
      router.push(`/documents/${newDoc._id}`);
    } catch (error) {
      console.error('Create document error:', error);
      toast.error(error.msg || 'Failed to create document.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Create New Document
            </h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-indigo-100 p-8 space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input
                        id="title"
                        type="text"
                        className="w-full rounded-lg border-gray-300 shadow-sm"
                        {...register('title', { required: 'Title is required' })}
                    />
                    {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                    <Controller
                        name="content"
                        control={control}
                        render={({ field }) => <Editor content={field.value} onUpdate={field.onChange} />}
                    />
                </div>
                
                <div>
                    <label htmlFor="visibility" className="block text-sm font-bold text-gray-700 mb-2">Visibility</label>
                    <select
                        id="visibility"
                        className="w-full rounded-lg border-gray-300 shadow-sm"
                        {...register('visibility')}
                    >
                        <option value="private">🔒 Private</option>
                        <option value="shared">👥 Shared</option>
                        <option value="public">🌍 Public</option>
                    </select>
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => router.back()} className="px-4 py-2 border rounded-lg">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50">
                        {isLoading ? 'Creating...' : 'Create Document'}
                    </button>
                </div>
            </div>
        </form>
      </div>
    </div>
  );
}