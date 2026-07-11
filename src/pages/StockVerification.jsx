import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Tabs,
  Tab,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  AccountBalanceWallet as CaseIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  List as ListIcon,
} from '@mui/icons-material';
import salesInvoiceService from '../services/salesInvoiceService';
import stockVerificationService from '../services/stockVerificationService';
import { roundOffFine, roundOffFineFormatted } from '../utils/roundOff';
import { gradients } from '../theme';

const StockVerification = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState({
    cashInHand: { openingBalance: 0, balanceWeight: 0, openingFine: 0, balanceFine: 0, balanceAmount: 0 },
    stock: { totalPuggas: 0, totalFine: 0, openingFine: 0, balanceFine: 0 },
    dukanStock: { totalPuggas: 0, totalFine: 0 },
  });
  const [verifiedStock, setVerifiedStock] = useState({});
  const [verifiedDukan, setVerifiedDukan] = useState({});
  const [caseVerified, setCaseVerified] = useState({
    physicalBalance: '',
    physicalFine999: '',
    remark: '',
  });
  const [verificationDate, setVerificationDate] = useState(new Date().toISOString().split('T')[0]);

  const [verifications, setVerifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchData();
    fetchVerifications();
  }, []);

  useEffect(() => {
    if (tabValue === 2) {
      fetchVerifications();
    }
  }, [tabValue, page]);

  const fetchData = async () => {
    try {
      const response = await salesInvoiceService.getDashboard();
      const data = response?.data?.data || response?.data || {};
      setDashboardData({
        cashInHand: data?.cashInHand || { openingBalance: 0, balanceWeight: 0, openingFine: 0, balanceFine: 0, balanceAmount: 0 },
        stock: data?.stock || { totalPuggas: 0, totalFine: 0, openingFine: 0, balanceFine: 0 },
        dukanStock: data?.dukanStock || { totalPuggas: 0, totalFine: 0 },
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load stock data');
    }
  };

  const fetchVerifications = async () => {
    try {
      const response = await stockVerificationService.getVerifications({ page, limit });
      const data = response?.data || response || {};
      setVerifications(data?.records || []);
      setTotalPages(data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    }
  };

  const handleStockVerifyChange = (paggaId, field, value) => {
    setVerifiedStock(prev => ({ ...prev, [paggaId]: { ...prev[paggaId], [field]: value } }));
  };

  const handleDukanVerifyChange = (paggaId, field, value) => {
    setVerifiedDukan(prev => ({ ...prev, [paggaId]: { ...prev[paggaId], [field]: value } }));
  };

  const buildPayload = () => {
    return {
      date: verificationDate,
      physicalFine999: parseFloat(caseVerified.physicalFine999) || 0,
      physicalBalance: parseFloat(caseVerified.physicalBalance) || 0,
      remark: caseVerified.remark || '',
    };
  };


  const handleSaveVerification = async () => {
    const toastId = toast.loading('Saving verification...');
    try {
      const payload = buildPayload();
      if (editId) {
        await stockVerificationService.updateVerification(editId, payload);
      } else {
        await stockVerificationService.createVerification(payload);
      }
      toast.dismiss(toastId);
      toast.success('Verification saved successfully');
      setCaseVerified({ physicalBalance: '', physicalFine999: '', remark: '' });
      setEditId(null);
      fetchVerifications();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to save verification');
    }
  };


  const handleEdit = (record) => {
    setEditId(record._id);
    setVerificationDate(record.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
    setCaseVerified({
      physicalBalance: record.physicalBalance?.toString() || '',
      physicalFine999: record.physicalFine999?.toString() || '',
      remark: record.remark || '',
    });
    setTabValue(1);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    const toastId = toast.loading('Deleting verification...');
    try {
      await stockVerificationService.deleteVerification(deleteId);
      toast.dismiss(toastId);
      toast.success('Verification deleted successfully');
      setDeleteConfirmOpen(false);
      setDeleteId(null);
      fetchVerifications();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to delete verification');
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setCaseVerified({ physicalBalance: '', physicalFine999: '', remark: '' });
    setVerificationDate(new Date().toISOString().split('T')[0]);
  };

  const SummaryCard = ({ title, systemValue, physicalValue, diff, unit }) => (
    <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
        {title}
      </Typography>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>System:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {systemValue} {unit}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Physical:</Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {physicalValue || '-'} {unit}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Difference:</Typography>
          <Chip
            label={diff !== null ? `${diff > 0 ? '+' : ''}${diff} ${unit}` : '-'}
            size="small"
            color={diff === null ? 'default' : diff === 0 ? 'success' : diff > 0 ? 'info' : 'error'}
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Stack>
    </Paper>
  );

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
          Physical Stock Verification
        </Typography>
        <TextField
          type="date"
          label="Verification Date"
          size="small"
          value={verificationDate}
          onChange={(e) => setVerificationDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      <Paper sx={{ borderRadius: 2, p: { xs: 1.5, sm: 2, md: 3 }, mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab icon={<InventoryIcon />} label="Fine Stock" />
          <Tab icon={<CaseIcon />} label="Case (Cash)" />
          <Tab icon={<ListIcon />} label="Verification List" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            {editId && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip label="Editing existing verification" color="warning" size="small" />
                <Button size="small" onClick={handleCancelEdit} sx={{ color: '#ef4444' }}>Cancel Edit</Button>
              </Box>
            )}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="Stock - Total Paggas"
                  systemValue={dashboardData.stock.totalPuggas}
                  physicalValue={Object.keys(verifiedStock).length}
                  diff={Object.keys(verifiedStock).length - dashboardData.stock.totalPuggas}
                  unit=""
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="Stock - Total Fine"
                  systemValue={dashboardData.stock.totalFine}
                  physicalValue={Object.values(verifiedStock).reduce((sum, v) => {
                    const w = parseFloat(v.weight) || 0;
                    const t = parseFloat(v.touch) || 0;
                    return sum + roundOffFine(w * t / 100);
                  }, 0).toFixed(2)}
                  diff={null}
                  unit="g"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="Dukan Stock - Total Paggas"
                  systemValue={dashboardData.dukanStock.totalPuggas}
                  physicalValue={Object.keys(verifiedDukan).length}
                  diff={Object.keys(verifiedDukan).length - dashboardData.dukanStock.totalPuggas}
                  unit=""
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Fine Stock Verification
            </Typography>
            <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Difference (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>{dashboardData.stock.totalPuggas} paggas</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{dashboardData.stock.totalFine}g</TableCell>
                    <TableCell>
                      <TextField size="small" type="number" placeholder="Weight" value={verifiedStock['stock']?.weight || ''} onChange={(e) => handleStockVerifyChange('stock', 'weight', e.target.value)} sx={{ width: 100 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" type="number" placeholder="Touch" value={verifiedStock['stock']?.touch || ''} onChange={(e) => handleStockVerifyChange('stock', 'touch', e.target.value)} sx={{ width: 80 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {verifiedStock['stock']?.weight && verifiedStock['stock']?.touch
                        ? roundOffFineFormatted(parseFloat(verifiedStock['stock'].weight) * parseFloat(verifiedStock['stock'].touch) / 100)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {verifiedStock['stock']?.weight && verifiedStock['stock']?.touch
                        ? (roundOffFine(parseFloat(verifiedStock['stock'].weight) * parseFloat(verifiedStock['stock'].touch) / 100) - dashboardData.stock.totalFine).toFixed(2)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <TextField size="small" placeholder="Remark" value={verifiedStock['stock']?.remark || ''} onChange={(e) => handleStockVerifyChange('stock', 'remark', e.target.value)} sx={{ width: 120 }} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Dukan Stock Verification
            </Typography>
            <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: gradients.purple }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Difference (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell>{dashboardData.dukanStock.totalPuggas} paggas</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{dashboardData.dukanStock.totalFine}g</TableCell>
                    <TableCell>
                      <TextField size="small" type="number" placeholder="Weight" value={verifiedDukan['dukan']?.weight || ''} onChange={(e) => handleDukanVerifyChange('dukan', 'weight', e.target.value)} sx={{ width: 100 }} />
                    </TableCell>
                    <TableCell>
                      <TextField size="small" type="number" placeholder="Touch" value={verifiedDukan['dukan']?.touch || ''} onChange={(e) => handleDukanVerifyChange('dukan', 'touch', e.target.value)} sx={{ width: 80 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {verifiedDukan['dukan']?.weight && verifiedDukan['dukan']?.touch
                        ? roundOffFineFormatted(parseFloat(verifiedDukan['dukan'].weight) * parseFloat(verifiedDukan['dukan'].touch) / 100)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {verifiedDukan['dukan']?.weight && verifiedDukan['dukan']?.touch
                        ? (roundOffFine(parseFloat(verifiedDukan['dukan'].weight) * parseFloat(verifiedDukan['dukan'].touch) / 100) - dashboardData.dukanStock.totalFine).toFixed(2)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <TextField size="small" placeholder="Remark" value={verifiedDukan['dukan']?.remark || ''} onChange={(e) => handleDukanVerifyChange('dukan', 'remark', e.target.value)} sx={{ width: 120 }} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveVerification}
                sx={{
                  background: gradients.successDark,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  '&:hover': { background: gradients.successDarkHover },
                  px: 4,
                  py: 1.5,
                }}
              >
                {editId ? 'Update Verification' : 'Save Verification'}
              </Button>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {editId && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip label="Editing existing verification" color="warning" size="small" />
                <Button size="small" onClick={handleCancelEdit} sx={{ color: '#ef4444' }}>Cancel Edit</Button>
              </Box>
            )}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="Balance Amount"
                  systemValue={Math.trunc(dashboardData.cashInHand.balanceAmount || 0).toLocaleString('en-IN')}
                  physicalValue={caseVerified.physicalBalance ? Math.trunc(parseFloat(caseVerified.physicalBalance)).toLocaleString('en-IN') : ''}
                  diff={caseVerified.physicalBalance ? (parseFloat(caseVerified.physicalBalance) - (dashboardData.cashInHand.balanceAmount || 0)).toFixed(0) : null}
                  unit="₹"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="999 Fine (System)"
                  systemValue={Math.trunc(dashboardData.cashInHand.balanceFine999 || 0).toLocaleString('en-IN')}
                  physicalValue="-"
                  diff={null}
                  unit="g"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <SummaryCard
                  title="999 Fine (Physical)"
                  systemValue="-"
                  physicalValue={caseVerified.physicalFine999 ? Math.trunc(parseFloat(caseVerified.physicalFine999)).toLocaleString('en-IN') : ''}
                  diff={caseVerified.physicalFine999 ? (parseFloat(caseVerified.physicalFine999) - (dashboardData.cashInHand.balanceFine999 || 0)).toFixed(0) : null}
                  unit="g"
                />
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Enter Physical Count
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Physical Balance Amount (₹)"
                    type="number"
                    value={caseVerified.physicalBalance}
                    onChange={(e) => setCaseVerified(prev => ({ ...prev, physicalBalance: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#818cf8' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Physical 999 Fine (g)"
                    type="number"
                    value={caseVerified.physicalFine999}
                    onChange={(e) => setCaseVerified(prev => ({ ...prev, physicalFine999: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#818cf8' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <TextField
                    fullWidth
                    label="Remark"
                    value={caseVerified.remark}
                    onChange={(e) => setCaseVerified(prev => ({ ...prev, remark: e.target.value }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#818cf8' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  onClick={handleSaveVerification}
                  sx={{
                    background: gradients.primary,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    '&:hover': { background: gradients.primaryHover },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {editId ? 'Update Case Verification' : 'Save Case Verification'}
                </Button>
              </Box>
            </Paper>
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            <TableContainer component={Paper} elevation={1}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Balance (₹)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>999 Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Diff Balance</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Diff 999 Fine</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verifications.map((v, index) => {
                    const systemBalance = dashboardData.cashInHand.balanceAmount || 0;
                    const systemFine999 = dashboardData.cashInHand.balanceFine999 || 0;
                    const diffBalance = (v.physicalBalance || 0) - systemBalance;
                    const diffFine999 = (v.physicalFine999 || 0) - systemFine999;
                    return (
                      <TableRow key={v._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{(page - 1) * limit + index + 1}</TableCell>
                        <TableCell>{v.date ? new Date(v.date).toLocaleDateString('en-GB') : '-'}</TableCell>
                        <TableCell>{Math.trunc(v.physicalBalance || 0).toLocaleString('en-IN')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{(v.physicalFine999 || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${diffBalance > 0 ? '+' : ''}${diffBalance.toFixed(0)}`}
                            size="small"
                            color={diffBalance === 0 ? 'success' : diffBalance > 0 ? 'info' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${diffFine999 > 0 ? '+' : ''}${diffFine999.toFixed(2)}`}
                            size="small"
                            color={diffFine999 === 0 ? 'success' : diffFine999 > 0 ? 'info' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{v.remark || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEdit(v)} sx={{ color: '#6366f1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteClick(v._id)} sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {verifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No verifications found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </Box>
        )}
      </Paper>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this verification record?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" sx={{ background: '#ef4444', '&:hover': { background: '#dc2626' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StockVerification;
