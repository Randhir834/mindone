const mongoose = require("mongoose");

// New sub-schema for individual notifications
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
}, { _id: false }); // _id is not needed for sub-documents in an array

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
  // ADDED: Array to store in-app notifications
  notifications: [notificationSchema]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);