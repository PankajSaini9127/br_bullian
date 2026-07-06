import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
} from '@mui/material';
import {
  ArrowDownward as IncomingIcon,
  ArrowUpward as OutgoingIcon,
  AccountBalance as BalanceIcon,
  AccountBalanceWallet as CaseInHandIcon,
  Print as PrintIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import caseService from '../services/caseService';
import partyService from '../services/partyService';
import { gradients } from '../theme';
import { printCashBook } from '../utils/thermalPrinter';

const CaseBook = () => {
  const [cashBook, setCashBook] = useState(null);
  const [loading, setLoading] = useState(false);

  // Add payment modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addPaymentType, setAddPaymentType] = useState('incoming');
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [paymentDate, setPaymentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCashBook();
    fetchParties();
  }, []);

  const fetchCashBook = async () => {
    setLoading(true);
    try {
      const response = await caseService.getCashBook();
      setCashBook(response);
    } catch (error) {
      console.error('Error fetching cash book:', error);
      toast.error('Failed to load cash book data');
    } finally {
      setLoading(false);
    }
  };

  const incomingPayments = cashBook?.incoming?.payments || [];
  const outgoingPayments = cashBook?.outgoing?.payments || [];
  const totalIncoming = cashBook?.incoming?.total || 0;
  const totalOutgoing = cashBook?.outgoing?.total || 0;
  const balance = cashBook?.balance || 0;

  const handlePrint = () => {
    if (!cashBook) return;
    printCashBook(cashBook);
  };

  const fetchParties = async () => {
    try {
      const response = await partyService.getParties();
      setParties(response?.data?.parties || []);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

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
    }, 500);
    return () => clearTimeout(debounceTimer);
  }, [partySearchQuery]);

  const handleOpenAddModal = (type) => {
    setAddPaymentType(type);
    setAddModalOpen(true);
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    setSelectedParty(null);
    setPartySearchQuery('');
    setAmount('');
    setRemark('');
    setPaymentDate('');
  };

  const handleSavePayment = async () => {
    if (!selectedParty || !amount || !paymentDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      await caseService.createPayment({
        paymentType: addPaymentType,
        paymentDate,
        amount: parseFloat(amount),
        remark,
        partyId: selectedParty._id || selectedParty.id,
      });
      toast.success(`${addPaymentType === 'incoming' ? 'Incoming' : 'Outgoing'} payment added successfully`);
      handleCloseAddModal();
      fetchCashBook();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    } finally {
      setSaving(false);
    }
  };

  // Prepare combined transactions for tally-style print
  const allTransactions = [];
  incomingPayments.forEach((payment, index) => {
    allTransactions.push({
      date: payment.paymentDate,
      particular: payment.partyId?.partyName || '-',
      voucherType: 'Receipt',
      voucherNo: payment.paymentNo || '-',
      remark: payment.remark || '',
      debit: payment.amount || 0,
      credit: 0,
      type: 'incoming'
    });
  });
  outgoingPayments.forEach((payment, index) => {
    allTransactions.push({
      date: payment.paymentDate,
      particular: payment.partyId?.partyName || '-',
      voucherType: 'Payment',
      voucherNo: payment.paymentNo || '-',
      remark: payment.remark || '',
      debit: 0,
      credit: payment.amount || 0,
      type: 'outgoing'
    });
  });

  // Sort by date
  allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate running balance
  let runningBalance = 0;
  const transactionsWithBalance = allTransactions.map((t) => {
    runningBalance = runningBalance + t.debit - t.credit;
    return { ...t, balance: runningBalance };
  });

  // Print styles
  const printStyles = `
    @media print {
      .no-print {
        display: none !important;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, color: 'text.primary' }}>
            Cash Book
          </Typography>
          <Stack direction="row" spacing={1} className="no-print" useFlexGap flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddModal('incoming')}
              sx={{
                background: gradients.success,
                fontWeight: 600,
                '&:hover': { background: gradients.successHover },
              }}
            >
              Add Incoming
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddModal('outgoing')}
              sx={{
                background: gradients.danger,
                fontWeight: 600,
                '&:hover': { background: gradients.dangerHover },
              }}
            >
              Add Outgoing
            </Button>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{
                background: gradients.primary,
                fontWeight: 600,
              }}
            >
              Print
            </Button>
          </Stack>
        </Box>

      {/* Summary Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
        <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IncomingIcon sx={{ mr: 1, color: '#10b981', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Total In</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                ₹{totalIncoming.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <OutgoingIcon sx={{ mr: 1, color: '#ef4444', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Total Out</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ef4444' }}>
                ₹{totalOutgoing.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BalanceIcon sx={{ mr: 1, color: '#6366f1', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Balance</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: balance >= 0 ? '#6366f1' : '#ef4444' }}>
                ₹{balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CaseInHandIcon sx={{ mr: 1, color: '#0891b2', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Case in Hand</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: balance >= 0 ? '#0891b2' : '#ef4444' }}>
                ₹{Math.trunc(balance).toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Tally-style Cash Book Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
          ) : transactionsWithBalance.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
              <Typography>No transactions found</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '90px' }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Particulars</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '90px' }}>Voucher Type</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '120px' }}>Voucher No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'right', width: '120px' }}>Debit (&#8377;)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'right', width: '120px' }}>Credit (&#8377;)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'right', width: '120px' }}>Balance (&#8377;)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionsWithBalance.map((t, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:nth-of-type(odd)': { background: 'rgba(0, 0, 0, 0.02)' },
                        '&:hover': { background: 'rgba(99, 102, 241, 0.05)' },
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {t.date ? new Date(t.date).toLocaleDateString('en-GB') : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {t.particular}{t.remark ? ` (${t.remark})` : ''}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        <Box
                          sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: t.type === 'incoming' ? '#166534' : '#991b1b',
                            background: t.type === 'incoming' ? 'rgba(220, 252, 231, 0.3)' : 'rgba(254, 226, 226, 0.3)',
                          }}
                        >
                          {t.voucherType}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>{t.voucherNo}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', textAlign: 'right', fontWeight: 600, color: '#166534' }}>
                        {t.debit > 0 ? Math.trunc(t.debit).toLocaleString('en-IN') : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', textAlign: 'right', fontWeight: 600, color: '#991b1b' }}>
                        {t.credit > 0 ? Math.trunc(t.credit).toLocaleString('en-IN') : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', textAlign: 'right', fontWeight: 700 }}>
                        {Math.trunc(t.balance).toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ background: 'rgba(0, 0, 0, 0.04)', '& td': { borderTop: '2px solid', borderColor: 'divider' } }}>
                    <TableCell colSpan={4} sx={{ fontWeight: 700, textAlign: 'right' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right', color: '#166534' }}>
                      {Math.trunc(totalIncoming).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right', color: '#991b1b' }}>
                      {Math.trunc(totalOutgoing).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right', color: balance >= 0 ? '#6366f1' : '#ef4444' }}>
                      {Math.trunc(balance).toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={addModalOpen} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: addPaymentType === 'incoming' ? '#10b981' : '#ef4444' }}>
          Add {addPaymentType === 'incoming' ? 'Incoming' : 'Outgoing'} Payment
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={partySearchQuery ? partySearchResults : parties}
              getOptionLabel={(option) => option.partyName || ''}
              value={selectedParty}
              onChange={(_, newValue) => setSelectedParty(newValue)}
              onInputChange={(_, newValue) => setPartySearchQuery(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Party" required />
              )}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
            />
            <TextField
              label="Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <TextField
              label="Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal}>Cancel</Button>
          <Button
            onClick={handleSavePayment}
            variant="contained"
            disabled={saving}
            sx={{
              background: addPaymentType === 'incoming' ? gradients.success : gradients.danger,
              '&:hover': { background: addPaymentType === 'incoming' ? gradients.successHover : gradients.dangerHover },
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </>
  );
};

export default CaseBook;
