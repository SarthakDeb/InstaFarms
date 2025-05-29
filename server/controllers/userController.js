const db = require('../config/db');
const calculateAge = require('../utils/calculateAge');
const { deleteS3Object } = require('./s3Controller'); // Helper from s3Controller.js


const getFullUserProfile = async (userId) => {
    const userQuery = `
        SELECT
          u.id, u.name, u.email, u.phone, u.date_of_birth, u.profile_image_url, u.password,
          u.created_at, u.updated_at,
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
        // IMPORTANT: Exclude password from the returned user object
        delete user.password;
        return user;
    }
    return null;
};

exports.createUser = async (req, res) => {
  const { name, email, phone, date_of_birth, profile_image_url, password } = req.body;
  
  if (!email) { // Name is now optional at creation if signup handles only email/pass
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    
    const result = await db.query(
      'INSERT INTO users (name, email, phone, date_of_birth, profile_image_url, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name || '', email, phone, date_of_birth, profile_image_url, password] // Handle if password not provided
    );
    const userRow = result.rows[0];
    const newUserProfile = await getFullUserProfile(userRow.id);
    res.status(201).json(newUserProfile);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT
        u.id, u.name, u.email, u.phone, u.date_of_birth, u.profile_image_url,
        u.created_at, u.updated_at,
        (SELECT COUNT(*) FROM followers f WHERE f.following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM followers f WHERE f.follower_id = u.id) AS following_count
      FROM users u
      ORDER BY u.created_at DESC;
    `;
    const result = await db.query(query);
    const users = result.rows.map(user => {
      const age = calculateAge(user.date_of_birth);
      // Exclude password from the list of all users
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        age: age,
        followers_count: parseInt(user.followers_count, 10),
        following_count: parseInt(user.following_count, 10),
      };
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const userProfile = await getFullUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a user
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  
  const { name, phone, date_of_birth, profile_image_url } = req.body;

  if (name === undefined && phone === undefined && date_of_birth === undefined && profile_image_url === undefined) {
    return res.status(400).json({ error: 'No update data provided.' });
  }

  try {
    const existingUserResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (existingUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const existingUser = existingUserResult.rows[0];
    const oldProfileImageUrl = existingUser.profile_image_url;

    // If profile_image_url is being changed (new URL provided or set to null) AND there was an old one
    if (profile_image_url !== existingUser.profile_image_url && oldProfileImageUrl) {
        try {
            const url = new URL(oldProfileImageUrl); // Use global URL
            // Check if it's an S3 URL from your bucket
            if (url.hostname.includes('s3') && url.hostname.includes(process.env.S3_BUCKET_NAME)) {
                const oldObjectKey = url.pathname.substring(1); // Remove leading '/'
                if (oldObjectKey) {
                    console.log(`Attempting to delete old S3 object: ${oldObjectKey}`);
                    await deleteS3Object(oldObjectKey); // This function is imported from s3Controller
                }
            }
        } catch (e) {
            console.warn("Could not parse or delete old S3 image URL during update:", oldProfileImageUrl, e.message);
        }
    }

    const updatedName = name !== undefined ? name : existingUser.name;
    const updatedPhone = phone !== undefined ? phone : existingUser.phone;
    const updatedDob = date_of_birth !== undefined ? date_of_birth : existingUser.date_of_birth;
    const updatedImageUrl = profile_image_url !== undefined ? profile_image_url : existingUser.profile_image_url;

    
    const result = await db.query(
      'UPDATE users SET name = $1, phone = $2, date_of_birth = $3, profile_image_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id',
      [updatedName, updatedPhone, updatedDob, updatedImageUrl, userId]
    );
    
    const updatedUserId = result.rows[0].id;
    const finalUserProfile = await getFullUserProfile(updatedUserId);

    res.status(200).json(finalUserProfile);
  } catch (error) {
    console.error('Error updating user:', error);
    // Removed specific email unique constraint check as email update is not primary here
    res.status(500).json({ error: 'Internal server error while updating user.' });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    // Before deleting user, delete their S3 profile image if it exists
    const userResult = await db.query('SELECT profile_image_url FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0 && userResult.rows[0].profile_image_url) {
        const imageUrl = userResult.rows[0].profile_image_url;
        try {
            const url = new URL(imageUrl);
            if (url.hostname.includes('s3') && url.hostname.includes(process.env.S3_BUCKET_NAME)) {
                const objectKey = url.pathname.substring(1);
                if (objectKey) {
                    await deleteS3Object(objectKey);
                }
            }
        } catch(e) {
            console.warn("Could not parse or delete S3 image URL during user deletion:", imageUrl, e.message);
        }
    }

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...deletedUser } = result.rows[0]; // Exclude password
    res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Follow/Unfollow and Get Following/Followers lists (remain unchanged from your provided code)
exports.followUser = async (req, res) => { /* ... your existing code ... */ };
exports.unfollowUser = async (req, res) => { /* ... your existing code ... */ };
exports.getFollowing = async (req, res) => { /* ... your existing code ... */ };
exports.getFollowers = async (req, res) => { /* ... your existing code ... */ };

// Make sure your existing follow/unfollow and get lists are here:
// Follow a user
exports.followUser = async (req, res) => {
  const { userId, targetUserId } = req.params;
  if (userId === targetUserId) {
    return res.status(400).json({ error: "User cannot follow themselves." });
  }
  try {
    const userCheck = await db.query('SELECT id FROM users WHERE id = $1 OR id = $2', [userId, targetUserId]);
    const foundUserIds = userCheck.rows.map(r => r.id.toString());
    if (!foundUserIds.includes(userId)) return res.status(404).json({ error: `User with ID ${userId} not found.`});
    if (!foundUserIds.includes(targetUserId)) return res.status(404).json({ error: `User with ID ${targetUserId} to follow not found.`});
    if (userCheck.rows.length < 2 && !(userCheck.rows.some(u => u.id == userId) && userCheck.rows.some(u => u.id == targetUserId))) {
        // This condition might be redundant given the individual checks above
    }

    await db.query(
      'INSERT INTO followers (follower_id, following_id) VALUES ($1, $2)',
      [userId, targetUserId]
    );
    res.status(201).json({ message: `User ${userId} is now following user ${targetUserId}` });
  } catch (error) {
    console.error('Error following user:', error);
    if (error.code === '23505') { 
      return res.status(409).json({ error: `User ${userId} is already following user ${targetUserId}` });
    }
    if (error.code === '23503') { 
        return res.status(404).json({ error: 'One or both users not found.'});
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  const { userId, targetUserId } = req.params;
  try {
    const result = await db.query(
      'DELETE FROM followers WHERE follower_id = $1 AND following_id = $2 RETURNING *',
      [userId, targetUserId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: `User ${userId} is not following user ${targetUserId}` });
    }
    res.status(200).json({ message: `User ${userId} unfollowed user ${targetUserId}` });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get users followed by a specific user
exports.getFollowing = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.email, u.profile_image_url
             FROM users u
             JOIN followers f ON u.id = f.following_id
             WHERE f.follower_id = $1`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get followers of a specific user
exports.getFollowers = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.email, u.profile_image_url
             FROM users u
             JOIN followers f ON u.id = f.follower_id
             WHERE f.following_id = $1`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching followers list:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};