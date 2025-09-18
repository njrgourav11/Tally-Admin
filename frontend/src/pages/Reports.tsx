import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, TextField
} from '@mui/material';
import { TrendingUp, Inventory, ShoppingCart, Warning } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';

interface SalesReport {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface StockReport {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockValue: number;
  lowStock: any[];
  outOfStock: any[];
}

export const Reports: React.FC = () => {
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [stockReport, setStockReport] = useState<StockReport | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReports();
  }, [dateRange.startDate, dateRange.endDate]);

  const loadReports = async () => {
    try {
      const [salesRes, stockRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        axios.get('http://localhost:5000/api/reports/stock')
      ]);
      
      setSalesReport(salesRes.data);
      setStockReport(stockRes.data);
    } catch (error) {
      toast.error('Failed to load reports');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Date Range Filter */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          type="date"
          label="Start Date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Sales Overview */}
      <Typography variant="h5" gutterBottom>
        Sales Overview
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h4">
                    ₹{salesReport?.totalSales?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Orders
                  </Typography>
                  <Typography variant="h4">
                    {salesReport?.totalOrders || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Order Value
                  </Typography>
                  <Typography variant="h4">
                    ₹{salesReport?.averageOrderValue?.toFixed(0) || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Stock Overview */}
      <Typography variant="h5" gutterBottom>
        Stock Overview
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Products
                  </Typography>
                  <Typography variant="h4">
                    {stockReport?.totalProducts || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h4">
                    {stockReport?.lowStockItems || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Warning color="error" sx={{ mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Out of Stock
                  </Typography>
                  <Typography variant="h4">
                    {stockReport?.outOfStockItems || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Low Stock Items */}
      {stockReport?.lowStock && stockReport.lowStock.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Low Stock Items
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockReport.lowStock.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>₹{item.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};