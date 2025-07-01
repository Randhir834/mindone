const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, getProfile, changePassword, verifyOtp } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/verify-otp", verifyOtp);

// Add user search route for mentions
router.get("/users/search", protect, require("../controllers/authController").searchUsers);

router.get("/profile", protect, getProfile);

router.put("/change-password", protect, changePassword);

module.exports = router;
