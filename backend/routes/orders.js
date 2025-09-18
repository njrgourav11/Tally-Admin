const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Mock data for development
const mockOrders = [
  {
    id: '1',
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St, City, State'
    },
    items: [
      {
        productId: '1',
        productName: 'Sample Product 1',
        quantity: 2,
        price: 100
      }
    ],
    status: 'new',
    total: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    customerInfo: {
      name: 'Jane Smith',
      email: 'jane@example.com', 
      phone: '+1234567891',
      address: '456 Oak Ave, City, State'
    },
    items: [
      {
        productId: '2',
        productName: 'Sample Product 2',
        quantity: 1,
        price: 150
      }
    ],
    status: 'in-progress',
    total: 150,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Get all orders
router.get('/', async (req, res) => {
  try {
    if (db.collection) {
      const snapshot = await db.collection('orders').get();
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no orders in database, create sample orders
      if (orders.length === 0) {
        const batch = db.batch();
        mockOrders.forEach(order => {
          const docRef = db.collection('orders').doc(order.id);
          batch.set(docRef, order);
        });
        await batch.commit();
        res.json(mockOrders);
      } else {
        res.json(orders);
      }
    } else {
      res.json(mockOrders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.json(mockOrders);
  }
});

// Update order status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (db.collection) {
      // Check if document exists first
      const docRef = db.collection('orders').doc(id);
      const doc = await docRef.get();
      
      if (doc.exists) {
        await docRef.update({
          status,
          updatedAt: new Date()
        });
      } else {
        // Create the document if it doesn't exist
        const mockOrder = mockOrders.find(o => o.id === id);
        if (mockOrder) {
          await docRef.set({
            ...mockOrder,
            status,
            updatedAt: new Date()
          });
        }
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    res.json({ success: true }); // Mock success for development
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (db.collection) {
      const doc = await db.collection('orders').doc(id).get();
      
      if (!doc.exists) {
        // Create the order if it doesn't exist but is in mock data
        const mockOrder = mockOrders.find(o => o.id === id);
        if (mockOrder) {
          await db.collection('orders').doc(id).set(mockOrder);
          return res.json(mockOrder);
        }
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json({ id: doc.id, ...doc.data() });
    } else {
      const mockOrder = mockOrders.find(o => o.id === id);
      res.json(mockOrder || { error: 'Order not found' });
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    const mockOrder = mockOrders.find(o => o.id === req.params.id);
    res.json(mockOrder || { error: 'Order not found' });
  }
});

module.exports = router;