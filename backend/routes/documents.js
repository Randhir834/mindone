const express = require('express');
const router = express.Router();
const {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  searchDocuments,
  shareDocument
} = require('../controllers/documentController');

const { protect } = require('../middleware/auth');

// Apply the 'protect' middleware to all routes in this file
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

module.exports = router;