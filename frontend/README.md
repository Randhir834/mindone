# Frontend Application

## Prerequisites
- Node.js (v14 or higher)
- Backend API running on `http://localhost:5001`

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

## Features

- **Authentication**: Login, Register, Forgot Password, Reset Password
- **Document Management**: Create, edit, and manage documents
- **Real-time Updates**: Live collaboration features
- **Responsive Design**: Works on desktop and mobile

## Backend Connection

The frontend is now connected to the real backend API. Make sure:

1. The backend server is running on `http://localhost:5001`
2. MongoDB is running and accessible
3. The backend `.env` file is properly configured

## Development Notes

- JWT tokens are stored in cookies for authentication
- API calls are made to `http://localhost:5001/api` by default
- Error handling displays user-friendly messages
- Form validation using react-hook-form
- Toast notifications for user feedback

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Project Structure

```
frontend/
├── components/          # Reusable UI components
├── pages/              # Next.js pages
│   ├── _app.js         # Global app configuration
│   ├── index.js        # Home page (redirects based on auth)
│   ├── login.js        # Login page
│   ├── register.js     # Registration page
│   ├── forgot-password.js  # Forgot password page
│   ├── reset-password.js   # Password reset page
│   └── dashboard.js    # Protected dashboard page
├── services/           # API services
│   └── authService.js  # Authentication API calls
├── utils/              # Utility functions
│   └── auth.js         # Authentication utilities and hooks
├── styles/             # Global styles
│   └── globals.css     # Tailwind CSS and custom styles
└── public/             # Static assets
```

## Authentication Flow

### Registration
1. User visits `/register`
2. Fills out email and password
3. Form validates input
4. API call to `/api/auth/register`
5. Success redirects to `/login`

### Login
1. User visits `/login`
2. Enters credentials
3. API call to `/api/auth/login`
4. JWT token stored in secure cookie
5. Redirects to `/dashboard`

### Session Management
- Tokens are automatically included in API requests
- 401 responses trigger automatic logout
- Protected routes redirect to login if not authenticated
- Token expires after 2 hours

### Password Reset
1. User visits `/forgot-password`
2. Enters email address
3. API call to `/api/auth/forgot-password`
4. User receives email with reset link
5. Clicks link to `/reset-password?token=...`
6. Sets new password
7. Redirects to `/login`

## API Integration

The frontend integrates with the backend API endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/me` - Get user profile (optional)

## Security Features

- JWT tokens stored in secure cookies
- Automatic token refresh handling
- CSRF protection with sameSite cookies
- Form validation on both client and server
- Secure password requirements
- Automatic logout on token expiration

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:5001/api)

## Next Steps

1. **Backend Integration**: Ensure your backend has the required authentication endpoints
2. **Email Service**: Set up email service for password reset functionality
3. **Document Management**: Implement document creation, editing, and management features
4. **User Profile**: Add user profile management
5. **File Upload**: Implement document file upload functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend has CORS configured for frontend domain
2. **Token Issues**: Check JWT_SECRET is set in backend environment
3. **API Connection**: Verify backend is running on correct port
4. **Build Errors**: Clear `.next` folder and reinstall dependencies

### Debug Mode

Enable debug logging by setting:
```javascript
// In authService.js
const DEBUG = true;
```

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Test authentication flows
4. Update documentation for new features
