// Import required dependencies
const mongoose = require('mongoose');
// Load environment variables from .env file
require('dotenv').config();

// Function to establish MongoDB connection
const connectDB = async () => {
  try {
    console.log('✅ Connecting to MongoDB...');
    // Log the MongoDB URI for debugging purposes
    console.log('✅ MONGO_URI:', process.env.MONGO_URI); // Debug: check your URI

    // Connect to MongoDB with specified options
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Log successful connection
    console.log('✅ MongoDB Connected');
  } catch (err) {
    // Log error and exit if connection fails
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

// Export the database connection function
module.exports = connectDB;
