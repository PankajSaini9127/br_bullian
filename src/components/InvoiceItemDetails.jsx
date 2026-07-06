import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { gradients } from '../theme';

const InvoiceItemDetails = ({ onSave }) => {
  const [items, setItems] = useState([
    { id: 1, paggaNo: '', weight: '', touch: '', fine: '' }
  ]);

  const handleAddItem = () => {
    const newId = items.length + 1;
    setItems([...items, { id: newId, paggaNo: '', weight: '', touch: '', fine: '' }]);
  };

  const handleDeleteItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleInputChange = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto calculate fine when weight and touch are provided
        if (field === 'weight' || field === 'touch') {
          const weight = field === 'weight' ? value : item.weight;
          const touch = field === 'touch' ? value : item.touch;
          if (weight && touch) {
            const fine = (parseFloat(weight) * (parseFloat(touch) / 100)).toFixed(2);
            updatedItem.fine = fine;
          } else {
            updatedItem.fine = '';
          }
        }
        
        return updatedItem;
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  const getTotalWeight = () => {
    return items.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2);
  };

  const getTotalFine = () => {
    return items.reduce((total, item) => total + (parseFloat(item.fine) || 0), 0).toFixed(2);
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        items: items,
        totalGrossWeight: getTotalWeight(),
        totalFine: getTotalFine(),
      });
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
        border: '1px solid', borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Incoming Invoice Item Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            size="small"
            sx={{
              background: gradients.primary,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: gradients.primaryHover,
              },
            }}
          >
            Add Item
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            size="small"
            sx={{
              background: gradients.successDark,
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              '&:hover': {
                background: gradients.successDarkHover,
              },
            }}
          >
            Save Invoice
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ background: gradients.primary }}>
              <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Sr No</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
              >
                <TableCell sx={{ fontWeight: 600 }}>{item.id}</TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={item.paggaNo}
                    onChange={(e) => handleInputChange(item.id, 'paggaNo', e.target.value)}
                    placeholder="Enter Pagga No"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#818cf8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={item.weight}
                    onChange={(e) => handleInputChange(item.id, 'weight', e.target.value)}
                    placeholder="0.00"
                    InputProps={{
                      inputProps: { step: '0.01' },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#818cf8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={item.touch}
                    onChange={(e) => handleInputChange(item.id, 'touch', e.target.value)}
                    placeholder="00.00"
                    InputProps={{
                      inputProps: { step: '0.01', min: 0, max: 100 },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#818cf8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={item.fine}
                    InputProps={{
                      readOnly: true,
                      inputProps: { step: '0.01' },
                    }}
                    sx={{
                      bgcolor: 'background.default',
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: '#818cf8',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6366f1',
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={items.length === 1}
                    sx={{
                      color: '#ec4899',
                      '&:hover': { background: 'rgba(236, 72, 153, 0.1)' },
                      '&:disabled': { color: '#ccc' },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ background: 'rgba(99, 102, 241, 0.04)' }}>
              <TableCell sx={{ fontWeight: 700 }} colSpan={2}>
                Total
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {getTotalWeight()} g
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                -
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>
                {getTotalFine()} g
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Section */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          background: 'rgba(99, 102, 241, 0.04)',
          borderRadius: 2,
          border: '1px solid', borderColor: 'divider',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Net Weight
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#6366f1',
              }}
            >
              {getTotalWeight()} g
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Total Fine
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#ec4899',
              }}
            >
              {getTotalFine()} g
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default InvoiceItemDetails;
