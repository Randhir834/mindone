/**
 * Version Control Utility Module
 * Manages document versioning, comparison, and restoration
 */

const DocumentVersion = require('../models/DocumentVersion');
const Document = require('../models/Document');

/**
 * Calculate document statistics
 * @param {string} content - Document content with HTML markup
 * @returns {Object} Word and character counts
 * @description Removes HTML tags for accurate word counting while preserving them for character count
 */
const calculateCounts = (content) => {
  if (!content) return { wordCount: 0, characterCount: 0 };
  
  // Strip HTML tags and normalize whitespace for word counting
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const characterCount = content.length; // Include HTML in character count
  
  return { wordCount, characterCount };
};

/**
 * Generate a human-readable summary of changes
 * @param {Object} oldVersion - Previous version of the document
 * @param {Object} newVersion - New version of the document
 * @returns {string} Description of changes made
 */
const generateChangeSummary = (oldVersion, newVersion) => {
  const changes = [];
  
  // Check for title changes
  if (oldVersion.title !== newVersion.title) {
    changes.push('Title changed');
  }
  
  // Check for content changes and calculate difference in word count
  if (oldVersion.content !== newVersion.content) {
    const oldCount = calculateCounts(oldVersion.content);
    const newCount = calculateCounts(newVersion.content);
    
    if (newCount.wordCount > oldCount.wordCount) {
      changes.push(`Added ${newCount.wordCount - oldCount.wordCount} words`);
    } else if (newCount.wordCount < oldCount.wordCount) {
      changes.push(`Removed ${oldCount.wordCount - newCount.wordCount} words`);
    } else {
      changes.push('Content modified');
    }
  }
  
  // Check for visibility changes
  if (oldVersion.visibility !== newVersion.visibility) {
    changes.push(`Visibility changed to ${newVersion.visibility}`);
  }
  
  return changes.join(', ') || 'Minor changes';
};

/**
 * Determine the primary type of change made
 * @param {Object} oldVersion - Previous version of the document
 * @param {Object} newVersion - New version of the document
 * @returns {string} Type of change: created, updated, or specific change type
 */
const determineChangeType = (oldVersion, newVersion) => {
  if (!oldVersion) return 'created';
  
  // Track which aspects of the document changed
  const changes = [];
  if (oldVersion.title !== newVersion.title) changes.push('title');
  if (oldVersion.content !== newVersion.content) changes.push('content');
  if (oldVersion.visibility !== newVersion.visibility) changes.push('visibility');
  
  // Return appropriate change type based on what changed
  if (changes.length === 0) return 'updated';
  if (changes.length === 1) return `${changes[0]}_changed`;
  return 'updated';
};

/**
 * Create a new version of a document
 * @param {string} documentId - ID of the document
 * @param {Object} newData - New document data (title, content, visibility)
 * @param {string} userId - ID of the user making the change
 * @param {string} changeSummary - Optional manual summary of changes
 * @returns {Promise<Object>} Created version document
 */
const createVersion = async (documentId, newData, userId, changeSummary = '') => {
  try {
    // Retrieve current document state
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    const nextVersion = document.currentVersion + 1;
    
    // Get previous version for comparison
    const previousVersion = await DocumentVersion.findOne({ 
      documentId, 
      version: document.currentVersion 
    });
    
    // Calculate document statistics
    const counts = calculateCounts(newData.content);
    
    // Generate change summary if not manually provided
    let summary = changeSummary;
    if (!summary && previousVersion) {
      summary = generateChangeSummary(previousVersion, newData);
    }
    
    // Determine type of changes made
    const changeType = determineChangeType(previousVersion, newData);
    
    // Create new version record
    const version = new DocumentVersion({
      documentId,
      version: nextVersion,
      title: newData.title,
      content: newData.content,
      visibility: newData.visibility,
      changedBy: userId,
      changeType,
      changeSummary: summary,
      wordCount: counts.wordCount,
      characterCount: counts.characterCount
    });
    
    await version.save();
    
    // Update main document version tracking
    document.currentVersion = nextVersion;
    document.lastVersionCreatedAt = new Date();
    await document.save();
    
    return version;
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
};

/**
 * Retrieve version history for a document
 * @param {string} documentId - ID of the document
 * @param {number} limit - Maximum number of versions to return
 * @returns {Promise<Array>} List of versions, sorted newest first
 */
const getVersionHistory = async (documentId, limit = 50) => {
  try {
    const versions = await DocumentVersion.find({ documentId })
      .sort({ version: -1 })
      .limit(limit)
      .populate('changedBy', 'name email')
      .lean();
    
    return versions;
  } catch (error) {
    console.error('Error getting version history:', error);
    throw error;
  }
};

/**
 * Get a specific version of a document
 * @param {string} documentId - ID of the document
 * @param {number} versionNumber - Version number to retrieve
 * @returns {Promise<Object>} Version document with populated user data
 */
const getVersion = async (documentId, versionNumber) => {
  try {
    const version = await DocumentVersion.findOne({ 
      documentId, 
      version: versionNumber 
    }).populate('changedBy', 'name email');
    
    return version;
  } catch (error) {
    console.error('Error getting version:', error);
    throw error;
  }
};

/**
 * Compare two versions of a document
 * @param {string} documentId - ID of the document
 * @param {number} version1 - First version number to compare
 * @param {number} version2 - Second version number to compare
 * @returns {Promise<Object>} Difference analysis between versions
 */
const compareVersions = async (documentId, version1, version2) => {
  try {
    // Fetch both versions concurrently
    const [v1, v2] = await Promise.all([
      getVersion(documentId, version1),
      getVersion(documentId, version2)
    ]);
    
    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }
    
    // Generate comprehensive diff object
    const diff = {
      title: {
        old: v1.title,
        new: v2.title,
        changed: v1.title !== v2.title
      },
      content: {
        old: v1.content,
        new: v2.content,
        changed: v1.content !== v2.content,
        wordCountDiff: v2.wordCount - v1.wordCount,
        characterCountDiff: v2.characterCount - v1.characterCount
      },
      visibility: {
        old: v1.visibility,
        new: v2.visibility,
        changed: v1.visibility !== v2.visibility
      },
      metadata: {
        version1: v1,
        version2: v2
      }
    };
    
    return diff;
  } catch (error) {
    console.error('Error comparing versions:', error);
    throw error;
  }
};

/**
 * Restore a document to a previous version
 * @param {string} documentId - ID of the document
 * @param {number} versionNumber - Version to restore to
 * @param {string} userId - ID of user performing the restore
 * @returns {Promise<Object>} Newly created version with restored content
 */
const restoreVersion = async (documentId, versionNumber, userId) => {
  try {
    // Get the version to restore
    const version = await getVersion(documentId, versionNumber);
    if (!version) {
      throw new Error('Version not found');
    }
    
    // Create new version with restored content
    const restoredData = {
      title: version.title,
      content: version.content,
      visibility: version.visibility
    };
    
    // Create new version marking it as a restore
    const newVersion = await createVersion(
      documentId, 
      restoredData, 
      userId, 
      `Restored to version ${versionNumber}`
    );
    
    return newVersion;
  } catch (error) {
    console.error('Error restoring version:', error);
    throw error;
  }
};

// Export utility functions
module.exports = {
  createVersion,
  getVersionHistory,
  getVersion,
  compareVersions,
  restoreVersion,
  calculateCounts,
  generateChangeSummary
}; 