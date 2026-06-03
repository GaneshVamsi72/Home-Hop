const reviewSchema = require('../validation_schemas/reviewSchema.js');
const AppError = require('../utils/AppError');

let validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errMsg = error.details.map(el => el.message).join(', ');
        throw new AppError(errMsg, 400);
    }

    next();
};

module.exports = validateReview;