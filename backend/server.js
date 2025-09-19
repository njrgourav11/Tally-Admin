const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// ✅ Correct path
const tallyService = require('./services/tallyService');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const syncRoutes = require('./routes/sync');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);

// Auto sync every 30 minutes (⚠️ works only locally, not on Vercel)
cron.schedule('*/30 * * * *', async () => {
  console.log('Running automatic sync...');
  try {
    await tallyService.syncStockItems();
  } catch (error) {
    console.error('Auto sync failed:', error);
  }
});

if (process.env.VERCEL) {
  // On Vercel → export app
  module.exports = app;
} else {
  // Local dev → run server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
