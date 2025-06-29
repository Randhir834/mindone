#!/bin/bash

echo "🚀 Setting up Document Manager Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Backend setup
echo "📦 Setting up backend..."
cd backend

# Install dependencies
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file for backend..."
    cat > .env << EOF
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
EOF
    echo "✅ Backend .env file created"
else
    echo "✅ Backend .env file already exists"
fi

cd ..

# Frontend setup
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
npm install

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file for frontend..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5001/api
EOF
    echo "✅ Frontend .env.local file created"
else
    echo "✅ Frontend .env.local file already exists"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start MongoDB (if not already running)"
echo "2. Start the backend server: cd backend && npm run dev"
echo "3. Start the frontend server: cd frontend && npm run dev"
echo "4. Open http://localhost:3000 in your browser" 