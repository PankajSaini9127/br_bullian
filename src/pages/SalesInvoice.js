import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Pagination,
  Autocomplete,
  Tooltip,
  Stack,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import jsPDF from 'jspdf';
import partyService from '../services/partyService';
import salesInvoiceService from '../services/salesInvoiceService';
import { roundOffFine, roundOffFineFormatted } from '../utils/roundOff';
import { printSalesInvoiceBluetooth } from '../utils/thermalPrinter';

const SalesInvoice = () => {
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedPartyName, setSelectedPartyName] = useState('');
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [filterPartySearchQuery, setFilterPartySearchQuery] = useState('');
  const [filterPartySearchResults, setFilterPartySearchResults] = useState([]);
  const [paggaSearchTerm, setPaggaSearchTerm] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [parties, setParties] = useState([]);
  const [availablePagga, setAvailablePagga] = useState([]);
  const [filteredPagga, setFilteredPagga] = useState([]);
  const [filterParty, setFilterParty] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [checkedPagga, setCheckedPagga] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [formError, setFormError] = useState('');
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [editPartyId, setEditPartyId] = useState('');
  const [editInvoiceDate, setEditInvoiceDate] = useState('');
  const [editAvailablePagga, setEditAvailablePagga] = useState([]);
  const [editCurrentPagga, setEditCurrentPagga] = useState([]);
  const [editPartySearchQuery, setEditPartySearchQuery] = useState('');
  const [editPartySearchResults, setEditPartySearchResults] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPartyId, setFilterPartyId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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

    const fetchAvailablePagga = async () => {
      try {
        const response = await salesInvoiceService.getAvailablePagga();
        setAvailablePagga(response?.puggas || []);
      } catch (error) {
        console.error('Error fetching available pagga:', error);
      }
    };

    const fetchSalesInvoices = async () => {
      try {
        const params = {
          page,
          limit,
        };
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;
        if (filterPartyId) params.partyId = filterPartyId;

        const response = await salesInvoiceService.getSalesInvoices(params);

        // Handle response structure: response.salesInvoices and response.pagination
        let salesInvoiceList = [];
        if (response && Array.isArray(response.salesInvoices)) {
          salesInvoiceList = response.salesInvoices;
        } else if (Array.isArray(response)) {
          salesInvoiceList = response;
        } else if (response && Array.isArray(response.data)) {
          salesInvoiceList = response.data;
        }

        setSalesInvoices(salesInvoiceList);
        setTotalPages(response?.pagination?.totalPages || response?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching sales invoices:', error);
      }
    };

    fetchParties();
    fetchAvailablePagga();
    fetchSalesInvoices();
  }, [filterStartDate, filterEndDate, filterPartyId, page, limit]);

  useEffect(() => {
    const filtered = availablePagga.filter(pagga => {
      const partyMatch = !filterParty ||
        pagga.invoiceId?.partyId?._id === filterParty ||
        pagga.invoiceId?.partyId === filterParty;

      const paggaDate = pagga.invoiceId?.invoiceDate || pagga.createdAt;
      const dateMatch = !filterDate ||
        (paggaDate && paggaDate.split('T')[0] === filterDate);

      const paggaSearchMatch = !paggaSearchTerm ||
        (pagga.paggaNo && pagga.paggaNo.toLowerCase().includes(paggaSearchTerm.toLowerCase())) ||
        (pagga.weight && String(pagga.weight).includes(paggaSearchTerm)) ||
        (pagga.touch && String(pagga.touch).includes(paggaSearchTerm));

      return partyMatch && dateMatch && paggaSearchMatch;
    });
    setFilteredPagga(filtered);
  }, [filterParty, filterDate, paggaSearchTerm, availablePagga]);

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
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [partySearchQuery, parties]);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (filterPartySearchQuery) {
        try {
          const response = await partyService.searchParties(filterPartySearchQuery);
          setFilterPartySearchResults(response?.data?.parties || []);
        } catch (error) {
          console.error('Error searching parties:', error);
        }
      } else {
        setFilterPartySearchResults(parties);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filterPartySearchQuery, parties]);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (editPartySearchQuery) {
        try {
          const response = await partyService.searchParties(editPartySearchQuery);
          setEditPartySearchResults(response?.data?.parties || []);
        } catch (error) {
          console.error('Error searching parties:', error);
        }
      } else {
        setEditPartySearchResults(parties);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [editPartySearchQuery, parties]);

  const handleSelectAll = (event) => {
    const isChecked = event.target.checked;
    setSelectAll(isChecked);
    const newCheckedPagga = {};
    filteredPagga.forEach(pagga => {
      newCheckedPagga[pagga._id] = isChecked;
    });
    setCheckedPagga(newCheckedPagga);
  };

  const handleCheckPagga = (paggaId) => {
    setCheckedPagga(prev => ({
      ...prev,
      [paggaId]: !prev[paggaId]
    }));
    setSelectAll(false);
  };

  const handleAddToDukanStock = async () => {
    try {
      const selectedPaggaIds = Object.keys(checkedPagga).filter(id => checkedPagga[id]);
      if (selectedPaggaIds.length === 0) {
        toast.error('Please select at least one pagga');
        return;
      }
      
      await salesInvoiceService.markDukanStock(selectedPaggaIds);
      toast.success(`${selectedPaggaIds.length} pagga(s) added to Dukan Stock`);
      
      // Clear selections and refresh available pagga
      setCheckedPagga({});
      setSelectAll(false);
      const response = await salesInvoiceService.getAvailablePagga();
      setAvailablePagga(response?.puggas || []);
    } catch (error) {
      console.error('Error adding to Dukan Stock:', error);
      toast.error('Failed to add to Dukan Stock');
    }
  };

  const getTotalFine = () => {
    let total = 0;
    availablePagga.forEach(pagga => {
      if (checkedPagga[pagga._id]) {
        const weight = parseFloat(pagga.weight) || 0;
        const touch = parseFloat(pagga.touch) || 0;
        const fine = weight * touch / 100;
        total += roundOffFine(fine);
      }
    });
    return total.toFixed(2);
  };

  const handleSaveSalesInvoice = async () => {
    const toastId = toast.loading('Creating sales invoice...');
    try {
      setFormError('');

      if (!selectedPartyId) {
        toast.dismiss(toastId);
        setFormError('Please select a party');
        return;
      }

      const selectedPaggaIds = Object.keys(checkedPagga).filter(id => checkedPagga[id]);

      if (selectedPaggaIds.length === 0) {
        toast.dismiss(toastId);
        setFormError('Please select at least one pagga');
        return;
      }

      const salesInvoiceData = {
        partyId: selectedPartyId,
        invoiceDate: invoiceDate,
        paggaIds: selectedPaggaIds,
      };

      await salesInvoiceService.createSalesInvoice(salesInvoiceData);

      // Refresh sales invoices list with filter params
      const params = {
        page,
        limit,
      };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterPartyId) params.partyId = filterPartyId;

      const response = await salesInvoiceService.getSalesInvoices(params);

      // Handle response structure: response.salesInvoices and response.pagination
      let salesInvoiceList = [];
      if (response && Array.isArray(response.salesInvoices)) {
        salesInvoiceList = response.salesInvoices;
      } else if (Array.isArray(response)) {
        salesInvoiceList = response;
      } else if (response && Array.isArray(response.data)) {
        salesInvoiceList = response.data;
      }

      setSalesInvoices(salesInvoiceList);

      // Refetch available pagga list
      const paggaResponse = await salesInvoiceService.getAvailablePagga();
      setAvailablePagga(paggaResponse?.puggas || []);

      setSelectedPartyId('');
      setSelectedPartyName('');
      setInvoiceDate(today);
      setCheckedPagga({});
      setSelectAll(false);
      setShowAddForm(false);
      setFormError('');
      toast.dismiss(toastId);
      toast.success('Sales invoice created successfully');
    } catch (error) {
      console.error('Error creating sales invoice:', error);
      setFormError('Failed to save sales invoice. Please try again.');
      toast.dismiss(toastId);
      toast.error('Failed to create sales invoice');
    }
  };

  const handleViewSalesInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedInvoice(null);
  };

  const  handlePrintSalesInvoice = (invoice) => {
    // Calculate required height based on content
    const itemCount = invoice.paggaIds?.length || 0;
    const itemHeight = itemCount * 6; // 6mm per item
    const headerHeight = 44; // Header content
    const footerHeight = 28; // Footer content
    const requiredHeight = headerHeight + itemHeight + footerHeight + 20; // +20mm padding

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, Math.max(requiredHeight, 50)], // 80mm fixed width, dynamic height (min 50mm)
    });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Outgoing Sales Invoice', 40, 16, { align: 'center' });

    doc.line(5, 18, 75, 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Party: ${invoice.partyId?.partyName || invoice.partyName || '-'}`, 5, 24);
    doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}`, 5, 30);
    doc.text(`Invoice No: ${invoice.salesInvoiceNo || 'SINV-' + String(invoice._id).padStart(4, '0')}`, 5, 36);

    doc.line(5, 38, 75, 38);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Sr', 5, 44);
    doc.text('Pagga', 15, 44);
    doc.text('Wt(g)', 40, 44);
    doc.text('Touch', 50, 44);
    doc.text('Fine(g)', 62, 44);

    doc.line(5, 46, 75, 46);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    let yPosition = 52;

    invoice.paggaIds?.forEach((item, index) => {
      const weight = parseFloat(item.weight) || 0;
      const touch = parseFloat(item.touch) || 0;
      const fine = weight * touch / 100;
      const roundedFine = roundOffFineFormatted(fine);

      doc.text(`${index + 1}`, 5, yPosition);
      doc.text(item.paggaNo || '-', 15, yPosition);
      doc.text(String(item.weight) || '0', 40, yPosition);
      doc.text(String(item.touch) || '0', 50, yPosition);
      doc.text(roundedFine, 62, yPosition);
      yPosition += 6;
    });

    doc.line(5, yPosition, 75, yPosition);
    yPosition += 6;

    const totalGrossWeight = invoice.paggaIds?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2);
    const totalFine = invoice.paggaIds?.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const touch = parseFloat(item.touch) || 0;
      const fine = weight * touch / 100;
      return total + roundOffFine(fine);
    }, 0).toFixed(2);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Items: ${invoice.paggaIds?.length || 0}`, 5, yPosition);
    doc.text(`Gross Wt: ${totalGrossWeight}g`, 5, yPosition + 6);
    doc.text(`Total Fine: ${totalFine}g`, 5, yPosition + 12);

    doc.line(5, yPosition + 16, 75, yPosition + 16);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 40, yPosition + 22, { align: 'center' });

    doc.save(`sales-invoice-${invoice?.salesInvoiceNo || invoice._id}.pdf`);
  };

  const handleBluetoothPrintSalesInvoice = async (invoice) => {
    const toastId = toast.loading('Printing sales invoice...');
    try {
      await printSalesInvoiceBluetooth(invoice);
      toast.dismiss(toastId);
      toast.success('Print sent to thermal printer');
    } catch (error) {
      console.error('Print failed:', error);
      toast.dismiss(toastId);
      toast.error('Print failed: ' + (error.message || 'Printer not available'));
    }
  };

  const handleEditSalesInvoice = async (invoice) => {

    console.log('Editing invoice:', invoice);
    console.log('Party ID:', invoice.partyId?._id || invoice.partyId);
    setEditingInvoice(invoice);
    setEditPartyId(invoice.partyId?._id || invoice.partyId);
    setEditInvoiceDate(invoice.invoiceDate);

    // Set current pagga from the invoice
    setEditCurrentPagga(invoice.paggaIds || []);

    // Fetch available pagga
    try {
      const response = await salesInvoiceService.getAvailablePagga();
      const available = response?.puggas || [];
      setEditAvailablePagga(available);
    } catch (error) {
      console.error('Error fetching available pagga:', error);
      setEditAvailablePagga([]);
    }

    setEditModalOpen(true);
  };

  const handleRemoveEditPagga = (paggaId) => {
    setEditCurrentPagga(prev => prev.filter(p => p._id !== paggaId));
  };

  const handleAddEditPagga = (pagga) => {
    setEditCurrentPagga(prev => [...prev, pagga]);
  };

  const handleEditItemChange = (id, field, value) => {
    const updatedItems = editItems.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'touch') {
          // Format touch as XX.XX
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
    setEditItems(updatedItems);
  };

  const handleRemoveEditItem = (id) => {
    if (editItems.length > 1) {
      const updatedItems = editItems.filter(item => item.id !== id);
      setEditItems(updatedItems);
    }
  };

  const handleAddEditItem = () => {
    const newId = Math.max(...editItems.map(item => item.id)) + 1;
    setEditItems([...editItems, { id: newId, paggaNo: '', weight: '', touch: '', fine: '' }]);
  };

  const handleUpdateSalesInvoice = async () => {
    const toastId = toast.loading('Updating sales invoice...');
    try {
      if (!editPartyId) {
        toast.dismiss(toastId);
        toast.error('Please select a party');
        return;
      }

      const invoiceData = {
        partyId: editPartyId,
        invoiceDate: editInvoiceDate,
        paggaIds: editCurrentPagga,
      };

      await salesInvoiceService.updateSalesInvoiceDetails(editingInvoice._id || editingInvoice.id, invoiceData);

      // Refresh sales invoice list
      const params = {
        page,
        limit,
      };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterPartyId) params.partyId = filterPartyId;

      const response = await salesInvoiceService.getSalesInvoices(params);
      setSalesInvoices(response?.salesInvoices || response || []);

      setEditModalOpen(false);
      setEditingInvoice(null);
      setEditAvailablePagga([]);
      setEditCurrentPagga([]);
      setEditPartyId('');
      setEditInvoiceDate('');
      toast.dismiss(toastId);
      toast.success('Sales invoice updated successfully');
    } catch (error) {
      console.error('Error updating sales invoice:', error);
      toast.dismiss(toastId);
      toast.error('Failed to update sales invoice');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          border: '1px solid #e2e8f0',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {showAddForm ? 'Create Sales Invoice' : 'Sales Invoices'}
          </Typography>
          <Button
            variant="contained"
            startIcon={showAddForm ? null : <AddIcon />}
            onClick={() => setShowAddForm(!showAddForm)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #db2777 100%)',
              },
            }}
          >
            {showAddForm ? 'Back to List' : 'Create New'}
          </Button>
        </Box>

        {formError && (
          <Box sx={{ mb: 3, p: 2, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>
              {formError}
            </Typography>
          </Box>
        )}

        {showAddForm ? (
          <>
            {/* Total Fine Display */}
        <Box
          sx={{
            mb: 3,
            p: 3,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            borderRadius: 2,
            color: '#fff',
          }}
        >
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
            Total Fine of Selected Pagga
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {getTotalFine()} g
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              loading={false}
              options={partySearchQuery ? partySearchResults : parties}
              getOptionLabel={(option) => option.partyName || ''}
              value={parties.find(p => p._id === selectedPartyId) || null}
              onChange={(event, newValue) => {
                setSelectedPartyId(newValue?._id || '');
                setSelectedPartyName(newValue?.partyName || '');
                setFormError('');
              }}
              onInputChange={(event, newInputValue) => {
                setPartySearchQuery(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Party Name"
                  error={!!formError && !selectedPartyId}
                  helperText={formError && !selectedPartyId ? formError : ''}
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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
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
          </Grid>
        </Grid>

        <Typography
          variant="h6"
          sx={{
            mt: 4,
            mb: 2,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Available Pagga for Sale
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item>
              <TextField
                placeholder="search pagga"
                variant="outlined"
                size="small"
                value={paggaSearchTerm}
                onChange={(e) => setPaggaSearchTerm(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </Grid>
            <Grid item>
              <Autocomplete
                loading={false}
                sx={{ minWidth: 250 }}
                options={filterPartySearchQuery ? filterPartySearchResults : parties}
                getOptionLabel={(option) => option.partyName || ''}
                value={parties.find(p => p._id === filterParty) || null}
                onChange={(event, newValue) => {
                  setFilterParty(newValue?._id || '');
                }}
                onInputChange={(event, newInputValue) => {
                  setFilterPartySearchQuery(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Party"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item>
              <TextField
                type="date"
                label="Filter by Date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 200 }}
              />
            </Grid>
          </Grid>
        </Box>

        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                <TableCell padding="checkbox" sx={{ color: '#fff', fontWeight: 600 }}>
                  <Checkbox
                    checked={selectAll}
                    onChange={handleSelectAll}
                    sx={{ color: '#fff', '&.Mui-checked': { color: '#fff' } }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Invoice Date</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPagga.map((pagga, index) => {
                const weight = parseFloat(pagga.weight) || 0;
                const touch = parseFloat(pagga.touch) || 0;
                const fine = weight * touch / 100;
                const roundedFine = roundOffFineFormatted(fine);
                return (
                  <TableRow
                    key={pagga._id}
                    sx={{
                      '&:hover': {
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={checkedPagga[pagga._id] || false}
                        onChange={() => handleCheckPagga(pagga._id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                    <TableCell>{pagga.paggaNo}</TableCell>
                    <TableCell>{pagga.invoiceId?.partyId?.partyName || pagga.partyName || '-'}</TableCell>
                    <TableCell>
                      {pagga.invoiceId?.invoiceDate
                        ? new Date(pagga.invoiceId.invoiceDate).toLocaleDateString('en-GB')
                        : pagga.createdAt
                        ? new Date(pagga.createdAt).toLocaleDateString('en-GB')
                        : '-'}
                    </TableCell>
                    <TableCell>{pagga.weight}</TableCell>
                    <TableCell>{pagga.touch}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{roundedFine}</TableCell>
                  </TableRow>
                );
              })}
              {filteredPagga.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      No available pagga for sale
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {Object.keys(checkedPagga).filter(id => checkedPagga[id]).length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleAddToDukanStock}
              sx={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                },
              }}
            >
              Add To Dukan Stock
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSalesInvoice}
            disabled={!selectedPartyId}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              },
              px: 4,
              py: 1.5,
            }}
          >
            Save Sales Invoice
          </Button>
        </Box>
          </>
        ) : (
          <>
            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>Start Date</InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    name="startDate"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
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
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel shrink>End Date</InputLabel>
                  <TextField
                    fullWidth
                    size="small"
                    name="endDate"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
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
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  loading={false}
                  fullWidth
                  size="small"
                  options={filterPartySearchQuery ? filterPartySearchResults : parties}
                  getOptionLabel={(option) => option.partyName || ''}
                  value={parties.find((p) => p._id === filterPartyId) || null}
                  onChange={(e, newValue) => setFilterPartyId(newValue?._id || '')}
                  onInputChange={(event, newInputValue) => {
                    setFilterPartySearchQuery(newInputValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Party"
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
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterStartDate('');
                    setFilterEndDate('');
                    setFilterPartyId('');
                    setPage(1);
                  }}
                  sx={{
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      borderColor: '#4338ca',
                      background: '#e0e7ff',
                    },
                  }}
                >
                  Reset Filters
                </Button>
              </Grid>
            </Grid>
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Invoice No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Items</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Gross Weight (g)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Fine (g)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>View</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, width: '100px' }}>Action</TableCell>
                  {/* <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>USB</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {salesInvoices.map((invoice) => {
                  const totalGrossWeight = invoice.paggaIds?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2);
                  const totalFine = invoice.paggaIds?.reduce((total, item) => {
                    const weight = parseFloat(item.weight) || 0;
                    const touch = parseFloat(item.touch) || 0;
                    const fine = weight * touch / 100;
                    return total + roundOffFine(fine);
                  }, 0).toFixed(2);
                  return (
                    <TableRow
                      key={invoice._id || invoice.id}
                      sx={{
                        '&:hover': {
                          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{invoice.salesInvoiceNo || 'SINV-' + String(invoice._id).padStart(4, '0')}</TableCell>
                      <TableCell>{invoice.partyId?.partyName || invoice.partyName || '-'}</TableCell>
                      <TableCell>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={invoice.paggaIds?.length || 0}
                          size="small"
                          sx={{
                            bgcolor: '#dbeafe',
                            color: '#1e40af',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{totalGrossWeight} g</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#ec4899' }}>{totalFine} g</TableCell>
                      <TableCell>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() => handleViewSalesInvoice(invoice)}
                            sx={{ color: '#6366f1', '&:hover': { background: '#e0e7ff' } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={() => handlePrintSalesInvoice(invoice)}
                            sx={{ color: '#10b981', '&:hover': { background: '#d1fae5' } }}
                          >
                            <DownloadIcon />
                            
                          </IconButton>
                        </Tooltip>
                      {/* </TableCell>
                      <TableCell> */}
                        <Tooltip title="Print">
                          <IconButton
                            size="small"
                            onClick={() => handleBluetoothPrintSalesInvoice(invoice)}
                            sx={{ color: '#3b82f6', '&:hover': { background: '#dbeafe' } }}
                          >
                            <PrintIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      {/* </TableCell>
                      <TableCell> */}
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditSalesInvoice(invoice)}
                            sx={{ color: '#ec4899', '&:hover': { background: '#fce7f3' } }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {salesInvoices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        No sales invoices found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                },
              }}
            />
          </Box>
          </>
        )}

        {/* View Sales Invoice Modal */}
        <Dialog
          open={viewModalOpen}
          onClose={handleCloseViewModal}
          maxWidth="md"
          fullWidth
          sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            Sales Invoice Details
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedInvoice && (
              <Box>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Invoice No</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedInvoice.salesInvoiceNo || 'SINV-' + String(selectedInvoice.id).padStart(4, '0')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Party Name</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedInvoice.partyId?.partyName || selectedInvoice.partyName || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Date</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-GB') : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>Total Items</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedInvoice.paggaIds?.length || 0}</Typography>
                  </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#424242' }}>
                  Pagga Details
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedInvoice.paggaIds?.map((item, index) => {
                        const weight = parseFloat(item.weight) || 0;
                        const touch = parseFloat(item.touch) || 0;
                        const fine = weight * touch / 100;
                        const roundedFine = roundOffFineFormatted(fine);
                        return (
                          <TableRow key={item.id || index}>
                            <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                            <TableCell>{item.paggaNo}</TableCell>
                            <TableCell>{item.weight}</TableCell>
                            <TableCell>{item.touch}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{roundedFine}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, p: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Total Gross Weight</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                        {selectedInvoice.paggaIds?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2)} g
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>Total Fine</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#ec4899' }}>
                        {selectedInvoice.paggaIds?.reduce((total, item) => {
                          const weight = parseFloat(item.weight) || 0;
                          const touch = parseFloat(item.touch) || 0;
                          const fine = weight * touch / 100;
                          return total + roundOffFine(fine);
                        }, 0).toFixed(2)} g
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseViewModal} sx={{ color: '#6366f1' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Sales Invoice Modal */}
        <Dialog
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          maxWidth="lg"
          fullWidth
          sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}
        >
          <DialogTitle>Edit Sales Invoice</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Autocomplete
                loading={false}
                fullWidth
                size="small"
                options={editPartySearchQuery ? editPartySearchResults : parties}
                getOptionLabel={(option) => option.partyName || ''}
                value={parties.find((p) => p._id === editPartyId) || null}
                onChange={(e, newValue) => {
                  console.log('Party changed to:', newValue);
                  setEditPartyId(newValue?._id || '');
                }}
                onInputChange={(event, newInputValue) => {
                  setEditPartySearchQuery(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Party"
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
              <TextField
                fullWidth
                size="small"
                label="Date"
                type="date"
                value={editInvoiceDate}
                onChange={(e) => setEditInvoiceDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#424242' }}>
              Current Pagga
            </Typography>

            <TableContainer sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editCurrentPagga.map((pagga, index) => {
                    const weight = parseFloat(pagga.weight) || 0;
                    const touch = parseFloat(pagga.touch) || 0;
                    const fine = weight * touch / 100;
                    const roundedFine = roundOffFineFormatted(fine);
                    return (
                      <TableRow
                        key={pagga._id}
                        sx={{
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                        <TableCell>{pagga.paggaNo}</TableCell>
                        <TableCell>{pagga.weight}</TableCell>
                        <TableCell>{pagga.touch}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{roundedFine}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveEditPagga(pagga._id)}
                            sx={{ color: '#ef4444', '&:hover': { background: '#fee2e2' } }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {editCurrentPagga.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          No pagga in this invoice
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#424242' }}>
              Available Pagga to Add
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {editAvailablePagga
                    .filter(pagga => !editCurrentPagga.some(current => current._id === pagga._id))
                    .map((pagga, index) => {
                    const weight = parseFloat(pagga.weight) || 0;
                    const touch = parseFloat(pagga.touch) || 0;
                    const fine = weight * touch / 100;
                    const roundedFine = roundOffFineFormatted(fine);
                    return (
                      <TableRow
                        key={pagga._id}
                        sx={{
                          '&:hover': {
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                          },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                        <TableCell>{pagga.paggaNo}</TableCell>
                        <TableCell>{pagga.weight}</TableCell>
                        <TableCell>{pagga.touch}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{roundedFine}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleAddEditPagga(pagga)}
                            sx={{ color: '#10b981', '&:hover': { background: '#d1fae5' } }}
                          >
                            <AddIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {editAvailablePagga.filter(pagga => !editCurrentPagga.some(current => current._id === pagga._id)).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          No available pagga to add
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditModalOpen(false)} sx={{ color: '#6366f1' }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSalesInvoice}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca 0%, #be185d 100%)',
                },
              }}
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default SalesInvoice;

// Add thermal printer styles
const thermalStyle = document.createElement('style');
thermalStyle.textContent = `
  @media print {
    @page {
      size: 80mm auto;
      margin: 2mm;
    }

    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      margin: 0;
      padding: 0;
    }

    .MuiContainer-root {
      max-width: 80mm !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Hide elements that shouldn't be printed */
    button, .MuiButton-root, .MuiIconButton-root, .MuiTabs-root, .MuiPagination-root,
    .MuiAutocomplete-root, .MuiTextField-root, .MuiFormControl-root,
    .no-print, .MuiDialog-root {
      display: none !important;
    }

    /* Table print styles */
    table {
      width: 100% !important;
      font-size: 14pt !important;
      border-collapse: collapse !important;
    }

    thead {
      display: table-header-group;
    }

    th {
      font-size: 15pt !important;
      padding: 2px !important;
      border-bottom: 1px solid #000 !important;
      background: #f0f0f0 !important;
    }

    td {
      padding: 2px !important;
      border-bottom: 1px solid #ccc !important;
      font-size: 14pt !important;
    }

    tr {
      page-break-inside: avoid;
    }

    /* Typography */
    h1, h2, h3, h4, h5, h6 {
      margin: 2px 0 !important;
      font-size: 16pt !important;
    }

    p, span, div {
      font-size: 14pt !important;
    }
  }
`;
document.head.appendChild(thermalStyle);
