const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const saveRedirectUrl = require('../middleware/saveRedirectUrl');

router.get('/signup', (req, res) => {
    res.render('./users/signup.ejs');
});

router.get('/login', (req, res) => {
    res.render('./users/login.ejs');
});

router.post('/signup', async (req, res) => {
    try {
        let { email, username, password } = req.body;

        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);

        // passport.authenticate() middleware invokes req.login() automatically. login() function is primarily used when users sign up, during which req.login() can be invoked to automatically log in the newly registered user.
        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash('success', `Welcome to HomeHop, ${registeredUser.username}!`);
            
            res.redirect('/listings');
        });
    } catch(err) {
        req.flash('error', err.message);

        res.redirect('/signup');
    }
});

router.post(
    '/login', 

    saveRedirectUrl,
    
    // passport.authenticate() middleware invokes req.login() automatically.
    passport.authenticate('local', { 
        failureRedirect: '/login', 
        failureFlash: true 
    }), 
    
    (req, res) => {
        req.flash('success', `Welcome Back, ${req.user.username}!`);

        let redirectUrl = res.locals.redirectUrl || '/listings';

        res.redirect(redirectUrl);
    }   
);

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash('success', 'Logged Out Successfully!');

        res.redirect('/listings');
    });
});

module.exports = router;