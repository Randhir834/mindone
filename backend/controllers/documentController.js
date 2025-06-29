const Document = require('../models/Document');
const User = require('../models/User');
const { createVersion, getVersionHistory, getVersion, compareVersions, restoreVersion } = require('../utils/versionControl');

/**
 * Parses HTML content to extract all mentioned user IDs from 'data-mention' attributes.
 * @param {string} content - The HTML content of the document.
 * @returns {Set<string>} A Set of unique user IDs that were mentioned.
 */
const extractMentionedIds = (content) => {
    if (!content) return new Set();
    
    const ids = new Set();
    const mentionRegex = /data-mention="([^"]+)"/g;
    let match;
    
    console.log('Extracting mentions from content:', content.substring(0, 200) + '...');
    
    while ((match = mentionRegex.exec(content)) !== null) {
        // match[1] is the captured group (the user ID)
        const userId = match[1];
        if (userId && userId.trim()) {
            ids.add(userId.trim());
            console.log('Found mention:', userId);
        }
    }
    
    console.log('Total mentions found:', ids.size);
    return ids;
};

/**
 * Processes mentions, auto-shares the document, and sends in-app notifications.
 * @param {object} document - The mongoose document being saved.
 * @param {string} newContent - The new content for the document.
 * @param {string} oldContent - The previous content of the document.
 * @param {string} authorId - The ID of the user saving the document.
 */
const processMentions = async (document, newContent, oldContent, authorId) => {
    try {
        const newMentionIds = extractMentionedIds(newContent);
        const oldMentionIds = extractMentionedIds(oldContent);

        // Determine who is newly mentioned by finding IDs in the new set but not the old one.
        const newlyMentionedIds = [...newMentionIds].filter(id => !oldMentionIds.has(id));

        if (newlyMentionedIds.length === 0) {
            return; // No new mentions to process
        }

        console.log(`Found ${newlyMentionedIds.length} new mentions.`);

        for (const userId of newlyMentionedIds) {
            try {
                // A user cannot mention themselves to gain access.
                if (userId === authorId.toString()) {
                    continue;
                }

                // Check if the user is already in the sharedWith list to avoid duplicates.
                const isAlreadyShared = document.sharedWith.some(
                    share => share.user.toString() === userId
                );

                if (!isAlreadyShared) {
                    // Auto-Share Document with read-only access.
                    document.sharedWith.push({ user: userId, permission: 'view' });
                    console.log(`Auto-sharing document "${document.title}" with user ${userId}`);
                }

                // Create and push an in-app notification.
                const notification = {
                    documentId: document._id,
                    mentionedBy: authorId,
                    timestamp: new Date(),
                    read: false
                };

                // Add notification to the mentioned user's 'notifications' array.
                // Use updateOne instead of findByIdAndUpdate for better error handling
                const updateResult = await User.updateOne(
                    { _id: userId },
                    {
                        $push: { 
                            notifications: {
                                $each: [notification],
                                $position: 0 // Adds the new notification to the top of the list.
                            }
                        }
                    }
                );
                
                if (updateResult.modifiedCount > 0) {
                    console.log(`Pushed in-app notification to user ${userId} for document ${document._id}`);
                } else {
                    console.log(`User ${userId} not found or notification not added`);
                }
            } catch (userError) {
                console.error(`Error processing mention for user ${userId}:`, userError);
                // Continue processing other mentions even if one fails
                // Don't throw the error to avoid affecting document creation
            }
        }
    } catch (error) {
        console.error('Error in processMentions:', error);
        // Don't re-throw the error to avoid affecting document creation
        // Just log it and continue
    }
};

/**
 * @desc    Create a new document
 * @route   POST /api/documents
 * @access  Private
 */
exports.createDocument = async (req, res) => {
  const { title, content, visibility } = req.body;
  try {
    // Step 1: Create and save the document first to get an _id.
    let newDocument = new Document({
      title,
      content,
      visibility,
      author: req.userId // Attached from 'protect' middleware
    });
    
    // Initial save to generate the document's _id
    await newDocument.save();

    // Step 2: Create the initial version
    await createVersion(
      newDocument._id,
      { title, content, visibility },
      req.userId,
      'Document created'
    );

    // Step 3: Now that the document has an _id, process mentions.
    // This will modify the newDocument object in memory.
    // IMPORTANT: We don't want mention processing to fail the document creation
    if (content && content.includes('data-mention')) {
      try {
        await processMentions(newDocument, content, '', req.userId);
        // Save again only if mentions were processed successfully
        await newDocument.save();
      } catch (mentionError) {
        console.error('Error processing mentions (non-fatal):', mentionError);
        // Document creation succeeds even if mention processing fails
        // The document is already saved from step 1
      }
    }

    // Step 4: Return the saved document
    const savedDocument = await Document.findById(newDocument._id)
      .populate('author', 'name email')
      .populate('sharedWith.user', 'name email');
    
    res.status(201).json(savedDocument);
  } catch (err) {
    console.error('Error creating document:', err.message);
    res.status(500).json({ msg: 'Failed to create document' });
  }
};

/**
 * @desc    Update a document (for auto-save)
 * @route   PUT /api/documents/:id
 * @access  Private
 */
exports.updateDocument = async (req, res) => {
  try {
    const { title, content, visibility } = req.body;
    let document = await Document.findById(req.params.id);

    if (!document) {
        return res.status(404).json({ msg: 'Document not found' });
    }

    // Check if user has permission to edit
    const isAuthor = document.author.toString() === req.userId;
    const canEdit = document.sharedWith.find(
        share => share.user.toString() === req.userId && share.permission === 'edit'
    );

    if (!isAuthor && !canEdit) {
        return res.status(403).json({ msg: 'User not authorized to update this document' });
    }

    // Store old content before updating to find *new* mentions
    const oldContent = document.content;
    const oldTitle = document.title;
    const oldVisibility = document.visibility;

    // Update fields if they are provided in the request
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (visibility !== undefined) document.visibility = visibility;
    
    // Process any new mentions if content was updated
    if (content !== undefined) {
        await processMentions(document, content, oldContent, req.userId);
    }

    const updatedDocument = await document.save();

    // Create a new version if there are significant changes
    const hasSignificantChanges = 
      content !== undefined && content !== oldContent ||
      title !== undefined && title !== oldTitle ||
      visibility !== undefined && visibility !== oldVisibility;

    if (hasSignificantChanges) {
      await createVersion(
        document._id,
        { 
          title: document.title, 
          content: document.content, 
          visibility: document.visibility 
        },
        req.userId
      );
    }

    res.json(updatedDocument);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Share a document with another user
 * @route   POST /api/documents/:id/share
 * @access  Private
 */
exports.shareDocument = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const documentId = req.params.id;

    // Validate permission
    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({ msg: 'Permission must be either "view" or "edit"' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check if user has permission to share this document
    const isAuthor = document.author.toString() === req.userId;
    if (!isAuthor) {
      return res.status(403).json({ msg: 'Only the document author can share the document' });
    }

    // Check if user is trying to share with themselves
    if (userId === req.userId) {
      return res.status(400).json({ msg: 'Cannot share document with yourself' });
    }

    // Check if the target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if already shared with this user
    const existingShare = document.sharedWith.find(
      share => share.user.toString() === userId
    );

    if (existingShare) {
      // Update existing permission
      existingShare.permission = permission;
    } else {
      // Add new share
      document.sharedWith.push({ user: userId, permission });
    }

    await document.save();

    res.json({ msg: 'Document shared successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- UNCHANGED FUNCTIONS ---

/**
 * @desc    Get all documents accessible by user
 * @route   GET /api/documents
 * @access  Private
 */
exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { visibility: 'public' },
        { author: req.userId },
        { 'sharedWith.user': req.userId }
      ]
    }).populate('author', 'name email').sort({ updatedAt: -1 });

    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single document by ID
 * @route   GET /api/documents/:id
 * @access  Private (with logic for public access)
 */
exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('author', 'name email')
      .populate('sharedWith.user', 'name email');

    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    const isAuthor = document.author._id.toString() === req.userId;
    const isSharedWith = document.sharedWith.some(
      share => share.user._id.toString() === req.userId
    );

    if (document.visibility !== 'public' && !isAuthor && !isSharedWith) {
      return res.status(403).json({ msg: 'Not authorized to view this document' });
    }

    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Delete a document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    if (document.author.toString() !== req.userId) {
      return res.status(401).json({ msg: 'User not authorized to delete this document' });
    }

    await document.deleteOne();
    res.json({ msg: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Search documents
 * @route   GET /api/documents/search?q=query
 * @access  Private
 */
exports.searchDocuments = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ msg: 'Search query is required' });
        }

        const documents = await Document.find({
            $text: { $search: query },
            $or: [
                { visibility: 'public' },
                { author: req.userId },
                { 'sharedWith.user': req.userId }
            ]
        }).populate('author', 'name email');

        res.json(documents);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * @desc    Get a public document by ID (no authentication required)
 * @route   GET /api/documents/public/:id
 * @access  Public
 */
exports.getPublicDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('author', 'name email')
      .populate('sharedWith.user', 'name email');

    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Only allow access to public documents
    if (document.visibility !== 'public') {
      return res.status(403).json({ msg: 'This document is not publicly accessible' });
    }

    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Remove a user from document sharing
 * @route   DELETE /api/documents/:id/share/:userId
 * @access  Private
 */
exports.removeSharedUser = async (req, res) => {
  try {
    const { id: documentId, userId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check if user has permission to manage sharing for this document
    const isAuthor = document.author.toString() === req.userId;
    if (!isAuthor) {
      return res.status(403).json({ msg: 'Only the document author can manage sharing' });
    }

    // Check if the user is actually shared with this document
    const existingShareIndex = document.sharedWith.findIndex(
      share => share.user.toString() === userId
    );

    if (existingShareIndex === -1) {
      return res.status(404).json({ msg: 'User is not shared with this document' });
    }

    // Remove the user from sharedWith array
    document.sharedWith.splice(existingShareIndex, 1);
    await document.save();

    res.json({ msg: 'User removed from document sharing' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get version history for a document
 * @route   GET /api/documents/:id/versions
 * @access  Private
 */
exports.getVersionHistory = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check if user has permission to view
    const isAuthor = document.author.toString() === req.userId;
    const canView = document.visibility === 'public' || 
                   document.sharedWith.find(share => share.user.toString() === req.userId);

    if (!isAuthor && !canView) {
      return res.status(403).json({ msg: 'User not authorized to view this document' });
    }

    const versions = await getVersionHistory(req.params.id, parseInt(req.query.limit) || 50);
    res.json(versions);
  } catch (err) {
    console.error('Error getting version history:', err.message);
    res.status(500).json({ msg: 'Failed to get version history' });
  }
};

/**
 * @desc    Get a specific version of a document
 * @route   GET /api/documents/:id/versions/:version
 * @access  Private
 */
exports.getVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check if user has permission to view
    const isAuthor = document.author.toString() === req.userId;
    const canView = document.visibility === 'public' || 
                   document.sharedWith.find(share => share.user.toString() === req.userId);

    if (!isAuthor && !canView) {
      return res.status(403).json({ msg: 'User not authorized to view this document' });
    }

    const version = await getVersion(req.params.id, parseInt(req.params.version));
    if (!version) {
      return res.status(404).json({ msg: 'Version not found' });
    }

    res.json(version);
  } catch (err) {
    console.error('Error getting version:', err.message);
    res.status(500).json({ msg: 'Failed to get version' });
  }
};

/**
 * @desc    Compare two versions of a document
 * @route   GET /api/documents/:id/compare/:version1/:version2
 * @access  Private
 */
exports.compareVersions = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check if user has permission to view
    const isAuthor = document.author.toString() === req.userId;
    const canView = document.visibility === 'public' || 
                   document.sharedWith.find(share => share.user.toString() === req.userId);

    if (!isAuthor && !canView) {
      return res.status(403).json({ msg: 'User not authorized to view this document' });
    }

    const diff = await compareVersions(
      req.params.id, 
      parseInt(req.params.version1), 
      parseInt(req.params.version2)
    );

    res.json(diff);
  } catch (err) {
    console.error('Error comparing versions:', err.message);
    res.status(500).json({ msg: 'Failed to compare versions' });
  }
};

/**
 * @desc    Restore a document to a previous version
 * @route   POST /api/documents/:id/restore/:version
 * @access  Private
 */
exports.restoreVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check if user has permission to edit
    const isAuthor = document.author.toString() === req.userId;
    const canEdit = document.sharedWith.find(
        share => share.user.toString() === req.userId && share.permission === 'edit'
    );

    if (!isAuthor && !canEdit) {
      return res.status(403).json({ msg: 'User not authorized to edit this document' });
    }

    const restoredVersion = await restoreVersion(
      req.params.id, 
      parseInt(req.params.version), 
      req.userId
    );

    // Update the main document with restored content
    document.title = restoredVersion.title;
    document.content = restoredVersion.content;
    document.visibility = restoredVersion.visibility;
    await document.save();

    res.json({ 
      message: 'Document restored successfully', 
      restoredVersion,
      document 
    });
  } catch (err) {
    console.error('Error restoring version:', err.message);
    res.status(500).json({ msg: 'Failed to restore version' });
  }
};