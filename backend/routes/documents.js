const express = require('express');
const router = express.Router();
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

const { protect } = require('../middleware/auth');

// Public route for accessing public documents (no authentication required)
router.get('/public/:id', getPublicDocument);

// Apply the 'protect' middleware to all other routes in this file
router.use(protect);

// Note: The order of routes matters. More specific routes should come first.
router.get('/search', searchDocuments);

router.route('/')
  .post(createDocument)
  .get(getDocuments);

router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

router.post('/:id/share', shareDocument);
router.delete('/:id/share/:userId', removeSharedUser);

// Version control routes
router.get('/:id/versions', getVersionHistory);
router.get('/:id/versions/:version', getVersion);
router.get('/:id/compare/:version1/:version2', compareVersions);
router.post('/:id/restore/:version', restoreVersion);

module.exports = router;