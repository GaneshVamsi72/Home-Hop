const listingSchema = require('../validation_schemas/listingSchema.js');
const AppError = require('../utils/AppError.js');

let validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(', ');
        throw new AppError(errMsg, 400);
    }

    next();
};

module.exports = validateListing;