require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const AppError = require('./utils/AppError.js');
const listingRouter = require('./routes/listings.js');
const reviewRouter = require('./routes/reviews.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const userRouter = require('./routes/users.js');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

const sessionOptions = {
    secret: 'mySuperSecretKey', 
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000,
        httpOnly: true
    }
}

// A session refers to a time-limited interaction between two or more communication devices or systems.
// It is a stateful connection that allows for the exchange of information and commands between the parties involved.
app.use(session(sessionOptions));

app.use(passport.initialize()); // Intializes Passport for incoming requests, allowing authentication strategies to be applied.
app.use(passport.session()); // Middleware that will restore login state from a session.
// If sessions are being utilized, and a login session has been established, this middleware will populate req.user with the current user.

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/*
What are Serialize and Deserialize?

Login

Suppose:

{
    _id: "123",
    username: "vamsi"
}

Passport stores ONLY: "123" inside session.

This is serializeUser() !

Next Request

Passport sees: "123" and fetches:

{
    _id: "123",
    username: "vamsi"
}

from MongoDB.

This is deserializeUser() !
*/ 

/*
What Passport Adds?

After successful login you'll automatically get:

req.user

Example:

console.log(req.user);
{
    _id: "...",
    username: "vamsi",
    email: "..."
}
*/

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    res.locals.curUser = req.user;

    next();
});

const MONGO_URL = process.env.MONGO_URL;

main()
    .then(() => console.log('MongoDB Connected!'))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    console.log("Request Received");
    console.log(`[${req.method}] ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.render('HomePage.ejs');
});

app.use('/', userRouter);
app.use('/listings', listingRouter);
app.use('/listings/:id/reviews', reviewRouter);

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.url} on this server`, 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!"} = err;
    
    res.status(statusCode).render('ErrorPage.ejs', { message });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});