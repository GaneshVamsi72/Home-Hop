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
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

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