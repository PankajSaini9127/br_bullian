import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  Stack,
  Pagination,
} from '@mui/material';
import {
  ArrowUpward as IncomingIcon,
  ArrowDownward as OutgoingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
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
  const [isEdit, setIsEdit] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState(null);
  const [partyId, setPartyId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [parties, setParties] = useState([]);
  const [paymentType, setPaymentType] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const limit = 15;

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
    }, 1000);
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

      console.log(response)
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
    setIsEdit(false);
    setEditingCaseId(null);
    setPartyId('');
    setPartyName('');
    setSelectedParty(null);
    setAmount('');
    setRemark('');
    setPaymentDate('');
  };

  const handleAmountChange = (value) => {
    // Remove commas for storage
    const cleanValue = value.replace(/,/g, '');
    setAmount(cleanValue);
  };

  const formatAmount = (value) => {
    if (!value) return '';
    const numStr = value.toString();
    let lastThree = numStr.substring(numStr.length - 3);
    let otherNumbers = numStr.substring(0, numStr.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  };

  const handleSaveCase = async () => {
    const toastId = toast.loading(isEdit ? 'Updating payment...' : 'Creating payment...');
    try {
      const paymentData = {
        paymentType,
        paymentDate,
        amount: parseFloat(amount),
        remark,
        partyId,
      };
      if (isEdit) {
        await caseService.updatePayment(editingCaseId, paymentData);
      } else {
        await caseService.createPayment(paymentData);
      }
      handleCloseModal();
      fetchCases();
      toast.dismiss(toastId);
      toast.success(isEdit ? 'Payment updated successfully' : 'Payment created successfully');
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.dismiss(toastId);
      toast.error('Failed to save payment');
    }
  };

  const handleEditCase = (caseItem) => {
    setIsEdit(true);
    setEditingCaseId(caseItem._id);
    setPartyId(caseItem.partyId?._id || caseItem.partyId);
    setPartyName(caseItem.partyId?.partyName || '');
    setSelectedParty(caseItem.partyId);
    setAmount(caseItem.amount?.toString() || '');
    setRemark(caseItem.remark || '');
    setPaymentDate(caseItem.paymentDate?.split('T')[0] || '');
    setPaymentType(caseItem.paymentType);
    setOpenModal(true);
  };

  const handleDeleteCase = async (id) => {
    setDeletingCaseId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const toastId = toast.loading('Deleting payment...');
    try {
      await caseService.deletePayment(deletingCaseId);
      setDeleteConfirmOpen(false);
      setDeletingCaseId(null);
      fetchCases();
      toast.dismiss(toastId);
      toast.success('Payment deleted successfully');
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.dismiss(toastId);
      toast.error('Failed to delete payment');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, color: '#1e293b' }}>
        Case Management
      </Typography>

      <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => {
                setTabValue(v);
                setPage(1);
              }}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
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
                whiteSpace: 'nowrap',
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
                        ₹{formatAmount(Math.trunc(caseItem.amount || 0))}
                      </TableCell>
                      <TableCell>{caseItem.remark || '-'}</TableCell>
                      <TableCell>
                        {caseItem.paymentDate ? new Date(caseItem.paymentDate).toLocaleDateString('en-GB') : '-'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleEditCase(caseItem)}
                          sx={{ color: '#6366f1', '&:hover': { background: '#e0e7ff' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add Case Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}>
        <DialogTitle>
          {isEdit ? 'Edit' : 'Add'} {paymentType === 'incoming' ? 'Incoming' : 'Outgoing'} Case
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              fullWidth
              size="small"
              options={partySearchQuery ? partySearchResults : parties}
              getOptionLabel={(option) => option.partyName || ''}
              value={selectedParty}
              onChange={(e, newValue) => {
                setPartyId(newValue?._id || '');
                setPartyName(newValue?.partyName || '');
                setSelectedParty(newValue);
                setPartySearchQuery('');
              }}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === 'input') {
                  setPartySearchQuery(newInputValue);
                }
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Amount (₹)"
                type="text"
                value={formatAmount(amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                required
                size="small"
              />
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
            </Stack>
            <TextField
              fullWidth
              label="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              size="small"
              multiline
              rows={2}
            />
          </Stack>
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
            {isEdit ? 'Update' : 'Add'} Case
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this payment?
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: '#6366f1' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              fontWeight: 600,
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Case;
