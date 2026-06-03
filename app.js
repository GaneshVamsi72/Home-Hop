require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync.js');
const AppError = require('./utils/AppError.js');
const validateListing = require('./validation_middleware/validateListing.js');
const Review = require('./models/review.js');
const validateReview = require('./validation_middleware/validateReview.js');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

const MONGO_URL = process.env.MONGO_URL;

main()
    .then(() => console.log('MongoDB Connected!'))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use((req, res, next) => {
    console.log("Request Received");
    console.log(`[${req.method}] ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.render('HomePage.ejs');
});

app.get('/listings', catchAsync(async (req, res) => {
    let listings = await Listing.find({});
    res.render('./listings/AllListings.ejs', { listings });
}));

app.get('/listings/new', (req, res) => {
    res.render('./listings/NewListing.ejs');
});

app.get('/listings/:id', catchAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }
    res.render('./listings/ListingDetailed.ejs', { listing });
}));

app.get('/listings/:id/edit', catchAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }
    res.render('./listings/EditListing.ejs', { listing });
}));

app.post('/listings', validateListing, catchAsync(async (req, res) => {
    // Temporary Fix for Public “Add Listing” Abuse Risk
    if (process.env.NODE_ENV === "production") {
        throw new AppError("Demo mode: Listing creation disabled", 403);
    }
    //
    let listing = req.body.listing;

    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    await Listing.create(listing);
    res.redirect('/listings');
}));

app.post('/listings/:id/reviews', validateReview, catchAsync(async (req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }

    let review = new Review(req.body.review);
    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    res.redirect(`/listings/${id}`);
}));

app.put('/listings/:id', validateListing, catchAsync(async (req, res) => {
    let id = req.params.id;
    let listing = req.body.listing;
    
    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    
    let updated = await Listing.findByIdAndUpdate(id,  listing, { runValidators: true });
    if (!updated) {
        throw new AppError("Listing Not Found", 404);
    }

    res.redirect(`/listings/${id}`);
}));

app.delete('/listings/:id', catchAsync(async (req, res) => {
    let id = req.params.id;
    let deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError("Listing Not Found", 404);
    }
    res.redirect('/listings');
}));

app.delete('/listings/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    let id = req.params.id;
    let reviewId = req.params.reviewId;

    await Listing.findByIdAndUpdate(
        id, 
        {
            $pull: {
                reviews: reviewId
            }
        }
    );

    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.url} on this server`, 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something Went Wrong!"} = err;
    
    res.status(statusCode).render('ErrorPage.ejs', { message });
});