const Document = require('../models/Document');
const User = require('../models/User');
const { createVersion, getVersionHistory, getVersion, compareVersions, restoreVersion } = require('../utils/versionControl');

/**
 * Helper function to extract user IDs from document content mentions
 * @param {string} content - The HTML content of the document.
 * @returns {Set<string>} A Set of unique user IDs that were mentioned.
 * @description Parses HTML content to find all user IDs in data-mention attributes
 */
const extractMentionedIds = (content) => {
    if (!content) return new Set();
    
    const ids = new Set();
    // Regex to match data-mention attributes in HTML
    const mentionRegex = /data-mention="([^"]+)"/g;
    let match;
    
    console.log('Extracting mentions from content:', content.substring(0, 200) + '...');
    
    // Extract all mentions using regex
    while ((match = mentionRegex.exec(content)) !== null) {
        // match[1] contains the captured user ID
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
 * Helper function to handle document mentions
 * @param {object} document - The mongoose document being saved
 * @param {string} newContent - New document content
 * @param {string} oldContent - Previous document content
 * @param {string} authorId - ID of the user making the changes
 * @description Processes new mentions, shares document with mentioned users, and sends notifications
 */
const processMentions = async (document, newContent, oldContent, authorId) => {
    try {
        // Extract mentions from both old and new content
        const newMentionIds = extractMentionedIds(newContent);
        const oldMentionIds = extractMentionedIds(oldContent);

        // Find only the newly added mentions
        const newlyMentionedIds = [...newMentionIds].filter(id => !oldMentionIds.has(id));

        if (newlyMentionedIds.length === 0) {
            return; // Exit if no new mentions
        }

        console.log(`Found ${newlyMentionedIds.length} new mentions.`);

        // Process each newly mentioned user
        for (const userId of newlyMentionedIds) {
            try {
                // Skip if user mentions themselves
                if (userId === authorId.toString()) {
                    continue;
                }

                // Check for existing share permissions
                const isAlreadyShared = document.sharedWith.some(
                    share => share.user.toString() === userId
                );

                // Auto-share document if not already shared
                if (!isAlreadyShared) {
                    document.sharedWith.push({ user: userId, permission: 'view' });
                    console.log(`Auto-sharing document "${document.title}" with user ${userId}`);
                }

                // Prepare notification object
                const notification = {
                    documentId: document._id,
                    mentionedBy: authorId,
                    timestamp: new Date(),
                    read: false
                };

                // Add notification to user's notifications array
                const updateResult = await User.updateOne(
                    { _id: userId },
                    {
                        $push: { 
                            notifications: {
                                $each: [notification],
                                $position: 0 // Add to start of array
                            }
                        }
                    }
                );
                
                // Log notification status
                if (updateResult.modifiedCount > 0) {
                    console.log(`Pushed in-app notification to user ${userId} for document ${document._id}`);
                } else {
                    console.log(`User ${userId} not found or notification not added`);
                }
            } catch (userError) {
                console.error(`Error processing mention for user ${userId}:`, userError);
                // Continue with other mentions if one fails
            }
        }
    } catch (error) {
        console.error('Error in processMentions:', error);
        // Log error but don't throw to prevent document save failure
    }
};

/**
 * @desc    Create a new document with version control and mention processing
 * @route   POST /api/documents
 * @access  Private
 */
exports.createDocument = async (req, res) => {
  const { title, content, visibility } = req.body;
  try {
    // Step 1: Initial document creation
    let newDocument = new Document({
      title,
      content,
      visibility,
      author: req.userId
    });
    
    // Save to generate document ID
    await newDocument.save();

    // Step 2: Create initial version record
    await createVersion(
      newDocument._id,
      { title, content, visibility },
      req.userId,
      'Document created'
    );

    // Step 3: Process any mentions in content
    if (content && content.includes('data-mention')) {
      try {
        await processMentions(newDocument, content, '', req.userId);
        await newDocument.save();
      } catch (mentionError) {
        console.error('Error processing mentions (non-fatal):', mentionError);
      }
    }

    // Step 4: Return populated document
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
 * @desc    Update document content with version control and mention processing
 * @route   PUT /api/documents/:id
 * @access  Private
 */
exports.updateDocument = async (req, res) => {
  try {
    const { title, content, visibility } = req.body;
    let document = await Document.findById(req.params.id);

    // Validate document exists
    if (!document) {
        return res.status(404).json({ msg: 'Document not found' });
    }

    // Check user permissions
    const isAuthor = document.author.toString() === req.userId;
    const canEdit = document.sharedWith.find(
        share => share.user.toString() === req.userId && share.permission === 'edit'
    );

    if (!isAuthor && !canEdit) {
        return res.status(403).json({ msg: 'User not authorized to update this document' });
    }

    // Store original values for version control
    const oldContent = document.content;
    const oldTitle = document.title;
    const oldVisibility = document.visibility;

    // Update document fields
    if (title !== undefined) document.title = title;
    if (content !== undefined) document.content = content;
    if (visibility !== undefined) document.visibility = visibility;
    
    // Process mentions if content changed
    if (content !== undefined) {
        await processMentions(document, content, oldContent, req.userId);
    }

    const updatedDocument = await document.save();

    // Create version if significant changes made
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
 * @desc    Share document with another user
 * @route   POST /api/documents/:id/share
 * @access  Private (Author only)
 */
exports.shareDocument = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const documentId = req.params.id;

    // Validate permission value
    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({ msg: 'Permission must be either "view" or "edit"' });
    }

    // Find and validate document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Verify author permission
    const isAuthor = document.author.toString() === req.userId;
    if (!isAuthor) {
      return res.status(403).json({ msg: 'Only the document author can share the document' });
    }

    // Prevent self-sharing
    if (userId === req.userId) {
      return res.status(400).json({ msg: 'Cannot share document with yourself' });
    }

    // Verify target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update or add sharing permission
    const existingShare = document.sharedWith.find(
      share => share.user.toString() === userId
    );

    if (existingShare) {
      existingShare.permission = permission;
    } else {
      document.sharedWith.push({ user: userId, permission });
    }

    await document.save();

    res.json({ msg: 'Document shared successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- DOCUMENT ACCESS AND RETRIEVAL FUNCTIONS ---

/**
 * @desc    Get all documents accessible by user
 * @route   GET /api/documents
 * @access  Private
 */
exports.getDocuments = async (req, res) => {
  try {
    // Find documents that are either public, authored by user, or shared with user
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
 * @desc    Get a single document by ID with access control
 * @route   GET /api/documents/:id
 * @access  Private (with public access logic)
 */
exports.getDocumentById = async (req, res) => {
  try {
    // Find and populate document details
    const document = await Document.findById(req.params.id)
      .populate('author', 'name email')
      .populate('sharedWith.user', 'name email');

    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check access permissions
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
 * @desc    Delete a document (author only)
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    // Validate document exists
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Verify author permission
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
 * @desc    Search documents with text index
 * @route   GET /api/documents/search?q=query
 * @access  Private
 */
exports.searchDocuments = async (req, res) => {
    try {
        const query = req.query.q;
        // Validate search query
        if (!query) {
            return res.status(400).json({ msg: 'Search query is required' });
        }

        // Search with text index and access control
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
 * @desc    Get public document without authentication
 * @route   GET /api/documents/public/:id
 * @access  Public
 */
exports.getPublicDocument = async (req, res) => {
  try {
    // Find and populate document details
    const document = await Document.findById(req.params.id)
      .populate('author', 'name email')
      .populate('sharedWith.user', 'name email');

    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Verify document is public
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
 * @desc    Remove user from document sharing
 * @route   DELETE /api/documents/:id/share/:userId
 * @access  Private (Author only)
 */
exports.removeSharedUser = async (req, res) => {
  try {
    const { id: documentId, userId } = req.params;

    // Find and validate document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Verify author permission
    const isAuthor = document.author.toString() === req.userId;
    if (!isAuthor) {
      return res.status(403).json({ msg: 'Only the document author can manage sharing' });
    }

    // Find shared user
    const existingShareIndex = document.sharedWith.findIndex(
      share => share.user.toString() === userId
    );

    if (existingShareIndex === -1) {
      return res.status(404).json({ msg: 'User is not shared with this document' });
    }

    // Remove user from sharing
    document.sharedWith.splice(existingShareIndex, 1);
    await document.save();

    res.json({ msg: 'User removed from document sharing' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- VERSION CONTROL FUNCTIONS ---

/**
 * @desc    Get version history of a document
 * @route   GET /api/documents/:id/versions
 * @access  Private
 */
exports.getVersionHistory = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check access permissions
    const isAuthor = document.author.toString() === req.userId;
    const canView = document.visibility === 'public' || 
                   document.sharedWith.find(share => share.user.toString() === req.userId);

    if (!isAuthor && !canView) {
      return res.status(403).json({ msg: 'User not authorized to view this document' });
    }

    // Get version history with optional limit
    const versions = await getVersionHistory(req.params.id, parseInt(req.query.limit) || 50);
    res.json(versions);
  } catch (err) {
    console.error('Error getting version history:', err.message);
    res.status(500).json({ msg: 'Failed to get version history' });
  }
};

/**
 * @desc    Get specific version of a document
 * @route   GET /api/documents/:id/versions/:version
 * @access  Private
 */
exports.getVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check access permissions
    const isAuthor = document.author.toString() === req.userId;
    const canView = document.visibility === 'public' || 
                   document.sharedWith.find(share => share.user.toString() === req.userId);

    if (!isAuthor && !canView) {
      return res.status(403).json({ msg: 'User not authorized to view this document' });
    }

    // Get specific version
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

    // Check access permissions
    const isAuthor = document.author.toString() === req.userId;
    const canView = document.visibility === 'public' || 
                   document.sharedWith.find(share => share.user.toString() === req.userId);

    if (!isAuthor && !canView) {
      return res.status(403).json({ msg: 'User not authorized to view this document' });
    }

    // Compare versions
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
 * @desc    Restore document to a previous version
 * @route   POST /api/documents/:id/restore/:version
 * @access  Private
 */
exports.restoreVersion = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check edit permissions
    const isAuthor = document.author.toString() === req.userId;
    const canEdit = document.sharedWith.find(
        share => share.user.toString() === req.userId && share.permission === 'edit'
    );

    if (!isAuthor && !canEdit) {
      return res.status(403).json({ msg: 'User not authorized to edit this document' });
    }

    // Restore to specified version
    const restoredVersion = await restoreVersion(
      req.params.id, 
      parseInt(req.params.version), 
      req.userId
    );

    // Update main document with restored content
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

/**
 * @desc    Generate and download PDF version of a document
 * @route   GET /api/documents/:id/pdf
 * @access  Private
 */
exports.downloadPDF = async (req, res) => {
  let browser = null;
  try {
    console.log('Starting PDF download process for document:', req.params.id);
    
    const document = await Document.findById(req.params.id)
      .populate('author', 'name email');

    if (!document) {
      console.log('Document not found:', req.params.id);
      return res.status(404).json({ msg: 'Document not found' });
    }

    // Check user permissions
    const isAuthor = document.author._id.toString() === req.userId;
    const hasAccess = document.visibility === 'public' || 
                     isAuthor || 
                     document.sharedWith.some(share => share.user.toString() === req.userId);

    if (!hasAccess) {
      console.log('Access denied for user:', req.userId);
      return res.status(403).json({ msg: 'Access denied' });
    }

    console.log('Initializing puppeteer...');
    const puppeteer = require('puppeteer');

    // Create HTML template for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6;
            }
            .header { 
              margin-bottom: 30px;
              border-bottom: 1px solid #eee;
              padding-bottom: 20px;
            }
            .title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px;
              color: #2563eb;
            }
            .metadata { 
              color: #666; 
              font-size: 14px; 
              margin-bottom: 20px;
            }
            .content { 
              font-size: 14px;
              color: #333;
            }
            .mention {
              background-color: #e5edff;
              padding: 2px 4px;
              border-radius: 4px;
              color: #2563eb;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${document.title}</div>
            <div class="metadata">
              Author: ${document.author.name || document.author.email}<br>
              Created: ${new Date(document.createdAt).toLocaleDateString()}<br>
              Last Updated: ${new Date(document.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <div class="content">
            ${document.content}
          </div>
        </body>
      </html>
    `;

    console.log('Launching puppeteer browser...');
    // Launch puppeteer with more detailed error logging
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    }).catch(err => {
      console.error('Puppeteer launch error:', err);
      throw err;
    });
    
    console.log('Creating new page...');
    const page = await browser.newPage();
    
    console.log('Setting page content...');
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    }).catch(err => {
      console.error('Page content error:', err);
      throw err;
    });
    
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      printBackground: true,
      timeout: 30000
    }).catch(err => {
      console.error('PDF generation error:', err);
      throw err;
    });

    console.log('Setting response headers...');
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
    
    console.log('Sending PDF response...');
    res.send(pdfBuffer);

  } catch (err) {
    console.error('Detailed error in downloadPDF:', {
      message: err.message,
      stack: err.stack,
      userId: req.userId,
      documentId: req.params.id
    });
    res.status(500).json({ 
      msg: 'Server error while generating PDF',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close().catch(err => {
        console.error('Error closing browser:', err);
      });
    }
  }
};