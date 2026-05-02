const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const seedProducts = require('../data/seedProducts');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ inStock: true }).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    const inserted = await Product.insertMany(seedProducts);
    res.json({ message: 'Products seeded successfully', count: inserted.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;