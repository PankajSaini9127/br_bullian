import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Sell as SellIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Scale as QuantityIcon,
  AttachMoney as RateIcon,
  Payments as AmountIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import partyService from '../services/partyService';
import saudaService from '../services/saudaService';

const Sauda = () => {
  const [saudaList, setSaudaList] = useState([]);
  const [parties, setParties] = useState([]);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSauda, setEditingSauda] = useState(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [saudaToDelete, setSaudaToDelete] = useState(null);
  const [tabValue, setTabValue] = useState('purchase');
  const [searchPartyId, setSearchPartyId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [formData, setFormData] = useState({
    partyName: '',
    partyId: '',
    saudaDate: new Date().toISOString().split('T')[0],
    quantity: '',
    rate: '',
    saudaType: 'purchase',
    isCrossCut: false,
    status: 'Pending',
    deliveredQuantity: '',
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
          console.log(response)
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
    fetchSaudaList();
  }, [tabValue, searchPartyId, filterStartDate, filterEndDate, page]);

  const fetchSaudaList = async () => {
    try {
      const filters = {};
      filters.type = tabValue;
      if (searchPartyId) filters.partyId = searchPartyId;
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;
      filters.page = page;
      filters.limit = limit;

      const response = await saudaService.getSaudaList(tabValue, filters);
      if (response || response?.saudas) {
        setSaudaList(response?.saudas || []);
        setTotalPages(response?.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching sauda list:', error);
      toast.error('Failed to fetch sauda list');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Calculate total amount when quantity or rate changes
    if (name === 'quantity' || name === 'rate') {
      setFormData((prev) => {
        const qty = name === 'quantity' ? value : prev.quantity;
        const rt = name === 'rate' ? value : prev.rate;
        const newData = { ...prev, [name]: value };

        const qtyNum = qty ? parseFloat(qty) : 0;
        const rtNum = rt ? parseFloat(rt) : 0;
        if (!isNaN(qtyNum) && !isNaN(rtNum)) {
          newData.amount = (qtyNum * (rtNum / 1000)).toFixed(1);
        }
        return newData;
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setEditingSauda(null);
    setFormData({
      partyName: '',
      partyId: '',
      saudaDate: new Date().toISOString().split('T')[0],
      quantity: '',
      rate: '',
      amount: '',
      saudaType: tabValue,
      status: 'Pending',
      deliveredQuantity: '',
    });
  };

  const handleEditSauda = (sauda) => {
    setEditingSauda(sauda);
    setFormData({
      partyName: sauda.partyName,
      partyId: sauda.partyId?._id || '',
      saudaDate: sauda.saudaDate,
      quantity: sauda.quantity,
      rate: sauda.rate,
      amount: sauda.totalAmount || '',
      saudaType: sauda.saudaType || sauda.type || tabValue,
      status: sauda.status || 'Pending',
      deliveredQuantity: sauda.deliveredQuantity || '',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSauda(null);
    setFormData({
      partyName: '',
      partyId: '',
      saudaDate: new Date().toISOString().split('T')[0],
      quantity: '',
      rate: '',
      amount: '',
      saudaType: 'purchase',
      status: 'Pending',
      deliveredQuantity: '',
      isCrossCut: false,
    });
  };

  const handleSaveSauda = async () => {

    console.log("hererer",formData)
    if (!formData.partyId || !formData.saudaDate || !formData.quantity || !formData.rate) {
      toast.error('Please fill all required fields');
      return;
    }

    const qty = parseFloat(formData.quantity) || 0;
    const rt = parseFloat(formData.rate) || 0;
    const totalAmount = (qty * (rt / 1000)).toFixed(1);

    const saudaData = {
      partyName: formData.partyName,
      partyId: formData.partyId,
      saudaDate: formData.saudaDate,
      quantity: formData.quantity,
      rate: formData.rate,
      totalAmount,
      saudaType: formData.saudaType,
      status: formData.status,
      deliveredQuantity: formData.deliveredQuantity,
      isCrossCut: formData.isCrossCut,
    };

    try {

      console.log(editingSauda)
      if (editingSauda) {
        await saudaService.updateSauda(editingSauda._id, saudaData);
        setSaudaList(saudaList.map((s) =>
          s.id === editingSauda.id
            ? { ...s, ...saudaData }
            : s
        ));
        toast.success('Sauda updated successfully');
      } else {
        const response = await saudaService.addSauda(saudaData);
        setSaudaList([...saudaList, response]);
        toast.success('Sauda added successfully');
      }
      handleCloseModal();
      fetchSaudaList();
    } catch (error) {
      console.error('Error saving sauda:', error);
      toast.error('Failed to save sauda');
    }
  };

  const handleCrossCutCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({ ...prev, isCrossCut: isChecked }));
  };

  const handleDeleteSauda = (sauda) => {
    setSaudaToDelete(sauda);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!saudaToDelete) return;

    try {
      await saudaService.deleteSauda(saudaToDelete._id || saudaToDelete.id);
      setSaudaList(saudaList.filter((s) => s._id !== saudaToDelete._id && s.id !== saudaToDelete.id));
      toast.success('Sauda deleted successfully');
      setDeleteConfirmationOpen(false);
      setSaudaToDelete(null);
    } catch (error) {
      console.error('Error deleting sauda:', error);
      toast.error('Failed to delete sauda');
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setSaudaToDelete(null);
  };

  const handlePrintSauda = (sauda) => {
    let htmlContent = `
      <html>
      <head>
        <title>Sauda Print</title>
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
        <h1>SAUDA DETAILS</h1>
        <div class="header">
          <p><strong>Sauda Type:</strong> ${sauda.saudaType === 'purchase' ? 'Purchase' : 'Sales'}</p>
          <p><strong>Party Name:</strong> ${sauda.partyId?.partyName || sauda.partyName || '-'}</p>
          <p><strong>Sauda Date:</strong> ${formatDate(sauda.saudaDate)}</p>
        </div>

        <div class="details">
          <table>
            <tr>
              <td class="label">Sauda No</td>
              <td class="value">${sauda.saudaNo || sauda._id || '-'}</td>
            </tr>
            <tr>
              <td class="label">Quantity</td>
              <td class="value">${sauda.quantity} g</td>
            </tr>
            <tr>
              <td class="label">Rate</td>
              <td class="value">₹${parseFloat(sauda.rate).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td class="label">Total Amount</td>
              <td class="value">₹${((parseFloat(sauda.quantity) || 0) * (parseFloat(sauda.rate) || 0) / 1000).toFixed(1)}</td>
            </tr>
            <tr>
              <td class="label">Status</td>
              <td class="value">${sauda.status || 'Pending'}</td>
            </tr>
            <tr>
              <td class="label">Delivered Quantity</td>
              <td class="value">${sauda.delivered || sauda.deliveredQuantity || 0} g</td>
            </tr>
            <tr>
              <td class="label">Pending Quantity</td>
              <td class="value">${(parseFloat(sauda.quantity) - (parseFloat(sauda.delivered) || parseFloat(sauda.deliveredQuantity) || 0)).toFixed(1)} g</td>
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

  const getFilteredSaudaList = () => {
    return saudaList.filter((s) => {
      const matchesType = s.saudaType === tabValue;
      const matchesParty = !searchPartyId || (s.partyId?._id === searchPartyId || s.partyId === searchPartyId);
      const matchesStartDate = !filterStartDate || s.saudaDate >= filterStartDate;
      const matchesEndDate = !filterEndDate || s.saudaDate <= filterEndDate;
      return matchesType && matchesParty && matchesStartDate && matchesEndDate;
    });
  };

  const handleResetFilters = () => {
    setSearchPartyId('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
  };

  const handlePrintAllSauda = () => {
    const filteredList = getFilteredSaudaList();
    if (filteredList.length === 0) {
      toast.error('No sauda to print');
      return;
    }

    const selectedParty = parties.find((p) => p._id === searchPartyId);

    let htmlContent = `
      <html>
      <head>
        <title>SAUDA LIST</title>
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
        <h1>${tabValue === 'purchase' ? 'PURCHASE' : 'SALES'} SAUDA LIST</h1>
        <div class="header">
          ${selectedParty ? `<p><strong>Party:</strong> ${selectedParty.partyName}</p>` : ''}
          ${filterStartDate || filterEndDate ? `<p><strong>Period:</strong> ${filterStartDate || '...'} to ${filterEndDate || '...'}</p>` : ''}
          <p><strong>Total Records:</strong> ${filteredList.length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Party Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Qty (g)</th>
              <th>Rate</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Delivered (g)</th>
              <th>Pending (g)</th>
            </tr>
          </thead>
          <tbody>
    `;

    filteredList.forEach((sauda, index) => {
      const qty = parseFloat(sauda.quantity) || 0;
      const rt = parseFloat(sauda.rate) || 0;
      const amount = (qty * (rt / 1000)).toFixed(1);
      const delivered = parseFloat(sauda.delivered) || parseFloat(sauda.deliveredQuantity) || 0;
      const pending = (qty - delivered).toFixed(1);

      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${sauda.partyId?.partyName || sauda.partyName || '-'}</td>
          <td>${sauda.saudaType === 'purchase' ? 'Purchase' : 'Sales'}</td>
          <td>${formatDate(sauda.saudaDate)}</td>
          <td>${sauda.quantity}</td>
          <td>₹${parseFloat(sauda.rate).toLocaleString('en-IN')}</td>
          <td>₹${parseFloat(amount).toLocaleString('en-IN')}</td>
          <td>${sauda.status || 'Pending'}</td>
          <td>${delivered}</td>
          <td>${pending}</td>
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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Sauda Management
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
              border: '1px solid #e2e8f0',
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
                value="purchase"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon sx={{ color: '#6366f1' }} />
                    Purchase
                  </Box>
                }
              />
              <Tab
                value="sales"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SellIcon sx={{ color: '#ec4899' }} />
                    Sales
                  </Box>
                }
              />
            </Tabs>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
              border: '1px solid #e2e8f0',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#424242' }}>
                {tabValue === 'purchase' ? 'Purchase' : 'Sales'} Sauda List
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintAllSauda}
                  sx={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
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
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4338ca 0%, #be185d 100%)',
                    },
                  }}
                >
                  Add {tabValue === 'purchase' ? 'Purchase' : 'Sales'} Sauda
                </Button>
              </Box>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  sx={{ minWidth: { md: '200px' } }}
                  options={partySearchQuery ? partySearchResults : parties}
                  getOptionLabel={(option) => option.partyName || ''}
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      borderColor: '#4338ca',
                      background: '#e0e7ff',
                    },
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sauda Date</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Quantity</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Rate</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Amount</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Delivered Qty</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '120px' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {saudaList.map((sauda, index) => (
                    <TableRow
                      key={sauda.id}
                      sx={{
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell>{sauda?.partyId?.partyName || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={sauda.saudaType === 'purchase' ? 'Purchase' : 'Sales'}
                          size="small"
                          icon={sauda.saudaType === 'purchase' ? <ShoppingCartIcon sx={{ fontSize: '14px !important' }} /> : <SellIcon sx={{ fontSize: '14px !important' }} />}
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            bgcolor: sauda.saudaType === 'purchase' ? '#e0e7ff' : '#fce7f3',
                            color: sauda.saudaType === 'purchase' ? '#4338ca' : '#be185d',
                            '& .MuiChip-icon': {
                              color: sauda.saudaType === 'purchase' ? '#4338ca' : '#be185d',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(sauda.saudaDate)}</TableCell>
                      <TableCell>{sauda.quantity} g</TableCell>
                      <TableCell>{sauda.rate}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {(() => {
                          const qty = parseFloat(String(sauda.quantity).replace(/,/g, '')) || 0;
                          const rt = parseFloat(String(sauda.rate).replace(/,/g, '')) || 0;
                          const amount = (qty * (rt / 1000)).toFixed(1);
                          return `₹${parseFloat(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
                        })()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sauda.status || 'Pending'}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            bgcolor: sauda.status === 'delivered' ? '#d1fae5' : sauda.status === 'partial' ? '#fef3c7' : '#fee2e2',
                            color: sauda.status === 'delivered' ? '#065f46' : sauda.status === 'partial' ? '#92400e' : '#991b1b',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {sauda.delivered || 0} g
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handlePrintSauda(sauda)}
                          sx={{ color: '#10b981', '&:hover': { background: '#d1fae5' } }}
                        >
                          <PrintIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditSauda(sauda)}
                          sx={{ color: '#6366f1', '&:hover': { background: '#e0e7ff' } }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteSauda(sauda)}
                          sx={{ color: '#ef4444', '&:hover': { background: '#fee2e2' } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {saudaList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          No {tabValue === 'purchase' ? 'purchase' : 'sales'} sauda records found
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
        </Grid>
      </Grid>

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
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
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
              {editingSauda ? <EditIcon sx={{ fontSize: 28 }} /> : <AddIcon sx={{ fontSize: 28 }} />}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {editingSauda ? 'Edit Sauda' : 'Add New Sauda'}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {tabValue === 'purchase' ? 'Purchase' : 'Sales'} Transaction
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
          <Stack spacing={2} sx={{pt:2}}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Autocomplete
                fullWidth
                sx={{ minWidth: { md: '200px' } }}
                options={partySearchQuery ? partySearchResults : parties}
                getOptionLabel={(option) => option.partyName || ''}
                value={parties.find((p) => p._id === formData.partyId) || null}
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
              <TextField
                fullWidth
                label="Sauda Date *"
                type="date"
                value={formData.saudaDate}
                name="saudaDate"
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
              <TextField
                fullWidth
                label="Quantity *"
                type="text"
                value={formData.quantity}
                name="quantity"
                onChange={handleInputChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#6366f1', fontWeight: 600 }}>g</Typography></InputAdornment>,
                }}
                helperText={formData.quantity ? `${(parseFloat(formData.quantity) / 1000).toFixed(3)} kg` : 'Please Enter Qty in Grams Only'}
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
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Rate *"
                type="text"
                value={formData.rate}
                name="rate"
                onChange={handleInputChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                }}
                helperText={formData.rate ? `${parseFloat(formData.rate).toLocaleString('en-IN')} - ${numberToWords(parseFloat(formData.rate))}` : 'Enter rate'}
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
              <TextField
                fullWidth
                label="Total Amount"
                type="text"
                value={formData.amount ? parseFloat(formData.amount).toLocaleString('en-IN') : ''}
                InputProps={{
                  readOnly: true,
                  startAdornment: <Typography sx={{ color: '#ec4899', mr: 1, fontSize: 20 }}>₹</Typography>,
                }}
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    height: 56,
                    borderRadius: 2,
                  },
                }}
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth sx={{
                '& .MuiOutlinedInput-root': {
                  height: 56,
                  borderRadius: 2,
                },
              }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  name="status"
                  onChange={handleInputChange}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Partial">Partial</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Delivered Quantity"
                type="text"
                value={formData.deliveredQuantity}
                name="deliveredQuantity"
                onChange={handleInputChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#6366f1', fontWeight: 600 }}>g</Typography></InputAdornment>,
                }}
                helperText={formData.deliveredQuantity ? `${(parseFloat(formData.deliveredQuantity) / 1000).toFixed(3)} kg` : 'Optional'}
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
            </Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isCrossCut}
                  onChange={handleCrossCutCheckboxChange}
                  sx={{
                    color: '#6366f1',
                    '&.Mui-checked': {
                      color: '#6366f1',
                    },
                  }}
                />
              }
              label="Cross Cut"
              sx={{ fontWeight: 600, color: '#475569' }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button
            onClick={handleCloseModal}
            startIcon={<CloseIcon />}
            sx={{
              color: '#64748b',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                background: '#f1f5f9',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={editingSauda ? <CheckIcon /> : <AddIcon />}
            onClick={handleSaveSauda}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #be185d 100%)',
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
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DeleteIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Are you sure you want to delete this sauda? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{
              borderColor: '#64748b',
              color: '#64748b',
              '&:hover': {
                borderColor: '#475569',
                background: '#f1f5f9',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Sauda;
