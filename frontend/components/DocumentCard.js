import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentCard({ document }) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to the specific document page
    router.push(`/documents/${document._id}`);
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'private':
        return (
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            <div className="absolute -inset-0.5 bg-red-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition"></div>
            <svg className="h-6 w-6 text-red-500 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        );
      case 'shared':
        return (
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            <div className="absolute -inset-0.5 bg-blue-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition"></div>
            <svg className="h-6 w-6 text-blue-500 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      case 'public':
        return (
          <div className="relative group-hover:scale-110 transition-transform duration-300">
            <div className="absolute -inset-0.5 bg-green-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition"></div>
            <svg className="h-6 w-6 text-green-500 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getVisibilityText = (visibility) => {
    const colors = {
      private: 'bg-red-50 text-red-600 border-red-100 group-hover:bg-red-100',
      shared: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100',
      public: 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-100'
    };
    
    return (
      <span className={`text-xs px-3 py-1 rounded-full border ${colors[visibility] || 'bg-gray-50 text-gray-600'} transition-all duration-300`}>
        {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
      </span>
    );
  };

  // Strip HTML for a plain text preview
  const plainTextContent = document.content ? document.content.replace(/<[^>]*>?/gm, '') : '';

  return (
    <div 
      onClick={handleClick}
      className="group relative"
    >
      {/* Hover effect background */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
      
      {/* Card content */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100/50 transition-all duration-500 cursor-pointer w-full h-[320px] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-bl-[100px] opacity-20 transition-transform duration-500 group-hover:scale-150 group-hover:opacity-30"></div>
        
        <div className="p-6 flex flex-col h-full relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getVisibilityIcon(document.visibility)}
              {getVisibilityText(document.visibility)}
            </div>
            <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              {document.updatedAt && formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
            </div>
          </div>

          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 mb-2 line-clamp-2 h-[3.5rem]">
            {document.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-4 flex-grow group-hover:text-gray-800 transition-colors duration-300 h-[5rem]">
            {plainTextContent ? plainTextContent.substring(0, 200) + (plainTextContent.length > 200 ? '...' : '') : 'No content'}
          </p>

          <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {(document.author?.name || document.author?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-gray-600">
                <span className="font-medium bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {document.author?.name || document.author?.email || 'Unknown'}
                </span>
              </span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              {document.createdAt && new Date(document.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}