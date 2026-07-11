import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  Autocomplete,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import partyService from '../services/partyService';
import metalPaltaService from '../services/metalPaltaService';
import { roundOffFine, roundOffFineFormatted } from '../utils/roundOff';
import { gradients } from '../theme';

const MetalPalta = () => {
  const [paltas, setPaltas] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [parties, setParties] = useState([]);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedPartyName, setSelectedPartyName] = useState('');
  const [paltaDate, setPaltaDate] = useState(new Date().toISOString().split('T')[0]);
  const [paggaCount, setPaggaCount] = useState(4);
  const [items, setItems] = useState([
    { id: 1, paggaNo: '', weight: '', touch: '', fine: '' },
    { id: 2, paggaNo: '', weight: '', touch: '', fine: '' },
    { id: 3, paggaNo: '', weight: '', touch: '', fine: '' },
    { id: 4, paggaNo: '', weight: '', touch: '', fine: '' },
  ]);
  const [paltaPerKg, setPaltaPerKg] = useState(8);
  const [givenSilver, setGivenSilver] = useState('');
  const [silverRate, setSilverRate] = useState('');
  const [formError, setFormError] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPalta, setSelectedPalta] = useState(null);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const limit = 10;

  useEffect(() => {
    fetchParties();
    fetchPaltas();
  }, [page, filterStartDate, filterEndDate]);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (partySearchQuery) {
        try {
          const response = await partyService.searchParties(partySearchQuery);
          setPartySearchResults(response?.data?.parties || []);
        } catch (error) {
          console.error('Error searching parties:', error);
        }
      } else {
        setPartySearchResults(parties);
      }
    }, 1000);
    return () => clearTimeout(debounceTimer);
  }, [partySearchQuery, parties]);

  useEffect(() => {
    const newItems = [];
    for (let i = 1; i <= paggaCount; i++) {
      const existingItem = items.find(item => item.id === i);
      newItems.push(existingItem || { id: i, paggaNo: '', weight: '', touch: '', fine: '' });
    }
    setItems(newItems);
  }, [paggaCount]);

  const fetchParties = async () => {
    try {
      const response = await partyService.getParties();
      if (response && response.parties) {
        setParties(response.parties);
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const fetchPaltas = async () => {
    try {
      const params = { page, limit };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      const response = await metalPaltaService.getMetalPaltas(params);
      const data = response?.data || response || {};
      setPaltas(data?.records || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching paltas:', error);
      setPaltas([]);
    }
  };

  const getTotalWeight = () => {
    return items.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2);
  };

  const getTotalFine = () => {
    return items.reduce((total, item) => total + (parseFloat(item.fine) || 0), 0).toFixed(2);
  };

  const requiredSilver = () => {
    const totalFine = parseFloat(getTotalFine()) || 0;
    return roundOffFine((parseFloat(paltaPerKg) || 0) * totalFine / 1000).toFixed(2);
  };

  const chandiDeniHai = () => {
    const totalFine = parseFloat(getTotalFine()) || 0;
    const palta = parseFloat(requiredSilver()) || 0;
    return (totalFine + palta).toFixed(2);
  };

  const silverDifference = () => {
    const required = parseFloat(chandiDeniHai()) || 0;
    const given = parseFloat(givenSilver) || 0;
    return (given - required).toFixed(2);
  };

  const getTransactionType = () => {
    const diff = parseFloat(silverDifference()) || 0;
    return diff >= 0 ? 'sales' : 'purchase';
  };

  const finalAmount = () => {
    const diff = parseFloat(silverDifference()) || 0;
    const ratePerKg = parseFloat(silverRate) || 0;
    const ratePerGram = ratePerKg / 1000;
    return (diff * ratePerGram).toFixed(2);
  };

  const handleInputChange = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'touch') {
          let formattedValue = value.replace(/\D/g, '');
          if (formattedValue.length > 2) {
            formattedValue = formattedValue.slice(0, 2) + '.' + formattedValue.slice(2, 4);
          }
          updatedItem.touch = formattedValue;
        }
        if (field === 'weight' || field === 'touch') {
          const weight = field === 'weight' ? value : item.weight;
          const touch = field === 'touch' ? updatedItem.touch : item.touch;
          if (weight && touch) {
            const fine = parseFloat(weight) * (parseFloat(touch) / 100);
            updatedItem.fine = roundOffFineFormatted(fine);
          } else {
            updatedItem.fine = '';
          }
        }
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);
    setPaggaCount(updatedItems.length);
  };

  const handleKeyDown = (id, field, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = items.findIndex(item => item.id === id);
      if (field === 'paggaNo') {
        const weightInput = document.getElementById(`weight-${id}`);
        if (weightInput) weightInput.focus();
      } else if (field === 'weight') {
        const touchInput = document.getElementById(`touch-${id}`);
        if (touchInput) touchInput.focus();
      } else if (field === 'touch') {
        const nextRowId = items[currentIndex + 1]?.id;
        if (nextRowId) {
          const nextPaggaNoInput = document.getElementById(`paggaNo-${nextRowId}`);
          if (nextPaggaNoInput) nextPaggaNoInput.focus();
        } else {
          setPaggaCount(paggaCount + 1);
          setTimeout(() => {
            const newId = paggaCount + 1;
            const newPaggaNoInput = document.getElementById(`paggaNo-${newId}`);
            if (newPaggaNoInput) newPaggaNoInput.focus();
          }, 100);
        }
      }
    }
  };

  const handleAddPagga = () => {
    const newId = items.length + 1;
    setItems([...items, { id: newId, paggaNo: '', weight: '', touch: '', fine: '' }]);
    setPaggaCount(items.length + 1);
  };

  const handleRemovePagga = (id) => {
    if (items.length > 1) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      setPaggaCount(updatedItems.length);
    }
  };

  const resetForm = () => {
    setSelectedPartyId('');
    setSelectedPartyName('');
    setPaltaDate(new Date().toISOString().split('T')[0]);
    setPaggaCount(4);
    setItems([
      { id: 1, paggaNo: '', weight: '', touch: '', fine: '' },
      { id: 2, paggaNo: '', weight: '', touch: '', fine: '' },
      { id: 3, paggaNo: '', weight: '', touch: '', fine: '' },
      { id: 4, paggaNo: '', weight: '', touch: '', fine: '' },
    ]);
    setPaltaPerKg(8);
    setGivenSilver('');
    setSilverRate('');
    setFormError('');
    setEditId(null);
  };

  const handleSave = async () => {
    const toastId = toast.loading('Saving metal palta...');
    try {
      setFormError('');
      if (!selectedPartyId) {
        toast.dismiss(toastId);
        setFormError('Please select a party');
        return;
      }
      const filledItems = items.filter(item =>
        item.paggaNo?.trim() && item.weight?.trim() && item.touch?.trim()
      );
      if (filledItems.length === 0) {
        toast.dismiss(toastId);
        setFormError('Please fill at least one pagga item');
        return;
      }
      const totalFine = items.reduce((total, item) => {
        const w = parseFloat(item.weight) || 0;
        const t = parseFloat(item.touch) || 0;
        return total + roundOffFine(w * t / 100);
      }, 0);

      const diff = parseFloat(silverDifference()) || 0;
      if (diff !== 0 && !silverRate) {
        toast.dismiss(toastId);
        toast.warning('Chandi rate daalo — chandi kam ya jyada di hai, bhav katna hai');
        return;
      }

      const payload = {
        partyId: selectedPartyId,
        date: paltaDate,
        saudaCategory: 'chorsa-999',
        items: filledItems.map(item => ({
          paggaNo: item.paggaNo,
          weight: parseFloat(item.weight) || 0,
          touch: parseFloat(item.touch) || 0,
          fine: parseFloat(item.fine) || 0,
        })),
        totalFine,
        paltaPerKg: parseFloat(paltaPerKg) || 0,
        requiredSilver: parseFloat(requiredSilver()) || 0,
        chandiDeniHai: parseFloat(chandiDeniHai()) || 0,
        givenSilver: parseFloat(givenSilver) || 0,
        silverDifference: parseFloat(silverDifference()) || 0,
        silverRate: parseFloat(silverRate) || 0,
        transactionType: getTransactionType(),
        finalAmount: parseFloat(finalAmount()) || 0,
      };

      if (editId) {
        await metalPaltaService.updateMetalPalta(editId, payload);
      } else {
        await metalPaltaService.createMetalPalta(payload);
      }
      toast.dismiss(toastId);
      toast.success(editId ? 'Metal palta updated successfully' : 'Metal palta created successfully');
      resetForm();
      setShowAddForm(false);
      fetchPaltas();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to save metal palta');
    }
  };

  const handleEdit = (palta) => {
    setEditId(palta._id);
    setSelectedPartyId(palta.partyId?._id || palta.partyId || '');
    setSelectedPartyName(palta.partyId?.partyName || palta.partyName || '');
    setPaltaDate(palta.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setItems((palta.items || []).map((item, i) => ({
      id: i + 1,
      paggaNo: item.paggaNo || '',
      weight: item.weight?.toString() || '',
      touch: item.touch?.toString() || '',
      fine: item.fine?.toString() || '',
    })));
    setPaggaCount(palta.items?.length || 4);
    setPaltaPerKg(palta.paltaPerKg?.toString() || '8');
    setGivenSilver(palta.givenSilver?.toString() || '');
    setSilverRate(palta.silverRate?.toString() || '');
    setShowAddForm(true);
  };

  const handleView = (palta) => {
    setSelectedPalta(palta);
    setViewModalOpen(true);
  };

  const handleCloseView = () => {
    setViewModalOpen(false);
    setSelectedPalta(null);
  };

  const handleBackToList = () => {
    resetForm();
    setShowAddForm(false);
  };

  const diff = parseFloat(silverDifference()) || 0;
  const amount = parseFloat(finalAmount()) || 0;

  return (
    <Container maxWidth={false} sx={{ mt: 1, mb: 1, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Metal Palta
        </Typography>
      </Box>

      {!showAddForm && (
        <>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Metal Palta List
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { resetForm(); setShowAddForm(true); }}
                sx={{
                  background: gradients.primary,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  '&:hover': { background: gradients.primaryHover },
                }}
              >
                Add Metal Palta
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={1} sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Palta/Kg</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Palta Weight</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Chandi Deni Hai</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Chandi Di</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Difference</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Final Amount</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paltas.map((p, index) => {
                    const pDiff = (p.givenSilver || 0) - (p.chandiDeniHai || p.requiredSilver || 0);
                    const pAmount = p.finalAmount || 0;
                    return (
                      <TableRow key={p._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{(page - 1) * limit + index + 1}</TableCell>
                        <TableCell>{p.date ? new Date(p.date).toLocaleDateString('en-GB') : '-'}</TableCell>
                        <TableCell>{p.partyId?.partyName || p.partyName || '-'}</TableCell>
                        <TableCell>{(p.totalFine || 0).toFixed(2)}</TableCell>
                        <TableCell>{p.paltaPerKg || 0}</TableCell>
                        <TableCell>{(p.requiredSilver || 0).toFixed(2)}</TableCell>
                        <TableCell>{(p.chandiDeniHai || p.requiredSilver || 0).toFixed(2)}</TableCell>
                        <TableCell>{(p.givenSilver || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${pDiff > 0 ? '+' : ''}${pDiff.toFixed(2)}`}
                            size="small"
                            color={pDiff === 0 ? 'success' : pDiff > 0 ? 'info' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${pAmount > 0 ? '+' : ''}\u20B9${Math.trunc(pAmount).toLocaleString('en-IN')}`}
                            size="small"
                            color={pAmount === 0 ? 'default' : pAmount > 0 ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleView(p)} sx={{ color: '#6366f1' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEdit(p)} sx={{ color: '#f59e0b' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {paltas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No metal palta records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
              </Box>
            )}
          </Paper>
        </>
      )}

      {showAddForm && (
        <>
          <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {editId ? 'Edit Metal Palta' : 'Create Metal Palta'}
              </Typography>
              <Button variant="outlined" onClick={handleBackToList} sx={{ color: '#6366f1', borderColor: '#6366f1' }}>
                ← Back to List
              </Button>
            </Box>
            {formError && (
              <Box sx={{ mb: 2, p: 2, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fecaca', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>{formError}</Typography>
              </Box>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <Autocomplete
                fullWidth
                options={partySearchQuery ? partySearchResults : parties}
                getOptionLabel={(option) => option.partyName || ''}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
                value={parties.find(p => p._id === selectedPartyId) || null}
                onChange={(event, newValue) => {
                  setSelectedPartyId(newValue?._id || '');
                  setSelectedPartyName(newValue?.partyName || '');
                  setFormError('');
                  setPartySearchQuery('');
                }}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === 'input') {
                    setPartySearchQuery(newInputValue);
                  } else if (reason === 'reset' || reason === 'clear') {
                    setPartySearchQuery('');
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Party Name" error={!!formError && !selectedPartyId} helperText={formError && !selectedPartyId ? formError : ''} />
                )}
              />
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={paltaDate}
                onChange={(e) => setPaltaDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Pagga Count"
                type="text"
                value={paggaCount}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  if (!isNaN(num) && num >= 1 && num <= 50) setPaggaCount(num);
                }}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 50 }}
                sx={{ maxWidth: { sm: 200 } }}
              />
            </Stack>
          </Paper>

          <Paper elevation={1} sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.25rem' }, background: gradients.primary, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Pagga Details
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddPagga} size="small" sx={{ background: gradients.primary, '&:hover': { background: gradients.primaryHover } }}>
                Add Pagga
              </Button>
            </Box>

            <TableContainer sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 600, sm: 'auto' } } }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '50px' }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '60px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{item.id}</TableCell>
                      <TableCell>
                        <TextField fullWidth size="small" id={`paggaNo-${item.id}`} value={item.paggaNo} onChange={(e) => handleInputChange(item.id, 'paggaNo', e.target.value)} onKeyDown={(e) => handleKeyDown(item.id, 'paggaNo', e)} placeholder="Enter Pagga No" />
                      </TableCell>
                      <TableCell>
                        <TextField fullWidth size="small" type="text" id={`weight-${item.id}`} value={item.weight} onChange={(e) => handleInputChange(item.id, 'weight', e.target.value)} onKeyDown={(e) => handleKeyDown(item.id, 'weight', e)} placeholder="0.00" inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*', step: '0.01' }} />
                      </TableCell>
                      <TableCell>
                        <TextField fullWidth size="small" type="text" id={`touch-${item.id}`} value={item.touch} onChange={(e) => handleInputChange(item.id, 'touch', e.target.value)} onKeyDown={(e) => handleKeyDown(item.id, 'touch', e)} placeholder="00.00" inputProps={{ maxLength: 5 }} />
                      </TableCell>
                      <TableCell>
                        <TextField fullWidth size="small" type="text" value={item.fine} InputProps={{ readOnly: true }} sx={{ bgcolor: 'background.default' }} />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleRemovePagga(item.id)} disabled={items.length === 1} sx={{ color: '#ef4444', '&.Mui-disabled': { color: '#d1d5db' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 700 }} colSpan={2}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{getTotalWeight()} g</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>-</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{getTotalFine()} g</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Palta Calculation
            </Typography>
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Palta per Kg"
                  type="number"
                  value={paltaPerKg}
                  onChange={(e) => setPaltaPerKg(e.target.value)}
                  inputProps={{ step: '0.01', min: 0 }}
                  helperText="Default: 8"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Palta Kitna Bna (g)"
                  type="number"
                  value={requiredSilver()}
                  InputProps={{ readOnly: true }}
                  sx={{ bgcolor: 'background.default' }}
                  helperText={`(${paltaPerKg} × ${getTotalFine()}) / 1000`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Chandi Deni Hai (g)"
                  type="number"
                  value={chandiDeniHai()}
                  InputProps={{ readOnly: true }}
                  sx={{ bgcolor: 'background.default' }}
                  helperText="Total Fine + Palta Weight"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Chandi Di (g)"
                  type="number"
                  value={givenSilver}
                  onChange={(e) => setGivenSilver(e.target.value)}
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Chandi Rate (₹/kg)"
                  type="text"
                  value={silverRate ? Number(silverRate).toLocaleString('en-IN') : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9.]/g, '');
                    setSilverRate(raw);
                  }}
                  inputProps={{ inputMode: 'decimal' }}
                  helperText="Bhav katne ke liye"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(99, 102, 241, 0.04)', border: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Palta Weight</Typography>
                  <Chip
                    label={`${requiredSilver()} g`}
                    color="primary"
                    sx={{ fontWeight: 700, fontSize: '1rem', py: 0.5 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                    ({paltaPerKg} × {getTotalFine()}g) / 1000
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Silver Difference</Typography>
                  <Chip
                    label={`${diff > 0 ? '+' : ''}${diff} g`}
                    color={diff === 0 ? 'success' : diff > 0 ? 'info' : 'error'}
                    sx={{ fontWeight: 700, fontSize: '1rem', py: 0.5 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                    {diff === 0 ? 'Exact chandi di' : diff > 0 ? 'Jyada chandi di — bhav katna' : 'Kam chandi di — bhav katna'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Final Amount</Typography>
                  <Chip
                    label={`${amount > 0 ? '+' : ''}\u20B9${Math.trunc(amount).toLocaleString('en-IN')}`}
                    color={amount === 0 ? 'default' : amount > 0 ? 'success' : 'warning'}
                    sx={{ fontWeight: 700, fontSize: '1rem', py: 0.5 }}
                  />
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                    {amount === 0 ? 'Kuch nahi lena dena' : amount > 0 ? 'Party se lena hai' : 'Party ko dena hai'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={3} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={!selectedPartyId}
                    sx={{
                      background: gradients.successDark,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      '&:hover': { background: gradients.successDarkHover },
                      px: 4,
                      py: 1.5,
                    }}
                  >
                    {editId ? 'Update Metal Palta' : 'Save Metal Palta'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </>
      )}

      <Dialog open={viewModalOpen} onClose={handleCloseView} maxWidth="md" fullWidth>
        <DialogTitle sx={{ background: gradients.primary, color: '#fff' }}>
          Metal Palta Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedPalta && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Party Name</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedPalta.partyId?.partyName || selectedPalta.partyName || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Date</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedPalta.date ? new Date(selectedPalta.date).toLocaleDateString('en-GB') : '-'}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Pagga Details</Typography>
              <TableContainer component={Paper} elevation={1}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ background: gradients.primary }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(selectedPalta.items || []).map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{item.paggaNo || '-'}</TableCell>
                        <TableCell>{item.weight || 0}</TableCell>
                        <TableCell>{item.touch || 0}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.fine || 0}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                      <TableCell colSpan={3} sx={{ fontWeight: 700 }}>Total Fine</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} colSpan={2}>{(selectedPalta.totalFine || 0).toFixed(2)} g</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Palta per Kg</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{selectedPalta.paltaPerKg || 0}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Palta Weight</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{(selectedPalta.requiredSilver || 0).toFixed(2)} g</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chandi Deni Hai</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{(selectedPalta.chandiDeniHai || selectedPalta.requiredSilver || 0).toFixed(2)} g</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Chandi Di</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{(selectedPalta.givenSilver || 0).toFixed(2)} g</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Final Amount</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: (selectedPalta.finalAmount || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                      {(selectedPalta.finalAmount || 0) >= 0 ? '+' : ''}\u20B9{Math.trunc(selectedPalta.finalAmount || 0).toLocaleString('en-IN')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MetalPalta;
