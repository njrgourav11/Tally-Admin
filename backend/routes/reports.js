const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Sales report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = db.collection('orders');
    
    if (startDate && endDate) {
      query = query.where('createdAt', '>=', new Date(startDate))
                   .where('createdAt', '<=', new Date(endDate));
    }
    
    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => doc.data());
    
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    
    res.json({
      totalSales,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stock report
router.get('/stock', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = snapshot.docs.map(doc => doc.data());
    
    const lowStock = products.filter(p => p.quantity < 10);
    const outOfStock = products.filter(p => p.quantity === 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.rate), 0);
    
    res.json({
      totalProducts: products.length,
      lowStockItems: lowStock.length,
      outOfStockItems: outOfStock.length,
      totalStockValue: totalValue,
      lowStock,
      outOfStock
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;