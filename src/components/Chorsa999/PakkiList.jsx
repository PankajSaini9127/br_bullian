import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Tabs,
  Tab,
  Chip,
  Stack,
  InputAdornment,
  MenuItem,
  Pagination,
  Tooltip,
  LinearProgress,
  Divider,
  Collapse,
  Alert,
} from '@mui/material';


import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Sell as SellIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Print as PrintIcon,
  HourglassEmpty as PendingIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import partyService from '../services/partyService';
import pakkiService from '../services/pakkiService';
import saudaService from '../services/saudaService';
import { gradients } from '../theme';

const Chorsa999 = () => {
  const pageTitle = location.pathname.includes('/bank') ? 'Bank 9999' : 'Chorsa 999';
  const [chorsaList, setChorsaList] = useState([]);
  const [parties, setParties] = useState([]);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChorsa, setEditingChorsa] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [chorsaToDelete, setChorsaToDelete] = useState(null);
  const [tabValue, setTabValue] = useState('buy');
  const [stockData, setStockData] = useState({
    chorsaStock: 0, chorsaBuyWeight: 0, chorsaSellWeight: 0, chorsaBadlaWeight: 0, chorsaInitialStock: 0,
    bankStock: 0, bankBuyWeight: 0, bankSellWeight: 0, bankInitialStock: 0,
    latestVerificationDate: null
  });
  const [loadingStock, setLoadingStock] = useState(false);
  const [searchPartyId, setSearchPartyId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [pendingPakkiGroups, setPendingPakkiGroups] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [formPendingPakkiGroups, setFormPendingPakkiGroups] = useState([]);
  const [loadingFormPending, setLoadingFormPending] = useState(false);
  const [expandedFormGroups, setExpandedFormGroups] = useState({});
  const [bhavcutModalOpen, setBhavcutModalOpen] = useState(false);
  const [bhavcutWeight, setBhavcutWeight] = useState('');
  const [bhavcutRate, setBhavcutRate] = useState('');
  const [bhavcutDate, setBhavcutDate] = useState('');
  const [formData, setFormData] = useState({
    partyName: '',
    partyId: '',
    date: new Date().toISOString().split('T')[0],
    weight: '',
    pcs: '',
    type: 'buy',
    chorsaType: 'chorsa-999',
  });

  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertGroup = (n) => {
      if (n === 0) return '';
      if (n < 10) return units[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
      return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertGroup(n % 100) : '');
    };

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crore > 0) result += convertGroup(crore) + ' Crore ';
    if (lakh > 0) result += convertGroup(lakh) + ' Lakh ';
    if (thousand > 0) result += convertGroup(thousand) + ' Thousand ';
    if (remainder > 0) result += convertGroup(remainder);

    return result.trim();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
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

    fetchParties();
  }, []);

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
    fetchPakkiList();
  }, [tabValue, searchPartyId, filterStartDate, filterEndDate, page]);

  const fetchStock = async () => {
    setLoadingStock(true);
    try {
      const data = await pakkiService.getPakkiStock();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching pakki stock:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [location.pathname]);

  // Fetch pending pakki saudas for selected party
  useEffect(() => {
    if (!searchPartyId) {
      setPendingPakkiGroups([]);
      return;
    }
    const fetchPending = async () => {
      setLoadingPending(true);
      try {
        const category = location.pathname.includes('/bank') ? 'bank-9999' : (location.pathname.includes('/chorsa') ? 'chorsa-999' : null);
        const data = await saudaService.getPartyPendingPakkiSaudas(searchPartyId, null, category);
        setPendingPakkiGroups(data?.groups || []);
      } catch (e) {
        console.error('Error fetching pending pakki saudas:', e);
      } finally {
        setLoadingPending(false);
      }
    };
    fetchPending();
  }, [searchPartyId, location.pathname]);

  useEffect(() => {
    if (!formData.partyId) {
      setFormPendingPakkiGroups([]);
      return;
    }
    const fetchFormPending = async () => {
      setLoadingFormPending(true);
      try {
        const category = location.pathname.includes('/bank') ? 'bank-9999' : (location.pathname.includes('/chorsa') ? 'chorsa-999' : null);
        const data = await saudaService.getPartyPendingPakkiSaudas(formData.partyId, null, category);
        setFormPendingPakkiGroups(data?.groups || []);
      } catch (e) {
        console.error('Error fetching form pending pakki saudas:', e);
      } finally {
        setLoadingFormPending(false);
      }
    };
    fetchFormPending();
  }, [formData.partyId, location.pathname]);

  const fetchPakkiList = async () => {
    try {
      // Determine which endpoint to call based on the URL path
      if (location.pathname.includes('/chorsa')) {
        // Chorsa 999 specific listing
        const data = await pakkiService.getChorsaPakkiList();
        setChorsaList(data?.records || data || []);
        setTotalPages(data?.pagination?.totalPages || 1);
      } else if (location.pathname.includes('/bank')) {
        // Bank 9999 specific listing
        const data = await pakkiService.getBankPakkiList();
        setChorsaList(data?.records || data || []);
        setTotalPages(data?.pagination?.totalPages || 1);
      } else {
        // Generic listing with filters
        const filters = {};
        filters.type = tabValue;
        if (searchPartyId) filters.partyId = searchPartyId;
        if (filterStartDate) filters.startDate = filterStartDate;
        if (filterEndDate) filters.endDate = filterEndDate;
        filters.page = page;
        filters.limit = limit;

        const response = await pakkiService.getPakkiList(filters);
        const responseData = response?.data || response;
        setChorsaList(responseData?.records || responseData);
        setTotalPages(responseData?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching pakki list:', error);
      toast.error('Failed to fetch pakki list');
    }
  };
// Duplicate fetch block removed – handled by fetchPakkiList function above

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Calculate quantity (weight * pcs) and total amount when weight, pcs or rate changes
    if (name === 'weight' || name === 'pcs') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setEditingChorsa(null);
    const defaultChorsaType = location.pathname.includes('/bank') ? 'bank-9999' : 'chorsa-999';
    setFormData({
      partyName: '',
      partyId: '',
      date: new Date().toISOString().split('T')[0],
      weight: '',
      pcs: '',
      type: tabValue,
      chorsaType: defaultChorsaType,
    });
  };

  const handleEditChorsa = (chorsa) => {
    setEditingChorsa(chorsa);
    setFormData({
      partyName: chorsa.partyId?.partyName || chorsa.partyName,
      partyId: chorsa.partyId?._id || chorsa.partyId || '',
      date: chorsa.date ? chorsa.date.split('T')[0] : '',
      weight: chorsa.weight || '',
      pcs: chorsa.pcs || '',
      type: chorsa.type || tabValue,
      chorsaType: chorsa.chorsaType || (location.pathname.includes('/bank') ? 'bank-9999' : 'chorsa-999'),
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingChorsa(null);
    setFormPendingPakkiGroups([]);
    setExpandedFormGroups({});
    const defaultChorsaType = location.pathname.includes('/bank') ? 'bank-9999' : 'chorsa-999';
    setFormData({
      partyName: '',
      partyId: '',
      date: new Date().toISOString().split('T')[0],
      weight: '',
      pcs: '',
      type: 'buy',
      chorsaType: defaultChorsaType,
    });
  };  const handleBhavcutSubmit = async () => {
    if (!bhavcutDate) {
      toast.error('Please select a valid date');
      return;
    }
    if (!bhavcutRate || isNaN(bhavcutRate) || Number(bhavcutRate) <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }

    const chorsaData = {
      partyName: formData.partyName,
      partyId: formData.partyId,
      date: formData.date,
      weight: formData.weight,
      pcs: formData.pcs,
      type: formData.type,
      chorsaType: formData.chorsaType,
      bhavcut: {
        weight: Number(bhavcutWeight),
        rate: Number(bhavcutRate),
        date: bhavcutDate,
      }
    };

    try {
      if (editingChorsa) {
        await pakkiService.updatePakki(editingChorsa._id || editingChorsa.id, chorsaData);
        toast.success('Pakki updated successfully');
      } else {
        await pakkiService.createPakki(chorsaData);
        toast.success('Pakki added successfully');
      }
      setBhavcutModalOpen(false);
      handleCloseModal();
      fetchPakkiList();
      fetchStock();
    } catch (error) {
      console.error('Error saving pakki with bhavcut:', error);
      toast.error(error.response?.data?.message || 'Failed to save pakki');
    }
  };

  const handleSaveChorsa = async () => {
    if (!formData.partyId || !formData.date) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.type === 'sell') {
      const currentStock = location.pathname.includes('/bank') ? stockData.bankStock : stockData.chorsaStock;
      let availableStock = currentStock;
      if (editingChorsa) {
        availableStock = currentStock + (editingChorsa.type === 'sell' ? Number(editingChorsa.weight) : 0) - (editingChorsa.type === 'buy' ? Number(editingChorsa.weight) : 0);
      }
      if (Number(formData.weight) > availableStock) {
        toast.error(`Insufficient stock! Available stock is ${availableStock}g`);
        return;
      }
    }

    const activeCategory = location.pathname.includes('/bank') ? 'bank-9999' : 'chorsa-999';
    const activeSaudaType = formData.type === 'buy' ? 'purchase' : 'sales';
    const matchingGroup = formPendingPakkiGroups.find(g => g.saudaType === activeSaudaType && g.saudaCategory === activeCategory);
    let remainingSaudaQty = matchingGroup ? Number(matchingGroup.totalRemaining) || 0 : 0;

    if (editingChorsa && editingChorsa.partyId === formData.partyId) {
      const oldWeight = Number(editingChorsa.weight) || 0;
      if (editingChorsa.type === formData.type && editingChorsa.chorsaType === formData.chorsaType) {
        remainingSaudaQty += oldWeight;
      }
    }

    const inputWeight = Number(formData.weight) || 0;
    if (inputWeight > remainingSaudaQty) {
      const excess = inputWeight - remainingSaudaQty;
      setBhavcutWeight(excess);
      setBhavcutRate('');
      setBhavcutDate(formData.date || new Date().toISOString().split('T')[0]);
      setBhavcutModalOpen(true);
      return;
    }

    const chorsaData = {
      partyName: formData.partyName,
      partyId: formData.partyId,
      date: formData.date,
      weight: formData.weight,
      pcs: formData.pcs,
      type: formData.type,
      chorsaType: formData.chorsaType,
    };

    try {
      if (editingChorsa) {
        await pakkiService.updatePakki(editingChorsa._id || editingChorsa.id, chorsaData);
        toast.success('Pakki updated successfully');
      } else {
        await pakkiService.createPakki(chorsaData);
        toast.success('Pakki added successfully');
      }
      handleCloseModal();
      fetchPakkiList();
      fetchStock();
    } catch (error) {
      console.error('Error saving pakki:', error);
      toast.error('Failed to save pakki');
    }
  };

  const handleDeleteChorsa = (chorsa) => {
    setChorsaToDelete(chorsa);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!chorsaToDelete) return;

    try {
      await pakkiService.deletePakki(chorsaToDelete._id || chorsaToDelete.id);
      toast.success('Pakki deleted successfully');
      setDeleteConfirmationOpen(false);
      setChorsaToDelete(null);
      fetchPakkiList();
      fetchStock();
    } catch (error) {
      console.error('Error deleting pakki:', error);
      toast.error('Failed to delete pakki');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setChorsaToDelete(null);
  };

  const handlePrintChorsa = (chorsa) => {
    let htmlContent = `
      <html>
      <head>
        <title>${pageTitle} Print</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 14px; padding: 30px; }
          h1 { text-align: center; margin-bottom: 20px; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${pageTitle.toUpperCase()} DETAILS</h1>
        <div class="header">
          <p><strong>Type:</strong> ${chorsa.type === 'buy' ? 'Buy' : 'Sell'}</p>
          <p><strong>Category:</strong> ${chorsa.chorsaType === 'bank-9999' ? 'Bank 9999' : 'Chorsa 999'}</p>
          <p><strong>Party Name:</strong> ${chorsa.partyId?.partyName || chorsa.partyName || '-'}</p>
          <p><strong>Date:</strong> ${formatDate(chorsa.date)}</p>
        </div>

        <div class="details">
          <table>
            <tr>
              <td class="label">Invoice No</td>
              <td class="value">${chorsa.invoiceNo || '-'}</td>
            </tr>
            <tr>
              <td class="label">Weight</td>
              <td class="value">${chorsa.weight || '-'} g</td>
            </tr>
            <tr>
              <td class="label">Pcs</td>
              <td class="value">${chorsa.pcs || '-'}</td>
            </tr>
          </table>
        </div>

        <p style="margin-top: 40px; color: #666; text-align: center;">Printed: ${new Date().toLocaleString('en-GB')}</p>
      </body>
      </html>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);
    
    const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
    printDoc.open();
    printDoc.write(htmlContent);
    printDoc.close();
    
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  };

  const getFilteredList = () => {
    return chorsaList.filter((s) => {
      const matchesType = s.type === tabValue;
      const matchesParty = !searchPartyId || (s.partyId?._id === searchPartyId || s.partyId === searchPartyId);
      const matchesStartDate = !filterStartDate || s.date >= filterStartDate;
      const matchesEndDate = !filterEndDate || s.date <= filterEndDate;
      return matchesType && matchesParty && matchesStartDate && matchesEndDate;
    });
  };

  const handleResetFilters = () => {
    setSearchPartyId('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  };

  const handlePrintAllChorsa = () => {
    const filteredList = getFilteredList();
    if (filteredList.length === 0) {
      toast.error(`No ${pageTitle} to print`);
      return;
    }

    const selectedParty = parties.find((p) => p._id === searchPartyId);

    let htmlContent = `
      <html>
      <head>
        <title>${pageTitle.toUpperCase()} LIST</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
          h1 { text-align: center; margin-bottom: 15px; font-size: 18px; }
          .header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${tabValue === 'buy' ? 'BUY' : 'SELL'} ${pageTitle.toUpperCase()} LIST</h1>
        <div class="header">
          ${selectedParty ? `<p><strong>Party:</strong> ${selectedParty.partyName}</p>` : ''}
          ${filterStartDate || filterEndDate ? `<p><strong>Period:</strong> ${filterStartDate || '...'} to ${filterEndDate || '...'}</p>` : ''}
          <p><strong>Total Records:</strong> ${filteredList.length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Invoice No</th>
              <th>Party Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Weight (g)</th>
              <th>Pcs</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredList.forEach((chorsa, index) => {
      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${chorsa.invoiceNo || '-'}</td>
          <td>${chorsa.partyId?.partyName || chorsa.partyName || '-'}</td>
          <td>${chorsa.chorsaType === 'bank-9999' ? 'Bank 9999' : 'Chorsa 999'}</td>
          <td>${formatDate(chorsa.date)}</td>
          <td>${chorsa.weight || '-'}</td>
          <td>${chorsa.pcs || '-'}</td>
        </tr>
      `;
    });

    htmlContent += `
          </tbody>
        </table>

        <p style="margin-top: 30px; color: #666; text-align: center;">Printed: ${new Date().toLocaleString('en-GB')}</p>
      </body>
      </html>
    `;

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);
    
    const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
    printDoc.open();
    printDoc.write(htmlContent);
    printDoc.close();
    
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {pageTitle}
        </Typography>

        {/* Current Stock Card */}
        {(() => {
          const isBank = location.pathname.includes('/bank');
          const netStock = isBank ? stockData.bankStock : stockData.chorsaStock;
          const buyW = isBank ? stockData.bankBuyWeight : stockData.chorsaBuyWeight;
          const sellW = isBank ? stockData.bankSellWeight : (stockData.chorsaSellWeight + (stockData.chorsaBadlaWeight || 0));
          const openW = isBank ? stockData.bankInitialStock : stockData.chorsaInitialStock;
          return (
            <Paper
              elevation={4}
              sx={{
                p: 2,
                px: 3,
                borderRadius: 3,
                background: isBank
                  ? 'linear-gradient(135deg, #831843 0%, #9d174d 100%)'
                  : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isBank
                  ? '0 8px 30px rgba(236, 72, 153, 0.3)'
                  : '0 8px 30px rgba(99, 102, 241, 0.3)',
              }}
            >
              <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.72rem', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', mb: 0.5 }}>
                Current Stock ({pageTitle})
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5, mb: 1 }}>
                {loadingStock ? '...' : `${Number(netStock).toFixed(2)}g`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.65, display: 'block', fontSize: '0.62rem' }}>Opening</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{Number(openW).toFixed(2)}g</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.65, display: 'block', fontSize: '0.62rem' }}>Buy</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#86efac' }}>+{Number(buyW).toFixed(2)}g</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.65, display: 'block', fontSize: '0.62rem' }}>{isBank ? 'Sell' : 'Sell+Badla'}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#fca5a5' }}>-{Number(sellW).toFixed(2)}g</Typography>
                </Box>
              </Box>
              {stockData.latestVerificationDate && (
                <Typography variant="caption" sx={{ opacity: 0.5, fontSize: '0.62rem', mt: 1, display: 'block' }}>
                  Verified: {new Date(stockData.latestVerificationDate).toLocaleDateString('en-GB')}
                </Typography>
              )}
            </Paper>
          );
        })()}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
            border: '1px solid', borderColor: 'divider',
          }}
        >
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => {
                setTabValue(newValue);
                setPage(1);
              }}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                },
              }}
            >
              <Tab
                value="buy"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon sx={{ color: '#6366f1' }} />
                    Buy
                  </Box>
                }
              />
              <Tab
                value="sell"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SellIcon sx={{ color: '#ec4899' }} />
                    Sell
                  </Box>
                }
              />
            </Tabs>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 2, mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {tabValue === 'buy' ? 'Buy' : 'Sell'} {pageTitle} List
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintAllChorsa}
                  sx={{
                    background: gradients.success,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    '&:hover': {
                      background: gradients.successHover,
                    },
                  }}
                >
                  Print All
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenModal}
                  sx={{
                    background: gradients.primary,
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: gradients.primaryHover,
                    },
                  }}
                >
                  Add {tabValue === 'buy' ? 'Buy' : 'Sell'} {pageTitle}
                </Button>
              </Box>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  fullWidth
                  sx={{ minWidth: { md: '200px' } }}
                  options={partySearchQuery ? partySearchResults : parties}
                  getOptionLabel={(option) => option.partyName || ''}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  value={parties.find((p) => p._id === searchPartyId) || null}
                  onChange={(e, newValue) => {
                    setSearchPartyId(newValue?._id || '');
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
                      label="Search by Party"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => {
                    setFilterEndDate(e.target.value);
                    setPage(1);
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      borderColor: '#4338ca',
                      background: 'rgba(99, 102, 241, 0.1)',
                    },
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>

            {/* ── Pending Pakki Saudas Section ── */}
            {searchPartyId && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <PendingIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Pending Pakki Saudas
                  </Typography>
                  {loadingPending && (
                    <LinearProgress sx={{ width: 80, ml: 1, borderRadius: 2 }} />
                  )}
                </Box>

                {!loadingPending && pendingPakkiGroups.length === 0 && (
                  <Alert
                    severity="success"
                    sx={{ borderRadius: 2, fontWeight: 500 }}
                  >
                    🎉 Is party ke saare pakki saudas deliver ho gaye hain!
                  </Alert>
                )}

                <Grid container spacing={2}>
                  {pendingPakkiGroups.map((group) => {
                    const groupKey = `${group.saudaType}-${group.saudaCategory}`;
                    const isExpanded = expandedGroups[groupKey];
                    const deliveredPct = group.totalQuantity > 0
                      ? Math.round((group.totalDelivered / group.totalQuantity) * 100)
                      : 0;
                    const isBuy = group.saudaType === 'purchase';
                    const categoryLabel = group.saudaCategory === 'bank-9999' ? 'Bank 9999' : 'Chorsa 999';
                    const cardColor = isBuy
                      ? (group.saudaCategory === 'bank-9999' ? '#0ea5e9' : '#6366f1')
                      : (group.saudaCategory === 'bank-9999' ? '#14b8a6' : '#ec4899');

                    return (
                      <Grid item xs={12} md={6} key={groupKey}>
                        <Paper
                          elevation={2}
                          sx={{
                            borderRadius: 3,
                            overflow: 'hidden',
                            border: `2px solid ${cardColor}22`,
                            boxShadow: `0 4px 16px ${cardColor}22`,
                          }}
                        >
                          {/* Card Header */}
                          <Box
                            sx={{
                              background: `linear-gradient(135deg, ${cardColor}dd, ${cardColor}99)`,
                              px: 2.5,
                              py: 1.5,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                {isBuy ? '🛒 Purchase' : '💰 Sales'} — {categoryLabel}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                {group.saudas.length} sauda{group.saudas.length > 1 ? 's' : ''} pending
                              </Typography>
                            </Box>
                            <Chip
                              label={`${group.totalRemaining} g remaining`}
                              size="small"
                              sx={{
                                background: 'rgba(255,255,255,0.25)',
                                color: '#fff',
                                fontWeight: 700,
                                backdropFilter: 'blur(4px)',
                              }}
                            />
                          </Box>

                          {/* Progress Bar */}
                          <Box sx={{ px: 2.5, pt: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Total: {group.totalQuantity} g
                              </Typography>
                              <Typography variant="caption" sx={{ color: cardColor, fontWeight: 700 }}>
                                Delivered: {group.totalDelivered} g ({deliveredPct}%)
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={deliveredPct}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: `${cardColor}22`,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: cardColor,
                                  borderRadius: 4,
                                },
                              }}
                            />
                          </Box>

                          {/* Expand/Collapse Toggle */}
                          <Box
                            sx={{
                              px: 2.5,
                              py: 1,
                              display: 'flex',
                              justifyContent: 'flex-end',
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              setExpandedGroups((prev) => ({
                                ...prev,
                                [groupKey]: !prev[groupKey],
                              }))
                            }
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: cardColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                              {isExpanded ? 'Hide details' : 'Show details'}
                              {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                            </Typography>
                          </Box>

                          {/* Sauda Detail Rows */}
                          <Collapse in={isExpanded}>
                            <Divider />
                            <Box sx={{ px: 2, pb: 1.5 }}>
                                  <Table size="small" sx={{ minWidth: { xs: 500, sm: '100%' } }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Sauda No</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Qty (g)</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Delivered</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Remaining</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Status</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {group.saudas.map((s) => (
                                    <TableRow key={s._id} sx={{ '&:hover': { background: `${cardColor}11` } }}>
                                      <TableCell sx={{ fontSize: '0.78rem', py: 0.75, fontWeight: 600, color: cardColor }}>#{s.saudaNo}</TableCell>
                                      <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{formatDate(s.saudaDate)}</TableCell>
                                      <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{s.quantity}</TableCell>
                                      <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#10b981', fontWeight: 600 }}>{s.delivered}</TableCell>
                                      <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#ef4444', fontWeight: 700 }}>{s.remaining}</TableCell>
                                      <TableCell sx={{ py: 0.75 }}>
                                        <Chip
                                          label={s.status}
                                          size="small"
                                          sx={{
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            backgroundColor: s.status === 'pending' ? '#fef3c7' : '#dbeafe',
                                            color: s.status === 'pending' ? '#92400e' : '#1e40af',
                                          }}
                                        />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </Collapse>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
            <TableContainer>

              <Table sx={{ minWidth: { xs: 800, sm: '100%' } }}>
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Invoice No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pcs</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '120px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chorsaList.map((chorsa, index) => (
                    <TableRow
                      key={chorsa._id || chorsa.id}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>{chorsa.invoiceNo || '-'}</TableCell>
                      <TableCell>{chorsa.partyId?.partyName || chorsa.partyName || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={chorsa.chorsaType === 'bank-9999' ? 'Bank 9999' : 'Chorsa 999'}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(chorsa.date)}</TableCell>
                      <TableCell>{chorsa.weight || '-'} g</TableCell>
                      <TableCell>{chorsa.pcs || '-'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handlePrintChorsa(chorsa)}
                          sx={{ color: '#10b981', '&:hover': { background: 'rgba(16, 185, 129, 0.1)' } }}
                        >
                          <PrintIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditChorsa(chorsa)}
                          sx={{ color: '#6366f1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteChorsa(chorsa)}
                          sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {chorsaList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          No {tabValue === 'buy' ? 'buy' : 'sell'} {pageTitle} records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(event, value) => {
                    setPage(value);
                  }}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
        </Paper>
      </Box>

      <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal} 
        maxWidth="md" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)',
            overflow: 'hidden',
            width: { xs: 'calc(100% - 16px)' },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: gradients.primary,
            color: '#fff',
            fontWeight: 700,
            py: 3,
            px: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {editingChorsa ? <EditIcon sx={{ fontSize: 28 }} /> : <AddIcon sx={{ fontSize: 28 }} />}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {editingChorsa ? `Edit ${pageTitle}` : `Add New ${pageTitle}`}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {pageTitle} {tabValue === 'buy' ? 'Buy' : 'Sell'} Transaction
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: '#fff',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 2, px: 4 }}>
          <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={partySearchQuery ? partySearchResults : parties}
                  getOptionLabel={(option) => option.partyName || ''}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  value={formData.partyId ? { _id: formData.partyId, partyName: formData.partyName } : null}
                  onChange={(e, newValue) => {
                    if (newValue) {
                      setFormData({
                        ...formData,
                        partyName: newValue.partyName,
                        partyId: newValue._id,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        partyName: '',
                        partyId: '',
                      });
                      setPartySearchQuery('');
                    }
                  }}
                  onInputChange={(event, newInputValue, reason) => {
                    if (reason === 'input') {
                      setPartySearchQuery(newInputValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Select Party *"
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        shrink: true,
                      }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 56,
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              {formData.partyId && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <PendingIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Pending Pakki Saudas
                      </Typography>
                      {loadingFormPending && (
                        <LinearProgress sx={{ width: 80, ml: 1, borderRadius: 2 }} />
                      )}
                    </Box>

                    {!loadingFormPending && formPendingPakkiGroups.length === 0 && (
                      <Alert
                        severity="success"
                        sx={{ borderRadius: 2, fontWeight: 500 }}
                      >
                        🎉 Is party ke saare pakki saudas deliver ho gaye hain!
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      {formPendingPakkiGroups.map((group) => {
                        const groupKey = `${group.saudaType}-${group.saudaCategory}`;
                        const isExpanded = expandedFormGroups[groupKey];
                        const deliveredPct = group.totalQuantity > 0
                          ? Math.round((group.totalDelivered / group.totalQuantity) * 100)
                          : 0;
                        const isBuy = group.saudaType === 'purchase';
                        const categoryLabel = group.saudaCategory === 'bank-9999' ? 'Bank 9999' : 'Chorsa 999';
                        const cardColor = isBuy
                          ? (group.saudaCategory === 'bank-9999' ? '#0ea5e9' : '#6366f1')
                          : (group.saudaCategory === 'bank-9999' ? '#14b8a6' : '#ec4899');

                        return (
                          <Grid item xs={12} md={6} key={groupKey}>
                            <Paper
                              elevation={2}
                              sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: `2px solid ${cardColor}22`,
                                boxShadow: `0 4px 16px ${cardColor}22`,
                              }}
                            >
                              {/* Card Header */}
                              <Box
                                sx={{
                                  background: `linear-gradient(135deg, ${cardColor}dd, ${cardColor}99)`,
                                  px: 2.5,
                                  py: 1.5,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <Box>
                                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {isBuy ? '🛒 Purchase' : '💰 Sales'} — {categoryLabel}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                    {group.saudas.length} sauda{group.saudas.length > 1 ? 's' : ''} pending
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`${group.totalRemaining} g remaining`}
                                  size="small"
                                  sx={{
                                    background: 'rgba(255,255,255,0.25)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    backdropFilter: 'blur(4px)',
                                  }}
                                />
                              </Box>

                              {/* Progress Bar */}
                              <Box sx={{ px: 2.5, pt: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Total: {group.totalQuantity} g
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: cardColor, fontWeight: 700 }}>
                                    Delivered: {group.totalDelivered} g ({deliveredPct}%)
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={deliveredPct}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: `${cardColor}22`,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: cardColor,
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                              </Box>

                              {/* Expand/Collapse Toggle */}
                              <Box
                                sx={{
                                  px: 2.5,
                                  py: 1,
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  setExpandedFormGroups((prev) => ({
                                    ...prev,
                                    [groupKey]: !prev[groupKey],
                                  }))
                                }
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: cardColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  {isExpanded ? 'Hide details' : 'Show details'}
                                  {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                                </Typography>
                              </Box>

                              {/* Sauda Detail Rows */}
                              <Collapse in={isExpanded}>
                                <Divider />
                                <Box sx={{ px: 2, pb: 1.5 }}>
                                      <Table size="small" sx={{ minWidth: { xs: 500, sm: '100%' } }}>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Sauda No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Qty (g)</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Delivered</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Remaining</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Status</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {group.saudas.map((s) => (
                                        <TableRow key={s._id} sx={{ '&:hover': { background: `${cardColor}11` } }}>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, fontWeight: 600, color: cardColor }}>#{s.saudaNo}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{formatDate(s.saudaDate)}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{s.quantity}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#10b981', fontWeight: 600 }}>{s.delivered}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#ef4444', fontWeight: 700 }}>{s.remaining}</TableCell>
                                          <TableCell sx={{ py: 0.75 }}>
                                            <Chip
                                              label={s.status}
                                              size="small"
                                              sx={{
                                                fontSize: '0.68rem',
                                                fontWeight: 700,
                                                backgroundColor: s.status === 'pending' ? '#fef3c7' : '#dbeafe',
                                                color: s.status === 'pending' ? '#92400e' : '#1e40af',
                                              }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date *"
                  type="date"
                  value={formData.date}
                  name="date"
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight"
                  type="text"
                  value={formData.weight}
                  name="weight"
                  onChange={handleInputChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#6366f1', fontWeight: 600 }}>g</Typography></InputAdornment>,
                  }}
                  helperText={formData.weight ? `${(parseFloat(formData.weight) / 1000).toFixed(3)} kg per piece` : 'Optional: Weight per piece in grams'}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      borderRadius: 2,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#6366f1',
                      fontWeight: 500,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pcs"
                  type="text"
                  value={formData.pcs}
                  name="pcs"
                  onChange={handleInputChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#6366f1', fontWeight: 600 }}>pcs</Typography></InputAdornment>,
                  }}
                  helperText={formData.pcs ? `${formData.pcs} pieces` : 'Optional: Number of pieces'}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      borderRadius: 2,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#6366f1',
                      fontWeight: 500,
                    },
                  }}
                />
              </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button
            onClick={handleCloseModal}
            startIcon={<CloseIcon />}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={editingChorsa ? <CheckIcon /> : <AddIcon />}
            onClick={handleSaveChorsa}
            sx={{
              background: gradients.primary,
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: gradients.primaryHover,
              },
            }}
          />
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ background: gradients.danger, color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DeleteIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this pakki? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                background: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              background: gradients.danger,
              color: '#fff',
              '&:hover': {
                background: gradients.dangerHover,
                boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bhavcutModalOpen}
        onClose={() => setBhavcutModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {formData.type === 'buy' ? <ShoppingCartIcon /> : <SellIcon />}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bhav Cuts ({pageTitle})
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3, mt: 1 }}>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>
              Your {formData.type === 'buy' ? 'purchase' : 'sales'} weight exceeds the remaining pending sauda by <strong>{bhavcutWeight}g</strong>. The excess will be processed as a Bhavcut.
            </Typography>
            <TextField
              fullWidth
              label="Bhavcut Weight (g)"
              type="number"
              value={bhavcutWeight}
              disabled
              size="small"
            />
            <TextField
              fullWidth
              label="Bhavcut Date *"
              type="date"
              value={bhavcutDate}
              onChange={(e) => setBhavcutDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />
            <TextField
              fullWidth
              label="Bhavcut Rate"
              type="number"
              value={bhavcutRate}
              onChange={(e) => setBhavcutRate(e.target.value)}
              size="small"
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setBhavcutModalOpen(false)}
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                background: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBhavcutSubmit}
            variant="contained"
            sx={{
              background: gradients.success,
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                background: gradients.successHover,
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
              },
            }}
          >
            Submit Bhavcut
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Chorsa999;
