const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('users').add(userData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).update({
      ...req.body,
      updatedAt: new Date()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;