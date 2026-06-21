const Review = require('../models/review.js');

module.exports = async (req, res, next) => {

    let { id, reviewId } = req.params;

    let review = await Review.findById(reviewId);

    if (!review) {

        req.flash(
            "error",
            "Review Not Found!"
        );

        return res.redirect(`/listings/${id}`);
    }

    if (!review.author.equals(req.user._id)) {

        req.flash(
            "error",
            "You are not the author of this review!"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};