require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Default to 1 hour if not set
};