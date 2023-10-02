const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

    payment_ID: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    payment_method: {
        type: String,
    },
    status: {
        type: String,
        required: true,
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    created_at: {
        type: Date,
        required: true,
    },
    attempts: {
        type: Number,
    }
});

const Payment = mongoose.model('payment', paymentSchema)
module.exports = Payment;