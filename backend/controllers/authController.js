const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Don't generate JWT token - user needs to login explicitly
    res.status(201).json({ 
      message: "User registered successfully. Please login to continue.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: "If an account with that email exists, a reset link has been sent" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL - use environment variable or default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    
    // Create email content
    const emailSubject = "Password Reset Request";
    const emailText = `You requested a password reset. Please click the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link in your browser: <a href="${resetUrl}">${resetUrl}</a></p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this password reset, please ignore this email.</p>
      </div>
    `;

    // Send email
    const emailSent = await sendEmail(user.email, emailSubject, emailText, emailHtml);
    
    if (emailSent) {
      console.log(`Password reset email sent to ${user.email}`);
      res.json({ message: "If an account with that email exists, a reset link has been sent" });
    } else {
      // If email fails, remove the reset token
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      
      console.error(`Failed to send password reset email to ${user.email}`);
      res.status(500).json({ message: "Failed to send reset email. Please try again later." });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * @desc    Search users for mentions
 * @route   GET /api/auth/users/search?q=query
 * @access  Private
 */
exports.searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    // Search for users by name or email, excluding the current user
    const users = await User.find({
      _id: { $ne: req.userId }, // Exclude current user
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name email _id')
    .limit(10); // Limit results to prevent overwhelming the UI

    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
