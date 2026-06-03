const Joi = require('joi');

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),

        description: Joi.string().required(),

        price: Joi.number().min(0).required(),

        currency: Joi.string().valid('INR', 'USD').required(),  

        location: Joi.string().required(),

        image: Joi.string().allow('', null),

        country: Joi.string().required(),

        type: Joi.string().valid(
            "Hotel", 
            "Home", 
            "Room", 
            "Apartment", 
            "Flat", 
            "Villa", 
            "GuestSuite"
        ),

        amenities: Joi.string().allow('', null)
    }).required()
});

module.exports = listingSchema;