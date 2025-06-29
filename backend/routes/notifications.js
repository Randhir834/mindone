const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationAsRead);

module.exports = router;