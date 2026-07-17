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
  Card,
  CardContent,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  List as ListIcon,
  RestartAlt as ResetIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import salesInvoiceService from '../services/salesInvoiceService';
import stockVerificationService from '../services/stockVerificationService';
import pakkiService from '../services/pakkiService';
import companyService from '../services/companyService';
import caseService from '../services/caseService';
import metalPaltaService from '../services/metalPaltaService';
import { gradients } from '../theme';
import { useThemeMode } from '../context/ThemeContext';

const StockVerification = () => {
  const { mode } = useThemeMode();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    cashInHand: { balanceAmount: 0, balanceFine999: 0 }
  });
  const [verifiedChorsa999, setVerifiedChorsa999] = useState({ weight: '', remark: '' });
  const [verifiedBank9999, setVerifiedBank9999] = useState({ weight: '', remark: '' });
  const [chorsa999Stock, setChorsa999Stock] = useState({ buyWeight: 0, sellWeight: 0, netWeight: 0, buyPcs: 0, sellPcs: 0, netPcs: 0 });
  const [bank9999Stock, setBank9999Stock] = useState({ buyWeight: 0, sellWeight: 0, netWeight: 0, buyPcs: 0, sellPcs: 0, netPcs: 0 });
  const [cashBookData, setCashBookData] = useState({ totalIncoming: 0, totalOutgoing: 0, netCash: 0 });
  const [caseVerified, setCaseVerified] = useState({
    physicalBalance: '',
    physicalFine999: '',
    remark: '',
  });
  const [companyProfile, setCompanyProfile] = useState({ openingFine: 0, openingFine9999: 0 });
  const [verificationDate, setVerificationDate] = useState(new Date().toISOString().split('T')[0]);

  const [verifications, setVerifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchData();
    fetchVerifications();
    fetchPakkiStock();
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      fetchVerifications();
    }
  }, [tabValue, page]);

  const fetchCompanyProfile = async () => {
    try {
      const response = await companyService.getCompanies({ page: 1, limit: 1 });
      const data = response?.data?.data || response?.data || {};
      const list = data?.companies || data?.list || [];
      if (list.length > 0) {
        const c = list[0];
        setCompanyProfile({ openingFine: c.openingFine || 0, openingFine9999: c.openingFine9999 || 0 });
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [dashRes, cbRes] = await Promise.all([
        salesInvoiceService.getDashboard(),
        caseService.getCashBook()
      ]);

      const data = dashRes?.data?.data || dashRes?.data || {};
      const cb = cbRes?.data || cbRes || {};

      setDashboardData({
        cashInHand: {
          balanceAmount: data.cashInHand?.today || 0,
          balanceFine999: data.kachiStock?.todayFine || 0
        }
      });

      setCashBookData({
        totalIncoming: cb.incoming?.total || 0,
        totalOutgoing: cb.outgoing?.total || 0,
        netCash: cb.cashInHand || 0
      });

      // Pre-fill physical balance by default
      setCaseVerified(prev => ({
        ...prev,
        physicalBalance: prev.physicalBalance || Math.trunc(cb.cashInHand || 0).toString()
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load stock data');
    }
  };

  const fetchPakkiStock = async () => {
    try {
      const [verificationsRes, companyProfileRes, buyRes, sellRes, badlaRes] = await Promise.all([
        stockVerificationService.getVerifications({ page: 1, limit: 10 }),
        companyService.getCompanies({ page: 1, limit: 1 }),
        pakkiService.getPakkiList({ type: 'buy', limit: 9999 }),
        pakkiService.getPakkiList({ type: 'sell', limit: 9999 }),
        metalPaltaService.getMetalPaltas({ limit: 9999 })
      ]);

      const verificationsList = verificationsRes?.data?.records || verificationsRes?.records || [];
      const latestVerification = verificationsList.length > 0 
        ? [...verificationsList].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

      const companyData = companyProfileRes?.data?.data || companyProfileRes?.data || {};
      const companyList = companyData?.companies || companyData?.list || [];
      const profile = companyList.length > 0 ? companyList[0] : null;

      const buyRecords = buyRes?.data?.records || [];
      const sellRecords = sellRes?.data?.records || [];
      const badlaRecords = badlaRes?.data?.data?.records || badlaRes?.data?.records || [];

      const isAfterStart = (tx, startVerification, fallbackDateStr) => {
        if (startVerification) {
          const txDate = new Date(tx.date).setHours(0,0,0,0);
          const vDate = new Date(startVerification.date).setHours(0,0,0,0);
          if (txDate > vDate) return true;
          if (txDate === vDate) {
            return new Date(tx.createdAt) > new Date(startVerification.createdAt);
          }
          return false;
        } else if (fallbackDateStr) {
          const txDate = new Date(tx.date).setHours(0,0,0,0);
          const fDate = new Date(fallbackDateStr).setHours(0,0,0,0);
          return txDate >= fDate;
        }
        return true;
      };

      // Chorsa 999 Stock Calculation
      let chorsaInitial = profile ? parseFloat(profile.openingFine) || 0 : 0;
      let hasChorsaVerification = false;
      if (latestVerification && latestVerification.chorsa999 && latestVerification.chorsa999.physicalWeight !== undefined && latestVerification.chorsa999.physicalWeight !== null) {
        chorsaInitial = parseFloat(latestVerification.chorsa999.physicalWeight);
        hasChorsaVerification = true;
      }

      const chorsaBuys = buyRecords.filter(r => 
        r.chorsaType === 'chorsa-999' && 
        isAfterStart(r, hasChorsaVerification ? latestVerification : null, profile?.openingFineDate)
      );
      const chorsaSells = sellRecords.filter(r => 
        r.chorsaType === 'chorsa-999' && 
        isAfterStart(r, hasChorsaVerification ? latestVerification : null, profile?.openingFineDate)
      );
      const chorsaBadlas = badlaRecords.filter(r => 
        !r.isDeleted && 
        isAfterStart(r, hasChorsaVerification ? latestVerification : null, profile?.openingFineDate)
      );

      let chorsaBuyWeight = chorsaBuys.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
      let chorsaSellWeight = chorsaSells.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
      let chorsaBadlaWeight = chorsaBadlas.reduce((sum, r) => sum + (parseFloat(r.givenSilver) || 0), 0);

      let chorsaBuyPcs = chorsaBuys.reduce((sum, r) => sum + (parseInt(r.pcs) || 0), 0);
      let chorsaSellPcs = chorsaSells.reduce((sum, r) => sum + (parseInt(r.pcs) || 0), 0);

      const chorsaNetWeight = chorsaInitial + chorsaBuyWeight - chorsaSellWeight - chorsaBadlaWeight;
      const chorsaNetPcs = chorsaBuyPcs - chorsaSellPcs;

      setChorsa999Stock({
        buyWeight: chorsaBuyWeight,
        sellWeight: chorsaSellWeight + chorsaBadlaWeight,
        netWeight: chorsaNetWeight,
        buyPcs: chorsaBuyPcs,
        sellPcs: chorsaSellPcs,
        netPcs: chorsaNetPcs
      });

      // Bank 9999 Stock Calculation
      let bankInitial = profile ? parseFloat(profile.openingFine9999) || 0 : 0;
      let hasBankVerification = false;
      if (latestVerification && latestVerification.bank9999 && latestVerification.bank9999.physicalWeight !== undefined && latestVerification.bank9999.physicalWeight !== null) {
        bankInitial = parseFloat(latestVerification.bank9999.physicalWeight);
        hasBankVerification = true;
      }

      const bankBuys = buyRecords.filter(r => 
        r.chorsaType === 'bank-9999' && 
        isAfterStart(r, hasBankVerification ? latestVerification : null, profile?.openingFine9999Date)
      );
      const bankSells = sellRecords.filter(r => 
        r.chorsaType === 'bank-9999' && 
        isAfterStart(r, hasBankVerification ? latestVerification : null, profile?.openingFine9999Date)
      );

      let bankBuyWeight = bankBuys.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);
      let bankSellWeight = bankSells.reduce((sum, r) => sum + (parseFloat(r.weight) || 0), 0);

      let bankBuyPcs = bankBuys.reduce((sum, r) => sum + (parseInt(r.pcs) || 0), 0);
      let bankSellPcs = bankSells.reduce((sum, r) => sum + (parseInt(r.pcs) || 0), 0);

      const bankNetWeight = bankInitial + bankBuyWeight - bankSellWeight;
      const bankNetPcs = bankBuyPcs - bankSellPcs;

      setBank9999Stock({
        buyWeight: bankBuyWeight,
        sellWeight: bankSellWeight,
        netWeight: bankNetWeight,
        buyPcs: bankBuyPcs,
        sellPcs: bankSellPcs,
        netPcs: bankNetPcs
      });

      // Pre-fill physical values by default
      setVerifiedChorsa999(prev => ({ ...prev, weight: prev.weight || chorsaNetWeight.toFixed(2) }));
      setVerifiedBank9999(prev => ({ ...prev, weight: prev.weight || bankNetWeight.toFixed(2) }));
    } catch (error) {
      console.error('Error fetching pakki stock:', error);
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

  // Pre-fill cash fields by default when dashboardData loads
  useEffect(() => {
    if (dashboardData.cashInHand.balanceAmount) {
      setCaseVerified(prev => ({
        ...prev,
        physicalBalance: prev.physicalBalance || dashboardData.cashInHand.balanceAmount.toString(),
        physicalFine999: prev.physicalFine999 || dashboardData.cashInHand.balanceFine999.toString(),
      }));
    }
  }, [dashboardData]);

  const handlePreFillSystemValues = () => {
    setVerifiedChorsa999({ weight: chorsa999Stock.netWeight.toFixed(2), remark: '' });
    setVerifiedBank9999({ weight: bank9999Stock.netWeight.toFixed(2), remark: '' });
    setCaseVerified({
      physicalBalance: Math.trunc(cashBookData.netCash).toString(),
      physicalFine999: '0',
      remark: '',
    });
    toast.info('Pre-filled all fields with live system values');
  };

  const buildPayload = () => {
    return {
      date: verificationDate,
      physicalFine999: parseFloat(caseVerified.physicalFine999) || 0,
      physicalBalance: parseFloat(caseVerified.physicalBalance) || 0,
      remark: caseVerified.remark || '',
      chorsa999: {
        systemWeight: chorsa999Stock.netWeight,
        systemPcs: chorsa999Stock.netPcs,
        systemBuy: chorsa999Stock.buyWeight,
        systemSell: chorsa999Stock.sellWeight,
        physicalWeight: parseFloat(verifiedChorsa999.weight) || 0,
        remark: verifiedChorsa999.remark || '',
      },
      bank9999: {
        systemWeight: bank9999Stock.netWeight,
        systemPcs: bank9999Stock.netPcs,
        systemBuy: bank9999Stock.buyWeight,
        systemSell: bank9999Stock.sellWeight,
        physicalWeight: parseFloat(verifiedBank9999.weight) || 0,
        remark: verifiedBank9999.remark || '',
      },
      cash: {
        systemIn: cashBookData.totalIncoming,
        systemOut: cashBookData.totalOutgoing,
        systemNet: cashBookData.netCash,
        physicalBalance: parseFloat(caseVerified.physicalBalance) || 0,
        remark: caseVerified.remark || ''
      }
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
      toast.success('Stock Verification saved successfully');
      setEditId(null);
      fetchVerifications();
      fetchPakkiStock();
      fetchData();
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
    setVerifiedChorsa999({
      weight: record.chorsa999?.physicalWeight?.toString() || '',
      remark: record.chorsa999?.remark || '',
    });
    setVerifiedBank9999({
      weight: record.bank9999?.physicalWeight?.toString() || '',
      remark: record.bank9999?.remark || '',
    });
    setTabValue(0);
    toast.info('Editing verification record. Make changes below.');
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
    setVerifiedChorsa999({ weight: '', remark: '' });
    setVerifiedBank9999({ weight: '', remark: '' });
    setVerificationDate(new Date().toISOString().split('T')[0]);
    fetchPakkiStock();
    fetchData();
  };

  const ComparisonCard = ({ title, systemValue, physicalValue, diff, unit, color }) => (
    <Card sx={{ borderRadius: 3, borderLeft: `6px solid ${color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1.5 }}>
          {title}
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>System:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{systemValue} {unit}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Physical:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{physicalValue || '-'} {unit}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Diff:</Typography>
            <Chip
              label={diff !== null ? `${diff > 0 ? '+' : ''}${diff} ${unit}` : '-'}
              size="small"
              color={diff === null ? 'default' : diff === 0 ? 'success' : diff > 0 ? 'info' : 'error'}
              sx={{ fontWeight: 600, height: 20, fontSize: '0.75rem' }}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
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
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab icon={<InventoryIcon />} label="Verify Stock & Cash" />
          <Tab icon={<ListIcon />} label="Verification History" />
        </Tabs>

        {tabValue === 0 && (
          <Box>
            {editId && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip label="Editing existing verification" color="warning" size="small" />
                <Button size="small" onClick={handleCancelEdit} sx={{ color: '#ef4444' }}>Cancel Edit</Button>
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                {/* Cash Balance Section */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                  Cash Balance
                </Typography>
                <TableContainer component={Paper} elevation={1} sx={{ mb: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small" sx={{ minWidth: { xs: 800, sm: '100%' } }}>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Buy (In)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Sell (Out)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Net Stock (Cash)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Cash (₹)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Diff (₹)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>₹{Math.trunc(cashBookData.totalIncoming).toLocaleString('en-IN')}</TableCell>
                        <TableCell>₹{Math.trunc(cashBookData.totalOutgoing).toLocaleString('en-IN')}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>₹{Math.trunc(cashBookData.netCash).toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Cash Balance"
                            value={caseVerified.physicalBalance}
                            onChange={(e) => setCaseVerified(prev => ({ ...prev, physicalBalance: e.target.value }))}
                            sx={{ width: 140 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: (caseVerified.physicalBalance ? parseFloat(caseVerified.physicalBalance) - cashBookData.netCash : 0) >= 0 ? '#10b981' : '#ef4444' }}>
                          {caseVerified.physicalBalance
                            ? `₹${Math.trunc(parseFloat(caseVerified.physicalBalance) - cashBookData.netCash).toLocaleString('en-IN')}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Remark"
                            value={caseVerified.remark}
                            onChange={(e) => setCaseVerified(prev => ({ ...prev, remark: e.target.value }))}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Chorsa Section */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                  Chorsa 999 Stock
                </Typography>
                <TableContainer component={Paper} elevation={1} sx={{ mb: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small" sx={{ minWidth: { xs: 800, sm: '100%' } }}>
                    <TableHead>
                      <TableRow sx={{ background: gradients.primary }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Buy</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Sell</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Net Stock</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Weight (g)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Diff (g)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{chorsa999Stock.buyWeight.toFixed(1)}g</TableCell>
                        <TableCell>{chorsa999Stock.sellWeight.toFixed(1)}g</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{chorsa999Stock.netWeight.toFixed(1)}g</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Weight"
                            value={verifiedChorsa999.weight}
                            onChange={(e) => setVerifiedChorsa999(prev => ({ ...prev, weight: e.target.value }))}
                            sx={{ width: 140 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: (verifiedChorsa999.weight ? parseFloat(verifiedChorsa999.weight) - chorsa999Stock.netWeight : 0) >= 0 ? '#6366f1' : '#ef4444' }}>
                          {verifiedChorsa999.weight
                            ? `${(parseFloat(verifiedChorsa999.weight) - chorsa999Stock.netWeight).toFixed(1)}g`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Remark"
                            value={verifiedChorsa999.remark}
                            onChange={(e) => setVerifiedChorsa999(prev => ({ ...prev, remark: e.target.value }))}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Bank Section */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary' }}>
                  Bank 9999 Stock
                </Typography>
                <TableContainer component={Paper} elevation={1} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Table size="small" sx={{ minWidth: { xs: 800, sm: '100%' } }}>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Buy</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>System Sell</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Net Stock</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Physical Weight (g)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Diff (g)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{bank9999Stock.buyWeight.toFixed(1)}g</TableCell>
                        <TableCell>{bank9999Stock.sellWeight.toFixed(1)}g</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{bank9999Stock.netWeight.toFixed(1)}g</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            placeholder="Weight"
                            value={verifiedBank9999.weight}
                            onChange={(e) => setVerifiedBank9999(prev => ({ ...prev, weight: e.target.value }))}
                            sx={{ width: 140 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: (verifiedBank9999.weight ? parseFloat(verifiedBank9999.weight) - bank9999Stock.netWeight : 0) >= 0 ? '#ec4899' : '#ef4444' }}>
                          {verifiedBank9999.weight
                            ? `${(parseFloat(verifiedBank9999.weight) - bank9999Stock.netWeight).toFixed(1)}g`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            placeholder="Remark"
                            value={verifiedBank9999.remark}
                            onChange={(e) => setVerifiedBank9999(prev => ({ ...prev, remark: e.target.value }))}
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>

            {/* Bottom Actions Row */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={handlePreFillSystemValues}
                sx={{ borderRadius: 2 }}
              >
                Reset to Live System Values
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckIcon />}
                onClick={handleSaveVerification}
                sx={{
                  background: gradients.successDark,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  '&:hover': { background: gradients.successDarkHover },
                  px: 4,
                  borderRadius: 2,
                }}
              >
                {editId ? 'Update Verification' : 'Save Verification'}
              </Button>
            </Box>
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <TableContainer component={Paper} elevation={1} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', width: '50px' }} />
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Verified Cash (₹)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Verified Chorsa 999 (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Verified Bank 9999 (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Remark</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {verifications.map((v, index) => {
                    const chorsaDiff = (v.chorsa999?.physicalWeight || 0) - (v.chorsa999?.systemWeight || 0);
                    const bankDiff = (v.bank9999?.physicalWeight || 0) - (v.bank9999?.systemWeight || 0);
                    const isExpanded = !!expandedRows[v._id];

                    return (
                      <React.Fragment key={v._id}>
                        <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
                          <TableCell>
                            <IconButton size="small" onClick={() => toggleRow(v._id)} sx={{ color: isExpanded ? '#6366f1' : 'text.secondary' }}>
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{(page - 1) * limit + index + 1}</TableCell>
                          <TableCell>{v.date ? new Date(v.date).toLocaleDateString('en-GB') : '-'}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            ₹{Math.trunc(v.physicalBalance || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {(v.chorsa999?.physicalWeight || 0).toFixed(1)}g
                              </Typography>
                              {chorsaDiff !== 0 && (
                                <Chip
                                  label={`${chorsaDiff > 0 ? '+' : ''}${chorsaDiff.toFixed(1)}`}
                                  size="small"
                                  color={chorsaDiff > 0 ? 'info' : 'error'}
                                  sx={{ height: 16, fontSize: '0.65rem', fontWeight: 600 }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {(v.bank9999?.physicalWeight || 0).toFixed(1)}g
                              </Typography>
                              {bankDiff !== 0 && (
                                <Chip
                                  label={`${bankDiff > 0 ? '+' : ''}${bankDiff.toFixed(1)}`}
                                  size="small"
                                  color={bankDiff > 0 ? 'info' : 'error'}
                                  sx={{ height: 16, fontSize: '0.65rem', fontWeight: 600 }}
                                />
                              )}
                            </Stack>
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
                        {isExpanded && (
                          <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell colSpan={8} sx={{ py: 2, px: { xs: 1, md: 4 } }}>
                              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#6366f1' }}>
                                  Verification Stock & Cash Breakdown
                                </Typography>
                                <TableContainer component={Paper} variant="outlined">
                                  <Table size="small" sx={{ minWidth: { xs: 800, sm: '100%' } }}>
                                    <TableHead>
                                      <TableRow sx={{ backgroundColor: 'action.selected' }}>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Asset</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>System Buy / In</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>System Sell / Out</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Net Stock / Cash</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Physical Weight / Cash</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Diff</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Remark</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {/* Cash Row */}
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Cash Balance</TableCell>
                                        <TableCell>₹{Math.trunc(v.cash?.systemIn || 0).toLocaleString('en-IN')}</TableCell>
                                        <TableCell>₹{Math.trunc(v.cash?.systemOut || 0).toLocaleString('en-IN')}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>₹{Math.trunc(v.cash?.systemNet || 0).toLocaleString('en-IN')}</TableCell>
                                        <TableCell>₹{Math.trunc(v.cash?.physicalBalance || v.physicalBalance || 0).toLocaleString('en-IN')}</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: ((v.cash?.physicalBalance || v.physicalBalance || 0) - (v.cash?.systemNet || 0)) >= 0 ? '#10b981' : '#ef4444' }}>
                                          ₹{Math.trunc((v.cash?.physicalBalance || v.physicalBalance || 0) - (v.cash?.systemNet || 0)).toLocaleString('en-IN')}
                                        </TableCell>
                                        <TableCell>{v.cash?.remark || v.remark || '-'}</TableCell>
                                      </TableRow>

                                      {/* Chorsa Row */}
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Chorsa 999</TableCell>
                                        <TableCell>{(v.chorsa999?.systemBuy || 0).toFixed(1)}g</TableCell>
                                        <TableCell>{(v.chorsa999?.systemSell || 0).toFixed(1)}g</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{(v.chorsa999?.systemWeight || 0).toFixed(1)}g</TableCell>
                                        <TableCell>{(v.chorsa999?.physicalWeight || 0).toFixed(1)}g</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: chorsaDiff >= 0 ? '#6366f1' : '#ef4444' }}>
                                          {chorsaDiff > 0 ? '+' : ''}{chorsaDiff.toFixed(1)}g
                                        </TableCell>
                                        <TableCell>{v.chorsa999?.remark || '-'}</TableCell>
                                      </TableRow>

                                      {/* Bank Row */}
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Bank 9999</TableCell>
                                        <TableCell>{(v.bank9999?.systemBuy || 0).toFixed(1)}g</TableCell>
                                        <TableCell>{(v.bank9999?.systemSell || 0).toFixed(1)}g</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{(v.bank9999?.systemWeight || 0).toFixed(1)}g</TableCell>
                                        <TableCell>{(v.bank9999?.physicalWeight || 0).toFixed(1)}g</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: bankDiff >= 0 ? '#ec4899' : '#ef4444' }}>
                                          {bankDiff > 0 ? '+' : ''}{bankDiff.toFixed(1)}g
                                        </TableCell>
                                        <TableCell>{v.bank9999?.remark || '-'}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
