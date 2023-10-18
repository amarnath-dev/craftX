const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    stock: {
        type: Number,
    },
    category_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    catName: {
        type: String,
    },
    primaryImage: [String],
    secondaryImage: [String],
    is_delete: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
    },
    in_Stock: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });


const Product = mongoose.model('product', productSchema);
module.exports = Product;