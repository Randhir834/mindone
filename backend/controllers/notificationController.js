const User = require('../models/User');

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res) => {
  try {
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

    // Transform notifications, handling cases where a document might have been deleted
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
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    
    // Use a single atomic operation to update the notification
    const result = await User.updateOne(
      { _id: req.userId, 'notifications._id': notificationId },
      { $set: { 'notifications.$.read': true } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ msg: 'Notification not found or already marked as read' });
    }

    res.json({ msg: 'Notification marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};