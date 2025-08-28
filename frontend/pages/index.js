/**
 * Enhanced Home/Landing Page
 * Feature-rich landing page with:
 * - Hero section with call-to-action
 * - Feature showcase
 * - Statistics and metrics
 * - Quick actions
 * - Testimonials
 * - Integration with existing auth system
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiFileText, 
  FiUsers, 
  FiClock, 
  FiShield, 
  FiSearch, 
  FiEdit3, 
  FiShare2, 
  FiBell,
  FiTrendingUp,
  FiZap,
  FiCheckCircle,
  FiArrowRight,
  FiStar,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiDownload,
  FiGlobe,
  FiLock,
  FiSmartphone,
  FiCloud,
  FiPlus,
  FiUpload,
  FiBarChart3
} from 'react-icons/fi';
import authService from '../services/authService';
import FeatureShowcase from '../components/FeatureShowcase';
import StatisticsSection from '../components/StatisticsSection';
import CallToAction from '../components/CallToAction';
import TestimonialsSection from '../components/TestimonialsSection';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/register');
    }
  };

  const features = [
    {
      icon: FiFileText,
      title: "Rich Document Editor",
      description: "Advanced text editor with formatting, images, and real-time collaboration",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Real-time collaboration",
        "Rich text formatting",
        "Image and media support",
        "Auto-save functionality"
      ]
    },
    {
      icon: FiUsers,
      title: "Team Collaboration",
      description: "Work together with mentions, comments, and shared workspaces",
      color: "from-green-500 to-emerald-500",
      features: [
        "User mentions (@username)",
        "Comment threads",
        "Shared workspaces",
        "Activity tracking"
      ]
    },
    {
      icon: FiClock,
      title: "Version Control",
      description: "Track changes, revert versions, and maintain document history",
      color: "from-purple-500 to-pink-500",
      features: [
        "Document versioning",
        "Change tracking",
        "Revert capabilities",
        "Audit trail"
      ]
    },
    {
      icon: FiShield,
      title: "Secure Sharing",
      description: "Control access with granular permissions and secure links",
      color: "from-orange-500 to-red-500",
      features: [
        "Granular permissions",
        "Secure sharing links",
        "Access controls",
        "Privacy settings"
      ]
    },
    {
      icon: FiSearch,
      title: "Smart Search",
      description: "Find documents instantly with powerful search and filters",
      color: "from-indigo-500 to-blue-500",
      features: [
        "Full-text search",
        "Advanced filters",
        "Search suggestions",
        "Recent documents"
      ]
    },
    {
      icon: FiBell,
      title: "Real-time Notifications",
      description: "Stay updated with mentions, comments, and document changes",
      color: "from-yellow-500 to-orange-500",
      features: [
        "Instant notifications",
        "Email alerts",
        "Push notifications",
        "Mention tracking"
      ]
    }
  ];

  const advancedFeatures = [
    {
      icon: FiZap,
      title: "Lightning Fast",
      description: "Optimized for speed with instant loading and real-time updates"
    },
    {
      icon: FiLock,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance with industry standards"
    },
    {
      icon: FiGlobe,
      title: "Global Access",
      description: "Access your documents from anywhere, on any device"
    },
    {
      icon: FiBarChart3,
      title: "Advanced Analytics",
      description: "Track usage, collaboration patterns, and productivity metrics"
    }
  ];

  const stats = [
    { 
      number: "10K+", 
      label: "Documents Created", 
      icon: FiFileText,
      description: "Millions of words written and shared"
    },
    { 
      number: "5K+", 
      label: "Active Users", 
      icon: FiUsers,
      description: "Growing community of creators"
    },
    { 
      number: "99.9%", 
      label: "Uptime", 
      icon: FiShield,
      description: "Reliable service you can count on"
    },
    { 
      number: "24/7", 
      label: "Support", 
      icon: FiZap,
      description: "Always here when you need help"
    }
  ];

  const quickActions = [
    {
      icon: FiPlus,
      title: "Create Document",
      description: "Start a new document with our rich editor",
      action: () => router.push('/documents/create'),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: FiUpload,
      title: "Upload Files",
      description: "Import existing documents and files",
      action: () => router.push('/dashboard'),
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: FiUsers,
      title: "Invite Team",
      description: "Collaborate with your team members",
      action: () => router.push('/dashboard'),
      color: "from-purple-500 to-pink-500"
    }
  ];

  const testimonials = [
    {
      content: "MindOne has completely transformed how our team collaborates on documents. The real-time features and mentions system are game-changers.",
      author: "Sarah Johnson",
      title: "Product Manager",
      company: "Tech Startup",
      rating: 5
    },
    {
      content: "The version control and collaboration features have made our document workflow so much more efficient. Highly recommended!",
      author: "Michael Chen",
      title: "Content Director",
      company: "Marketing Agency",
      rating: 5
    },
    {
      content: "Finally, a document platform that actually understands what teams need. The user experience is exceptional.",
      author: "Emily Rodriguez",
      title: "Content Director",
      company: "Creative Agency",
      rating: 5
    }
  ];

  if (isLoading) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                MindOne
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/login"
                    className="px-6 py-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200 nav-link"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 btn-hover-lift"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="px-6 py-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200 nav-link"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 btn-hover-lift"
                  >
                    Go to App
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Transform Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 block animate-gradient-text">
                Document Workflow
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate platform for creating, collaborating, and managing documents with advanced features like real-time editing, version control, and intelligent mentions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 btn-hover-lift"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                <FiArrowRight className="w-5 h-5" />
              </button>

            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-10 hero-floating">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 right-10 opacity-10 hero-floating" style={{ animationDelay: '2s' }}>
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatisticsSection 
        stats={stats}
        title="Trusted by Teams Worldwide"
        subtitle="Join thousands of users who trust MindOne for their document needs"
      />

      {/* Main Features Section */}
      <FeatureShowcase
        title="Powerful Features for Modern Teams"
        subtitle="Everything you need to create, collaborate, and manage documents effectively"
        features={features}
        columns={3}
        showActions={true}
        className="bg-white/30"
      />

      {/* Advanced Features Section */}
      <FeatureShowcase
        title="Built for the Modern World"
        subtitle="Advanced capabilities that keep you ahead of the curve"
        features={advancedFeatures}
        columns={4}
        showDescriptions={true}
        className="bg-gradient-to-r from-indigo-50 to-purple-50"
      />

      {/* Quick Actions Section */}
      {isAuthenticated && (
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <p className="text-lg text-gray-600">
                Get started with your documents right away
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={action.action}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 text-left group quick-action-btn"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <TestimonialsSection 
        testimonials={testimonials}
        title="What Our Users Say"
        subtitle="Real feedback from real users who love MindOne"
        className="bg-white/30"
      />

      {/* CTA Section */}
      <CallToAction
        title="Ready to Transform Your Workflow?"
        subtitle="Join thousands of teams already using MindOne to create amazing documents together."
        primaryButton={{
          text: isAuthenticated ? 'Go to Dashboard' : 'Get Started Free',
          action: handleGetStarted,
          icon: FiArrowRight,
          variant: "primary"
        }}
        background="gradient"
        backgroundColors="from-indigo-600 to-purple-600"
        showBadge={true}
        badgeText="Join Now"
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">MindOne</span>
              </div>
              <p className="text-gray-400">
                The ultimate platform for document collaboration and management.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiGithub className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FiLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MindOne. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
