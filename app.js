const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));

const MONGO_URL = "mongodb://127.0.0.1:27017/homehop";

main()
    .then(() => console.log('MongoDB Connected!'))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

let port = 8080;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

app.use((req, res, next) => {
    console.log("Request Received");
    console.log(`[${req.method}] ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.render('HomePage.ejs');
});

app.get('/listings', async (req, res) => {
    let listings = await Listing.find({});
    res.render('./listings/AllListings.ejs', { listings });
});

app.get('/listings/new', (req, res) => {
    res.render('./listings/NewListing.ejs');
});

app.get('/listings/:id', async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/ListingDetailed.ejs', { listing });
});

app.get('/listings/:id/edit', async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render('./listings/EditListing.ejs', { listing });
});

app.post('/listings', async (req, res) => {
    let listing = req.body.listing;
    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    await Listing.insertOne(listing);
    res.redirect('/listings');
});

app.put('/listings/:id', async (req, res) => {
    let id = req.params.id;
    let listing = req.body.listing;
    if (listing.amenities) {
        listing.amenities = listing.amenities.split(",").map(a => a.trim());
    }
    await Listing.findByIdAndUpdate(id,  listing, { runValidators: true });

    res.redirect(`/listings/${id}`);
});

app.delete('/listings/:id', async (req, res) => {
    let id = req.params.id;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
});