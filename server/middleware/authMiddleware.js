// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig'); // Or process.env.JWT_SECRET

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token error: malformed token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token error: malformed scheme.' });
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(401).json({ error: 'Token invalid or expired.' });
    }

    req.userId = decoded.id; // Add the user ID from token to the request object
    return next();
  });
};