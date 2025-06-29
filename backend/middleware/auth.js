const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Middleware to protect routes that require authentication
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // IMPORTANT: Attach userId to the request object
      req.userId = decoded.id; 
      
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ msg: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }
};

// Middleware to identify a user if a token is present, but not fail if it's not.
// Useful for public routes that can show more info to logged-in users.
const identifyUser = (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.id;
        } catch (error) {
            // Invalid token, just proceed as a guest
            req.userId = null;
        }
    }
    next();
};

module.exports = { protect, identifyUser };