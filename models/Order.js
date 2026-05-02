const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String, default: '' }
  },
  items: [{
    productName: String,
    quantity: Number,
    unit: String,
    pricePerUnit: Number,
    subtotal: Number
  }],
  itemsTotal: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 30 },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);