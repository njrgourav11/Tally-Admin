import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Chip, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { Order } from '../types';
import { orderAPI } from '../services/api';
import { formatDateTime } from '../utils/date';
import toast from 'react-hot-toast';

const statusColors = {
  'new': 'primary',
  'in-progress': 'warning',
  'shipped': 'info',
  'completed': 'success'
} as const;

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const response = await orderAPI.getById(orderId);
      setSelectedOrder(response.data);
      setDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const handleStatusUpdate = async (status: Order['status']) => {
    if (!selectedOrder) return;
    
    try {
      await orderAPI.updateStatus(selectedOrder.id, status);
      toast.success('Order status updated');
      setDialogOpen(false);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id.slice(-8)}</TableCell>
                <TableCell>{order.customerInfo.name}</TableCell>
                <TableCell>{order.items.length} items</TableCell>
                <TableCell>${order.total}</TableCell>
                <TableCell>
                  <Chip 
                    label={order.status} 
                    color={statusColors[order.status]}
                  />
                </TableCell>
                <TableCell>
                  {/* Consistent date+time display */}
                  {formatDateTime(order.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<Visibility />}
                    onClick={() => handleViewOrder(order.id)}
                    size="small"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" gutterBottom>Customer Information</Typography>
              <Typography>Name: {selectedOrder.customerInfo.name}</Typography>
              <Typography>Email: {selectedOrder.customerInfo.email}</Typography>
              <Typography>Phone: {selectedOrder.customerInfo.phone}</Typography>
              <Typography gutterBottom>Address: {selectedOrder.customerInfo.address}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Items</Typography>
              {selectedOrder.items.map((item, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography>{item.productName} - Qty: {item.quantity} - ${item.price}</Typography>
                </Box>
              ))}
              
              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: ${selectedOrder.total}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(e.target.value as Order['status'])}
                >
                  <MenuItem value="new">New</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="shipped">Shipped</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};