const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { sendOrderEmailToOwner, sendOrderConfirmationToCustomer } = require('../utils/emailService');

const ALLOWED_PINCODES = ['638452', '638476', '638453', '638454', '638457', '638458', '638503', '638505', '638110'];
const MIN_ORDER_VALUE = 200;
const DELIVERY_CHARGE = 30;

const generateOrderId = () => {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  return `MV${timestamp}`;
};

router.post('/', async (req, res) => {
  try {
    const { customer, items, customerEmail, notes } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return res.status(400).json({ error: 'All customer details required' });
    }

    if (!ALLOWED_PINCODES.includes(customer.pincode)) {
      return res.status(400).json({ 
        error: 'Sorry! We currently deliver only in Gobichettipalayam area. Please check your pincode.' 
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    if (itemsTotal < MIN_ORDER_VALUE) {
      return res.status(400).json({ 
        error: `Minimum order value is ₹${MIN_ORDER_VALUE}. Please add more items.` 
      });
    }

    const totalAmount = itemsTotal + DELIVERY_CHARGE;

    const newOrder = new Order({
      orderId: generateOrderId(),
      customer,
      items,
      itemsTotal,
      deliveryCharge: DELIVERY_CHARGE,
      totalAmount,
      notes: notes || ''
    });

    await newOrder.save();

    sendOrderEmailToOwner(newOrder);
    if (customerEmail) {
      sendOrderConfirmationToCustomer(newOrder, customerEmail);
    }

    res.status(201).json({
      message: 'Order placed successfully!',
      orderId: newOrder.orderId,
      totalAmount: newOrder.totalAmount
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;