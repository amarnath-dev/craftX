const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({

    coupon_code: {
        type: "String",
        required: true,
        unique: true,
    },
    max_use: {
        type: Number,
        required: true,
    },
    minPurchase_amount: {
        type: Number,
        default: 500,
    },
    used_users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    ],
    description: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true,
    },
    is_delete: {
        type: Boolean,
        default: false,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true
    },
    discount_value: {
        type: Number,
    },
    usedCount: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });

const Coupon = new mongoose.model('coupon', couponSchema);
module.exports = Coupon;