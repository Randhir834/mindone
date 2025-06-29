const Document = require('../models/Document');
const User = require('../models/User');

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
                await User.findByIdAndUpdate(userId, {
                    $push: { 
                        notifications: {
                            $each: [notification],
                            $position: 0 // Adds the new notification to the top of the list.
                        }
                    }
                });
                console.log(`Pushed in-app notification to user ${userId} for document ${document._id}`);
            } catch (userError) {
                console.error(`Error processing mention for user ${userId}:`, userError);
                // Continue processing other mentions even if one fails
            }
        }
    } catch (error) {
        console.error('Error in processMentions:', error);
        throw error; // Re-throw to be handled by the calling function
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

    // Step 2: Now that the document has an _id, process mentions.
    // This will modify the newDocument object in memory.
    try {
      await processMentions(newDocument, content, '', req.userId);
    } catch (mentionError) {
      console.error('Error processing mentions:', mentionError);
      // Don't fail the document creation if mention processing fails
      // The document will still be created without mention processing
    }

    // Step 3: Save the document again to persist the changes from processMentions (like sharedWith).
    const savedDocument = await newDocument.save();
    
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

    // Update fields if they are provided in the request
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (visibility !== undefined) document.visibility = visibility;
    
    // Process any new mentions if content was updated
    if (content !== undefined) {
        await processMentions(document, content, oldContent, req.userId);
    }

    const updatedDocument = await document.save();
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