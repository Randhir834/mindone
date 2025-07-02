/**
 * User Model
 * Represents a user in the system with authentication and notification capabilities
 */

const mongoose = require("mongoose");

/**
 * Notification sub-schema
 * Defines structure for in-app notifications, particularly for document mentions
 * @property {ObjectId} documentId - Reference to the document where user was mentioned
 * @property {ObjectId} mentionedBy - Reference to the user who created the mention
 * @property {Boolean} read - Notification read status
 * @property {Date} timestamp - When the notification was created
 */
const notificationSchema = new mongoose.Schema({
  documentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Document', 
    required: true 
  },
  mentionedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false }); // Disable _id for notifications to optimize storage

/**
 * Main user schema
 * @property {String} name - User's full name
 * @property {String} email - User's unique email address
 * @property {String} password - Hashed password
 * @property {String} resetToken - Token for password reset
 * @property {Date} resetTokenExpiry - Expiration time for reset token
 * @property {String} otp - One-time password for email verification
 * @property {Date} otpExpiry - Expiration time for OTP
 * @property {Boolean} isVerified - Email verification status
 * @property {Array} notifications - List of user's notifications
 * @property {Date} createdAt - Account creation timestamp (added by timestamps)
 * @property {Date} updatedAt - Last update timestamp (added by timestamps)
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  resetToken: String,
  resetTokenExpiry: Date,
  // Email verification fields
  otp: String,
  otpExpiry: Date,
  isVerified: {
    type: Boolean,
    default: false
  },
  // In-app notifications array
  notifications: [notificationSchema]
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Export the model
module.exports = mongoose.model("User", userSchema);