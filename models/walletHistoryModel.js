const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({

    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transaction_amount: {
        type: Number,
        required: true,
    },
    transaction_title: {
        type: String,
        required: true,
    },
    transaction_des: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now()
    },

}, { timestamps: true });


const Wallet = mongoose.model('wallet', walletSchema);

module.exports = Wallet;