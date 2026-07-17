import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  TablePagination,
  Stack,
} from '@mui/material';
import {
  Print as PrintIcon,
  FilterList as FilterIcon,
  RestartAlt as ResetIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  SwapHoriz as SwapHorizIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import reportService from '../services/reportService';
import partyService from '../services/partyService';
import pakkiService from '../services/pakkiService';
import { gradients } from '../theme';
import { useThemeMode } from '../context/ThemeContext';
import { roundOffFineFormatted } from '../utils/roundOff';

const Reports = () => {
  const { mode } = useThemeMode();
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [partyTotals, setPartyTotals] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [currentChorsaStock, setCurrentChorsaStock] = useState(0);
  
  // Single Date Filter - Defaults to Today
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchParties();
    fetchChorsaStock();
  }, []);

  const fetchChorsaStock = async () => {
    try {
      const stock = await pakkiService.getPakkiStock(reportDate);
      setCurrentChorsaStock(stock?.chorsaStock || 0);
    } catch (error) {
      console.error('Error fetching chorsa stock:', error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportDate, selectedParty]);

  const fetchParties = async () => {
    try {
      const response = await partyService.getParties();
      setParties(response?.data?.parties || []);
    } catch (error) {
      console.error('Error fetching parties:', error);
      toast.error('Failed to load parties');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (reportDate) params.date = reportDate;
      if (selectedParty) params.partyId = selectedParty._id;

      const data = await reportService.getReportSummary(params);
      setRecords(data?.records || []);
      setPartyTotals(data?.partyTotals || []);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report summary');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setPage(0);
    fetchReport();
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    setReportDate(today);
    setSelectedParty(null);
    setPage(0);
    setLoading(true);
    reportService.getReportSummary({ date: today })
      .then((data) => {
        setRecords(data?.records || []);
        setPartyTotals(data?.partyTotals || []);
      })
      .catch((error) => {
        console.error('Error fetching report:', error);
        toast.error('Failed to load report summary');
      })
      .finally(() => setLoading(false));
  };

  // Pagination Handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // KPI Calculations
  const totalKachiBuy = records.reduce((sum, r) => sum + r.kachiBuyFine, 0);
  const totalKachiSell = records.reduce((sum, r) => sum + r.kachiSellFine, 0);
  
  const totalExchangeKachi = records.reduce((sum, r) => sum + r.exchangeKachiFine, 0);
  const totalExchangeBadla = records.reduce((sum, r) => sum + r.exchangeBadlaWeight, 0);
  const totalExchangeGiven = records.reduce((sum, r) => sum + r.exchangeGivenSilver, 0);

  const totalChorsaBuy = records.reduce((sum, r) => sum + r.chorsaBuyWeight, 0);
  const totalChorsaSell = records.reduce((sum, r) => sum + r.chorsaSellWeight, 0);

  const totalBankBuy = records.reduce((sum, r) => sum + r.bankBuyWeight, 0);
  const totalBankSell = records.reduce((sum, r) => sum + r.bankSellWeight, 0);

  // PDF Print report
  const handlePrintReport = () => {
    if (records.length === 0) {
      toast.error('No report data to print');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add border & header styling
    doc.setFillColor(79, 70, 229); // primary color Indigo
    doc.rect(0, 0, 297, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BR BULLION', 15, 10);
    doc.setFontSize(10);
    doc.text('Daily Transaction Summary Report (Grouped by Party)', 15, 17);

    // Filter info on PDF
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    // Formatting date
    const dateFormatted = reportDate ? new Date(reportDate).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    doc.text(`Date: ${dateFormatted}`, 15, 32);
    if (selectedParty) {
      doc.text(`Filtered Party: ${selectedParty.partyName}`, 15, 37);
    }

    // Table Header (Removed Date column, widened Party Name column)
    const headers = [
      'Party Name', 'Kachi Buy', 'Kachi Sell', 
      'Exch. Kachi', 'Exch. Badla', 'Silver Given', 
      'Chorsa Buy', 'Chorsa Sell', 'Bank Buy', 'Bank Sell'
    ];

    let yPosition = 45;
    
    // Draw Header Row
    doc.setFillColor(243, 244, 246);
    doc.rect(10, yPosition, 277, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    
    const colWidths = [52, 25, 25, 25, 25, 25, 25, 25, 25, 25];
    const colPositions = [];
    let currentX = 10;
    colWidths.forEach((width) => {
      colPositions.push(currentX);
      currentX += width;
    });

    headers.forEach((h, index) => {
      doc.text(h, colPositions[index] + 2, yPosition + 5);
    });

    yPosition += 7;

    // Draw Data Rows
    doc.setFont('helvetica', 'normal');
    records.forEach((r, idx) => {
      if (yPosition > 190) {
        doc.addPage();
        // Draw Header on new page
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 297, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('BR BULLION - Transaction Report Summary', 15, 10);
        
        yPosition = 25;
        doc.setFillColor(243, 244, 246);
        doc.rect(10, yPosition, 277, 7, 'F');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        headers.forEach((h, i) => {
          doc.text(h, colPositions[i] + 2, yPosition + 5);
        });
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
      }

      // Zebra striping
      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(10, yPosition, 277, 6, 'F');
      }

      const rowValues = [
        r.partyName,
        `${roundOffFineFormatted(r.kachiBuyFine)}g`,
        `${roundOffFineFormatted(r.kachiSellFine)}g`,
        `${roundOffFineFormatted(r.exchangeKachiFine)}g`,
        `${roundOffFineFormatted(r.exchangeBadlaWeight)}g`,
        `${roundOffFineFormatted(r.exchangeGivenSilver)}g`,
        `${roundOffFineFormatted(r.chorsaBuyWeight)}g`,
        `${roundOffFineFormatted(r.chorsaSellWeight)}g`,
        `${roundOffFineFormatted(r.bankBuyWeight)}g`,
        `${roundOffFineFormatted(r.bankSellWeight)}g`
      ];

      doc.setTextColor(80, 80, 80);
      rowValues.forEach((val, i) => {
        doc.text(String(val), colPositions[i] + 2, yPosition + 4.5);
      });
      yPosition += 6;
    });

    // Draw Totals Row
    doc.line(10, yPosition, 287, yPosition);
    doc.setFillColor(243, 244, 246);
    doc.rect(10, yPosition, 277, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    const totals = [
      'Total Summary',
      `${roundOffFineFormatted(totalKachiBuy)}g`,
      `${roundOffFineFormatted(totalKachiSell)}g`,
      `${roundOffFineFormatted(totalExchangeKachi)}g`,
      `${roundOffFineFormatted(totalExchangeBadla)}g`,
      `${roundOffFineFormatted(totalExchangeGiven)}g`,
      `${roundOffFineFormatted(totalChorsaBuy)}g`,
      `${roundOffFineFormatted(totalChorsaSell)}g`,
      `${roundOffFineFormatted(totalBankBuy)}g`,
      `${roundOffFineFormatted(totalBankSell)}g`
    ];

    totals.forEach((t, i) => {
      doc.text(t, colPositions[i] + 2, yPosition + 5);
    });

    yPosition += 15;
    
    // Add Chorsa Stock Info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Chorsa 999 (Pakki) Daily Stock Summary:', 15, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    
    const impact = totalChorsaBuy - totalChorsaSell - totalExchangeGiven;
    const openingStock = currentChorsaStock - impact;
    
    const openingStr = `Opening Stock (kal ka bacha hua): ${roundOffFineFormatted(openingStock)}g`;
    const impactStr = `Today's Impact (Buy - Sell - Silver Given): ${impact > 0 ? '+' : ''}${roundOffFineFormatted(impact)}g`;
    const stockStr = `Total Closing Stock Available: ${roundOffFineFormatted(currentChorsaStock)}g`;
    
    doc.text(openingStr, 20, yPosition);
    yPosition += 6;
    doc.text(impactStr, 20, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(stockStr, 20, yPosition);

    doc.autoPrint();
    const pdfBlob = doc.output('blob');
    const blobURL = URL.createObjectURL(pdfBlob);

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobURL;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(blobURL);
        }, 1500);
      }, 100);
    };

    toast.success('Print dialog opened successfully!');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 5, px: { xs: 2, sm: 3 } }}>
      {/* Title Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <AssessmentIcon fontSize="large" sx={{ color: '#4f46e5' }} />
            Daily Summary Reports
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Grouped by party for a selected transaction date
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PrintIcon />}
          onClick={handlePrintReport}
          sx={{
            background: gradients.primary,
            borderRadius: 2,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            '&:hover': {
              background: gradients.primaryLight,
            },
          }}
        >
          Print PDF Report
        </Button>
      </Box>

      {/* Filters Card */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2.5} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Select Date *"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
                size="small"
                options={parties}
                getOptionLabel={(option) => option.partyName || ''}
                value={selectedParty}
                onChange={(event, newValue) => setSelectedParty(newValue)}
                renderInput={(params) => <TextField {...params} label="Search Party" />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  onClick={handleReset}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={handleFilter}
                  fullWidth
                  sx={{
                    background: gradients.primary,
                    borderRadius: 2,
                    '&:hover': { background: gradients.primaryLight },
                  }}
                >
                  Filter
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Kachi card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '6px solid #4f46e5', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Kachi (Invoices)</Typography>
                <ShoppingCartIcon sx={{ color: '#4f46e5', opacity: 0.8 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Buy: {roundOffFineFormatted(totalKachiBuy)}g
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Sell: {roundOffFineFormatted(totalKachiSell)}g
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Exchange Badla Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '6px solid #10b981', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Metal Exchange</Typography>
                <SwapHorizIcon sx={{ color: '#10b981', opacity: 0.8 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Kachi: {roundOffFineFormatted(totalExchangeKachi)}g
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Badla: {roundOffFineFormatted(totalExchangeBadla)}g | Given: {roundOffFineFormatted(totalExchangeGiven)}g
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Chorsa card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '6px solid #f59e0b', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Chorsa 999 (Pakki)</Typography>
                <TrendingUpIcon sx={{ color: '#f59e0b', opacity: 0.8 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                Buy: {roundOffFineFormatted(totalChorsaBuy)}g
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#ef4444', mt: 0.5 }}>
                Sell: {roundOffFineFormatted(totalChorsaSell)}g
              </Typography>
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #e5e7eb' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                  Opening Stock: {roundOffFineFormatted(currentChorsaStock - (totalChorsaBuy - totalChorsaSell - totalExchangeGiven))}g
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: totalChorsaBuy - totalChorsaSell - totalExchangeGiven >= 0 ? '#10b981' : '#ef4444' }}>
                  Today's Impact: {(totalChorsaBuy - totalChorsaSell - totalExchangeGiven) > 0 ? '+' : ''}{roundOffFineFormatted(totalChorsaBuy - totalChorsaSell - totalExchangeGiven)}g
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#f59e0b', mt: 0.5 }}>
                  Closing Stock: {roundOffFineFormatted(currentChorsaStock)}g
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, borderLeft: '6px solid #ec4899', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Bank 9999 (Pakki)</Typography>
                <TrendingUpIcon sx={{ color: '#ec4899', opacity: 0.8 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Buy: {roundOffFineFormatted(totalBankBuy)}g
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Sell: {roundOffFineFormatted(totalBankSell)}g
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Visual Chart - Party Wise Custom Chart */}
      {partyTotals.length > 0 && (
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
            border: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Party-Wise Transactions Breakdown
            </Typography>
            <Grid container spacing={3}>
              {partyTotals.slice(0, 6).map((pt) => {
                 const maxVal = Math.max(
                  pt.kachiBuyFine + pt.kachiSellFine,
                  pt.chorsaBuyWeight + pt.chorsaSellWeight,
                  pt.bankBuyWeight + pt.bankSellWeight,
                  1
                );
                
                const kachiPct = Math.min(((pt.kachiBuyFine + pt.kachiSellFine + pt.exchangeKachiFine) / maxVal) * 100, 100);
                const chorsaPct = Math.min(((pt.chorsaBuyWeight + pt.chorsaSellWeight) / maxVal) * 100, 100);
                const bankPct = Math.min(((pt.bankBuyWeight + pt.bankSellWeight) / maxVal) * 100, 100);

                return (
                  <Grid item xs={12} md={6} key={pt.partyId}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        background: mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        border: '1px solid',
                        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#4f46e5' }}>
                        {pt.partyName}
                      </Typography>
                      
                      {/* Kachi Bar */}
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Kachi / Exchange (g)</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {(pt.kachiBuyFine + pt.kachiSellFine + pt.exchangeKachiFine).toFixed(1)}g
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative', bgcolor: mode==='dark' ? '#333' : '#e0e0e0' }}>
                          <Box sx={{ width: `${kachiPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #4f46e5)', borderRadius: 4, transition: 'width 1s ease-in-out' }} />
                        </Box>
                      </Box>

                      {/* Chorsa Bar */}
                      <Box sx={{ mb: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Chorsa 999 (g)</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {(pt.chorsaBuyWeight + pt.chorsaSellWeight).toFixed(1)}g
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative', bgcolor: mode==='dark' ? '#333' : '#e0e0e0' }}>
                          <Box sx={{ width: `${chorsaPct}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: 4, transition: 'width 1s ease-in-out' }} />
                        </Box>
                      </Box>

                      {/* Bank Bar */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>Bank 9999 (g)</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {(pt.bankBuyWeight + pt.bankSellWeight).toFixed(1)}g
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', position: 'relative', bgcolor: mode==='dark' ? '#333' : '#e0e0e0' }}>
                          <Box sx={{ width: `${bankPct}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899, #db2777)', borderRadius: 4, transition: 'width 1s ease-in-out' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Date-Wise Detailed Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
          border: mode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Party Name</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#4f46e5' }}>Kachi Buy</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#4f46e5' }}>Kachi Sell</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#10b981' }}>Exch. Kachi</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#10b981' }}>Exch. Badla</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#10b981' }}>Silver Given</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#f59e0b' }}>Chorsa Buy</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#f59e0b' }}>Chorsa Sell</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#ec4899' }}>Bank Buy</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#ec4899' }}>Bank Sell</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>Loading reports summary...</Typography>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>No records found for current filters.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              records
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((r, idx) => (
                  <TableRow
                    key={`${r.partyId}_${idx}`}
                    hover
                    sx={{
                      '&:hover': {
                        background: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{r.partyName}</TableCell>
                    <TableCell align="right">{r.kachiBuyFine > 0 ? `${roundOffFineFormatted(r.kachiBuyFine)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.kachiSellFine > 0 ? `${roundOffFineFormatted(r.kachiSellFine)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.exchangeKachiFine > 0 ? `${roundOffFineFormatted(r.exchangeKachiFine)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.exchangeBadlaWeight > 0 ? `${roundOffFineFormatted(r.exchangeBadlaWeight)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.exchangeGivenSilver > 0 ? `${roundOffFineFormatted(r.exchangeGivenSilver)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.chorsaBuyWeight > 0 ? `${roundOffFineFormatted(r.chorsaBuyWeight)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.chorsaSellWeight > 0 ? `${roundOffFineFormatted(r.chorsaSellWeight)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.bankBuyWeight > 0 ? `${roundOffFineFormatted(r.bankBuyWeight)}g` : '-'}</TableCell>
                    <TableCell align="right">{r.bankSellWeight > 0 ? `${roundOffFineFormatted(r.bankSellWeight)}g` : '-'}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={records.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Container>
  );
};

export default Reports;
