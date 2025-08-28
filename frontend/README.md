# MindOne - Collaborative Document Management Platform

## Overview
MindOne is a comprehensive collaborative document management platform built with Next.js frontend and Node.js backend. The platform features real-time collaboration, version control, mention systems, and advanced document management capabilities.

## Prerequisites
- Node.js (v16 or higher)
- Backend API running on `http://localhost:5001`
- MongoDB database

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the frontend directory (optional):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

3. Start the development server:
```bash
npm run dev
```

The application will start on `http://localhost:3000`

## 🚀 Features

### Core Functionality
- **Authentication System**: Complete user authentication with JWT tokens
- **Document Management**: Create, edit, and manage documents with real-time collaboration
- **Version Control**: Track document versions and changes with rollback capabilities
- **Mention System**: @mentions for team collaboration and notifications
- **Real-time Updates**: Live collaboration features with instant updates
- **Responsive Design**: Modern UI that works seamlessly on all devices

### Advanced Features
- **Document Sharing**: Public and private document sharing with permission controls
- **Activity Tracking**: Monitor recent activities and document changes
- **Notification System**: Real-time notifications for mentions and updates
- **Search Functionality**: Advanced document search and filtering
- **User Profiles**: Comprehensive user profile management
- **Statistics Dashboard**: Analytics and insights for document usage

## 🏗️ Backend Connection

The frontend is fully connected to the real backend API. Ensure:

1. The backend server is running on `http://localhost:5001`
2. MongoDB is running and accessible
3. The backend `.env` file is properly configured with:
   - JWT_SECRET
   - MONGODB_URI
   - EMAIL_SERVICE credentials

## 🛠️ Development Notes

- JWT tokens are stored in secure HTTP-only cookies
- API calls are made to `http://localhost:5001/api` by default
- Comprehensive error handling with user-friendly messages
- Form validation using react-hook-form
- Toast notifications for user feedback
- Real-time updates using WebSocket connections

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 📁 Project Structure

```
frontend/
├── components/          # Reusable UI components
│   ├── Editor.js        # Advanced document editor with collaboration
│   ├── DocumentCard.js  # Document display cards
│   ├── VersionHistory.js # Document version management
│   ├── MentionList.js   # @mention functionality
│   ├── Notifications.js # Notification system
│   ├── ProfileModal.js  # User profile management
│   ├── SharingManager.js # Document sharing controls
│   ├── CallToAction.js  # Call-to-action components
│   ├── FeatureShowcase.js # Feature highlights
│   ├── RecentActivity.js # Activity tracking
│   ├── StatisticsSection.js # Analytics dashboard
│   ├── SuggestionsSection.js # Smart suggestions
│   └── TestimonialsSection.js # User testimonials
├── pages/              # Next.js pages
│   ├── _app.js         # Global app configuration
│   ├── index.js        # Home page with feature showcase
│   ├── login.js        # User login
│   ├── register.js     # User registration
│   ├── forgot-password.js  # Password recovery
│   ├── reset-password.js   # Password reset
│   ├── dashboard.js    # Main dashboard
│   ├── profile.js      # User profile management
│   ├── search.js       # Document search
│   ├── test.js         # Testing page
│   └── documents/      # Document management
│       ├── create.js    # Create new documents
│       ├── [id].js     # Edit existing documents
│       └── public/      # Public document views
├── services/           # API services
│   ├── authService.js  # Authentication API calls
│   ├── documentService.js # Document management API
│   ├── notificationService.js # Notification API
│   ├── userService.js  # User management API
│   └── versionService.js # Version control API
├── config/             # Configuration files
│   └── backend.js      # Backend API configuration
├── utils/              # Utility functions
│   └── auth.js         # Authentication utilities and hooks
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS and custom styles
└── public/             # Static assets
```

## 🔐 Authentication Flow

### Registration
1. User visits `/register`
2. Fills out email and password
3. Form validates input with comprehensive validation
4. API call to `/api/auth/register`
5. Success redirects to `/login`

### Login
1. User visits `/login`
2. Enters credentials
3. API call to `/api/auth/login`
4. JWT token stored in secure HTTP-only cookie
5. Redirects to `/dashboard`

### Session Management
- Tokens are automatically included in API requests
- 401 responses trigger automatic logout
- Protected routes redirect to login if not authenticated
- Token expires after 2 hours with automatic refresh

### Password Reset
1. User visits `/forgot-password`
2. Enters email address
3. API call to `/api/auth/forgot-password`
4. User receives email with reset link
5. Clicks link to `/reset-password?token=...`
6. Sets new password with validation
7. Redirects to `/login`

## 🔌 API Integration

The frontend integrates with comprehensive backend API endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get user profile

### Documents
- `GET /api/documents` - List user documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document details
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/share` - Share document

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

### Version Control
- `GET /api/documents/:id/versions` - Get document versions
- `POST /api/documents/:id/versions` - Create new version
- `PUT /api/documents/:id/restore/:versionId` - Restore version

## 🛡️ Security Features

- JWT tokens stored in secure HTTP-only cookies
- Automatic token refresh handling
- CSRF protection with sameSite cookies
- Form validation on both client and server
- Secure password requirements with strength validation
- Automatic logout on token expiration
- Rate limiting on authentication endpoints
- Input sanitization and validation

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface using Tailwind CSS
- **Responsive Layout**: Optimized for all screen sizes
- **Dark/Light Mode**: Theme switching capability
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: User-friendly error messages and recovery options
- **Accessibility**: ARIA labels and keyboard navigation support

## 🚀 Next Steps

1. **Real-time Collaboration**: Implement WebSocket connections for live editing
2. **File Upload**: Add document file upload and management
3. **Advanced Search**: Implement full-text search with filters
4. **Mobile App**: Develop React Native mobile application
5. **API Documentation**: Generate comprehensive API documentation
6. **Testing**: Add unit and integration tests
7. **Performance**: Implement lazy loading and code splitting
8. **Analytics**: Add user behavior tracking and analytics

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS configured for frontend domain
2. **Token Issues**: Check JWT_SECRET is set in backend environment
3. **API Connection**: Verify backend is running on correct port
4. **Build Errors**: Clear `.next` folder and reinstall dependencies
5. **MongoDB Connection**: Verify database connection string and network access

### Debug Mode

Enable debug logging by setting:
```javascript
// In authService.js
const DEBUG = true;
```

### Performance Optimization

- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize bundle size with dynamic imports
- Use Next.js Image component for optimized images

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Add comprehensive error handling
3. Test all authentication flows thoroughly
4. Update documentation for new features
5. Ensure responsive design for all components
6. Add proper TypeScript types (if migrating)
7. Follow accessibility guidelines

## 📊 Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔗 Related Repositories

- **Backend**: [mindone-backend](https://github.com/Randhir834/mindone-backend)
- **API Documentation**: [API Docs](https://github.com/Randhir834/mindone-api-docs)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above
