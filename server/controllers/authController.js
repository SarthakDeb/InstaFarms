const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig'); // Or directly use process.env.JWT_SECRET
const calculateAge = require('../utils/calculateAge');

const generateToken = (params = {}) => {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: authConfig.expiresIn,
  });
};


const getFullUserProfile = async (userId) => {
    const userQuery = `
        SELECT
          u.id, u.name, u.email, u.phone, u.date_of_birth, u.profile_image_url, u.created_at, u.updated_at,
          (SELECT COUNT(*) FROM followers f WHERE f.following_id = u.id) AS followers_count,
          (SELECT COUNT(*) FROM followers f WHERE f.follower_id = u.id) AS following_count,
          COALESCE((SELECT json_agg(json_build_object('id', fu.id, 'name', fu.name, 'profile_image_url', fu.profile_image_url))
           FROM followers fl
           JOIN users fu ON fl.following_id = fu.id
           WHERE fl.follower_id = u.id), '[]'::json) AS following_list,
          COALESCE((SELECT json_agg(json_build_object('id', fu.id, 'name', fu.name, 'profile_image_url', fu.profile_image_url))
           FROM followers fl
           JOIN users fu ON fl.follower_id = fu.id
           WHERE fl.following_id = u.id), '[]'::json) AS followers_list
        FROM users u
        WHERE u.id = $1;
    `;
    const result = await db.query(userQuery, [userId]);
    if (result.rows.length > 0) {
        const user = result.rows[0];
        user.age = calculateAge(user.date_of_birth);
        user.followers_count = parseInt(user.followers_count, 10);
        user.following_count = parseInt(user.following_count, 10);
        user.following_list = Array.isArray(user.following_list) ? user.following_list : [];
        user.followers_list = Array.isArray(user.followers_list) ? user.followers_list : [];
        return user;
    }
    return null;
};


exports.signup = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with only email and password. Other details (name, dob, etc.) are null initially.
    const newUserResult = await db.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name', // Added name as null/empty initially
      [email.toLowerCase(), hashedPassword, ''] // Set name to empty string or null
    );
    const user = newUserResult.rows[0];

    // Fetch the full profile for the new user to ensure consistency
    const fullUserProfile = await getFullUserProfile(user.id);


    const token = generateToken({ id: user.id });

    return res.status(201).json({ user: fullUserProfile, token });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error during signup.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const userFromDb = result.rows[0];

    if (!userFromDb.password) {
        return res.status(401).json({ error: 'User account not fully set up for password login.' });
    }

    const isMatch = await bcrypt.compare(password, userFromDb.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    const fullUserProfile = await getFullUserProfile(userFromDb.id);
    if (!fullUserProfile) { // Should not happen if userFromDb exists, but good check
         return res.status(404).json({ error: 'User profile not found after login.' });
    }

    const token = generateToken({ id: fullUserProfile.id });

    // Exclude password from the returned user object
    const { password: _, ...userToReturn } = fullUserProfile; 

    return res.status(200).json({ user: userToReturn, token });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
};