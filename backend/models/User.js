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
 * @property {String} firstName - User's first name
 * @property {String} lastName - User's last name
 * @property {String} phone - User's phone number
 * @property {String} bio - User's biography/description
 * @property {String} location - User's location/city
 * @property {String} company - User's company/organization
 * @property {String} website - User's website URL
 * @property {String} avatar - User's avatar image URL
 * @property {String} resetToken - Token for password reset
 * @property {Date} resetTokenExpiry - Expiration time for reset token
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
  // Enhanced profile fields
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  location: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  resetToken: String,
  resetTokenExpiry: Date,

  // In-app notifications array
  notifications: [notificationSchema]
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

// Export the model
module.exports = mongoose.model("User", userSchema);