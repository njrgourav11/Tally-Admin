import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Box, Chip, MenuItem
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { Product } from '../types';
import { productAPI } from '../services/api';
import { formatDateTime, parseToDate } from '../utils/date';
import toast from 'react-hot-toast';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    attributes: {} as Record<string, any>
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      description: product.description || '',
      attributes: product.attributes || {}
    });
    setDialogOpen(true);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.attributes?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Compute latest sync timestamp across products for header display
  const lastSync = React.useMemo(() => {
    const dates = products
      .map(p => parseToDate(p.syncedAt))
      .filter((d): d is Date => !!d);
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates.map(d => d.getTime())));
  }, [products]);



  const handleSave = async () => {
    if (!selectedProduct) return;
    
    try {
      await productAPI.update(selectedProduct.id, formData);
      toast.success('Product updated successfully');
      setDialogOpen(false);
      loadProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await productAPI.delete(productId);
        toast.success('Product deleted successfully');
        loadProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Products</Typography>
        <Typography variant="body2" color="text.secondary">
          Last synced: {lastSync ? formatDateTime(lastSync) : 'Not synced'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          select
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Categories</MenuItem>
          <MenuItem value="Electronics">Electronics</MenuItem>
          <MenuItem value="Clothing">Clothing</MenuItem>
          <MenuItem value="Books">Books</MenuItem>
        </TextField>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Last Synced</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Chip 
                    label={product.quantity} 
                    color={product.quantity > 0 ? 'success' : 'error'}
                  />
                </TableCell>
                <TableCell>{product.unit}</TableCell>
                <TableCell>{product.description || 'No description'}</TableCell>
                <TableCell>
                  {(() => {
                    return formatDateTime(product.syncedAt);
                  })()}
                </TableCell>
                <TableCell>
                  <Button
                    startIcon={<Edit />}
                    onClick={() => handleEdit(product)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<Delete />}
                    onClick={() => handleDelete(product.id, product.name)}
                    size="small"
                    color="error"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Product: {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Category"
            value={(formData.attributes as any)?.category || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              attributes: { ...formData.attributes, category: e.target.value }
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Brand"
            value={(formData.attributes as any)?.brand || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              attributes: { ...formData.attributes, brand: e.target.value }
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Color"
            value={(formData.attributes as any)?.color || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              attributes: { ...formData.attributes, color: e.target.value }
            })}
            margin="normal"
          />
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => {
                // Handle image upload here
                console.log('Images selected:', e.target.files);
              }}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};