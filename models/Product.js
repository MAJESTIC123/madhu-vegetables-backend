const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'Vegetables'
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'piece', 'bundle'],
    default: 'kg'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);