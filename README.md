# Document Management System

A full-stack document management application with real-time collaboration features, built with Next.js, Express.js, and MongoDB.

## Features

### Core Features
- **User Authentication**: Registration, login, forgot password with email reset
- **Document Management**: Create, edit, view, and delete documents with auto-save
- **Rich Text Editor**: WYSIWYG editor with TipTap
- **Global Search**: Search across all accessible documents
- **Privacy Controls**: Public, private, and shared document visibility

### Collaboration Features
- **@Username Mentions**: Type `@` in the editor to mention users
- **Automatic Access Granting**: When users are mentioned, they automatically get read access to the document
- **Real-time Notifications**: Mentioned users receive notifications in their dashboard
- **Document Sharing**: Manual sharing with view/edit permissions

### Bonus Features
- **Version Control**: Track document changes with timestamps
- **Document History**: View who made changes and when
- **Auto-save**: Automatic saving with debounced updates
- **Responsive Design**: Modern UI with Tailwind CSS

## @Mention System

The @mention system allows users to mention other users in documents, which automatically:

1. **Grants Access**: The mentioned user gets read access to the document
2. **Sends Notifications**: A notification appears in the mentioned user's dashboard
3. **Enables Collaboration**: Mentioned users can view and edit the document

### How to Use @Mentions

1. **Start Typing**: In any document editor, type `@` followed by a username
2. **Select User**: A dropdown will appear with matching users - click to select
3. **Automatic Processing**: The system automatically:
   - Shares the document with the mentioned user
   - Sends them a notification
   - Grants them read access

### Technical Implementation

- **Frontend**: TipTap editor with custom mention extension
- **Backend**: Automatic mention detection and processing
- **Database**: User notifications stored in User model
- **Real-time**: Notifications appear immediately in the dashboard

## Tech Stack

### Frontend
- **Next.js 14**: React framework
- **TipTap**: Rich text editor
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **React Hot Toast**: Notifications

### Backend
- **Express.js**: Node.js framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication
- **Nodemailer**: Email functionality
- **bcryptjs**: Password hashing

## Project Structure

```
root/
  backend/                  # Express.js backend server
    config/                 # Database configuration
      db.js
    controllers/            # Route handler logic
      authController.js     # Auth-related logic
      documentController.js # Document CRUD logic
      notificationController.js # Notification logic
    middleware/             # Express middleware
      auth.js               # Auth middleware (JWT)
    models/                 # Mongoose models
      Document.js           # Document schema
      DocumentVersion.js    # Versioning schema
      User.js               # User schema
    routes/                 # API route definitions
      auth.js
      documents.js
      notifications.js
    utils/                  # Utility/helper functions
      email.js              # Email sending logic
      versionControl.js     # Version control helpers
    server.js               # Entry point for backend
    package.json            # Backend dependencies
    ...
  frontend/                 # Next.js frontend app
    components/             # React UI components
      DocumentCard.js
      Editor.js
      MentionList.js
      Notifications.js
      SharingManager.js
      VersionHistory.js
    pages/                  # Next.js pages/routes
      _app.js
      dashboard.js
      documents/
        [id].js
        create.js
        public/
          [id].js
      ...
    services/               # API service wrappers
      authService.js
      documentService.js
      notificationService.js
      userService.js
      versionService.js
    styles/                 # Global styles (Tailwind)
      globals.css
    utils/                  # Frontend utility functions
      auth.js
    package.json            # Frontend dependencies
    ...
  README.md                 # Project documentation
  setup.sh                  # Setup script
  ...
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- SMTP server for email functionality

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd document-manager
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend (.env)
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_password
   FRONTEND_URL=http://localhost:3000
   
   # Frontend (.env.local)
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   ```

4. **Start the application**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/users/search` - Search users for mentions

### Documents
- `GET /api/documents` - Get all accessible documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/search` - Search documents
- `POST /api/documents/:id/share` - Share document

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/mention` - Create mention notification

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  notifications: [{
    documentId: ObjectId,
    mentionedBy: ObjectId,
    read: Boolean,
    timestamp: Date
  }]
}
```

### Document Model
```javascript
{
  title: String,
  content: String,
  visibility: String,
  author: ObjectId,
  sharedWith: [{
    user: ObjectId,
    permission: String
  }]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 