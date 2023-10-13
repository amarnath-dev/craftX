const mongoose = require('mongoose');
const cryptojs = require('crypto-js');
const Address = require('./addressModel');
const Cart = require('./cartModel');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
  phonenumber: {
    type: String,
    required: true,
    unique: true,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Boolean,
    default: true,
  },
  referalCode: {
    type: String,
  },
  address: [Address.schema],

  cart: [
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      count: {
        type: Number,
        default: 1
      }
    }
  ],

}, { timestamps: true })



// static method to login the user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const unhashedPassword = cryptojs.AES.decrypt(user.password, process.env.HASH_KEY).toString(cryptojs.enc.Utf8);
    if (unhashedPassword === password) {
      return user;
    }
    throw Error("Incorrect Password")
  }
  throw Error("Incorrect Email");
}


const User = mongoose.model('user', userSchema)
module.exports = User;

