"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Package, 
  ShoppingCart, 
  Activity,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
import { productAPI, orderAPI, syncAPI } from '../../lib/api';
import toast from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingOrders: 0,
    recentActivity: 0,
    totalRevenue: 0,
    activeUsers: 0
  });
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
    checkConnection();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [products, orders] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll()
      ]);
      
      const completedOrders = orders.data.filter(o => o.status === 'completed');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
      
      setStats({
        totalProducts: products.data.length,
        pendingOrders: orders.data.filter(o => o.status === 'new' || o.status === 'in-progress').length,
        recentActivity: orders.data.filter(o => {
          const d = new Date(o.createdAt as any);
          return !isNaN(d.getTime()) && d.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        }).length,
        totalRevenue,
        activeUsers: 0
      });
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      console.log('Testing Tally connection...');
      const response = await syncAPI.testConnection();
      console.log('Connection test response:', response.data);
      setConnectionStatus(response.data.connected);
    } catch (error: any) {
      console.error('Tally connection test failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setConnectionStatus(false);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      console.log('Starting manual sync...');
      const response = await syncAPI.manual();
      console.log('Sync response:', response.data);
      toast.success(`Synced ${response.data.count || 0} items successfully`);
      setLastSync(new Date());
      loadStats();
      setConnectionStatus(true);
    } catch (error: any) {
      console.error('Sync failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        toast.error('Network error: Cannot connect to backend. Check if backend is running.');
      } else if (error.response?.status === 404) {
        toast.error('Sync endpoint not found. Check backend API.');
      } else if (error.response?.status === 500) {
        toast.error('Server error: ' + (error.response?.data?.message || 'Internal server error'));
      } else if (error.message?.includes('ECONNREFUSED') || error.response?.data?.message?.includes('ECONNREFUSED')) {
        toast.error('Tally Prime is not running. Please start Tally Prime and enable API access on port 9000.');
      } else {
        toast.error('Sync failed: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      }
      setConnectionStatus(false);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Button
          onClick={handleManualSync}
          disabled={syncing}
          size="sm"
          className="gap-2"
          title={!connectionStatus ? 'Tally Prime may not be running' : 'Sync with Tally Prime'}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      <Alert className={connectionStatus ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        {connectionStatus ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
        <AlertDescription className={connectionStatus ? 'text-green-800' : 'text-red-800'}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Tally Connection: {connectionStatus ? 'Connected' : 'Disconnected'}</span>
              {lastSync && (
                <span className="text-xs">
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </div>
            {!connectionStatus && (
              <div className="text-xs">
                <p>To enable Tally sync:</p>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Open Tally Prime</li>
                  <li>Go to Gateway of Tally → F12: Configure → Connectivity → Set "Enable API" to Yes</li>
                  <li>Set API Port to 9000</li>
                  <li>Restart Tally Prime</li>
                </ol>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +2.1% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                -5.2% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8.1% from last week
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {stats.recentActivity > 0 ? (
                <div className="text-sm text-muted-foreground">
                  {stats.recentActivity} activities in the last 24 hours
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No recent activity
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Package className="mr-2 h-4 w-4" />
              Add New Product
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShoppingCart className="mr-2 h-4 w-4" />
              View All Orders
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="mr-2 h-4 w-4" />
              Force Sync Tally
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Activity className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};