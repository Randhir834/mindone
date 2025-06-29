# Backend API Setup

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/document-app

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=2h

# Server Configuration
PORT=5001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (for production)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=noreply@yourapp.com
```

3. Start MongoDB (if running locally):
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Windows
net start MongoDB

# On Linux
sudo systemctl start mongod
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5001`

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot` - Send password reset email
- `PUT /api/auth/reset/:token` - Reset password with token
- `GET /api/health` - Health check

## Development Notes

- In development mode, emails are sent to Ethereal Email (fake SMTP for testing)
- Email preview URLs are logged to the console
- JWT tokens expire in 2 hours by default
- CORS is configured to allow requests from `http://localhost:3000` 