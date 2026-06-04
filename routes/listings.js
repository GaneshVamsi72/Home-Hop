const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
const Listing = require('../models/listing.js');
const AppError = require('../utils/AppError.js');
const validateListing = require('../validation_middleware/validateListing.js');

router.get('/', catchAsync(async (req, res) => {
    let listings = await Listing.find({});
    res.render('./listings/AllListings.ejs', { listings });
}));

router.get('/new', (req, res) => {
    res.render('./listings/NewListing.ejs');
});

router.get('/:id', catchAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }
    res.render('./listings/ListingDetailed.ejs', { listing });
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }
    res.render('./listings/EditListing.ejs', { listing });
}));

router.post('/', validateListing, catchAsync(async (req, res) => {
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

router.put('/:id', validateListing, catchAsync(async (req, res) => {
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

router.delete('/:id', catchAsync(async (req, res) => {
    let id = req.params.id;
    let deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError("Listing Not Found", 404);
    }
    res.redirect('/listings');
}));

module.exports = router;