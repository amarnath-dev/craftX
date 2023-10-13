const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    linkUrl: {
        type: String,
        required: true,
    },
    bannerImage: {
        type: [String]
    },
    position: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    modifiedDate: {
        type: Date,
        default: Date.now,
    },
    is_delete: {
        type: Boolean,
        default: false,
    },
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
