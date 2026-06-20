const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        
        req.flash('error', 'You must be logged in first!');

        return res.redirect('/login');
    }

    next();
};

module.exports = isLoggedIn;