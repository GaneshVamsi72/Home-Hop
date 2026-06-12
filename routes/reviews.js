const express = require('express');
// By default, Router() does not inherit parameters from parent routes.
const router = express.Router({ mergeParams: true }); // Now parameters from parent route are preserved and merged into this router !
const validateReview = require('../validation_middleware/validateReview.js');
const catchAsync = require('../utils/catchAsync.js');
const Listing = require('../models/listing.js');
const AppError = require('../utils/AppError.js');
const Review = require('../models/review.js');

router.post('/', validateReview, catchAsync(async (req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }

    let review = new Review(req.body.review);
    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    req.flash('success', 'Review Added Successfully!');

    res.redirect(`/listings/${id}`);
}));

router.delete('/:reviewId', catchAsync(async (req, res) => {
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

    req.flash('success', 'Review Deleted Successfully!');

    res.redirect(`/listings/${id}`);
}));

module.exports = router;