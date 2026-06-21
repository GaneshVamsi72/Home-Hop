const Listing = require('../models/listing.js');

module.exports = async (req, res, next) => {

    let { id } = req.params;

    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing Not Found!");
        return res.redirect('/listings');
    }

    if (!listing.owner.equals(req.user._id)) {

        req.flash(
            "error",
            "You don't have permission to do that!"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};