/**
 * Express Server Configuration
 * Main server setup for the document management system:
 * - Environment configuration
 * - Express middleware setup
 * - API route registration
 * - Database connection
 * - Server initialization
 */

// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import route handlers for different API endpoints
const authRoutes = require("./routes/auth");
const documentRoutes = require("./routes/documents");
const notificationRoutes = require("./routes/notifications");

// Initialize Express application
const app = express();

// Configure CORS middleware
// Allow requests from frontend origin or all origins in development
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));

// Parse JSON request bodies with 10mb limit for file uploads
app.use(express.json({ limit: '10mb' }));

// Register API routes
// Authentication routes (login, register, etc.)
app.use("/api/auth", authRoutes);
// Document management routes (CRUD operations)
app.use("/api/documents", documentRoutes);
// Real-time notification routes
app.use("/api/notifications", notificationRoutes);

// Health check endpoint for monitoring
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Root endpoint for Vercel deployment verification
app.get('/', (req, res) => {
  res.send('Hello from Express on Vercel!');
});

/**
 * Server Initialization Function
 * - Establishes MongoDB connection
 * - Starts Express server
 * - Configures network listening
 * - Handles startup errors
 */
const startServer = async () => {
  try {
    // Connect to MongoDB database
    await connectDB();
    
    // Server configuration
    const PORT = process.env.PORT || 5001;
    const HOST = '0.0.0.0'; // Listen on all available network interfaces
    
    // Start server and log connection details
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌐 Network access: http://10.14.161.234:${PORT}`);
      console.log(`📱 CORS enabled for all origins`);
    });
  } catch (error) {
    // Handle startup errors gracefully
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Initialize the server
startServer();