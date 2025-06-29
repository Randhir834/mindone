# Network Setup Guide for Document Manager

This guide will help you set up your Document Manager application so that other computers on your network can access it.

## 🖥️ Your Computer (Backend Server)

### Current Configuration
- **Your IP Address**: `10.14.161.234`
- **Backend Port**: `5001`
- **Frontend Port**: `3000`
- **Backend URL**: `http://10.14.161.234:5001`
- **Frontend URL**: `http://10.14.161.234:3000`

### Step 1: Start the Backend Server

1. Open Terminal and navigate to the backend directory:
```bash
cd /Users/randhirkumar/Desktop/root/backend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the backend server:
```bash
npm run dev
```

You should see output like:
```
🚀 Server running on http://localhost:5001
🌐 Network access: http://10.14.161.234:5001
📱 CORS enabled for all origins
```

### Step 2: Start the Frontend Server

1. Open a new Terminal window and navigate to the frontend directory:
```bash
cd /Users/randhirkumar/Desktop/root/frontend
```

2. Install dependencies (if not already done):
```bash
npm install
```

3. Start the frontend server:
```bash
npm run dev
```

You should see output like:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 💻 Other Computers on the Network

### Accessing the Application

Other computers on your network can access the application by opening their web browser and navigating to:

**Frontend (Main Application)**: `http://10.14.161.234:3000`

### What Works
- ✅ User registration and login
- ✅ Document creation, editing, and sharing
- ✅ Real-time mentions and notifications
- ✅ Password reset functionality
- ✅ All API endpoints accessible

### Network Requirements
- Both computers must be on the same network (same WiFi/LAN)
- Your computer's firewall should allow connections on ports 3000 and 5001
- The backend server must be running on your computer

## 🔧 Configuration Details

### Backend Configuration (server.js)
- **Host**: `0.0.0.0` (listens on all network interfaces)
- **Port**: `5001`
- **CORS**: Enabled for all origins
- **Database**: MongoDB Atlas (cloud-based, accessible from anywhere)

### Frontend Configuration (next.config.js)
- **API URL**: `http://10.14.161.234:5001/api`
- **Port**: `3000`
- **Network Access**: Enabled

### Environment Variables

**Backend (.env)**:
```env
PORT=5001
MONGO_URI=mongodb+srv://admin:megha%40123A@cluster0.vdz4tsy.mongodb.net/knowledgebase
JWT_SECRET=mySuperSecretKey123
JWT_EXPIRES_IN=2h
FRONTEND_URL=http://10.14.161.234:3000
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://10.14.161.234:5001/api
```

## 🚨 Troubleshooting

### If other computers can't access the application:

1. **Check Firewall Settings**:
   - On macOS: System Preferences → Security & Privacy → Firewall
   - Allow incoming connections for Node.js

2. **Check Network Connection**:
   - Ensure both computers are on the same network
   - Try pinging your computer from the other computer: `ping 10.14.161.234`

3. **Check Server Status**:
   - Verify backend is running: `http://10.14.161.234:5001/api/health`
   - Verify frontend is running: `http://10.14.161.234:3000`

4. **Check Ports**:
   - Ensure ports 3000 and 5001 are not blocked
   - Try accessing the backend directly: `http://10.14.161.234:5001`

### Common Issues:

1. **CORS Errors**: Backend is configured to allow all origins
2. **Connection Refused**: Check if servers are running
3. **404 Errors**: Verify the API endpoints are correct

## 📱 Testing the Setup

1. **From your computer**: `http://localhost:3000`
2. **From other computers**: `http://10.14.161.234:3000`

Both should work identically and allow full functionality including:
- User registration and login
- Document management
- Real-time features
- Email notifications

## 🔒 Security Notes

- This setup is for development/testing purposes
- For production, consider:
  - Using HTTPS
  - Implementing proper CORS restrictions
  - Setting up a reverse proxy
  - Using environment-specific configurations 