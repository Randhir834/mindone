/**
 * RecentActivity Component
 * Displays recent user activity, document changes, and system notifications
 * in an attractive timeline format
 */
import { motion } from 'framer-motion';
import { FiEdit3, FiPlus, FiTrash2, FiEye, FiShare2, FiClock, FiUser, FiFileText } from 'react-icons/fi';

const RecentActivity = ({
  activities = [],
  title = "Recent Activity",
  subtitle = "Stay updated with what's happening in your workspace",
  maxItems = 10,
  className = "",
  showViewAll = true
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'create':
        return FiPlus;
      case 'edit':
        return FiEdit3;
      case 'delete':
        return FiTrash2;
      case 'view':
        return FiEye;
      case 'share':
        return FiShare2;
      case 'mention':
        return FiUser;
      default:
        return FiFileText;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'create':
        return 'from-green-500 to-emerald-500';
      case 'edit':
        return 'from-blue-500 to-cyan-500';
      case 'delete':
        return 'from-red-500 to-pink-500';
      case 'view':
        return 'from-indigo-500 to-purple-500';
      case 'share':
        return 'from-orange-500 to-yellow-500';
      case 'mention':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <section className={`py-8 ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-gray-600">
            {subtitle}
          </p>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative"
        >
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 to-purple-200"></div>

          {/* Activity Items */}
          <div className="space-y-6">
            {displayedActivities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const activityColor = getActivityColor(activity.type);
              
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative flex items-start gap-4 group"
                >
                  {/* Timeline Dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-16 h-16 bg-gradient-to-r ${activityColor} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <ActivityIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {activity.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiClock className="w-4 h-4" />
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {activity.description}
                    </p>
                    
                    {/* Activity Metadata */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {activity.user && (
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span>{activity.user}</span>
                        </div>
                      )}
                      
                      {activity.document && (
                        <div className="flex items-center gap-2">
                          <FiFileText className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{activity.document}</span>
                        </div>
                      )}
                      
                      {activity.category && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {activity.category}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {activity.action && (
                      <button
                        onClick={activity.action}
                        className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all duration-200"
                      >
                        {activity.actionText || 'View Details'}
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* View All Button */}
          {showViewAll && activities.length > maxItems && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-8"
            >
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105">
                View All Activity
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {activities.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-500">Start creating documents to see your activity here</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default RecentActivity;
