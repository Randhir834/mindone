const DocumentVersion = require('../models/DocumentVersion');
const Document = require('../models/Document');

/**
 * Calculate word and character counts from content
 */
const calculateCounts = (content) => {
  if (!content) return { wordCount: 0, characterCount: 0 };
  
  // Remove HTML tags for accurate counting
  const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const characterCount = content.length;
  
  return { wordCount, characterCount };
};

/**
 * Generate a summary of changes between two versions
 */
const generateChangeSummary = (oldVersion, newVersion) => {
  const changes = [];
  
  if (oldVersion.title !== newVersion.title) {
    changes.push('Title changed');
  }
  
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
  
  if (oldVersion.visibility !== newVersion.visibility) {
    changes.push(`Visibility changed to ${newVersion.visibility}`);
  }
  
  return changes.join(', ') || 'Minor changes';
};

/**
 * Determine the type of change made
 */
const determineChangeType = (oldVersion, newVersion) => {
  if (!oldVersion) return 'created';
  
  const changes = [];
  if (oldVersion.title !== newVersion.title) changes.push('title');
  if (oldVersion.content !== newVersion.content) changes.push('content');
  if (oldVersion.visibility !== newVersion.visibility) changes.push('visibility');
  
  if (changes.length === 0) return 'updated';
  if (changes.length === 1) return `${changes[0]}_changed`;
  return 'updated';
};

/**
 * Create a new version of a document
 */
const createVersion = async (documentId, newData, userId, changeSummary = '') => {
  try {
    // Get the current document to determine the next version number
    const document = await Document.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    
    const nextVersion = document.currentVersion + 1;
    
    // Get the previous version for comparison
    const previousVersion = await DocumentVersion.findOne({ 
      documentId, 
      version: document.currentVersion 
    });
    
    // Calculate counts
    const counts = calculateCounts(newData.content);
    
    // Generate change summary if not provided
    let summary = changeSummary;
    if (!summary && previousVersion) {
      summary = generateChangeSummary(previousVersion, newData);
    }
    
    // Determine change type
    const changeType = determineChangeType(previousVersion, newData);
    
    // Create the new version
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
    
    // Update the document's current version
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
 * Get version history for a document
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
 * Compare two versions and generate a diff
 */
const compareVersions = async (documentId, version1, version2) => {
  try {
    const [v1, v2] = await Promise.all([
      getVersion(documentId, version1),
      getVersion(documentId, version2)
    ]);
    
    if (!v1 || !v2) {
      throw new Error('One or both versions not found');
    }
    
    // Simple text diff (can be enhanced with a proper diff library)
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
 */
const restoreVersion = async (documentId, versionNumber, userId) => {
  try {
    const version = await getVersion(documentId, versionNumber);
    if (!version) {
      throw new Error('Version not found');
    }
    
    // Create a new version with the restored content
    const restoredData = {
      title: version.title,
      content: version.content,
      visibility: version.visibility
    };
    
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

module.exports = {
  createVersion,
  getVersionHistory,
  getVersion,
  compareVersions,
  restoreVersion,
  calculateCounts,
  generateChangeSummary
}; 