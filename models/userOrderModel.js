const mongoose = require('mongoose');

// Define the order schema
const orderSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    orderDate: {
        type: Date,
        default: Date.now,
    },
    orderState: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    orderAmount: {
        type: Number,
        required: true,
    },
    orderItems: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            unitPrice: {
                type: Number,
                required: true,
            },
            orderStatus: {
                type: String,
                enum: ['processing', 'shipped', 'out for delivery', 'delivered', 'canceled'],
                default: 'processing',
            },
            discount: {
                code: String,
                type: {
                    type: String,
                    enum: ['percentage', 'fixed'],
                },
                value: Number,
            },
            is_Canceled: {
                type: Boolean,
                default: false,
            },
            order_item_date: {
                type: Date,
                default: Date.now,
            },
            is_return: {
                type: Boolean,
                default: false,
            },
            is_Delivered: {
                type: Boolean,
                default: false,
            },
        },
    ],
    totalProductCount: {
        type: Number,
    },
    address: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    payment_method: {
        type: String,
        enum: ['Cash On Delivery', 'Pay Online', 'wallet payment'],
    },
    totalOrderProducts: {
        type: Number,
    },
    payment_status: {
        type: String,
        default: 'pending',
    },
});


const Order = mongoose.model('order', orderSchema);
module.exports = Order;
