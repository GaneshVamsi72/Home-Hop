const saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        // Storing in res.locals is needed because passport.authenticate() regenerates the session on login, clearing the data in the req.session !!! 
        // So saveRedirectUrl must be placed before passport.authenticate() in ([POST] /login) route handler
        res.locals.redirectUrl = req.session.redirectUrl;
        // Why can't we just store in res.locals in isLoggedIn middleware??
        // Because the scope of res.locals is just the current request !
    }

    next();
}

module.exports = saveRedirectUrl;