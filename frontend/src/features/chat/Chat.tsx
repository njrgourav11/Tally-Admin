"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Send } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
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
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

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
      const response = await axios.get(`${API_BASE_URL}/chat/conversations`);
      setConversations(response.data);
    } catch (error) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await axios.post(`${API_BASE_URL}/chat/conversations/${selectedConversation}/messages`, {
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customer Chat</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-4 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted ${
                      selectedConversation === conv.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <Avatar>
                      <AvatarFallback>{conv.customerName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.customerName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessageText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <CardContent className="flex-1 overflow-auto p-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        <Skeleton className="h-10 w-48 rounded-lg" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isAdmin
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <Separator />

              <div className="p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Select a conversation to start chatting
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};