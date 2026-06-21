const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
const Listing = require('../models/listing.js');
const AppError = require('../utils/AppError.js');
const validateListing = require('../validation_middleware/validateListing.js');
const isLoggedIn = require('../middleware/auth.js');
const isOwner = require('../middleware/isOwner.js');

router.get('/', catchAsync(async (req, res) => {
    let listings = await Listing.find({});
    res.render('./listings/AllListings.ejs', { listings });
}));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('./listings/NewListing.ejs');
});

router.get('/:id', catchAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({
        path: "reviews", 
        populate: {
            path: "author"
        }
    }).populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }
    res.render('./listings/ListingDetailed.ejs', { listing });
}));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }
    res.render('./listings/EditListing.ejs', { listing });
}));

router.post('/', isLoggedIn, validateListing, catchAsync(async (req, res) => {
    // Temporary Fix for Public “Add Listing” Abuse Risk
    if (process.env.NODE_ENV === "production") {
        req.flash("error", "Demo mode: Listing creation disabled");
        return res.redirect('/listings');
    }
    //
    let listing = req.body.listing;

    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    listing.owner = req.user._id;
    await Listing.create(listing);

    req.flash("success", "Listing Created Successfully!");

    res.redirect('/listings');
}));

router.put('/:id', isLoggedIn, isOwner, validateListing, catchAsync(async (req, res) => {
    let id = req.params.id;
    let listing = req.body.listing;
    
    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    
    let updated = await Listing.findByIdAndUpdate(id,  listing, { runValidators: true });
    if (!updated) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }

    req.flash('success', 'Listing Updated Successfully!');

    res.redirect(`/listings/${id}`);
}));

router.delete('/:id', isLoggedIn, isOwner, catchAsync(async (req, res) => {
    let id = req.params.id;
    let deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }

    req.flash('success', 'Listing Deleted Successfully!');

    res.redirect('/listings');
}));

module.exports = router;