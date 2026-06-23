const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
const Listing = require('../models/listing.js');
const AppError = require('../utils/AppError.js');
const validateListing = require('../validation_middleware/validateListing.js');
const isLoggedIn = require('../middleware/auth.js');
const isOwner = require('../middleware/isOwner.js');
const listingController = require('../controllers/listingController.js');

router.route('/')
    .get(catchAsync(listingController.index))
    .post(isLoggedIn, validateListing, catchAsync(listingController.createListing));

router.get('/new', isLoggedIn, listingController.renderNewForm);

router.route('/:id')
    .get(catchAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, validateListing, catchAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, catchAsync(listingController.deleteListing));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(listingController.renderEditForm));

module.exports = router;