/**
 * Authentication middleware module
 * Provides JWT-based authentication and user identification
 */

// Import required JWT library
const jwt = require("jsonwebtoken");

// JWT configuration - use environment variable or fallback
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

/**
 * Required authentication middleware
 * @description Protects routes by requiring a valid JWT token
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * @throws {401} If no token provided or token is invalid
 */
const protect = (req, res, next) => {
  let token;
  // Check for Bearer token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(" ")[1];
      // Verify token and decode payload
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach user ID from token to request object for use in protected routes
      req.userId = decoded.id; 
      
      next();
    } catch (err) {
      // Log verification errors and return unauthorized
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ msg: "Not authorized, token failed" });
    }
  }

  // Return unauthorized if no token found
  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }
};

/**
 * Optional authentication middleware
 * @description Identifies user if token present but allows request to proceed regardless
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const identifyUser = (req, res, next) => {
    let token;
    // Check for Bearer token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract and verify token
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            // Attach user ID if token valid
            req.userId = decoded.id;
        } catch (error) {
            // Set userId to null for invalid tokens
            req.userId = null;
        }
    }
    // Always proceed to next middleware
    next();
};

// Export middleware functions
module.exports = { protect, identifyUser };