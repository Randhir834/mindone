/**
 * DocumentCard component displays a single document in a card format.
 * It shows document metadata, visibility status, and content preview.
 * @param {Object} document - The document object containing metadata and content
 * @param {string} currentUserId - ID of the currently logged in user
 * @param {Function} onDelete - Callback function when document is deleted
 */
import { useRouter } from 'next/router';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import { documentService } from '../services/documentService';
import { toast } from 'react-toastify';

export default function DocumentCard({ document: docData, currentUserId, onDelete }) {
  const router = useRouter();

  // Navigate to document detail page when card is clicked
  const handleClick = () => {
    router.push(`/documents/${docData._id}`);
  };

  // Handle document deletion with confirmation
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
    try {
      await documentService.deleteDocument(docData._id);
      if (onDelete) onDelete(docData._id);
      toast.success('Document deleted successfully!');
    } catch (error) {
      toast.error(error.msg || 'Failed to delete document.');
    }
  };

  // Handle PDF download
  const handleDownload = async (e) => {
    e.stopPropagation(); // Prevent card click
    try {
      toast.info('Preparing PDF for download...', {
        autoClose: false,
        toastId: `pdf-${docData._id}`
      });
      
      const blob = await documentService.downloadPDF(docData._id);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create a temporary link element using window.document
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${docData.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      
      // Append to body, click, and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(`pdf-${docData._id}`);
      toast.success('PDF download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss(`pdf-${docData._id}`);
      if (error.message.includes('Server did not return a PDF file')) {
        toast.error('The server response was not in PDF format. Please try again later.');
      } else if (error.message.includes('Failed to fetch')) {
        toast.error('Network error. Please check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to download PDF');
      }
    }
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

  // Get appropriate visibility text and styling based on document visibility level
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

  // Process and sanitize HTML content for preview
  // Handles mentions and trims content to 200 characters
  let htmlPreview = '';
  if (typeof window !== 'undefined' && docData.content) {
    // Use DOMParser to safely parse HTML in the browser
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(docData.content, 'text/html');
    let charCount = 0;
    let result = '';

    // Recursive function to traverse DOM and extract text while preserving mentions
    function traverse(node) {
      if (charCount >= 200) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const remaining = 200 - charCount;
        const text = node.textContent.slice(0, remaining);
        charCount += text.length;
        result += text;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Preserve mention styling while stripping other HTML
        if (node.classList.contains && node.classList.contains('mention')) {
          result += `<span class=\"mention\">${node.textContent.slice(0, 200 - charCount)}</span>`;
          charCount += node.textContent.length;
        } else {
          for (let child of node.childNodes) {
            traverse(child);
            if (charCount >= 200) break;
          }
        }
      }
    }
    traverse(doc.body);
    // Sanitize final HTML to prevent XSS
    htmlPreview = DOMPurify.sanitize(result) + (charCount >= 200 ? '...' : '');
  }

  return (
    <div 
      onClick={handleClick}
      className="group relative"
    >
      {/* Gradient background effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
      
      {/* Main card content container */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100/50 transition-all duration-500 cursor-pointer w-full h-[320px] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-bl-[100px] opacity-20 transition-transform duration-500 group-hover:scale-150 group-hover:opacity-30"></div>
        
        <div className="p-6 flex flex-col h-full relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getVisibilityIcon(docData.visibility)}
              {getVisibilityText(docData.visibility)}
            </div>
            <div className="flex items-center space-x-2">
              {/* Download PDF Button */}
              <button
                onClick={handleDownload}
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                title="Download PDF"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                {docData.updatedAt && formatDistanceToNow(new Date(docData.updatedAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300 mb-2 line-clamp-2 h-[3.5rem]">
            {docData.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-4 flex-grow group-hover:text-gray-800 transition-colors duration-300 h-[5rem]">
            {htmlPreview ? (
              <span dangerouslySetInnerHTML={{ __html: htmlPreview }} />
            ) : (
              'No content'
            )}
          </p>

          <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {(docData.author?.name || docData.author?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-gray-600">
                <span className="font-medium bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {docData.author?.name || docData.author?.email || 'Unknown'}
                </span>
              </span>
            </div>
            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              {docData.createdAt && new Date(docData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}