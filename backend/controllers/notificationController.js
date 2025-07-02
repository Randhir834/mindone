// Import required models
const User = require('../models/User');

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/notifications
 * @access  Private
 * @description Retrieves user's notifications with populated document and user details
 */
exports.getNotifications = async (req, res) => {
  try {
    // Find user and populate notification references
    const user = await User.findById(req.userId).populate({
      path: 'notifications.documentId',
      select: 'title',
      model: 'Document' // Explicitly specify the model to prevent errors
    }).populate({
      path: 'notifications.mentionedBy',
      select: 'name',
      model: 'User' // Explicitly specify the model
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Transform notifications to handle deleted documents
    const notifications = user.notifications
      .filter(notification => notification.documentId) // Filter out notifs for deleted docs
      .map(notification => ({
        _id: notification._id,
        documentId: notification.documentId._id,
        documentTitle: notification.documentId.title,
        mentionedBy: notification.mentionedBy ? notification.mentionedBy._id : null,
        mentionedUserName: notification.mentionedBy ? notification.mentionedBy.name : 'A user',
        read: notification.read,
        timestamp: notification.timestamp,
        createdAt: notification.timestamp
    }));

    res.json(notifications);
  } catch (err) {
    console.error('Get Notifications Error:', err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 * @description Updates a specific notification's read status to true
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Update notification status in a single atomic operation
    const result = await User.updateOne(
      { _id: req.userId, 'notifications._id': notificationId },
      { $set: { 'notifications.$.read': true } }
    );

    // Check if notification was found and updated
    if (result.nModified === 0) {
      return res.status(404).json({ msg: 'Notification not found or already marked as read' });
    }

    res.json({ msg: 'Notification marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};