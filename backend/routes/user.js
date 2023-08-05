const express = require('express');
const { register, login, followUser, loggedInUserName, logout, updatePassword, updateProfile, myProfile, deleteMyProfile,
     getUserProfile, getAllUsers, forgotPassword, getMyPosts } = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/follow/:id').get(isAuthenticated, followUser);
router.route('/loggedInUserName').get(isAuthenticated, loggedInUserName);
router.route('/logout').get(isAuthenticated, logout);
router.route('/update/password').put(isAuthenticated, updatePassword);
router.route('/update/profile').put(isAuthenticated, updateProfile);
router.route('/me').get(isAuthenticated, myProfile);
router.route('/delete/me').delete(isAuthenticated, deleteMyProfile);
router.route('/user/:id').get(isAuthenticated, getUserProfile);
router.route('/users').get(isAuthenticated, getAllUsers);
router.route('/forget/password').post(isAuthenticated, forgotPassword);
router.route('/my/posts').get(isAuthenticated, getMyPosts);

module.exports = router;