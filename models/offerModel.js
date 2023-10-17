const mongoose = require('mongoose');

const categoryofferSchema = new mongoose.Schema({

    category_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    category_name: {
        type: String,
        required: true,
    },
    offer_title: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
    },
    is_Deleted: {
        type: Boolean,
        default: false,
    },
});

const Categoryoffer = mongoose.model('categoryOffer', categoryofferSchema);

module.exports = Categoryoffer;
