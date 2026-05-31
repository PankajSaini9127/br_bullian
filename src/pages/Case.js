import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Autocomplete,
} from '@mui/material';
import {
  ArrowUpward as IncomingIcon,
  ArrowDownward as OutgoingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import caseService from '../services/caseService';
import partyService from '../services/partyService';

const Case = () => {
  const [tabValue, setTabValue] = useState(0);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [partyId, setPartyId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [parties, setParties] = useState([]);
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  
  const limit = 10;

  // Fetch parties
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await partyService.getParties();
        setParties(response?.data?.parties || []);
      } catch (error) {
        console.error('Error fetching parties:', error);
      }
    };
    fetchParties();
  }, []);

  // Search parties
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (partySearchQuery) {
        try {
          const response = await partyService.searchParties(partySearchQuery);
          setPartySearchResults(response?.data?.parties || []);
        } catch (error) {
          console.error('Error searching parties:', error);
        }
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [partySearchQuery]);

  // Fetch cases
  useEffect(() => {
    fetchCases();
  }, [page, tabValue]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const paymentType = tabValue === 0 ? 'incoming' : 'outgoing';
      const response = await caseService.getPayments({ paymentType }, page, limit);
      setCases(response?.payments || response?.data || []);
      setTotalPages(response?.pagination?.totalPages || response?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    setPaymentType(tabValue === 0 ? 'incoming' : 'outgoing');
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setPartyId('');
    setPartyName('');
    setAmount('');
    setRemark('');
    setPaymentDate('');
  };

  const handleSaveCase = async () => {
    try {
      const paymentData = {
        paymentType,
        paymentDate,
        amount: parseFloat(amount),
        remark,
        partyId,
      };
      await caseService.createPayment(paymentData);
      handleCloseModal();
      fetchCases();
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };

  const handleDeleteCase = async (id) => {
    try {
      await caseService.deletePayment(id);
      fetchCases();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#1e293b' }}>
        Case Management
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => {
                setTabValue(v);
                setPage(1);
              }}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Incoming Cases" icon={<IncomingIcon />} iconPosition="start" />
              <Tab label="Outgoing Cases" icon={<OutgoingIcon />} iconPosition="start" />
            </Tabs>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                fontWeight: 600,
              }}
            >
              Add {tabValue === 0 ? 'Incoming' : 'Outgoing'} Case
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Payment No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Amount (₹)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, width: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>
                      No {tabValue === 0 ? 'incoming' : 'outgoing'} cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((caseItem, index) => (
                    <TableRow key={caseItem._id} sx={{ '&:hover': { background: '#f8fafc' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{caseItem.paymentNo || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{caseItem.partyId?.partyName || '-'}</TableCell>
                      <TableCell sx={{ color: '#10b981', fontWeight: 600 }}>
                        ₹{(caseItem.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{caseItem.remark || '-'}</TableCell>
                      <TableCell>
                        {caseItem.paymentDate ? new Date(caseItem.paymentDate).toLocaleDateString('en-GB') : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCase(caseItem._id)}
                          sx={{ color: '#ef4444', '&:hover': { background: '#fee2e2' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Case Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>
          Add {paymentType === 'incoming' ? 'Incoming' : 'Outgoing'} Case
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                size="small"
                options={partySearchQuery ? partySearchResults : parties}
                getOptionLabel={(option) => option.partyName || ''}
                value={parties.find((p) => p._id === partyId) || null}
                onChange={(e, newValue) => {
                  setPartyId(newValue?._id || '');
                  setPartyName(newValue?.partyName || '');
                }}
                onInputChange={(event, newInputValue) => {
                  setPartySearchQuery(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Party"
                    required
                    InputLabelProps={{ shrink: true }}
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
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Amount (₹)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#6366f1' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCase}
            disabled={!partyId || !amount}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              fontWeight: 600,
            }}
          >
            Save Case
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Case;
