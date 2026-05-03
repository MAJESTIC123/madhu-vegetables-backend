const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');

// POST /api/feedback - Submit feedback for an order
router.post('/', async (req, res) => {
  try {
    const { orderId, customerName, customerPhone, rating, comment } = req.body;

    // Validation
    if (!orderId || !customerName || !customerPhone || !rating) {
      return res.status(400).json({ 
        error: 'Order ID, name, phone and rating are required' 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Check if order exists
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ 
        error: 'Order not found. Please place an order first.' 
      });
    }

    // Check if feedback already exists for this order
    const existingFeedback = await Feedback.findOne({ orderId });
    if (existingFeedback) {
      return res.status(400).json({ 
        error: 'Feedback already submitted for this order. Thank you!' 
      });
    }

    // Create feedback
    const feedback = new Feedback({
      orderId,
      customerName,
      customerPhone,
      rating,
      comment: comment || ''
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback. Please try again.' 
    });
  }
});

// GET /api/feedback - Get all visible feedback (for public reviews page)
router.get('/', async (req, res) => {
  try {
    const feedbackList = await Feedback
      .find({ isVisible: true })
      .sort({ createdAt: -1 })
      .limit(100)
      .select('customerName rating comment createdAt');  // Don't expose phone publicly

    // Calculate stats
    const totalReviews = feedbackList.length;
    const averageRating = totalReviews > 0
      ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
      : 0;

    // Count ratings breakdown
    const ratingBreakdown = {
      5: feedbackList.filter(f => f.rating === 5).length,
      4: feedbackList.filter(f => f.rating === 4).length,
      3: feedbackList.filter(f => f.rating === 3).length,
      2: feedbackList.filter(f => f.rating === 2).length,
      1: feedbackList.filter(f => f.rating === 1).length,
    };

    res.json({
      totalReviews,
      averageRating: parseFloat(averageRating),
      ratingBreakdown,
      reviews: feedbackList
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to load feedback' 
    });
  }
});

// GET /api/feedback/check/:orderId - Check if order already has feedback
router.get('/check/:orderId', async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ orderId: req.params.orderId });
    res.json({ 
      hasFeedback: !!feedback,
      feedback: feedback || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check feedback' });
  }
});

module.exports = router;