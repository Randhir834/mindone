# Version Control & History Feature

This document describes the comprehensive version control system implemented for the document management application.

## 🎯 Features Implemented

### ✅ Core Version Control
- **Automatic Version Creation**: New versions are created whenever significant changes are made to documents
- **Version Tracking**: Each version includes timestamps, user information, and change summaries
- **Version History**: Complete history of all document changes with metadata
- **Version Restoration**: Ability to restore documents to any previous version

### ✅ Change Tracking
- **Change Detection**: Automatically detects changes in title, content, and visibility
- **Change Summaries**: Intelligent summaries of what changed between versions
- **Word/Character Counts**: Tracks content statistics for each version
- **Change Types**: Categorizes changes (created, updated, title_changed, content_changed, visibility_changed)

### ✅ Version Comparison
- **Side-by-Side Comparison**: Compare any two versions of a document
- **Diff Visualization**: Visual representation of changes between versions
- **Statistics Comparison**: Shows word count and character count differences
- **Metadata Comparison**: Compares title, content, and visibility changes

### ✅ User Interface
- **Version History Panel**: Clean, intuitive interface for viewing version history
- **Interactive Version Selection**: Click to view specific version details
- **Compare Mode**: Easy-to-use interface for selecting versions to compare
- **Restore Functionality**: One-click restoration with confirmation
- **Real-time Updates**: Version history updates automatically after changes

## 🏗️ Architecture

### Backend Components

#### 1. DocumentVersion Model (`backend/models/DocumentVersion.js`)
```javascript
{
  documentId: ObjectId,        // Reference to parent document
  version: Number,             // Version number (1, 2, 3, ...)
  title: String,               // Document title at this version
  content: String,             // Document content at this version
  visibility: String,          // Document visibility at this version
  changedBy: ObjectId,         // User who made the change
  changeType: String,          // Type of change made
  changeSummary: String,       // Human-readable change description
  wordCount: Number,           // Word count at this version
  characterCount: Number,      // Character count at this version
  createdAt: Date,             // When this version was created
  updatedAt: Date              // When this version was last modified
}
```

#### 2. Version Control Service (`backend/utils/versionControl.js`)
- `createVersion()`: Creates new versions with automatic change detection
- `getVersionHistory()`: Retrieves version history with pagination
- `getVersion()`: Gets specific version details
- `compareVersions()`: Compares two versions and generates diff
- `restoreVersion()`: Restores document to a previous version
- `calculateCounts()`: Calculates word and character counts
- `generateChangeSummary()`: Creates human-readable change descriptions

#### 3. Enhanced Document Controller (`backend/controllers/documentController.js`)
- Integrated version creation with document updates
- New endpoints for version management:
  - `GET /api/documents/:id/versions` - Get version history
  - `GET /api/documents/:id/versions/:version` - Get specific version
  - `GET /api/documents/:id/compare/:version1/:version2` - Compare versions
  - `POST /api/documents/:id/restore/:version` - Restore version

### Frontend Components

#### 1. Version Service (`frontend/services/versionService.js`)
- API client for all version control operations
- Utility functions for formatting and display
- Error handling and user feedback

#### 2. Version History Component (`frontend/components/VersionHistory.js`)
- Interactive version history display
- Version comparison interface
- Version restoration functionality
- Real-time updates and error handling

#### 3. Enhanced Document Editor (`frontend/pages/documents/[id].js`)
- Integrated version history panel
- Version number display in document header
- Automatic refresh after version restoration

## 🚀 Usage

### For Users

#### Viewing Version History
1. Open any document you have access to
2. Click the "Version History" button in the top navigation
3. Browse through all versions with timestamps and change summaries
4. Click on any version to view its details

#### Comparing Versions
1. Open the Version History panel
2. Click "Compare Versions" button
3. Select two versions from the dropdown menus
4. Click "Compare" to see the differences
5. Review the side-by-side comparison of changes

#### Restoring a Version
1. In the Version History panel, find the version you want to restore
2. Click the "Restore" button next to that version
3. Confirm the restoration in the dialog
4. The document will be updated with the restored content and a new version will be created

### For Developers

#### Creating Versions Programmatically
```javascript
const { createVersion } = require('./utils/versionControl');

// Create a new version
const version = await createVersion(
  documentId,
  { title: 'New Title', content: 'New content', visibility: 'public' },
  userId,
  'Optional change summary'
);
```

#### Getting Version History
```javascript
const { getVersionHistory } = require('./utils/versionControl');

// Get last 50 versions
const history = await getVersionHistory(documentId, 50);
```

#### Comparing Versions
```javascript
const { compareVersions } = require('./utils/versionControl');

// Compare versions 1 and 3
const diff = await compareVersions(documentId, 1, 3);
console.log(diff.content.wordCountDiff); // Word count difference
```

## 🔧 Configuration

### Version Creation Triggers
Versions are automatically created when:
- A document is first created
- Title is changed
- Content is modified
- Visibility is changed
- Document is restored to a previous version

### Change Detection
The system detects changes by comparing:
- **Title**: Exact string comparison
- **Content**: Exact HTML content comparison
- **Visibility**: Exact enum value comparison

### Version Limits
- Default history limit: 50 versions
- Configurable via API parameters
- Older versions are preserved but not loaded by default

## 🧪 Testing

Run the version control test script:
```bash
node test-version-control.js
```

This will test:
- Document creation with initial version
- Version updates and change detection
- Version history retrieval
- Version comparison
- Version restoration
- Error handling

## 📊 Performance Considerations

### Database Indexes
- `documentId + version` index for efficient version queries
- `documentId + createdAt` index for chronological ordering
- Text indexes on content for search functionality

### Memory Usage
- Version history is paginated to prevent memory issues
- Content is stored as-is without compression (consider compression for large documents)
- Version metadata is lightweight for efficient querying

### Storage
- Each version stores a complete copy of the document
- Consider implementing version pruning for very old documents
- Monitor storage usage as document count grows

## 🔮 Future Enhancements

### Potential Improvements
1. **Advanced Diff**: Implement line-by-line diff for better content comparison
2. **Version Branching**: Support for creating branches from specific versions
3. **Version Comments**: Allow users to add comments to versions
4. **Version Tags**: Tag important versions for easy identification
5. **Bulk Operations**: Restore multiple documents or compare multiple versions
6. **Version Export**: Export specific versions as separate files
7. **Version Analytics**: Track editing patterns and collaboration metrics

### Performance Optimizations
1. **Content Compression**: Compress version content to reduce storage
2. **Incremental Storage**: Store only differences between versions
3. **Version Pruning**: Automatically archive very old versions
4. **Caching**: Cache frequently accessed version data
5. **Background Processing**: Process version creation asynchronously

## 🐛 Troubleshooting

### Common Issues

#### Version Not Created
- Check if changes are actually different from current version
- Verify user has edit permissions
- Check database connection and error logs

#### Version History Not Loading
- Verify document permissions
- Check API endpoint availability
- Review network connectivity

#### Restore Not Working
- Confirm user has edit permissions
- Check if version exists
- Verify database transaction completion

### Debug Commands
```javascript
// Check version count for a document
const versions = await DocumentVersion.countDocuments({ documentId });

// Get latest version
const latest = await DocumentVersion.findOne({ documentId }).sort({ version: -1 });

// Check document version tracking
const doc = await Document.findById(documentId);
console.log('Current version:', doc.currentVersion);
```

## 📝 API Reference

### Version History Endpoint
```
GET /api/documents/:id/versions?limit=50
```

**Response:**
```json
[
  {
    "_id": "version_id",
    "version": 3,
    "title": "Document Title",
    "content": "<p>Content</p>",
    "visibility": "private",
    "changedBy": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    },
    "changeType": "content_changed",
    "changeSummary": "Added 15 words",
    "wordCount": 150,
    "characterCount": 1200,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### Compare Versions Endpoint
```
GET /api/documents/:id/compare/:version1/:version2
```

**Response:**
```json
{
  "title": {
    "old": "Old Title",
    "new": "New Title",
    "changed": true
  },
  "content": {
    "old": "<p>Old content</p>",
    "new": "<p>New content</p>",
    "changed": true,
    "wordCountDiff": 5,
    "characterCountDiff": 25
  },
  "visibility": {
    "old": "private",
    "new": "public",
    "changed": true
  }
}
```

### Restore Version Endpoint
```
POST /api/documents/:id/restore/:version
```

**Response:**
```json
{
  "message": "Document restored successfully",
  "restoredVersion": { /* version object */ },
  "document": { /* updated document object */ }
}
```

---

This version control system provides a robust foundation for tracking document changes while maintaining excellent user experience and performance. The modular architecture allows for easy extension and customization based on specific requirements. 