import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Alert } from '@mui/material';
import { Sync, CheckCircle, Error } from '@mui/icons-material';
import { productAPI, orderAPI, syncAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatDateTime, parseToDate } from '../utils/date';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    recentActivity: 0
  });
  const [syncing, setSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  useEffect(() => {
    loadStats();
    checkConnection();
  }, []);

  const loadStats = async () => {
    try {
      const [products, orders] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll()
      ]);
      
      setStats({
        totalProducts: products.data.length,
        pendingOrders: orders.data.filter(o => o.status === 'new' || o.status === 'in-progress').length,
        recentActivity: orders.data.filter(o => {
          const d = new Date(o.createdAt as any);
          return !isNaN(d.getTime()) && d.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        }).length
      });
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    }
  };

  const checkConnection = async () => {
    try {
      const response = await syncAPI.testConnection();
      setConnectionStatus(response.data.connected);
    } catch (error) {
      setConnectionStatus(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const response = await syncAPI.manual();
      toast.success(`Synced ${response.data.count} items successfully`);
      loadStats();
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Alert 
        severity={connectionStatus ? 'success' : 'error'} 
        icon={connectionStatus ? <CheckCircle /> : <Error />}
        sx={{ mb: 3 }}
      >
        Tally Connection: {connectionStatus ? 'Connected' : 'Disconnected'}
      </Alert>

      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h4">
                {stats.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Orders
              </Typography>
              <Typography variant="h4">
                {stats.pendingOrders}
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recent Activity (24h)
              </Typography>
              <Typography variant="h4">
                {stats.recentActivity}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Button
        variant="contained"
        startIcon={<Sync />}
        onClick={handleManualSync}
        disabled={syncing || !connectionStatus}
        size="large"
      >
        {syncing ? 'Syncing...' : 'Sync Now'}
      </Button>
    </Box>
  );
};