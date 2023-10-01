const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User',
  },
  productID: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
  count: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
