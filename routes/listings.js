const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync.js');
const Listing = require('../models/listing.js');
const AppError = require('../utils/AppError.js');
const validateListing = require('../validation_middleware/validateListing.js');
const isLoggedIn = require('../middleware/auth.js');
const isOwner = require('../middleware/isOwner.js');
const listingController = require('../controllers/listingController.js');

router.get('/', catchAsync(listingController.index));

router.get('/new', isLoggedIn, listingController.renderNewForm);

router.get('/:id', catchAsync(listingController.showListing));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(listingController.renderEditForm));

router.post('/', isLoggedIn, validateListing, catchAsync(listingController.createListing));

router.put('/:id', isLoggedIn, isOwner, validateListing, catchAsync(listingController.updateListing));

router.delete('/:id', isLoggedIn, isOwner, catchAsync(listingController.deleteListing));

module.exports = router;