const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  userName: { type: String, required: true },

  street: { type: String},

  apartment: { type: String },

  town: { type: String, required: true },

  state: { type: String, required: true },

  pinCode: { type: String, required: true },

  locality: { type: String, required: true},

  address: { type: String },

  areaStreet: {type: String,},

  landmark: {type: String},

  workHome: {type: String},

  country: { type: String},

  phoneNumber: { type: String, required: true},

  isDefaultShipping: { type: Boolean, default: false },

  isDefaultBilling: { type: Boolean, default: false },

  alternativeNumber: {type: String},
  
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
