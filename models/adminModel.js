const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    }
}, { timestamps: true })

const Admin = mongoose.model('admin', adminSchema)
module.exports = Admin;