/**
 * Authentication Routes
 * Handles user registration, authentication, and profile management
 */

const express = require("express");
const router = express.Router();
// Import authentication controller functions
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  getProfile, 
  changePassword, 
  verifyOtp 
} = require("../controllers/authController");
// Import authentication middleware
const { protect } = require("../middleware/auth");

// Public authentication routes (no authentication required)
/** POST /api/auth/register - Register a new user */
router.post("/register", register);
/** POST /api/auth/login - Authenticate user and get token */
router.post("/login", login);
/** POST /api/auth/forgot-password - Request password reset */
router.post("/forgot-password", forgotPassword);
/** PUT /api/auth/reset-password/:token - Reset password using token */
router.put("/reset-password/:token", resetPassword);
/** POST /api/auth/verify-otp - Verify email using OTP */
router.post("/verify-otp", verifyOtp);

// Protected user search route for mentions feature
/** GET /api/auth/users/search - Search users for mentions */
router.get("/users/search", protect, require("../controllers/authController").searchUsers);

// Protected profile routes (require authentication)
/** GET /api/auth/profile - Get current user's profile */
router.get("/profile", protect, getProfile);
/** PUT /api/auth/change-password - Change user's password */
router.put("/change-password", protect, changePassword);

// Export the router
module.exports = router;
