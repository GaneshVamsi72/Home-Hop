const Listing = require('../models/listing.js');
const Review = require('../models/review.js');
const AppError = require('../utils/AppError.js');

module.exports.createReview = async (req, res) => {
    let id = req.params.id;
    let listing = await Listing.findById(id);
    if (!listing) {
        throw new AppError("Listing Not Found", 404);
    }

    let review = new Review(req.body.review);
    review.author = req.user._id;
    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    req.flash('success', 'Review Added Successfully!');

    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview = async (req, res) => {
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
};