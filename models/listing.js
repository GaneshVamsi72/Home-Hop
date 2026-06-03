const mongoose = require('mongoose');
const Review = require('./review.js');

const DEFAULT_IMG_URL = "https://plus.unsplash.com/premium_photo-1686167988053-3c9501537a8d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const listingSchema = new mongoose.Schema({

    title: {
        type: String,
        trim: true,
        required: true
    },

    description: {
        type: String,
        trim: true,
        required: true
    },

    price: {
        type: Number,
        min: 0,
        required:true
    },

    currency: { 
        type: String, 
        default: 'INR' 
    },

    location: {
        type: String, 
        trim: true,
        required: true
    },

    image: {
        type: String,
        trim: true,
        default: DEFAULT_IMG_URL,
        set: (v) => (!v || v.trim() === "") ? DEFAULT_IMG_URL : v
    },
    
    country: {
        type: String,
        trim: true,
        required: true
    },

    type: {
        type: String,
        enum: ["Hotel", "Home", "Room", "Apartment", "Flat", "Villa", "GuestSuite"],
        default: "Home"
    },

    amenities: {
        type: [String],
        default: []
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
        }
    ],

}, { timestamps: true });

listingSchema.post('findOneAndDelete', async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }   
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing