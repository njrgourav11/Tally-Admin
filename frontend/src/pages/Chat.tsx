import React, { useState, useEffect } from 'react';
import {
  Box, Paper, List, ListItem, ListItemButton, ListItemText, TextField, Button,
  Typography, Divider, Avatar
} from '@mui/material';
import { Send } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isAdmin: boolean;
}

interface Conversation {
  id: string;
  customerName: string;
  lastMessage: Date;
  lastMessageText: string;
}

export const Chat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      toast.error('Failed to load conversations');
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`http://localhost:5000/api/chat/conversations/${selectedConversation}/messages`, {
        text: newMessage,
        sender: 'Admin',
        isAdmin: true
      });
      
      setNewMessage('');
      loadMessages(selectedConversation);
      loadConversations();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Customer Chat
      </Typography>
      
      <Box sx={{ display: 'flex', height: '600px', gap: 2 }}>
        {/* Conversations List */}
        <Paper sx={{ width: '300px', overflow: 'auto' }}>
          <List>
            {conversations.map((conv) => (
              <ListItem key={conv.id} disablePadding>
                <ListItemButton
                  selected={selectedConversation === conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                >
                  <Avatar sx={{ mr: 2 }}>{conv.customerName[0]}</Avatar>
                  <ListItemText
                    primary={conv.customerName}
                    secondary={conv.lastMessageText}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      justifyContent: message.isAdmin ? 'flex-end' : 'flex-start',
                      mb: 1
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        maxWidth: '70%',
                        bgcolor: message.isAdmin ? 'primary.main' : 'grey.200',
                        color: message.isAdmin ? 'white' : 'black'
                      }}
                    >
                      <Typography variant="body2">{message.text}</Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>

              <Divider />

              {/* Message Input */}
              <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <Button
                  variant="contained"
                  endIcon={<Send />}
                  onClick={sendMessage}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">
                Select a conversation to start chatting
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};