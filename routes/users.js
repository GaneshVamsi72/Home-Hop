const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const saveRedirectUrl = require('../middleware/saveRedirectUrl');
const userController = require('../controllers/userController');

router.get('/signup', userController.renderSignupForm);

router.get('/login', userController.renderLoginForm);

router.post('/signup', userController.signup);

router.post(
    '/login', 

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