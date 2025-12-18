require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/listing.js');
const { data } = require('./data.js');

const MONGO_URL = process.env.MONGO_URL;

main()
    .then(() => console.log('MongoDB Connected!'))
    .catch((err) => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    await Listing.insertMany(data, { runValidators: true });
}

initDB();