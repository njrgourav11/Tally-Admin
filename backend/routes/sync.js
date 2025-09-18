const express = require('express');
const tallyService = require('../services/tallyService');
const router = express.Router();

// Manual sync trigger
router.post('/manual', async (req, res) => {
  try {
    const result = await tallyService.syncStockItems();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Tally connection
router.get('/test', async (req, res) => {
  try {
    const isConnected = await tallyService.testConnection();
    res.json({ connected: isConnected });
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message });
  }
});

module.exports = router;