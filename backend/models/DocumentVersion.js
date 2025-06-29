const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  version: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'shared'],
    default: 'private'
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changeType: {
    type: String,
    enum: ['created', 'updated', 'title_changed', 'content_changed', 'visibility_changed'],
    default: 'updated'
  },
  changeSummary: {
    type: String,
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  characterCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// Index for efficient querying
documentVersionSchema.index({ documentId: 1, version: -1 });
documentVersionSchema.index({ documentId: 1, createdAt: -1 });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema); 