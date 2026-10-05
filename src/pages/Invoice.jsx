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
  LinearProgress,
  Alert,
  Divider,
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
  HourglassEmpty as PendingIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import partyService from '../services/partyService';
import invoiceService from '../services/invoiceService';
import saudaService from '../services/saudaService';
import { printInvoiceThermal, printInvoiceBluetooth, isBluetoothSupported } from '../utils/thermalPrinter';
import { roundOffFine, roundOffFineFormatted } from '../utils/roundOff';
import { gradients } from '../theme';

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [selectedPartyName, setSelectedPartyName] = useState('');
  const [partySaudaSummary, setPartySaudaSummary] = useState(null);
  const [excessFineModalOpen, setExcessFineModalOpen] = useState(false);
  const [isEditingExcess, setIsEditingExcess] = useState(false);
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
    { id: 4, paggaNo: '', weight: '', touch: '' },
  ]);
  // Kachi pending saudas state
  const [pendingKachiGroups, setPendingKachiGroups] = useState([]);
  const [loadingKachiPending, setLoadingKachiPending] = useState(false);
  const [expandedKachiGroups, setExpandedKachiGroups] = useState({});
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [editingInvoice, setEditingInvoice] = useState(null);
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
        const response = await partyService.getParties({ limit: 1000 });
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
    const fetchPendingKachi = async () => {
      if (!selectedPartyId) {
        setPendingKachiGroups([]);
        return;
      }
      setLoadingKachiPending(true);
      try {
        const response = await saudaService.getPartyPendingKachiSaudas(selectedPartyId, 'purchase');
        setPendingKachiGroups(response?.groups || response?.data?.groups || []);
      } catch (error) {
        console.error('Error fetching pending kachi:', error);
      } finally {
        setLoadingKachiPending(false);
      }
    };
    fetchPendingKachi();
  }, [selectedPartyId]);

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
  const handlePaggaCountChange = (value) => {
    if (value === '') {
      setPaggaCount('');
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 50) {
      setPaggaCount(num);
      setItems((prevItems) => {
        const newItems = [];
        for (let i = 1; i <= num; i++) {
          const existingItem = prevItems.find((item) => item.id === i);
          newItems.push(existingItem || { id: i, paggaNo: '', weight: '', touch: '', fine: '' });
        }
        return newItems;
      });
    }
  };

  const handleInputChange = (id, field, value) => {
    const updatedItems = items.map((item) => {
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
    setItems(updatedItems);
    setPaggaCount(updatedItems.length);
  };

  const handleKeyDown = (id, field, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = items.findIndex((item) => item.id === id);

      if (field === 'paggaNo') {
        const weightInput = document.getElementById(`weight-${id}`);
        if (weightInput) weightInput.focus();
      } else if (field === 'weight') {
        const touchInput = document.getElementById(`touch-${id}`);
        if (touchInput) touchInput.focus();
      } else if (field === 'touch') {
        const nextRowId = items[currentIndex + 1]?.id;
        if (nextRowId) {
          const nextPaggaNoInput = document.getElementById(`paggaNo-${nextRowId}`);
          if (nextPaggaNoInput) nextPaggaNoInput.focus();
        } else {
          setItems((prev) => {
            const newId = prev.length + 1;
            const newItems = [...prev, { id: newId, paggaNo: '', weight: '', touch: '', fine: '' }];
            setPaggaCount(newItems.length);
            setTimeout(() => {
              const newPaggaNoInput = document.getElementById(`paggaNo-${newId}`);
              if (newPaggaNoInput) newPaggaNoInput.focus();
            }, 100);
            return newItems;
          });
        }
      }
    }
  };

  const handleRemovePagga = (id) => {
    setItems((prev) => {
      if (prev.length <= 1) return prev;
      const updatedItems = prev.filter((item) => item.id !== id).map((item, idx) => ({
        ...item,
        id: idx + 1,
      }));
      setPaggaCount(updatedItems.length);
      return updatedItems;
    });
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    const pId = invoice.partyId?._id ? String(invoice.partyId._id) : (invoice.partyId ? String(invoice.partyId) : '');
    const pName = invoice.partyId?.partyName || invoice.partyName || '';
    setSelectedPartyId(pId);
    setSelectedPartyName(pName);
    setInvoiceDate(invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : today);

    if (pId && pName) {
      setParties((prev) => {
        if (!prev.some((p) => String(p._id) === String(pId))) {
          return [{ _id: pId, partyName: pName }, ...prev];
        }
        return prev;
      });
    }

    const existingItems = (invoice.items || []).map((item, idx) => {
      const weight = item.weight != null ? String(item.weight) : '';
      const touch = item.touch != null ? String(item.touch) : '';
      let fine = '';
      if (weight && touch) {
        fine = roundOffFineFormatted(parseFloat(weight) * (parseFloat(touch) / 100));
      } else if (item.fine != null) {
        fine = roundOffFineFormatted(item.fine);
      }
      return {
        id: idx + 1,
        paggaNo: item.paggaNo || '',
        weight,
        touch,
        fine,
      };
    });

    const finalItems = existingItems.length > 0 ? existingItems : [
      { id: 1, paggaNo: '', weight: '', touch: '', fine: '' },
      { id: 2, paggaNo: '', weight: '', touch: '', fine: '' },
      { id: 3, paggaNo: '', weight: '', touch: '', fine: '' },
      { id: 4, paggaNo: '', weight: '', touch: '', fine: '' },
    ];
    setItems(finalItems);
    setPaggaCount(finalItems.length);

    if (pId) {
      fetchPartySaudaSummary(pId);
    } else {
      setPartySaudaSummary(null);
    }
    setFormError('');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateInvoice = async () => {
    const toastId = toast.loading('Updating invoice...');
    try {
      setFormError('');
      if (!selectedPartyId) {
        toast.dismiss(toastId);
        setFormError('Please select a party');
        return;
      }

      if (!paggaCount || paggaCount <= 0) {
        toast.dismiss(toastId);
        setFormError('Pagga count must be greater than 0');
        return;
      }

      for (const item of items) {
        const hasPaggaNo = item.paggaNo && String(item.paggaNo).trim() !== '';
        const hasWeight = item.weight && String(item.weight).trim() !== '';
        const touchStr = String(item.touch || '').trim();
        const hasTouch = touchStr !== '';
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

      const filledPaggaItems = items.filter(item =>
        item.paggaNo && String(item.paggaNo).trim() !== '' &&
        item.weight && String(item.weight).trim() !== '' &&
        item.touch && String(item.touch).trim() !== ''
      );

      if (filledPaggaItems.length === 0) {
        toast.dismiss(toastId);
        setFormError('Please fill at least one pagga item with Pagga No, Weight, and Touch');
        return;
      }

      const newTotalFine = filledPaggaItems.reduce((total, item) => {
        const weight = parseFloat(item.weight) || 0;
        const touch = parseFloat(item.touch) || 0;
        const fine = weight * touch / 100;
        return total + roundOffFine(fine);
      }, 0);

      // Check if not return invoice and fine exceeds available pending purchase fine
      if (!editingInvoice?.isReturn) {
        const oldTotalFine = (editingInvoice.items || []).reduce((total, item) => {
          const weight = parseFloat(item.weight) || 0;
          const touch = parseFloat(item.touch) || 0;
          const fine = weight * touch / 100;
          return total + roundOffFine(fine);
        }, 0);
        const oldBhavcutWeight = Number(editingInvoice.bhavcutSaudaId?.quantity || 0);
        const oldNormalCut = Math.max(0, oldTotalFine - oldBhavcutWeight);

        const currentPartyRemaining = Number(partySaudaSummary?.purchase?.remaining || 0);
        const effectiveAvailable = currentPartyRemaining + oldNormalCut;

        if (newTotalFine > effectiveAvailable) {
          toast.dismiss(toastId);
          const excess = roundOffFine(newTotalFine - effectiveAvailable);
          setExcessFine(excess);
          setExcessWeight(excess.toFixed(2));
          setExcessRate(editingInvoice.bhavcutSaudaId?.rate ? String(editingInvoice.bhavcutSaudaId.rate) : '');
          setIsEditingExcess(true);
          setExcessFineModalOpen(true);
          return;
        }
      }

      const invoiceData = {
        partyId: selectedPartyId,
        invoiceDate: invoiceDate,
        invoiceNo: editingInvoice.invoiceNo,
        paggaItems: filledPaggaItems,
      };
      await invoiceService.updateInvoiceDetails(editingInvoice._id || editingInvoice.id, invoiceData);
      const params = { page, limit };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterPartyId) params.partyId = filterPartyId;
      const response = await invoiceService.getInvoices(params);
      setInvoices(response?.invoices || response || []);
      handleBackToList();
      toast.dismiss(toastId);
      toast.success('Invoice updated successfully!');
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.dismiss(toastId);
      toast.error('Failed to update invoice. Please try again.');
    }
  };

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
      const params = { page, limit };
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
    setItems((prev) => {
      const newItems = [...prev, { id: prev.length + 1, paggaNo: '', weight: '', touch: '', fine: '' }];
      setPaggaCount(newItems.length);
      return newItems;
    });
  };

  const fetchPartySaudaSummary = async (partyId) => {
    try {
      const response = await partyService.getPartySaudaSummary(partyId);
      setPartySaudaSummary(response?.data || {});
    } catch (error) {
      console.error('Error fetching party sauda summary:', error);
      setPartySaudaSummary({});
    }
  };

  const handleExcessFineSubmit = async () => {
    const toastId = toast.loading(isEditingExcess ? 'Updating invoice...' : 'Saving invoice...');
    try {
      setFormError('');
      if (!excessWeight || !excessRate) {
        toast.dismiss(toastId);
        setFormError('Please fill weight and rate');
        return;
      }

      const filledPaggaItems = items.filter(item =>
        item.paggaNo && String(item.paggaNo).trim() !== '' &&
        item.weight && String(item.weight).trim() !== '' &&
        item.touch && String(item.touch).trim() !== ''
      );

      if (isEditingExcess) {
        const invoiceData = {
          partyId: selectedPartyId,
          invoiceDate: invoiceDate,
          invoiceNo: editingInvoice?.invoiceNo,
          paggaItems: filledPaggaItems,
          bhavcut: {
            weight: Number(excessWeight),
            rate: Number(excessRate),
            amount: excessFine
          }
        };
        await invoiceService.updateInvoiceDetails(editingInvoice._id || editingInvoice.id, invoiceData);
        const params = { page, limit };
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;
        if (filterPartyId) params.partyId = filterPartyId;
        const response = await invoiceService.getInvoices(params);
        setInvoices(response?.invoices || response || []);
        handleBackToList();
        handleCloseExcessFineModal();
        toast.dismiss(toastId);
        toast.success('Invoice updated successfully!');
        return;
      }

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
      const createdRes = await invoiceService.createInvoice(invoiceData);
      const createdInvoice = createdRes?.data?.invoice || createdRes?.invoice || createdRes;
      const params = { page, limit };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterPartyId) params.partyId = filterPartyId;
      const response = await invoiceService.getInvoices(params);
      let invoiceList = [];
      if (Array.isArray(response)) {
        invoiceList = response;
      } else if (response && Array.isArray(response.invoices)) {
        invoiceList = response.invoices;
      } else if (response && Array.isArray(response.data)) {
        invoiceList = response.data;
      }
      setInvoices(invoiceList);
      if (createdInvoice) {
        if (!createdInvoice.partyId || typeof createdInvoice.partyId !== 'object') {
          createdInvoice.partyId = { _id: selectedPartyId, partyName: selectedPartyName };
        }
        if (!createdInvoice.items || createdInvoice.items.length === 0) {
          createdInvoice.items = filledPaggaItems;
        }
        handleShareWhatsApp(createdInvoice, true);
      }
      handleBackToList();
      handleCloseExcessFineModal();
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
    setIsEditingExcess(false);
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
    handleBackToList();
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setShowAddForm(false);
    setEditingInvoice(null);
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
    setPartySaudaSummary(null);
    setPendingKachiGroups([]);
    setFormError('');
    setIsEditingExcess(false);
  };

  const handleSaveInvoice = async () => {
    const toastId = toast.loading('Saving invoice...');
    try {
      setFormError('');
      if (!paggaCount || paggaCount <= 0) {
        toast.dismiss(toastId);
        setFormError('Pagga count must be greater than 0');
        return;
      }
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
      const totalFine = items.reduce((total, item) => {
        const weight = parseFloat(item.weight) || 0;
        const touch = parseFloat(item.touch) || 0;
        const fine = weight * touch / 100;
        return total + roundOffFine(fine);
      }, 0);
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
      const createdRes = await invoiceService.createInvoice(invoiceData);
      const createdInvoice = createdRes?.data?.invoice || createdRes?.invoice || createdRes;
      const params = { page, limit };
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;
      if (filterPartyId) params.partyId = filterPartyId;
      const response = await invoiceService.getInvoices(params);
      let invoiceList = [];
      if (Array.isArray(response)) {
        invoiceList = response;
      } else if (response && Array.isArray(response.invoices)) {
        invoiceList = response.invoices;
      } else if (response && Array.isArray(response.data)) {
        invoiceList = response.data;
      }
      setInvoices(invoiceList);
      if (createdInvoice) {
        if (!createdInvoice.partyId || typeof createdInvoice.partyId !== 'object') {
          createdInvoice.partyId = { _id: selectedPartyId, partyName: selectedPartyName };
        }
        if (!createdInvoice.items || createdInvoice.items.length === 0) {
          createdInvoice.items = filledPaggaItems;
        }
        handleShareWhatsApp(createdInvoice, true);
      }
      handleBackToList();
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
    const itemCount = invoice.items?.filter(item => item.paggaNo || item.weight || item.touch || item.fine).length || 0;
    const itemHeight = itemCount * 6;
    const headerHeight = 44;
    const footerHeight = 28;
    const requiredHeight = headerHeight + itemHeight + footerHeight + 20;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, Math.max(requiredHeight, 50)],
    });

    const totalGrossWeight = invoice.items?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2);
    const totalFine = invoice.items?.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const touch = parseFloat(item.touch) || 0;
      const fine = weight * touch / 100;
      return total + roundOffFine(fine);
    }, 0).toFixed(2);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BR JEWELLERS', 40, 10, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Incoming Invoice', 40, 16, { align: 'center' });

    doc.line(5, 18, 75, 18);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Party: ${invoice.partyId?.partyName || invoice.partyName || '-'}`, 5, 24);
    doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : 'N/A'}`, 5, 30);
    doc.text(`Invoice No: ${invoice.invoiceNo || 'INV-' + String(invoice.id).padStart(4, '0')}`, 5, 36);

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

    doc.line(5, yPosition, 75, yPosition);
    yPosition += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Fine: ${totalFine}g`, 5, yPosition);
    doc.text(`Gross Wt: ${totalGrossWeight}g`, 5, yPosition + 6);
    
    doc.line(5, yPosition + 16, 75, yPosition + 16);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your business!', 40, yPosition + 22, { align: 'center' });
    
    const partyName = invoice?.partyId?.partyName || invoice?.partyName || 'invoice';
    doc.save(`${partyName}-${invoice?.invoiceNo || 'unknown'}.pdf`);
  };

  const handleShareWhatsApp = (invoice, shouldDownloadPdf = true) => {
    if (!invoice) return;
    if (shouldDownloadPdf) {
      try {
        handlePrintInvoice(invoice);
      } catch (err) {
        console.error('Error generating PDF for WhatsApp:', err);
      }
    }

    const party = (invoice.partyId && typeof invoice.partyId === 'object') ? invoice.partyId : {};
    const partyName = party.partyName || invoice.partyName || selectedPartyName || '-';
    let contactNo = party.contactNo || '';
    if (!contactNo && parties.length > 0) {
      const pId = party._id || invoice.partyId;
      const found = parties.find(p => String(p._id) === String(pId));
      if (found && found.contactNo) contactNo = found.contactNo;
    }

    const invNo = invoice.invoiceNo || 'INV-' + String(invoice.id || invoice._id || '').slice(-4);
    const invDate = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

    const itemsList = (invoice.items || []).filter(item => item && (item.paggaNo || item.weight || item.touch || item.fine));
    const totalPaggas = itemsList.length;

    let totalGrossWt = 0;
    let totalFine = 0;

    const paggaRows = itemsList.map((item, idx) => {
      const weight = parseFloat(item.weight) || 0;
      const touch = parseFloat(item.touch) || 0;
      const fine = item.fine != null ? parseFloat(item.fine) : (weight * touch / 100);
      totalGrossWt += weight;
      totalFine += roundOffFine(fine);
      return `${idx + 1}. *#${item.paggaNo || '-'}* | Wt: ${weight.toFixed(2)}g | Touch: ${touch.toFixed(2)}% | Fine: ${roundOffFineFormatted(fine)}g`;
    }).join('\n');

    let msg = `*BR JEWELLERS*\n`;
    msg += `--------------------------------\n`;
    msg += `📥 *INCOMING KACHI PURCHASE INVOICE*\n`;
    msg += `*Party:* ${partyName}\n`;
    msg += `*Invoice No:* ${invNo}\n`;
    msg += `*Date:* ${invDate}\n`;
    msg += `--------------------------------\n`;
    if (paggaRows) {
      msg += `📦 *PAGGA DETAILS:*\n${paggaRows}\n`;
      msg += `--------------------------------\n`;
    }
    msg += `📊 *SUMMARY:*\n`;
    msg += `🔹 *Total Paggas:* ${totalPaggas}\n`;
    msg += `🔹 *Total Gross Wt:* ${totalGrossWt.toFixed(2)} g\n`;
    msg += `🔹 *Total Fine:* ${totalFine.toFixed(2)} g\n`;
    if (invoice.bhavcutSaudaId || invoice.bhavcut) {
      const bc = invoice.bhavcutSaudaId || invoice.bhavcut;
      const bcWt = bc.quantity || bc.weight || 0;
      const bcRate = bc.rate || 0;
      if (bcWt > 0) {
        msg += `🔹 *Bhav Cut:* ${bcWt} g @ ₹${Number(bcRate).toLocaleString('en-IN')}\n`;
      }
    }
    msg += `--------------------------------\n`;
    msg += `_Invoice PDF has been generated._\n`;
    msg += `Thank you for your business! 🙏`;

    let cleanPhone = String(contactNo).replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const whatsappUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;

    window.open(whatsappUrl, '_blank');
  };

  const currentPartyValue = selectedPartyId
    ? parties.find((p) => String(p._id) === String(selectedPartyId)) ||
      partySearchResults.find((p) => String(p._id) === String(selectedPartyId)) ||
      (editingInvoice?.partyId && String(editingInvoice.partyId?._id || editingInvoice.partyId) === String(selectedPartyId)
        ? {
            _id: String(selectedPartyId),
            partyName: editingInvoice.partyId?.partyName || editingInvoice.partyName || selectedPartyName || '',
          }
        : null) ||
      (selectedPartyName ? { _id: String(selectedPartyId), partyName: selectedPartyName } : null)
    : null;

  const partyOptions = React.useMemo(() => {
    const list = partySearchQuery ? partySearchResults : parties;
    if (currentPartyValue && currentPartyValue._id) {
      const exists = list.some((p) => String(p._id) === String(currentPartyValue._id));
      if (!exists) {
        return [currentPartyValue, ...list];
      }
    }
    return list;
  }, [partySearchQuery, partySearchResults, parties, currentPartyValue]);

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 1,
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

      {!showAddForm && (
        <>
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

          <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
                border: '1px solid', borderColor: 'divider',
              }}
            >
              {/* Filters — always visible */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="From Date"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#818cf8' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="To Date"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#818cf8' },
                        '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Autocomplete
                    loading={false}
                    fullWidth
                    options={partySearchQuery ? partySearchResults : parties}
                    getOptionLabel={(option) => option.partyName || ''}
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    value={parties.find((p) => p._id === filterPartyId) || null}
                    onChange={(e, newValue) => {
                      setFilterPartyId(newValue?._id || '');
                      setPartySearchQuery('');
                      setPage(1);
                    }}
                    onInputChange={(event, newInputValue, reason) => {
                      if (reason === 'input') setPartySearchQuery(newInputValue);
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
                            '&:hover fieldset': { borderColor: '#818cf8' },
                            '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 2 },
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
                      '&:hover': { borderColor: '#4338ca', background: 'rgba(99, 102, 241, 0.1)' },
                    }}
                  >
                    Reset Filters
                  </Button>
                </Grid>
              </Grid>

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: { xs: 800, sm: '100%' } }}>
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
                      <TableCell sx={{ color: '#fff', fontWeight: 600, width: '100px' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                          No invoices found. Use filters above or click "Add Invoice" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoices.map((invoice, index) => (
                        <TableRow key={invoice._id || index}>
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
                              sx={{ bgcolor: 'rgba(219, 234, 254, 0.15)', color: '#1e40af', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {invoice.items?.reduce((total, item) => total + (parseFloat(item.weight) || 0), 0).toFixed(2)} g
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#ec4899' }}>
                            {invoice.items?.reduce((total, item) => {
                              const weight = parseFloat(item.weight) || 0;
                              const touch = parseFloat(item.touch) || 0;
                              return total + roundOffFine(weight * touch / 100);
                            }, 0).toFixed(2)} g
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View">
                              <IconButton size="small" onClick={() => handleViewInvoice(invoice)}
                                sx={{ color: '#6366f1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleEditInvoice(invoice)}
                                sx={{ color: '#6366f1', '&:hover': { background: 'rgba(99, 102, 241, 0.1)' } }}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download PDF">
                              <IconButton size="small" onClick={() => handlePrintInvoice(invoice)}
                                sx={{ color: '#10b981', '&:hover': { background: 'rgba(16, 185, 129, 0.1)' } }}>
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Send on WhatsApp">
                              <IconButton size="small" onClick={() => handleShareWhatsApp(invoice, true)}
                                sx={{ color: '#25D366', '&:hover': { background: 'rgba(37, 211, 102, 0.1)' } }}>
                                <WhatsAppIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print">
                              <IconButton size="small" onClick={() => handleBluetoothPrintInvoice(invoice)}
                                sx={{ color: '#3b82f6', '&:hover': { background: 'rgba(59, 130, 246, 0.1)' } }}>
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  sx={{ '& .MuiPaginationItem-root': { fontWeight: 600 } }}
                />
              </Box>
            </Paper>
        </>
      )}

      {showAddForm && (
        <>
          <Paper
            elevation={3}
            sx={{
              p: { xs: 1.5, sm: 3 },
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
              border: '1px solid', borderColor: 'divider',
              mb: { xs: 2, md: 4 },
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {editingInvoice ? `Edit Invoice: ${editingInvoice.invoiceNo || ''}` : 'Create New Invoice'}
                </Typography>
                {editingInvoice && (
                  <Chip label={`Invoice #${editingInvoice.invoiceNo || ''}`} color="primary" size="small" variant="outlined" />
                )}
              </Box>
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
            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={editingInvoice ? 3 : 4}>
                <Autocomplete
                  loading={false}
                  fullWidth
                  sx={{ minWidth: { md: '200px' } }}
                  options={partyOptions}
                  getOptionLabel={(option) => option?.partyName || ''}
                  isOptionEqualToValue={(option, value) => {
                    if (!option || !value) return false;
                    return String(option._id || option.id || '') === String(value._id || value.id || '');
                  }}
                  value={currentPartyValue}
                  onChange={(event, newValue) => {
                    setSelectedPartyId(newValue?._id ? String(newValue._id) : '');
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
                {pendingKachiGroups.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, mt: 1 }}>
                      <PendingIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Pending Kachi Saudas
                      </Typography>
                      {loadingKachiPending && (
                        <LinearProgress sx={{ width: 80, ml: 1, borderRadius: 2 }} />
                      )}
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      {pendingKachiGroups.map((group) => {
                        const groupKey = `${group.saudaType}`;
                        const isExpanded = expandedKachiGroups[groupKey];
                        const deliveredPct = group.totalQuantity > 0
                          ? Math.round((group.totalDelivered / group.totalQuantity) * 100)
                          : 0;
                        const isBuy = group.saudaType === 'purchase';
                        const cardColor = isBuy ? '#f59e0b' : '#3b82f6';

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
                                    {isBuy ? '🛒 Purchase (Kachi)' : '💰 Sales (Kachi)'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                    {group.saudas.length} sauda{group.saudas.length > 1 ? 's' : ''} pending
                                  </Typography>
                                </Box>
                                {/* Cross status badge */}
                                {group.saudas.some(s => s.status === 'cross') && (
                                  <Chip label="Cross" color="warning" size="small" sx={{ ml: 1, backgroundColor: 'rgba(255,165,0,0.2)', color: '#fff' }} />
                                )}
                                {/* Remaining quantity chip */}
                                <Chip
                                  label={`${group.totalRemaining} g remaining`}
                                  size="small"
                                  sx={{
                                    background: 'rgba(255,255,255,0.25)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    backdropFilter: 'blur(4px)',
                                    ml: 2,
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
                                  setExpandedKachiGroups((prev) => ({
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
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Sauda No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Qty (g)</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Delivered</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Remaining</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Rate</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Status</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {group.saudas.map((s) => (
                                        <TableRow key={s._id} sx={{ '&:hover': { background: `${cardColor}11` } }}>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, fontWeight: 600, color: cardColor }}>#{s.saudaNo}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>
                                            {s.saudaDate ? new Date(s.saudaDate).toLocaleDateString('en-GB') : '-'}
                                          </TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{s.quantity}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#10b981', fontWeight: 600 }}>{s.delivered}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#ef4444', fontWeight: 700 }}>{s.remaining}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{s.rate || '-'}</TableCell>
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
                  </Grid>
                )}
                {selectedPartyId && !loadingKachiPending && pendingKachiGroups.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1, mb: 1, borderRadius: 2 }}>
                      Is party ke koi pending kachi saudas nahi hain!
                    </Alert>
                  </Grid>
                )}
              {editingInvoice && (
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Invoice No"
                    value={editingInvoice.invoiceNo || ''}
                    InputProps={{ readOnly: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={editingInvoice ? 3 : 4}>
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
              <Grid item xs={12} sm={6} md={editingInvoice ? 3 : 4}>
                <TextField
                  fullWidth
                  label="Pagga Count"
                  type="text"
                  value={paggaCount}
                  onChange={(e) => handlePaggaCountChange(e.target.value)}
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
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 1 }}>
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

            <TableContainer sx={{ overflowX: 'auto', '& .MuiTable-root': { minWidth: { xs: 600, sm: 'auto' } } }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ background: gradients.primary }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '50px' }}>Sr No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 600, width: '60px' }}>Action</TableCell>
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

            <Box
              sx={{
                mt: { xs: 1.5, sm: 3 },
                p: { xs: 1.5, sm: 3 },
                background: 'rgba(99, 102, 241, 0.04)',
                borderRadius: 2,
                border: '1px solid', borderColor: 'divider',
              }}
            >
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    Total Net Weight
                  </Typography>
                  <Typography
                    variant={{ xs: 'h6', sm: 'h4' }}
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
                    variant={{ xs: 'h6', sm: 'h4' }}
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
                    onClick={editingInvoice ? handleUpdateInvoice : handleSaveInvoice}
                    disabled={!selectedPartyId}
                    sx={{
                      background: gradients.successDark,
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                      '&:hover': {
                        background: gradients.successDarkHover,
                      },
                    }}
                  >
                    {editingInvoice ? 'Update Invoice' : 'Save Invoice'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </>
      )}

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

              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'text.primary' }}>
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
          <Button
            startIcon={<WhatsAppIcon />}
            onClick={() => handleShareWhatsApp(selectedInvoice, true)}
            sx={{ color: '#25D366' }}
          >
            WhatsApp
          </Button>
          <Button onClick={handleCloseViewModal} sx={{ color: '#6366f1' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>



      <Dialog open={showReturnForm} onClose={handleCloseReturnForm} maxWidth="lg" fullWidth sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}>
        <DialogTitle>Purchase Return Invoice</DialogTitle>
        <DialogContent>
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
                fullWidth
                sx={{ minWidth: { md: '200px' } }}
                options={partySearchQuery ? partySearchResults : parties}
                getOptionLabel={(option) => option.partyName || ''}
                isOptionEqualToValue={(option, value) => option?._id === value?._id}
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
