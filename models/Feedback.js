const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true  // Only one feedback per order
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  isVisible: {
    type: Boolean,
    default: true  // You can hide bad reviews from public if needed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast retrieval of recent reviews
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);