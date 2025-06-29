const mongoose = require('mongoose');

const shareSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' }
}, { _id: false });

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
  // Version control fields
  currentVersion: {
    type: Number,
    default: 1
  },
  lastVersionCreatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create a text index for searching content and title
documentSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Document', documentSchema);