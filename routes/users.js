const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const saveRedirectUrl = require('../middleware/saveRedirectUrl');
const userController = require('../controllers/userController');
const catchAsync = require('../utils/catchAsync');

router.route('/signup')
    .get(userController.renderSignupForm)
    .post(catchAsync(userController.signup));

router.route('/login')
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl,
        
        // passport.authenticate() middleware invokes req.login() automatically.
        passport.authenticate('local', { 
            failureRedirect: '/login', 
            failureFlash: true 
        }), 
        
        userController.login
    );

router.get('/logout', userController.logout);

module.exports = router;