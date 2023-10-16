const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    productID: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },

}, { timestamps: true });

const Wishlist = mongoose.model('wishlist', wishlistSchema);
module.exports = Wishlist;