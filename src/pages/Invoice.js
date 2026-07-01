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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Collapse,
  Tooltip,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Print as PrintIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Bluetooth as BluetoothIcon,
  AssignmentReturn as AssignmentReturnIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import partyService from '../services/partyService';
import invoiceService from '../services/invoiceService';
import { printInvoiceThermal, printInvoiceBluetooth, isBluetoothSupported } from '../utils/thermalPrinter';
import { roundOffFine, roundOffFineFormatted } from '../utils/roundOff';
import { gradients } from '../theme';

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedPartyName, setSelectedPartyName] = useState('');
  const [partySaudaSummary, setPartySaudaSummary] = useState(null);
  const [excessFineModalOpen, setExcessFineModalOpen] = useState(false);
  const [excessWeight, setExcessWeight] = useState('');
  const [excessRate, setExcessRate] = useState('');
  const [excessFine, setExcessFine] = useState(0);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [parties, setParties] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [paggaCount, setPaggaCount] = useState(4);
  const [items, setItems] = useState([
    { id: 1, paggaNo: '', weight: '', touch: '', fine: '' },
    { id: 2, paggaNo: '', weight: '', touch: '', fine: '' },
    { id: 3, paggaNo: '', weight: '', touch: '', fine: '' },
    { id: 4, paggaNo: '', weight: '', touch: '', fine: '' },
  ]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [editPartyId, setEditPartyId] = useState('');
  const [editInvoiceDate, setEditInvoiceDate] = useState('');
  const [editInvoiceNo, setEditInvoiceNo] = useState('');
  const [editCurrentPagga, setEditCurrentPagga] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterPartyId, setFilterPartyId] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnInvoice, setReturnInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnPartyId, setReturnPartyId] = useState('');
  const [returnPartyName, setReturnPartyName] = useState('');
  const [returnCheckedPagga, setReturnCheckedPagga] = useState({});
  const [returnSelectAll, setReturnSelectAll] = useState(false);
  const [returnAvailablePagga, setReturnAvailablePagga] = useState([]);
  const [returnInvoiceDate, setReturnInvoiceDate] = useState('');

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

    const fetchInvoices = async () => {
      try {
        const params = {
          page,
          limit,
        };
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;
        if (filterPartyId) params.partyId = filterPartyId;

        const response = await invoiceService.getInvoices(params);

        console.log("Invoices Response:", response);

        // Handle response structure: response.invoices and response.pagination
        let invoiceList = [];
        if (response && Array.isArray(response.invoices)) {
          invoiceList = response.invoices;
        } else if (Array.isArray(response)) {
          invoiceList = response;
        } else if (response && Array.isArray(response.data)) {
          invoiceList = response.data;
        }

        setInvoices(invoiceList);
        setTotalPages(response?.pagination?.totalPages || response?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setInvoices([]);
      }
    };

    fetchParties();
    fetchInvoices();
  }, [filterStartDate, filterEndDate, filterPartyId, page, limit]);

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
    const updateItems = () => {
      const newItems = [];
      for (let i = 1; i <= paggaCount; i++) {
        const existingItem = items.find(item => item.id === i);
        newItems.push(existingItem || { id: i, paggaNo: '', weight: '', touch: '', fine: '' });
      }
      setItems(newItems);
    };

    updateItems();
  }, [paggaCount]);

  const handleInputChange = (id, field, value) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };

        if (field === 'touch') {
          // Format touch as XX.XX
          let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
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
        // Move to weight field
        const weightInput = document.getElementById(`weight-${id}`);
        if (weightInput) weightInput.focus();
      } else if (field === 'weight') {
        // Move to touch field
        const touchInput = document.getElementById(`touch-${id}`);
        if (touchInput) touchInput.focus();
      } else if (field === 'touch') {
        // Move to next row's paggaNo or add new row
        const nextRowId = items[currentIndex + 1]?.id;
        if (nextRowId) {
          const nextPaggaNoInput = document.getElementById(`paggaNo-${nextRowId}`);
          if (nextPaggaNoInput) nextPaggaNoInput.focus();
        } else {
          // Add new pagga row
          setPaggaCount(paggaCount + 1);
          // Focus on the new row's paggaNo after a short delay
          setTimeout(() => {
            const newId = paggaCount + 1;
            const newPaggaNoInput = document.getElementById(`paggaNo-${newId}`);
            if (newPaggaNoInput) newPaggaNoInput.focus();
          }, 100);
        }
      }
    }
  };

  const handleRemovePagga = (id) => {
    if (items.length > 1) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      setPaggaCount(updatedItems.length);
    }
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setEditPartyId(invoice.partyId?._id || invoice.partyId);
    setEditInvoiceDate(invoice.invoiceDate);
    setEditInvoiceNo(invoice.invoiceNo || '');

    // Set current pagga from the invoice
    setEditCurrentPagga(invoice.items || []);

    setEditModalOpen(true);
  };

  const handleRemoveEditPagga = (index) => {
    setEditCurrentPagga(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddEditPagga = () => {
    setEditCurrentPagga(prev => [...prev, { paggaNo: '', weight: '', touch: '', fine: '' }]);
  };

  const handleEditPaggaChange = (index, field, value) => {
    const updatedPagga = editCurrentPagga.map((pagga, i) => {
      if (i === index) {
        const updatedItem = { ...pagga, [field]: value };

        if (field === 'touch') {
          // Format touch as XX.XX
          let formattedValue = value.replace(/\D/g, '');
          if (formattedValue.length > 2) {
            formattedValue = formattedValue.slice(0, 2) + '.' + formattedValue.slice(2, 4);
          }
          updatedItem.touch = formattedValue;
        }

        if (field === 'weight' || field === 'touch') {
          const weight = field === 'weight' ? value : pagga.weight;
          const touch = field === 'touch' ? updatedItem.touch : pagga.touch;
          if (weight && touch) {
            const fine = parseFloat(weight) * (parseFloat(touch) / 100);
            updatedItem.fine = roundOffFineFormatted(fine);
          } else {
            updatedItem.fine = '';
          }
        }

        return updatedItem;
      }
      return pagga;
    });
    setEditCurrentPagga(updatedPagga);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingInvoice(null);
    setEditCurrentPagga([]);
    setEditPartyId('');
    setEditInvoiceDate('');
  };

  const handleEditItemChange = (id, field, value) => {
    const updatedItems = editItems.map((item) => {
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

  const handleUpdateInvoice = async () => {
    const toastId = toast.loading('Updating invoice...');
    try {
      if (!editPartyId) {
        toast.dismiss(toastId);
        toast.error('Please select a party');
        return;
      }

      const invoiceData = {
        partyId: editPartyId,
        invoiceDate: editInvoiceDate,
        invoiceNo: editInvoiceNo,
        paggaItems: editCurrentPagga,
      };

      await invoiceService.updateInvoiceDetails(editingInvoice._id || editingInvoice.id, invoiceData);

      // Refresh invoice list
      const params = {
        page,
        limit,
      };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterPartyId) params.partyId = filterPartyId;

      const response = await invoiceService.getInvoices(params);
      setInvoices(response?.invoices || response || []);

      handleCloseEditModal();
      toast.dismiss(toastId);
      toast.success('Invoice updated successfully!');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.dismiss(toastId);
      toast.error('Failed to update invoice. Please try again.');
    }
  };

  // Return functions
  const handleReturnInvoice = async (invoice) => {
    setReturnInvoice(invoice);
    setReturnItems(invoice.items?.map(item => ({
      ...item,
      returnQuantity: item.weight,
      returnTouch: item.touch,
      returnFine: item.weight * item.touch / 100
    })) || []);
    setReturnModalOpen(true);
  };

  const handleOpenReturnForm = async () => {
    setShowReturnForm(true);
    setReturnPartyId('');
    setReturnPartyName('');
    setReturnCheckedPagga({});
    setReturnSelectAll(false);
    setReturnInvoiceDate(new Date().toISOString().split('T')[0]);
    setReturnAvailablePagga([]);
  };

  const handleReturnFromInvoice = async (invoice) => {
    setShowReturnForm(true);
    setReturnPartyId(invoice.partyId?._id || invoice.partyId);
    setReturnPartyName(invoice.partyId?.partyName || invoice.partyName || '');
    setReturnCheckedPagga({});
    setReturnSelectAll(false);
    setReturnInvoiceDate(new Date().toISOString().split('T')[0]);
    setReturnAvailablePagga([]);
    if (invoice.partyId?._id || invoice.partyId) {
      try {
        const response = await invoiceService.getAvailablePagga(invoice.partyId?._id || invoice.partyId);
        setReturnAvailablePagga(response?.puggas || []);
      } catch (error) {
        console.error('Error fetching available pagga:', error);
        setReturnAvailablePagga([]);
      }
    }
  };

  const handleCloseReturnForm = () => {
    setShowReturnForm(false);
    setReturnPartyId('');
    setReturnPartyName('');
    setReturnCheckedPagga({});
    setReturnSelectAll(false);
    setReturnAvailablePagga([]);
  };

  const getReturnTotalFine = () => {
    return returnAvailablePagga.reduce((total, pagga) => {
      if (returnCheckedPagga[pagga._id]) {
        return total + (parseFloat(pagga.fine) || 0);
      }
      return total;
    }, 0).toFixed(2);
  };

  const handleReturnSelectAll = (event) => {
    const isChecked = event.target.checked;
    setReturnSelectAll(isChecked);
    const newCheckedPagga = {};
    returnAvailablePagga.forEach(pagga => {
      newCheckedPagga[pagga._id] = isChecked;
    });
    setReturnCheckedPagga(newCheckedPagga);
  };

  const handleReturnPaggaToggle = (paggaId) => {
    setReturnCheckedPagga(prev => ({
      ...prev,
      [paggaId]: !prev[paggaId]
    }));
    setReturnSelectAll(false);
  };

  const handleCloseReturnModal = () => {
    setReturnModalOpen(false);
    setReturnInvoice(null);
    setReturnItems([]);
  };

  const handleReturnQuantityChange = (index, value) => {
    const updatedItems = [...returnItems];
    updatedItems[index].returnQuantity = value;
    updatedItems[index].returnFine = value * updatedItems[index].returnTouch / 100;
    setReturnItems(updatedItems);
  };

  const handleSaveReturnInvoice = async () => {
    const toastId = toast.loading('Creating return invoice...');
    try {
      const selectedPaggaIds = Object.keys(returnCheckedPagga).filter(id => returnCheckedPagga[id]);

      if (selectedPaggaIds.length === 0) {
        toast.dismiss(toastId);
        toast.error('Please select at least one pagga');
        return;
      }

      const returnInvoiceData = {
        isReturn: true,
        partyId: returnPartyId,
        invoiceDate: returnInvoiceDate,
        puggaIds: selectedPaggaIds,
      };

      await invoiceService.createInvoice(returnInvoiceData);

      const params = {
        page,
        limit,
      };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterPartyId) params.partyId = filterPartyId;

      const response = await invoiceService.getInvoices(params);
      setInvoices(response?.invoices || response || []);

      handleCloseReturnForm();
      toast.dismiss(toastId);
      toast.success('Return invoice created successfully');
    } catch (error) {
      console.error('Error creating return invoice:', error);
      toast.dismiss(toastId);
      toast.error('Failed to create return invoice');
    }
  };

  const getTotalWeight = () => {
    return items.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2);
  };

  const getTotalFine = () => {
    return items.reduce((total, item) => total + (parseFloat(item.fine) || 0), 0).toFixed(2);
  };

  const handleAddPagga = () => {
    const newId = items.length + 1;
    setItems([...items, { id: newId, paggaNo: '', weight: '', touch: '', fine: '' }]);
    setPaggaCount(paggaCount + 1);
  };

  const fetchPartySaudaSummary = async (partyId) => {
    try {
      const response = await partyService.getPartySaudaSummary(partyId);
      console.log('Party Sauda Summary Response:', response);
      setPartySaudaSummary(response?.data || {});
    } catch (error) {
      console.error('Error fetching party sauda summary:', error);
      setPartySaudaSummary({});
    }
  };

  const handleExcessFineSubmit = async () => {
    const toastId = toast.loading('Saving invoice...');
    try {
      setFormError('');

      if (!excessWeight || !excessRate) {
        toast.dismiss(toastId);
        setFormError('Please fill weight and rate');
        return;
      }

      // Filter out empty pagga items
      const filledPaggaItems = items.filter(item =>
        item.paggaNo && item.paggaNo.trim() !== '' &&
        item.weight && item.weight.trim() !== '' &&
        item.touch && item.touch.trim() !== ''
      );

      const invoiceData = {
        partyId: selectedPartyId,
        invoiceDate: invoiceDate,
        paggaItems: filledPaggaItems,
        bhavcut: {
          weight: excessWeight,
          rate: excessRate,
          amount: excessFine
        }
      };

      await invoiceService.createInvoice(invoiceData);

      // Refresh invoice list from API
      const response = await invoiceService.getInvoices();
      let invoiceList = [];
      if (Array.isArray(response)) {
        invoiceList = response;
      } else if (response && Array.isArray(response.invoices)) {
        invoiceList = response.invoices;
      } else if (response && Array.isArray(response.data)) {
        invoiceList = response.data;
      }
      setInvoices(invoiceList);

      setSelectedPartyId('');
      setSelectedPartyName('');
      setInvoiceDate(today);
      setPaggaCount(4);
      setItems([
        { id: 1, paggaNo: '', weight: '', touch: '', fine: '' },
        { id: 2, paggaNo: '', weight: '', touch: '', fine: '' },
        { id: 3, paggaNo: '', weight: '', touch: '', fine: '' },
        { id: 4, paggaNo: '', weight: '', touch: '', fine: '' },
      ]);
      setShowAddForm(false);
      setFormError('');
      setExcessFineModalOpen(false);
      setExcessWeight('');
      setExcessRate('');
      setExcessFine(0);
      toast.dismiss(toastId);
      toast.success('Invoice created successfully');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setFormError('Failed to save invoice. Please try again.');
      toast.dismiss(toastId);
      toast.error('Failed to save invoice');
    }
  };

  const handleExcessRateChange = (value) => {
    // Remove commas for storage
    const cleanValue = value.replace(/,/g, '');
    setExcessRate(cleanValue);
  };

  const formatRate = (value) => {
    if (!value) return '';
    const numStr = value.toString();
    let lastThree = numStr.substring(numStr.length - 3);
    let otherNumbers = numStr.substring(0, numStr.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  };

  const handleCloseExcessFineModal = () => {
    setExcessFineModalOpen(false);
    setExcessWeight('');
    setExcessRate('');
    setExcessFine(0);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleShowAddForm = () => {
    setShowAddForm(true);
  };

  const handleBackToList = () => {
    setShowAddForm(false);
  };

  const handleSaveInvoice = async () => {
    const toastId = toast.loading('Saving invoice...');
    try {
      setFormError('');

      // Validation: Pagga count must be greater than 0
      if (!paggaCount || paggaCount <= 0) {
        toast.dismiss(toastId);
        setFormError('Pagga count must be greater than 0');
        return;
      }

      // Validation: If any one of paggaNo, weight, or touch is filled, all three are required
      for (const item of items) {
        const hasPaggaNo = item.paggaNo && item.paggaNo.trim() !== '';
        const hasWeight = item.weight && item.weight.trim() !== '';
        const hasTouch = item.touch && item.touch.trim() !== '';

        const hasAnyValue = hasPaggaNo || hasWeight || hasTouch;

        if (hasAnyValue) {
          if (!hasPaggaNo) {
            toast.dismiss(toastId);
            setFormError(`Row ${item.id}: Pagga No is required`);
            return;
          }
          if (!hasWeight) {
            toast.dismiss(toastId);
            setFormError(`Row ${item.id}: Weight is required`);
            return;
          }
          if (!hasTouch) {
            toast.dismiss(toastId);
            setFormError(`Row ${item.id}: Touch is required`);
            return;
          }
        }
      }

      // Filter out empty pagga items (only send items where all three fields are filled)
      const filledPaggaItems = items.filter(item =>
        item.paggaNo && item.paggaNo.trim() !== '' &&
        item.weight && item.weight.trim() !== '' &&
        item.touch && item.touch.trim() !== ''
      );

      if (filledPaggaItems.length === 0) {
        toast.dismiss(toastId);
        setFormError('Please fill at least one pagga item with Pagga No, Weight, and Touch');
        return;
      }

      // Calculate total fine from items
      const totalFine = items.reduce((total, item) => {
        const weight = parseFloat(item.weight) || 0;
        const touch = parseFloat(item.touch) || 0;
        const fine = weight * touch / 100;
        return total + roundOffFine(fine);
      }, 0);

      // Check if invoice fine exceeds remaining purchase fine
      const remainingPurchaseFine = partySaudaSummary?.purchase?.remaining || 0;
      if (totalFine > remainingPurchaseFine) {
        toast.dismiss(toastId);
        const excess = totalFine - remainingPurchaseFine;
        setExcessFine(excess);
        setExcessWeight(excess.toFixed(2));
        setExcessFineModalOpen(true);
        return;
      }

      const invoiceData = {
        partyId: selectedPartyId,
        invoiceDate: invoiceDate,
        paggaItems: filledPaggaItems,
      };

      await invoiceService.createInvoice(invoiceData);

      // Refresh invoice list from API
      const response = await invoiceService.getInvoices();
      let invoiceList = [];
      if (Array.isArray(response)) {
        invoiceList = response;
      } else if (response && Array.isArray(response.invoices)) {
        invoiceList = response.invoices;
      } else if (response && Array.isArray(response.data)) {
        invoiceList = response.data;
      }
      setInvoices(invoiceList);

      setSelectedPartyId('');
      setSelectedPartyName('');
      setInvoiceDate(today);
      setPaggaCount(4);
      setItems([
        { id: 1, paggaNo: '', weight: '', touch: '', fine: '' },
        { id: 2, paggaNo: '', weight: '', touch: '', fine: '' },
        { id: 3, paggaNo: '', weight: '', touch: '', fine: '' },
        { id: 4, paggaNo: '', weight: '', touch: '', fine: '' },
      ]);
      setShowAddForm(false);
      setFormError('');
      toast.dismiss(toastId);
      toast.success('Invoice created successfully');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setFormError('Failed to save invoice. Please try again.');
      toast.dismiss(toastId);
      toast.error('Failed to save invoice');
    }
  };

  const handleBluetoothPrintInvoice = async (invoice) => {
    const toastId = toast.loading('Printing invoice...');
    try {
      await printInvoiceBluetooth(invoice);
      toast.dismiss(toastId);
    } catch (error) {
      console.error('Print failed:', error);
      toast.dismiss(toastId);
      toast.error('Print failed: ' + (error.message || 'Printer not available'));
    }
  };

  const handlePrintInvoice = (invoice) => {
    // Calculate required height based on content
    const itemCount = invoice.items?.filter(item => item.paggaNo || item.weight || item.touch || item.fine).length || 0;
    const itemHeight = itemCount * 6; // 6mm per item
    const headerHeight = 44; // Header content
    const footerHeight = 28; // Footer content
    const requiredHeight = headerHeight + itemHeight + footerHeight + 20; // +20mm padding

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, Math.max(requiredHeight, 50)], // 80mm fixed width, dynamic height (min 50mm)
    });

    // Calculate totals first
    const totalGrossWeight = invoice.items?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2);
    const totalFine = invoice.items?.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const touch = parseFloat(item.touch) || 0;
      const fine = weight * touch / 100;
      return total + roundOffFine(fine);
    }, 0).toFixed(2);

    // Add header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BR BULLION', 40, 10, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Incoming Invoice', 40, 16, { align: 'center' });

    // Add separator line
    doc.line(5, 18, 75, 18);

    // Add party and date info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Party: ${invoice.partyId?.partyName || invoice.partyName || '-'}`, 5, 24);
    doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}`, 5, 30);
    doc.text(`Invoice No: ${invoice.invoiceNo || 'INV-' + String(invoice.id).padStart(4, '0')}`, 5, 36);

    // Add separator line
    doc.line(5, 38, 75, 38);

    // Add table header
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('Sr', 5, 44);
    doc.text('Pagga', 15, 44);
    doc.text('Wt(g)', 40, 44);
    doc.text('Touch', 50, 44);
    doc.text('Fine(g)', 62, 44);

    // Add separator line
    doc.line(5, 46, 75, 46);

    // Add items
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    let yPosition = 52;

    invoice.items?.forEach((item, index) => {
      if (item.paggaNo || item.weight || item.touch || item.fine) {
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
      }
    });

    // Add separator line
    doc.line(5, yPosition, 75, yPosition);
    yPosition += 6;

    // Add totals at the bottom
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Fine: ${totalFine}g`, 5, yPosition);
    doc.text(`Gross Wt: ${totalGrossWeight}g`, 5, yPosition + 6);
    
    // Add footer
    doc.line(5, yPosition + 16, 75, yPosition + 16);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 40, yPosition + 22, { align: 'center' });
    
    // Save PDF
    doc.save(`invoice-${invoice?.invoiceNo || 'unknown'}.pdf`);
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
            background: gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Invoice Management
        </Typography>
      </Box>

      {/* Invoice List - Show by default */}
      {!showAddForm && (
        <>
          {/* Invoice List */}
          {invoices.length > 0 ? (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
                border: '1px solid', borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Invoice List
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleShowAddForm}
                    sx={{
                      background: gradients.primary,
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                      '&:hover': {
                        background: gradients.primaryHover,
                        boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
                      },
                    }}
                  >
                    Add Invoice
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AssignmentReturnIcon />}
                    onClick={handleOpenReturnForm}
                    sx={{
                      ml: 2,
                      background: gradients.warning,
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                      '&:hover': {
                        background: gradients.warningHover,
                        boxShadow: '0 6px 16px rgba(245, 158, 11, 0.5)',
                      },
                    }}
                  >
                    Return Invoice
                  </Button>
                </Box>
              </Box>

              {/* Filters */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
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
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
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
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    loading={false}
                    sx={{ minWidth: { md: '200px' } }}
                    options={partySearchQuery ? partySearchResults : parties}
                    getOptionLabel={(option) => option.partyName || ''}
                    value={parties.find((p) => p._id === filterPartyId) || null}
                    onChange={(e, newValue) => {
                      setFilterPartyId(newValue?._id || '');
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
                        size="small"
                        fullWidth
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
                        background: 'rgba(99, 102, 241, 0.1)',
                      },
                    }}
                  >
                    Reset Filters
                  </Button>
                </Grid>
              </Grid>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: gradients.primary }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600, width: 50 }}>Sr No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Invoice No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Items</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Gross Weight (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Total Fine (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>View</TableCell>
                      {/* <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Edit</TableCell> */}
                      <TableCell sx={{ color: '#fff', fontWeight: 600, width: '100px' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice,index) => (
                      <TableRow
                        key={invoice.id}
                      >
                        <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{invoice.invoiceNo || 'INV-' + String(invoice.id).padStart(4, '0')}</TableCell>
                        <TableCell>{invoice?.partyId?.partyName || '-'}</TableCell>
                        <TableCell>{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.isReturn ? 'Return' : 'Purchase'}
                            size="small"
                            sx={{
                              bgcolor: invoice.isReturn ? 'rgba(254, 243, 199, 0.15)' : 'rgba(219, 234, 254, 0.15)',
                              color: invoice.isReturn ? '#92400e' : '#1e40af',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invoice.items?.length || 0}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(219, 234, 254, 0.15)',
                              color: '#1e40af',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {invoice.items?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2)} g
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#ec4899' }}>
                          {invoice.items?.reduce((total, item) => {
                            const weight = parseFloat(item.weight) || 0;
                            const touch = parseFloat(item.touch) || 0;
                            const fine = weight * touch / 100;
                            return total + roundOffFine(fine);
                          }, 0).toFixed(2)} g
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => handleViewInvoice(invoice)}
                              sx={{ color: '#6366f1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEditInvoice(invoice)}
                              sx={{ color: '#6366f1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        {/* </TableCell>
                        <TableCell> */}
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handlePrintInvoice(invoice)}
                              sx={{ color: '#10b981', '&:hover': { background: 'rgba(16, 185, 129, 0.1)' } }}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        {/* </TableCell>
                        <TableCell> */}
                          <Tooltip title="Print">
                            <IconButton
                              size="small"
                              onClick={() => handleBluetoothPrintInvoice(invoice)}
                              sx={{ color: '#3b82f6', '&:hover': { background: 'rgba(59, 130, 246, 0.1)' } }}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
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
            </Paper>
          ) : (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
                border: '1px solid', borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                No Invoices Found
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Click the "Add Invoice" button to create your first invoice.
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Create Invoice Form - Show when showAddForm is true */}
      {showAddForm && (
        <>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
              border: '1px solid', borderColor: 'divider',
              mb: 4,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Create New Invoice
              </Typography>
              <Button
                variant="outlined"
                onClick={handleBackToList}
                sx={{ color: '#6366f1', borderColor: '#6366f1' }}
              >
                ← Back to List
              </Button>
            </Box>
            {formError && (
              <Box sx={{ mb: 3, p: 2, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fecaca', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>
                  {formError}
                </Typography>
              </Box>
            )}
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Autocomplete
                  loading={false}
                  fullWidth
                  sx={{ minWidth: { md: '200px' } }}
                  options={partySearchQuery ? partySearchResults : parties}
                  getOptionLabel={(option) => option.partyName || ''}
                  value={parties.find(p => p._id === selectedPartyId) || null}
                  onChange={(event, newValue) => {
                    setSelectedPartyId(newValue?._id || '');
                    setSelectedPartyName(newValue?.partyName || '');
                    setFormError('');
                    setPartySearchQuery('');
                    if (newValue?._id) {
                      fetchPartySaudaSummary(newValue._id);
                    } else {
                      setPartySaudaSummary(null);
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
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Pagga Count"
                  type="text"
                  value={paggaCount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setPaggaCount('');
                    } else {
                      const num = parseInt(value);
                      if (!isNaN(num) && num >= 1 && num <= 50) {
                        setPaggaCount(num);
                      }
                    }
                  }}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1, max: 50 }}
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
              {partySaudaSummary && (
                <Grid item xs={12}>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ 
                      p: 2, 
                      background: gradients.successLight,
                      border: '1px solid #bbf7d0',
                      borderRadius: 2 
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#166534' }}>
                        Sauda Summary
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Remaining Sales Fine: <strong>{partySaudaSummary.sales?.remaining || 0}g</strong>
                        </Typography> */}
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Remaining Purchase Fine: <strong>{partySaudaSummary.purchase?.remaining || 0}g</strong>
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Pagga Table */}
          <Paper
            elevation={1}
            sx={{
              p: 1,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
              border: '1px solid', borderColor: 'divider',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  background: gradients.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Incoming Invoice Item Details
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPagga}
                size="small"
                sx={{
                  background: gradients.primary,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: gradients.primaryHover,
                  },
                }}
              >
                Add Pagga
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>{item.id}</TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          id={`paggaNo-${item.id}`}
                          value={item.paggaNo}
                          onChange={(e) => handleInputChange(item.id, 'paggaNo', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(item.id, 'paggaNo', e)}
                          placeholder="Enter Pagga No"
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
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="text"
                          id={`weight-${item.id}`}
                          value={item.weight}
                          onChange={(e) => handleInputChange(item.id, 'weight', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(item.id, 'weight', e)}
                          placeholder="0.00"
                          inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*', step: '0.01' }}
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
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="text"
                          id={`touch-${item.id}`}
                          value={item.touch}
                          onChange={(e) => handleInputChange(item.id, 'touch', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(item.id, 'touch', e)}
                          placeholder="00.00"
                          inputProps={{ maxLength: 5 }}
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
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size="small"
                          type="text"
                          value={item.fine}
                          InputProps={{
                            readOnly: true,
                          }}
                          sx={{
                            bgcolor: 'background.default',
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
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleRemovePagga(item.id)}
                          disabled={items.length === 1}
                          sx={{
                            color: '#ef4444',
                            '&:hover': {
                              background: 'rgba(239, 68, 68, 0.1)',
                            },
                            '&.Mui-disabled': {
                              color: '#d1d5db',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                    <TableCell sx={{ fontWeight: 700 }} colSpan={2}>
                      Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {getTotalWeight()} g
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      -
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {getTotalFine()} g
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Section */}
            <Box
              sx={{
                mt: 3,
                p: 3,
                background: 'rgba(99, 102, 241, 0.04)',
                borderRadius: 2,
                border: '1px solid', borderColor: 'divider',
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Total Net Weight
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#6366f1',
                    }}
                  >
                    {getTotalWeight()} g
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Total Fine
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: '#ec4899',
                    }}
                  >
                    {getTotalFine()} g
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveInvoice}
                    disabled={!selectedPartyId}
                    sx={{
                      background: gradients.successDark,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      '&:hover': {
                        background: gradients.successDarkHover,
                      },
                    }}
                  >
                    Save Invoice
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </>
      )}

      {/* View Invoice Modal */}
      <Dialog open={viewModalOpen} onClose={handleCloseViewModal} maxWidth="md" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}>
        <DialogTitle sx={{ background: gradients.primary, color: '#fff' }}>
          Invoice Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedInvoice && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Invoice No</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedInvoice.invoiceNo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Party Name</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedInvoice.partyName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Date</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedInvoice.invoiceDate ? new Date(selectedInvoice.invoiceDate).toLocaleDateString('en-GB') : '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Items</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{selectedInvoice.items?.length || 0}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                Pagga Details
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: gradients.primary }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedInvoice.items?.map((item, index) => {
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

              <Box sx={{ mt: 3, p: 2, background: 'rgba(99, 102, 241, 0.04)', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Gross Weight</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                      {selectedInvoice.items?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2)} g
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Total Fine</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#ec4899' }}>
                      {selectedInvoice.items?.reduce((total, item) => {
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

      {/* Edit Invoice Modal */}
      <Dialog open={editModalOpen} onClose={handleCloseEditModal} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}>
        <DialogTitle>Edit Invoice</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              fullWidth
              sx={{ minWidth: { md: '200px' } }}
              size="small"
              loading={false}
              options={parties}
              getOptionLabel={(option) => option.partyName || ''}
              value={parties.find((p) => p._id === editPartyId) || null}
              onChange={(e, newValue) => {
                setEditPartyId(newValue?._id || '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Party Name"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Invoice Date"
                type="date"
                value={editInvoiceDate}
                onChange={(e) => setEditInvoiceDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Invoice No"
                value={editInvoiceNo}
                onChange={(e) => setEditInvoiceNo(e.target.value)}
                size="small"
              />
            </Stack>
          </Stack>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Pagga Details
          </Typography>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddEditPagga}
              sx={{
                background: gradients.primary,
                '&:hover': {
                  background: gradients.primaryHover,
                },
              }}
            >
              Add Pagga
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: gradients.primary }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Sr No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, width: '80px' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editCurrentPagga.map((item, index) => (
                  <TableRow
                    key={index}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="text"
                        value={item.paggaNo}
                        onChange={(e) => handleEditPaggaChange(index, 'paggaNo', e.target.value)}
                        placeholder="Enter Pagga No"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="text"
                        value={item.weight}
                        onChange={(e) => handleEditPaggaChange(index, 'weight', e.target.value)}
                        placeholder="0.00"
                        inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*', step: '0.01' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="text"
                        value={item.touch}
                        onChange={(e) => handleEditPaggaChange(index, 'touch', e.target.value)}
                        placeholder="00.00"
                        inputProps={{ maxLength: 5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="text"
                        value={item.fine}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveEditPagga(index)}
                        sx={{ color: '#ef4444', '&:hover': { background: 'rgba(239, 68, 68, 0.1)' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {editCurrentPagga.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No pagga in this invoice. Click "Add Pagga" to add.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseEditModal} sx={{ color: '#6366f1' }}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateInvoice}
            variant="contained"
            sx={{
              background: gradients.successDark,
              '&:hover': {
                background: gradients.successDarkHover,
              },
            }}
          >
            Update Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Form Modal */}
      <Dialog open={showReturnForm} onClose={handleCloseReturnForm} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}>
        <DialogTitle>Purchase Return Invoice</DialogTitle>
        <DialogContent>
          {/* Total Fine Display */}
          <Box
            sx={{
              mb: 3,
              p: 3,
              background: gradients.warning,
              borderRadius: 2,
              color: '#fff',
            }}
          >
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
              Total Fine of Selected Pagga
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {getReturnTotalFine()} g
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                loading={false}
                sx={{ minWidth: { md: '200px' } }}
                options={partySearchQuery ? partySearchResults : parties}
                getOptionLabel={(option) => option.partyName || ''}
                value={parties.find(p => p._id === returnPartyId) || null}
                onChange={(event, newValue) => {
                  setReturnPartyId(newValue?._id || '');
                  setReturnPartyName(newValue?.partyName || '');
                  setReturnCheckedPagga({});
                  setReturnSelectAll(false);
                  if (newValue?._id) {
                    invoiceService.getAvailablePagga(newValue._id)
                      .then(response => setReturnAvailablePagga(response?.puggas || []))
                      .catch(error => {
                        console.error('Error fetching available pagga:', error);
                        setReturnAvailablePagga([]);
                      });
                  } else {
                    setReturnAvailablePagga([]);
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
                    label="Party Name"
                    size="small"
                    fullWidth
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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Invoice Date"
                type="date"
                value={returnInvoiceDate}
                onChange={(e) => setReturnInvoiceDate(e.target.value)}
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

          {returnAvailablePagga.length > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{
                  mt: 4,
                  mb: 2,
                  fontWeight: 700,
                  background: gradients.warning,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Available Pagga for Return
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={returnSelectAll}
                          onChange={handleReturnSelectAll}
                          sx={{
                            color: '#f59e0b',
                            '&.Mui-checked': {
                              color: '#f59e0b',
                            },
                          }}
                        />
                      }
                      label="Select All"
                    />
                  </Grid>
                </Grid>
              </Box>

              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: gradients.warning }}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={returnSelectAll}
                          onChange={handleReturnSelectAll}
                          sx={{
                            color: '#fff',
                            '&.Mui-checked': {
                              color: '#fff',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {returnAvailablePagga.map((pagga, index) => (
                      <TableRow
                        key={pagga._id}
                        sx={{
                          '&:hover': {
                            background: gradients.warningRowHover,
                          },
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={returnCheckedPagga[pagga._id] || false}
                            onChange={() => handleReturnPaggaToggle(pagga._id)}
                            sx={{
                              color: '#f59e0b',
                              '&.Mui-checked': {
                                color: '#f59e0b',
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                        <TableCell>{pagga.paggaNo}</TableCell>
                        <TableCell>{pagga.weight}</TableCell>
                        <TableCell>{pagga.touch}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {pagga.fine}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseReturnForm} sx={{ color: '#6366f1' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveReturnInvoice}
            variant="contained"
            sx={{
              background: gradients.warning,
              '&:hover': {
                background: gradients.warningHover,
              },
            }}
          >
            Create Return Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Excess Fine Modal */}
      <Dialog open={excessFineModalOpen} onClose={handleCloseExcessFineModal} maxWidth="sm" fullWidth>
        <DialogTitle>Bhav Cuts</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ color: '#dc2626' }}>
              Invoice fine exceeds remaining purchase fine by <strong>{excessFine.toFixed(2)}g</strong>
            </Typography>
            <TextField
              fullWidth
              label="Weight (g)"
              type="number"
              value={excessWeight}
              disabled
              size="small"
            />
            <TextField
              fullWidth
              label="Rate"
              type="text"
              value={formatRate(excessRate)}
              onChange={(e) => handleExcessRateChange(e.target.value)}
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExcessFineModal} sx={{ color: '#6366f1' }}>
            Cancel
          </Button>
          <Button
            onClick={handleExcessFineSubmit}
            variant="contained"
            sx={{
              background: gradients.successDark,
              '&:hover': {
                background: gradients.successDarkHover,
              },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Invoice;

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
document.head.appendChild(thermalStyle);
