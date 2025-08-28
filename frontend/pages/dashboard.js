/**
 * Enhanced Dashboard Page Component
 * Main interface for document management with new features:
 * - Document listing and filtering
 * - Document creation and deletion
 * - Search functionality
 * - User profile and notifications
 * - Authentication state management
 * - Feature showcase and quick actions
 * - Statistics and insights
 * - Recent activity and suggestions
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/auth';
import DocumentCard from '../components/DocumentCard';
import { documentService } from '../services/documentService';
import Notifications from '../components/Notifications';
import FeatureShowcase from '../components/FeatureShowcase';
import StatisticsSection from '../components/StatisticsSection';
import CallToAction from '../components/CallToAction';
import RecentActivity from '../components/RecentActivity';
import SuggestionsSection from '../components/SuggestionsSection';

export default function Dashboard() {
  // State management
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [search, setSearch] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);
  
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

  // Dashboard statistics
  const dashboardStats = [
    { 
      number: documents.length.toString(), 
      label: "Total Documents", 
      icon: "📄",
      description: "Your document collection"
    },
    { 
      number: filteredDocs.length.toString(), 
      label: "Filtered Results", 
      icon: "🔍",
      description: "Current search results"
    },
    { 
      number: "100%", 
      label: "Uptime", 
      icon: "⚡",
      description: "Always available"
    },
    { 
      number: "24/7", 
      label: "Support", 
      icon: "🛟",
      description: "Help when you need it"
    }
  ];

  // Quick action features
  const quickFeatures = [
    {
      icon: "📝",
      title: "Rich Text Editor",
      description: "Advanced editing with formatting, images, and real-time collaboration",
      color: "from-blue-500 to-cyan-500",
      action: () => router.push('/documents/create')
    },
    {
      icon: "👥",
      title: "Team Collaboration",
      description: "Work together with mentions, comments, and shared workspaces",
      color: "from-green-500 to-emerald-500",
      action: () => router.push('/documents')
    },
    {
      icon: "🔄",
      title: "Version Control",
      description: "Track changes, revert versions, and maintain document history",
      color: "from-purple-500 to-pink-500",
      action: () => router.push('/documents')
    },
    {
      icon: "🔒",
      title: "Secure Sharing",
      description: "Control access with granular permissions and secure links",
      color: "from-orange-500 to-red-500",
      action: () => router.push('/documents')
    },
    {
      icon: "🔍",
      title: "Smart Search",
      description: "Find documents instantly with powerful search and filters",
      color: "from-indigo-500 to-blue-500",
      action: () => setSearch('')
    },
    {
      icon: "🔔",
      title: "Real-time Notifications",
      description: "Stay updated with mentions, comments, and document changes",
      color: "from-yellow-500 to-orange-500",
      action: () => {}
    }
  ];

  // Sample recent activities
  const recentActivities = [
    {
      type: 'create',
      title: 'Document Created',
      description: 'You created a new document "Project Overview"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      user: 'You',
      document: 'Project Overview',
      category: 'Document',
      action: () => router.push('/documents'),
      actionText: 'View Document'
    },
    {
      type: 'edit',
      title: 'Document Updated',
      description: 'You made changes to "Meeting Notes - Q4 Planning"',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      user: 'You',
      document: 'Meeting Notes - Q4 Planning',
      category: 'Document',
      action: () => router.push('/documents'),
      actionText: 'View Changes'
    },
    {
      type: 'share',
      title: 'Document Shared',
      description: 'You shared "Team Guidelines" with 3 team members',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      user: 'You',
      document: 'Team Guidelines',
      category: 'Sharing',
      action: () => router.push('/documents'),
      actionText: 'View Sharing'
    },
    {
      type: 'mention',
      title: 'You were mentioned',
      description: 'Sarah mentioned you in a comment on "Product Roadmap"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      user: 'Sarah Johnson',
      document: 'Product Roadmap',
      category: 'Mention',
      action: () => router.push('/documents'),
      actionText: 'View Comment'
    },
    {
      type: 'view',
      title: 'Document Viewed',
      description: 'You viewed "API Documentation" for the first time',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      user: 'You',
      document: 'API Documentation',
      category: 'View',
      action: () => router.push('/documents'),
      actionText: 'Open Document'
    }
  ];

  // Sample suggestions and tips
  const suggestions = [
    {
      type: 'tip',
      title: 'Use @mentions for collaboration',
      description: 'Mention team members with @username to notify them about important updates or get their input on documents.',
      difficulty: 1,
      action: () => router.push('/documents/create'),
      actionText: 'Try it now'
    },
    {
      type: 'feature',
      title: 'Version control for safety',
      description: 'Every change is automatically saved and versioned. You can always revert to previous versions if needed.',
      difficulty: 1,
      action: () => router.push('/documents'),
      actionText: 'View versions'
    },
    {
      type: 'workflow',
      title: 'Create document templates',
      description: 'Save time by creating reusable templates for common document types like meeting notes or project briefs.',
      difficulty: 2,
      action: () => router.push('/templates'),
      actionText: 'Create template'
    },
    {
      type: 'shortcut',
      title: 'Keyboard shortcuts',
      description: 'Use Ctrl+S to save, Ctrl+F to search, and Ctrl+Shift+P for the command palette.',
      difficulty: 1,
      action: () => {},
      actionText: 'View shortcuts'
    },
    {
      type: 'tutorial',
      title: 'Advanced formatting',
      description: 'Learn how to use tables, images, and advanced formatting options to create professional documents.',
      difficulty: 2,
      action: () => router.push('/docs'),
      actionText: 'Read tutorial'
    },
    {
      type: 'collaboration',
      title: 'Real-time editing',
      description: 'Invite team members to collaborate on documents in real-time. See changes as they happen.',
      difficulty: 1,
      action: () => router.push('/documents'),
      actionText: 'Share document'
    }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-indigo-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left side - Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-3 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Document Hub</h1>
                <p className="text-gray-600 text-sm">Your creative workspace for managing documents</p>
              </div>
            </div>

            {/* Right side - Search and Actions */}
            <div className="flex flex-col md:flex-row items-stretch gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex-1 md:w-64 min-w-[200px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="pl-10 w-full h-[40px] rounded-lg border-gray-200 bg-white/50 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-300 hover:bg-white/80"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {/* Clear Search Button */}
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Create Document Button */}
              <Link
                href="/documents/create"
                className="h-[40px] px-4 rounded-lg font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02] hover:shadow-emerald-500/20"
              >
                <svg className="h-4 w-4 transform group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Document
              </Link>

              {/* User Actions */}
              <div className="flex items-center gap-2">
                {/* Notifications Component */}
                <div className="h-[40px] flex items-center">
                  <Notifications />
                </div>
                {/* Profile Button */}
                <button
                  onClick={() => {
                    console.log('Profile button clicked!');
                    console.log('Current router pathname:', router.pathname);
                    console.log('Attempting to navigate to /profile...');
                    router.push('/profile').then(() => {
                      console.log('Navigation to /profile successful');
                    }).catch((error) => {
                      console.error('Navigation to /profile failed:', error);
                    });
                  }}
                  className="h-[40px] px-4 rounded-lg font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02] hover:shadow-indigo-500/20"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  My Profile
                </button>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="h-[40px] px-4 rounded-lg font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group hover:scale-[1.02] hover:shadow-rose-500/20"
                >
                  <svg className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, {user?.name || 'User'}! 👋</h2>
          <p className="text-gray-600 text-lg">Ready to create something amazing today?</p>
        </div>

        {/* Dashboard Statistics */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {dashboardStats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-gray-600 text-sm mb-2">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
            <button
              onClick={() => setShowFeatures(!showFeatures)}
              className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
            >
              {showFeatures ? 'Hide Features' : 'Show Features'}
              <svg className={`w-5 h-5 transition-transform duration-200 ${showFeatures ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {showFeatures && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {quickFeatures.map((feature, index) => (
                <button
                  key={index}
                  onClick={feature.action}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 text-left group"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

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

        {/* Feature Showcase Section */}
        <div className="mt-20">
          <FeatureShowcase
            title="Platform Features"
            subtitle="Explore what MindOne can do for you and your team"
            features={quickFeatures.map(feature => ({
              icon: () => <span className="text-3xl">{feature.icon}</span>,
              title: feature.title,
              description: feature.description,
              color: feature.color
            }))}
            columns={3}
            showActions={true}
            className="bg-white/30"
          />
        </div>

        {/* Recent Activity Section */}
        <div className="mt-20">
          <RecentActivity
            activities={recentActivities}
            title="Recent Activity"
            subtitle="Stay updated with what's happening in your workspace"
            maxItems={5}
            className="bg-gradient-to-r from-indigo-50 to-purple-50"
          />
        </div>

        {/* Suggestions Section */}
        <div className="mt-20">
          <SuggestionsSection
            suggestions={suggestions}
            title="Suggestions & Tips"
            subtitle="Discover ways to work smarter with MindOne"
            className="bg-white/30"
          />
        </div>


      </div>
      
      {/* Profile Modal - Remove this since we now have a dedicated page */}
      {/* <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} /> */}
    </div>
  );
}

// Animation Classes:
// .animate-fadeInUp { animation: fadeInUp 0.7s both; }
// .animate-bounceIn { animation: bounceIn 0.7s both; }
// .animate-pulseGlow { animation: pulseGlow 2s infinite; }
// .animate-float { animation: floating 3s infinite; }
