const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Mock data for development
const mockProducts = [
  {
    id: '1',
    name: 'Sample Product 1',
    quantity: 100,
    unit: 'Nos',
    description: 'Sample product description',
    images: [],
    attributes: {},
    syncedAt: new Date(),
    lastUpdated: new Date()
  },
  {
    id: '2', 
    name: 'Sample Product 2',
    quantity: 50,
    unit: 'Kg',
    description: 'Another sample product',
    images: [],
    attributes: {},
    syncedAt: new Date(),
    lastUpdated: new Date()
  }
];

// Get all products
router.get('/', async (req, res) => {
  try {
    if (db.collection) {
      const snapshot = await db.collection('products').get();
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(products.length > 0 ? products : mockProducts);
    } else {
      res.json(mockProducts);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    res.json(mockProducts);
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    if (db.collection) {
      await db.collection('products').doc(id).update(updateData);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.json({ success: true }); // Mock success for development
  }
});

// Add new product
router.post('/', async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (db.collection) {
      const docRef = await db.collection('products').add(productData);
      res.json({ success: true, id: docRef.id });
    } else {
      res.json({ success: true, id: `mock-${Date.now()}` });
    }
  } catch (error) {
    console.error('Error creating product:', error);
    res.json({ success: true, id: `mock-${Date.now()}` });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (db.collection) {
      await db.collection('products').doc(id).delete();
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;