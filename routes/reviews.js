const express = require('express');
// By default, Router() does not inherit parameters from parent routes.
const router = express.Router({ mergeParams: true }); // Now parameters from parent route are preserved and merged into this router !
const validateReview = require('../validation_middleware/validateReview.js');
const catchAsync = require('../utils/catchAsync.js');
const Listing = require('../models/listing.js');
const AppError = require('../utils/AppError.js');
const Review = require('../models/review.js');
const isLoggedIn = require('../middleware/auth.js');
const isReviewAuthor = require('../middleware/isReviewAuthor.js');
const reviewController = require('../controllers/reviewController.js');

router.post('/', isLoggedIn, validateReview, catchAsync(reviewController.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

module.exports = router;