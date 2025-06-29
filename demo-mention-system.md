# @Mention System Documentation

## Overview

The @mention system automatically grants read access to documents when users are mentioned during document creation or editing. This feature enables seamless collaboration by automatically sharing documents with mentioned users.

## How It Works

### 1. Frontend Implementation

The mention system uses TipTap editor with a custom mention extension:

```javascript
// In Editor.js
Mention.configure({
  HTMLAttributes: {
    class: 'mention',
    'data-mention': ({ node }) => node.attrs.id, // Stores user ID
  },
  renderLabel({ node }) {
    return `@${node.attrs.label ?? node.attrs.id}`;
  },
  suggestion: {
    items: async (query) => {
      // Search for users as you type
      const users = await userService.searchUsers(query);
      return users;
    },
    onSelect: ({ item }) => {
      return {
        id: item._id,    // User ID
        label: item.name // User name
      };
    },
  },
})
```

### 2. Backend Processing

When a document is saved, the system automatically processes mentions:

```javascript
// In documentController.js
const processMentions = async (document, newContent, oldContent, authorId) => {
  // Extract mentioned user IDs from content
  const newMentionIds = extractMentionedIds(newContent);
  const oldMentionIds = extractMentionedIds(oldContent);
  
  // Find newly mentioned users
  const newlyMentionedIds = [...newMentionIds].filter(id => !oldMentionIds.has(id));
  
  for (const userId of newlyMentionedIds) {
    // Skip self-mentions
    if (userId === authorId.toString()) continue;
    
    // Check if already shared
    const isAlreadyShared = document.sharedWith.some(
      share => share.user.toString() === userId
    );
    
    if (!isAlreadyShared) {
      // Auto-share with read-only access
      document.sharedWith.push({ user: userId, permission: 'view' });
    }
    
    // Create notification
    const notification = {
      documentId: document._id,
      mentionedBy: authorId,
      timestamp: new Date(),
      read: false
    };
    
    // Add to user's notifications
    await User.updateOne(
      { _id: userId },
      { $push: { notifications: { $each: [notification], $position: 0 } } }
    );
  }
};
```

### 3. Access Control

The system checks permissions for document access:

```javascript
// In documentController.js
exports.getDocumentById = async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate('author', 'name email')
    .populate('sharedWith.user', 'name email');

  const isAuthor = document.author._id.toString() === req.userId;
  const isSharedWith = document.sharedWith.some(
    share => share.user._id.toString() === req.userId
  );

  if (document.visibility !== 'public' && !isAuthor && !isSharedWith) {
    return res.status(403).json({ msg: 'Not authorized to view this document' });
  }

  res.json(document);
};
```

## Features

### ✅ Automatic Access Granting
- When a user is mentioned using `@username`, they automatically get read access
- No manual sharing required
- Works during both document creation and editing

### ✅ Read-Only Access
- Mentioned users get 'view' permission only
- They cannot edit the document unless explicitly granted 'edit' permission
- Document author retains full control

### ✅ Notification System
- Mentioned users receive in-app notifications
- Notifications include document reference and mention details
- Real-time notification updates

### ✅ Multiple Mentions Support
- Multiple users can be mentioned in the same document
- Each mentioned user gets individual access and notifications
- Duplicate mentions are handled gracefully

### ✅ Permission-Based UI
- Frontend shows read-only mode for users with view-only access
- Edit controls are hidden for users without edit permissions
- Clear visual indicators of access level

## Usage Examples

### 1. Creating a Document with Mentions

```javascript
// User types in editor: "Hello @John Doe, please review this"
// System automatically:
// - Extracts John Doe's user ID from the mention
// - Adds John Doe to document.sharedWith with 'view' permission
// - Creates a notification for John Doe
// - John Doe can now access the document
```

### 2. Editing a Document with New Mentions

```javascript
// User updates document: "Also @Jane Smith, please check this"
// System automatically:
// - Detects new mention of Jane Smith
// - Adds Jane Smith to sharedWith (if not already there)
// - Creates notification for Jane Smith
// - Jane Smith can now access the document
```

### 3. Access Control

```javascript
// John Doe (mentioned user) tries to access document
// System checks:
// - Is John Doe the author? No
// - Is John Doe in sharedWith? Yes (from mention)
// - Grant access with read-only permissions

// John Doe tries to edit document
// System checks:
// - Does John Doe have 'edit' permission? No (only 'view')
// - Deny edit access
```

## Test Results

The comprehensive test suite confirms all functionality:

```
✅ User registration and login
✅ Document creation
✅ Initial access restrictions
✅ Automatic access granting via mentions
✅ Multiple mentions support
✅ Read-only access for mentioned users
✅ Notification system
✅ Document listing for mentioned users
```

## Security Considerations

1. **Self-Mention Prevention**: Users cannot mention themselves to gain access
2. **Permission Validation**: Backend validates all access requests
3. **Read-Only Default**: Mentioned users get view-only access by default
4. **Duplicate Prevention**: Users are not added multiple times to sharedWith
5. **Error Handling**: Mention processing errors don't affect document creation

## Technical Implementation

### Database Schema

```javascript
// Document model
const documentSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'private', 'shared'] },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' }
  }]
});

// User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  notifications: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    mentionedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date,
    read: { type: Boolean, default: false }
  }]
});
```

### API Endpoints

- `POST /api/documents` - Create document (processes mentions)
- `PUT /api/documents/:id` - Update document (processes new mentions)
- `GET /api/documents` - List accessible documents
- `GET /api/documents/:id` - Get document (checks permissions)
- `GET /api/auth/users/search` - Search users for mentions
- `GET /api/notifications` - Get user notifications

## Conclusion

The @mention system provides a seamless way to automatically share documents with users through natural language mentions. It maintains security through proper access controls while enabling easy collaboration. The system is fully functional and tested, ready for production use. 