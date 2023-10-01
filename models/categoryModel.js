const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true, 
    },
    description: {
      type: String,
    },
    createdon: {
        type: Date,
        default: Date.now,
    },
    delete: {
        type: Boolean,
        default: false,
    },
    status: {
      type: Boolean,
      default: true,
    }

},{timestamps: true});
  

const Category = mongoose.model('category', categorySchema);
module.exports = Category;