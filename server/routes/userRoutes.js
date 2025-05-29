const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

// User Profile Routes
router.post('/', userController.createUser); // Create a new user
router.get('/', userController.getAllUsers); // Get all users for dashboard
router.get('/:userId', userController.getUserById); // Get a specific user
router.put('/:userId', userController.updateUser); // Update a user
router.delete('/:userId', userController.deleteUser); // Delete a user

// Follow/Unfollow Routes
router.post('/:userId/follow/:targetUserId', userController.followUser); // User <userId> follows <targetUserId>
router.delete('/:userId/unfollow/:targetUserId', userController.unfollowUser); // User <userId> unfollows <targetUserId>

// Get following/followers list
router.get('/:userId/following', userController.getFollowing); // Get list of users <userId> is following
router.get('/:userId/followers', userController.getFollowers); // Get list of users following <userId>


module.exports = router;