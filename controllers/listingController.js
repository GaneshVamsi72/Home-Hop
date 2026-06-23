const Listing = require('../models/listing.js');

module.exports.index = async (req, res) => {
    let listings = await Listing.find({});
    res.render('./listings/AllListings.ejs', { listings });
};

module.exports.renderNewForm = (req, res) => {
    res.render('./listings/NewListing.ejs');
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({
        path: "reviews", 
        populate: {
            path: "author"
        }
    }).populate("owner");
    
    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }
    res.render('./listings/ListingDetailed.ejs', { listing });
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }
    res.render('./listings/EditListing.ejs', { listing });
};

module.exports.createListing = async (req, res) => {
    let listing = req.body.listing;

    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    listing.owner = req.user._id;
    await Listing.create(listing);

    req.flash("success", "Listing Created Successfully!");

    res.redirect('/listings');
};

module.exports.updateListing = async (req, res) => {
    let id = req.params.id;
    let listing = req.body.listing;
    
    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    
    let updated = await Listing.findByIdAndUpdate(id,  listing, { runValidators: true });
    if (!updated) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }

    req.flash('success', 'Listing Updated Successfully!');

    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let id = req.params.id;
    let deleted = await Listing.findByIdAndDelete(id);
    if (!deleted) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }

    req.flash('success', 'Listing Deleted Successfully!');

    res.redirect('/listings');
};