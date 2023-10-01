const mongoose = require('mongoose');


const otpSchema = new mongoose.Schema({
    emailID: {
        type: String,
        unique: true,
    },
    otp: {
        type: String,
    },
    createdAt: {
        type: Date,
        expires: '1m',
        default: Date.now,
    }
}, { timestamps: true })


const Otp = mongoose.model('otp', otpSchema);
module.exports = Otp;