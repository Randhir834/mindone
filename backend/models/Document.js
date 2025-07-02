/**
 * Document Model
 * Represents a document in the collaborative editing system
 */

const mongoose = require('mongoose');

/**
 * Sub-schema for document sharing permissions
 * Defines who has access to a document and their permission level
 */
const shareSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' }
}, { _id: false }); // Disable _id for subdocuments to optimize storage

/**
 * Main document schema
 * @property {String} title - Document title
 * @property {String} content - Document content in HTML format
 * @property {ObjectId} author - Reference to the document creator
 * @property {String} visibility - Document access level (public/private/shared)
 * @property {Array} sharedWith - List of users with access and their permissions
 * @property {Number} currentVersion - Current version number of the document
 * @property {Date} lastVersionCreatedAt - Timestamp of last version creation
 * @property {Date} createdAt - Document creation timestamp (added by timestamps)
 * @property {Date} updatedAt - Last update timestamp (added by timestamps)
 */
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'shared'],
    default: 'private'
  },
  sharedWith: [shareSchema],
  // Version control tracking
  currentVersion: {
    type: Number,
    default: 1
  },
  lastVersionCreatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); // Automatically manage createdAt and updatedAt fields

// Create text index for full-text search functionality
documentSchema.index({ title: 'text', content: 'text' });

// Export the model
module.exports = mongoose.model('Document', documentSchema);