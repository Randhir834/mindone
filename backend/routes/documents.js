/**
 * Document Routes
 * Handles document creation, management, sharing, and version control
 */

const express = require('express');
const router = express.Router();
// Import document controller functions
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  searchDocuments,
  shareDocument,
  getPublicDocument,
  removeSharedUser,
  getVersionHistory,
  getVersion,
  compareVersions,
  restoreVersion
} = require('../controllers/documentController');

// Import authentication middleware
const { protect } = require('../middleware/auth');

/**
 * Public Document Routes
 * These routes do not require authentication
 */
/** GET /api/documents/public/:id - Get a publicly shared document */
router.get('/public/:id', getPublicDocument);

/**
 * Protected Routes
 * All routes below this middleware require authentication
 */
router.use(protect);

// Search route must come before other routes to avoid path conflicts
/** GET /api/documents/search - Search across user's accessible documents */
router.get('/search', searchDocuments);

/**
 * Base Document Routes
 */
router.route('/')
  /** POST /api/documents - Create a new document */
  .post(createDocument)
  /** GET /api/documents - Get all accessible documents */
  .get(getDocuments);

/**
 * Document Management Routes
 */
router.route('/:id')
  /** GET /api/documents/:id - Get a specific document */
  .get(getDocumentById)
  /** PUT /api/documents/:id - Update document content */
  .put(updateDocument)
  /** DELETE /api/documents/:id - Delete a document */
  .delete(deleteDocument);

/**
 * Document Sharing Routes
 */
/** POST /api/documents/:id/share - Share document with another user */
router.post('/:id/share', shareDocument);
/** DELETE /api/documents/:id/share/:userId - Remove user's access to document */
router.delete('/:id/share/:userId', removeSharedUser);

/**
 * Version Control Routes
 * Handle document versioning and comparison
 */
/** GET /api/documents/:id/versions - Get document version history */
router.get('/:id/versions', getVersionHistory);
/** GET /api/documents/:id/versions/:version - Get specific version */
router.get('/:id/versions/:version', getVersion);
/** GET /api/documents/:id/compare/:version1/:version2 - Compare two versions */
router.get('/:id/compare/:version1/:version2', compareVersions);
/** POST /api/documents/:id/restore/:version - Restore to previous version */
router.post('/:id/restore/:version', restoreVersion);

// Export the router
module.exports = router;