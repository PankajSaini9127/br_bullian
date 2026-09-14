import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Payments as PaymentsIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CompareArrows as SettleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import caseService from '../services/caseService';
import { useTheme } from '@mui/material/styles';
import { gradients } from '../theme';

const Outstanding = () => {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const [tabValue, setTabValue] = useState(0); // 0 = Receivables (Aana), 1 = Payables (Dena)
  const [loading, setLoading] = useState(false);
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Party detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [pendingInvoices, setPendingInvoices] = useState({ salesInvoices: [], purchaseInvoices: [] });
  const [advances, setAdvances] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Settle Modal State
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedAdvanceId, setSelectedAdvanceId] = useState('');
  const [settleAmount, setSettleAmount] = useState('');

  const fetchOutstandingData = async () => {
    setLoading(true);
    try {
      const result = await caseService.getOutstandingPayments();
      setReceivables(result?.receivables || []);
      setPayables(result?.payables || []);
    } catch (error) {
      console.error('Error loading outstanding payments:', error);
      toast.error('Failed to load outstanding payment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutstandingData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSearchQuery('');
  };

  // Open party bills/advances detail drawer/modal
  const handleOpenDetails = async (party) => {
    setSelectedParty(party);
    setDetailModalOpen(true);
    setLoadingDetails(true);
    try {
      const invoicesData = await caseService.getPendingInvoices(party.partyId);
      const advancesData = await caseService.getAdvances(party.partyId);
      setPendingInvoices(invoicesData || { salesInvoices: [], purchaseInvoices: [] });
      setAdvances(advancesData || []);
    } catch (error) {
      console.error('Error fetching party details:', error);
      toast.error('Failed to load unpaid bills or advances.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailModalOpen(false);
    setSelectedParty(null);
    setPendingInvoices({ salesInvoices: [], purchaseInvoices: [] });
    setAdvances([]);
  };

  // Open individual invoice settle modal
  const handleOpenSettle = (invoice) => {
    setSelectedInvoice(invoice);
    
    // Auto-select first advance if available
    if (advances.length > 0) {
      setSelectedAdvanceId(advances[0]._id);
      // Autofill with the minimum of invoice pending balance or advance remaining balance
      const maxSettle = Math.min(invoice.pendingAmount, advances[0].advanceRemaining);
      setSettleAmount(maxSettle.toString());
    } else {
      setSelectedAdvanceId('');
      setSettleAmount('');
    }
    setSettleModalOpen(true);
  };

  const handleCloseSettle = () => {
    setSettleModalOpen(false);
    setSelectedInvoice(null);
    setSelectedAdvanceId('');
    setSettleAmount('');
  };

  const handleAdvanceChange = (e) => {
    const advId = e.target.value;
    setSelectedAdvanceId(advId);
    const selectedAdv = advances.find(a => a._id === advId);
    if (selectedAdv && selectedInvoice) {
      const maxSettle = Math.min(selectedInvoice.pendingAmount, selectedAdv.advanceRemaining);
      setSettleAmount(maxSettle.toString());
    }
  };

  const handleSettleSubmit = async () => {
    if (!selectedAdvanceId || !settleAmount || parseFloat(settleAmount) <= 0) {
      toast.error('Please select an advance and enter a valid settle amount.');
      return;
    }

    const selectedAdv = advances.find(a => a._id === selectedAdvanceId);
    if (selectedAdv && parseFloat(settleAmount) > selectedAdv.advanceRemaining) {
      toast.error(`Settle amount cannot exceed remaining advance of ${selectedAdv.advanceRemaining}g.`);
      return;
    }

    if (selectedInvoice && parseFloat(settleAmount) > selectedInvoice.pendingAmount) {
      toast.error(`Settle amount cannot exceed pending invoice balance of ${selectedInvoice.pendingAmount}g.`);
      return;
    }

    try {
      const payload = {
        paymentId: selectedAdvanceId,
        invoiceId: selectedInvoice._id,
        invoiceType: selectedInvoice.salesInvoiceNo ? 'SalesInvoice' : 'Invoice',
        amount: parseFloat(settleAmount)
      };

      await caseService.settleAdvance(payload);
      toast.success('Advance settled successfully against the invoice.');
      handleCloseSettle();
      
      // Refresh current details
      if (selectedParty) {
        handleOpenDetails(selectedParty);
      }
      
      // Refresh outstanding summary lists
      fetchOutstandingData();
    } catch (error) {
      console.error('Error settling advance:', error);
      toast.error(error.response?.data?.message || 'Failed to settle advance.');
    }
  };

  const activeList = tabValue === 0 ? receivables : payables;

  const filteredList = activeList.filter((item) =>
    item.partyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: mode === 'dark' ? 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%)' : gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Payment Outstanding (Aana / Dena)
        </Typography>
      </Box>

      {/* Tabs Layout */}
      <Paper elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.95rem',
                py: 2,
              },
            }}
          >
            <Tab label="Aana Hai (Receivables)" />
            <Tab label="Dena Hai (Payables)" />
          </Tabs>
        </Box>

        {/* Search & Filter Bar */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Search by party name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Outstanding List Table */}
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(99, 102, 241, 0.04)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, pl: 3 }}>Sr No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Party Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact No</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Pending Bills Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Advance Balance</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, pr: 3 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="textSecondary">Loading outstanding list...</Typography>
                  </TableCell>
                </TableRow>
              ) : filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="textSecondary">
                      No outstanding records found for this category.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((item, index) => (
                  <TableRow key={item.partyId} sx={{ '&:hover': { background: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' } }}>
                    <TableCell sx={{ pl: 3 }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.partyName}</TableCell>
                    <TableCell>{item.contactNo}</TableCell>
                    <TableCell sx={{ color: item.totalPendingAmount > 0 ? '#f59e0b' : 'inherit', fontWeight: 700 }}>
                      ₹{item.totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ color: item.totalAdvanceAmount > 0 ? '#10b981' : 'inherit', fontWeight: 700 }}>
                      ₹{item.totalAdvanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell align="center" sx={{ pr: 3 }}>
                      <Tooltip title="View Unpaid Bills & Advances">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDetails(item)}
                          sx={{
                            backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                            '&:hover': { backgroundColor: mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)' }
                          }}
                        >
                          <VisibilityIcon size="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetails}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {selectedParty?.partyName} - Details
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Outstanding Bills & Advances summary
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDetails}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {loadingDetails ? (
            <Box align="center" sx={{ py: 6 }}>
              <Typography variant="body1">Loading outstanding details...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Summary Cards */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Total Unpaid Balance</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#f59e0b', mt: 0.5 }}>
                      ₹{selectedParty?.totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="subtitle2" color="textSecondary">Total Advance Balance (Jma)</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                      ₹{selectedParty?.totalAdvanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Pending Bills Table */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Unpaid Invoices</Typography>
                <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Invoice No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Bill Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Paid Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Pending Balance</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {((tabValue === 0 ? pendingInvoices.salesInvoices : pendingInvoices.purchaseInvoices) || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            No pending invoices found for this party.
                          </TableCell>
                        </TableRow>
                      ) : (
                        ((tabValue === 0 ? pendingInvoices.salesInvoices : pendingInvoices.purchaseInvoices) || []).map((inv) => (
                          <TableRow key={inv._id}>
                            <TableCell sx={{ fontWeight: 600 }}>{inv.salesInvoiceNo || inv.invoiceNo || 'N/A'}</TableCell>
                            <TableCell>{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</TableCell>
                            <TableCell>₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell sx={{ color: '#10b981' }}>₹{inv.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#f59e0b' }}>
                              ₹{inv.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell align="center">
                              {selectedParty?.totalAdvanceAmount > 0 ? (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  startIcon={<SettleIcon />}
                                  onClick={() => handleOpenSettle(inv)}
                                  sx={{ borderRadius: 1.5, py: 0.5, px: 1.5, fontSize: '0.72rem' }}
                                >
                                  Settle Advance
                                </Button>
                              ) : (
                                <Chip label="No Advance Available" size="small" variant="outlined" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Advance Payments Table */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Available Advances</Typography>
                <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Payment No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Payment Date</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Total Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Advance Remaining</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Payment Mode</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Remark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {advances.filter(a => a.paymentType === (tabValue === 0 ? 'incoming' : 'outgoing')).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                            No advances logged for this party.
                          </TableCell>
                        </TableRow>
                      ) : (
                        advances
                          .filter(a => a.paymentType === (tabValue === 0 ? 'incoming' : 'outgoing'))
                          .map((adv) => (
                            <TableRow key={adv._id}>
                              <TableCell sx={{ fontWeight: 600 }}>{adv.paymentNo || 'N/A'}</TableCell>
                              <TableCell>{new Date(adv.paymentDate).toLocaleDateString('en-GB')}</TableCell>
                              <TableCell>₹{adv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: '#10b981' }}>
                                ₹{adv.advanceRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </TableCell>
                              <TableCell>
                                <Chip label={String(adv.paymentMode).toUpperCase()} size="small" color="primary" variant="outlined" />
                              </TableCell>
                              <TableCell>{adv.remark || '-'}</TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleCloseDetails} sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Settle Advance Dialog */}
      <Dialog
        open={settleModalOpen}
        onClose={handleCloseSettle}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            width: '400px'
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          Settle Advance Against Invoice
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" color="textSecondary" display="block">Selected Invoice</Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
              {selectedInvoice?.salesInvoiceNo || selectedInvoice?.invoiceNo || 'N/A'} (Pending: ₹{selectedInvoice?.pendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
            </Typography>
          </Box>

          <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
            <InputLabel>Select Advance Payment *</InputLabel>
            <Select
              value={selectedAdvanceId}
              label="Select Advance Payment *"
              onChange={handleAdvanceChange}
            >
              {advances
                .filter(a => a.paymentType === (tabValue === 0 ? 'incoming' : 'outgoing'))
                .map((adv) => (
                  <MenuItem key={adv._id} value={adv._id}>
                    {adv.paymentNo || 'N/A'} (Remaining: ₹{adv.advanceRemaining})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            size="small"
            label="Settle Amount (₹) *"
            type="number"
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            InputProps={{
              inputProps: { min: 0.01, step: 0.01 }
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={handleCloseSettle} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSettleSubmit}
            startIcon={<CheckCircleIcon />}
            sx={{ borderRadius: 2 }}
          >
            Settle
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Outstanding;
