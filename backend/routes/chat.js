const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Get all chat conversations
router.get('/conversations', async (req, res) => {
  try {
    const snapshot = await db.collection('conversations').orderBy('lastMessage', 'desc').get();
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await db.collection('conversations').doc(id)
      .collection('messages').orderBy('timestamp', 'asc').get();
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const messageData = {
      ...req.body,
      timestamp: new Date()
    };
    
    await db.collection('conversations').doc(id)
      .collection('messages').add(messageData);
    
    // Update conversation last message
    await db.collection('conversations').doc(id).update({
      lastMessage: new Date(),
      lastMessageText: req.body.text
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;