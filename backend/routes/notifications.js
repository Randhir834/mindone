/**
 * Notification Routes
 * Handles in-app notifications for document mentions
 */

const express = require('express');
const router = express.Router();
// Import notification controller functions
const {
  getNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');

// Import authentication middleware
const { protect } = require('../middleware/auth');

/**
 * Protected Routes
 * All notification routes require authentication
 */
router.use(protect);

/** GET /api/notifications - Get user's notifications */
router.get('/', getNotifications);
/** PUT /api/notifications/:id/read - Mark notification as read */
router.put('/:id/read', markNotificationAsRead);

// Export the router
module.exports = router;