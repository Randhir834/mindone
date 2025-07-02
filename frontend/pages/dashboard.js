/**
 * Dashboard Page Component
 * Main interface for document management:
 * - Document listing and filtering
 * - Document creation and deletion
 * - Search functionality
 * - User profile and notifications
 * - Authentication state management
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/auth';
import DocumentCard from '../components/DocumentCard';
import { documentService } from '../services/documentService';
import Notifications from '../components/Notifications';
import ProfileModal from '../components/ProfileModal';

export default function Dashboard() {
  // State management
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [search, setSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Auth and routing hooks
  const { isAuthenticated, logout, getToken, user } = useAuth();
  const router = useRouter();

  // Handle client-side mounting
  useEffect(() => { setIsClient(true); }, []);
  
  // Authentication check and redirect
  useEffect(() => { 
    if (isClient && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [isClient, isAuthenticated, router]);
  
  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching documents...');
        console.log('Auth token:', getToken()); // Log the auth token
        const fetchedDocuments = await documentService.getDocuments();
        console.log('Fetched documents:', fetchedDocuments); // Log the fetched documents
        setDocuments(fetchedDocuments);
        toast.success('Documents loaded successfully!');
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error(error.msg || 'Failed to load documents');
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (isAuthenticated && isClient) {
      console.log('User is authenticated, fetching documents...');
      fetchDocuments();
    } else {
      console.log('User is not authenticated or not on client side');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('isClient:', isClient);
    }
  }, [isAuthenticated, isClient, getToken]);

  // Handle document creation navigation
  const handleCreateDocument = (e) => {
    e.preventDefault(); // Prevent default button behavior
    console.log('Create document clicked, navigating...');
    try {
      router.push('/documents/create').catch(error => {
        console.error('Navigation error:', error);
        toast.error('Failed to navigate to create page');
      });
    } catch (error) {
      console.error('Error in handleCreateDocument:', error);
      toast.error('Failed to navigate to create page');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      logout();
      toast.success('Logged out successfully');
      await router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Filter documents based on search query
  const filteredDocs = documents.filter(doc =>
    doc.title?.toLowerCase().includes(search.toLowerCase()) ||
    doc.content?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle document deletion from list
  const handleDeleteDocument = (deletedId) => {
    setDocuments((docs) => docs.filter((doc) => doc._id !== deletedId));
    toast.success('Document deleted successfully!');
  };

  // Make toast globally available for DocumentCard
  if (typeof window !== 'undefined') {
    window.toast = toast;
  }

  // Show loading state while authenticating
  if (!isClient || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header Section with Navigation */}
      <div className="mb-10 px-4 sm:px-6 lg:px-8 pt-6">
        <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 overflow-hidden border border-indigo-100 animate-fadeInUp">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 opacity-10">
            <svg className="w-40 h-40 text-indigo-500 transform rotate-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 opacity-10">
            <svg className="w-32 h-32 text-purple-500 transform -rotate-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          
          {/* Header Title and Icon */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-lg animate-float group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/20">
              <svg className="h-12 w-12 text-white transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 animate-gradient-text">Document Hub</h1>
              <p className="text-gray-600 text-lg">Your creative workspace for managing documents</p>
            </div>
          </div>

          {/* Navigation Bar with Search and Actions */}
          <nav className="flex flex-col md:flex-row items-stretch gap-4 mt-6 md:mt-0">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                className="pl-11 w-full h-[50px] rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 hover:bg-white/80"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {/* Clear Search Button */}
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Create Document Button */}
            <Link
              href="/documents/create"
              className="h-[50px] px-6 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02] hover:shadow-emerald-500/20"
            >
              <svg className="h-5 w-5 transform group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Document
            </Link>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications Component */}
              <div className="h-[50px] flex items-center">
                <Notifications />
              </div>
              {/* Profile Button */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="h-[50px] px-6 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02] hover:shadow-indigo-500/20"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                My Profile
              </button>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="h-[50px] px-6 rounded-xl font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02] hover:shadow-rose-500/20"
              >
                <svg className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-8 lg:px-12 w-full">
        {/* Document Count Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 animate-fadeInUp">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-20"></div>
              <h2 className="relative text-2xl font-bold text-gray-900 flex items-center gap-3 bg-white/50 backdrop-blur-sm py-2 px-4 rounded-lg">
                Your Documents <span className="text-indigo-500 font-normal">({filteredDocs.length})</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Document List Section */}
        {isLoading ? (
          // Loading State
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200">
                <div className="absolute top-0 left-0 right-0 bottom-0 border-t-4 border-indigo-600 rounded-full"></div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading your documents...</p>
            </div>
          </div>
        ) : filteredDocs.length > 0 ? (
          // Document Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fadeInUp">
            {filteredDocs.map((document, idx) => (
              <div 
                key={document._id} 
                style={{ animationDelay: `${idx * 100}ms` }} 
                className="animate-fadeInUp transform hover:scale-105 transition-all duration-300"
              >
                <DocumentCard 
                  document={document} 
                  currentUserId={user?.id || user?._id} 
                  onDelete={handleDeleteDocument} 
                />
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-16 animate-fadeInUp">
            <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-indigo-50">
              <div className="mb-6">
                <svg className="h-16 w-16 text-indigo-400 mx-auto animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No documents found
              </h3>
              <p className="text-gray-600 mb-8">
                Start your journey by creating your first document. It's simple and takes just a few clicks!
              </p>
              <Link
                href="/documents/create"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-base font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
              >
                <svg className="h-5 w-5 mr-2 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Document
              </Link>
            </div>
          </div>
        )}
      </main>
      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

// Animation Classes:
// .animate-fadeInUp { animation: fadeInUp 0.7s both; }
// .animate-bounceIn { animation: bounceIn 0.7s both; }
// .animate-pulseGlow { animation: pulseGlow 2s infinite; }
// .animate-float { animation: floating 3s infinite; }
