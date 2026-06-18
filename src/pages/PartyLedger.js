import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
  Chip,
  Collapse,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import partyService from '../services/partyService';
import { printPartyLedger } from '../utils/thermalPrinter';

const PartyLedger = () => {
  const [selectedParty, setSelectedParty] = useState(null);
  const [parties, setParties] = useState([]);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partySearchResults, setPartySearchResults] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ledgerData, setLedgerData] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

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
          const result = response?.data || response;
          setPartySearchResults(result?.parties || result || []);
        } catch (error) {
          console.error('Error searching parties:', error);
        }
      } else {
        setPartySearchResults(parties);
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [partySearchQuery, parties]);

  const handleFetchLedger = async () => {
    if (!selectedParty) return;
    const toastId = toast.loading('Fetching ledger...');
    try {
      const response = await partyService.getPartyLedger(selectedParty._id, startDate, endDate);
      const data = response?.data || response;

      console.log(data)
      setLedgerData(data);
      toast.dismiss(toastId);
      toast.success('Ledger loaded successfully');
    } catch (error) {
      console.error('Error fetching ledger:', error);
      toast.dismiss(toastId);
      toast.error('Failed to load ledger');
    }
  };

  const toggleRow = (index) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const entries = ledgerData?.entries || [];
  const summary = ledgerData?.summary || {};
  const party = ledgerData?.party || {};
  const pendingSaudas = ledgerData?.pendingSaudas || [];

  const handlePrint = async () => {
    const toastId = toast.loading('Printing ledger...');
    try {
      await printPartyLedger(party, entries, summary, pendingSaudas, startDate, endDate);
      toast.dismiss(toastId);
      toast.success('Ledger printed successfully');
    } catch (error) {
      console.error('Print failed:', error);
      toast.dismiss(toastId);
      toast.error('Failed to print ledger');
    }
  };

  const openingBalance = Math.trunc(party?.openingBalance || 0);
  let totalDebit = openingBalance > 0 ? openingBalance : 0;
  let totalCredit = openingBalance < 0 ? Math.abs(openingBalance) : 0;

  const getDebitAmount = (entry) => {
    if (entry.type === 'payment') {
      return entry.paymentType === 'incoming' ? Math.trunc(entry.amount || 0) : 0;
    }
    if (entry.type === 'incoming') {
      return entry.saudaCuts?.reduce((s, c) => s + Math.trunc(c.cutFine * c.rate / 1000), 0) || 0;
    }
    if (entry.type === 'crosscut') {
      return entry.creditDebitType === 'debit' ? Math.trunc(entry.totalProfitLoss || 0) : 0;
    }
    return 0;
  };

  const getCreditAmount = (entry) => {
    if (entry.type === 'payment') {
      return entry.paymentType === 'outgoing' ? Math.trunc(entry.amount || 0) : 0;
    }
    if (entry.type === 'sales') {
      return entry.saudaCuts?.reduce((s, c) => s + Math.trunc(c.cutFine * c.rate / 1000), 0) || 0;
    }
    if (entry.type === 'crosscut') {
      return entry.creditDebitType === 'credit' ? Math.trunc(entry.totalProfitLoss || 0) : 0;
    }
    return 0;
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, color: '#6366f1' }}>
          Party Ledger
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              fullWidth
              options={partySearchQuery ? partySearchResults : parties}
              getOptionLabel={(option) => option.partyName || ''}
              value={selectedParty}
              onChange={(event, newValue) => {
                setSelectedParty(newValue);
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
                  label="Select Party"
                  variant="outlined"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFetchLedger}
              disabled={!selectedParty}
              sx={{
                height: '56px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              }}
            >
              Fetch
            </Button>
          </Grid>
          {ledgerData && (
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={handlePrint}
                sx={{
                  height: '56px',
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                }}
              >
                <PrintIcon />
              </Button>
            </Grid>
          )}
        </Grid>

        {ledgerData && entries.length > 0 && (
          <TableContainer component={Paper} elevation={1}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Debit</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Credit</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Balance</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, width: 50 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ background: '#f5f5f5' }}>
                  <TableCell>-</TableCell>
                  <TableCell><strong>Opening Balance</strong></TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{openingBalance > 0 ? openingBalance : '-'}</TableCell>
                  <TableCell>{openingBalance < 0 ? Math.abs(openingBalance) : '-'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{Math.trunc(totalDebit - totalCredit)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                  {entries.map((entry, idx) => (
                    <React.Fragment key={idx}>
                      <TableRow key={idx}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>
                        <Chip label={entry.type} size="small" color={entry.type === 'incoming' ? 'primary' : entry.type === 'payment' ? 'success' : entry.type === 'crosscut' ? 'warning' : 'secondary'} sx={{ mr: 1 }} />
                        {entry.type === 'payment' ? entry.paymentNo : entry.type === 'crosscut' ? `${entry.targetSaudaNo} (${entry.targetSaudaType})` : entry.invoiceNo}
                      </TableCell>
                      <TableCell>{entry.type === 'payment' ? '-' : (entry.type === 'crosscut' ? `${entry.details?.reduce((sum, d) => sum + (d.crosscutQuantity || 0), 0)} g` : (entry.totalFine?.toFixed(2) + ' g'))}</TableCell>
                      <TableCell>
                        {entry.type === 'payment'
                          ? (entry.paymentType === 'incoming' ? Math.trunc(entry.amount || 0) : '-')
                          : (entry.type === 'incoming' ? (entry.saudaCuts?.reduce((s, c) => s + Math.trunc(c.cutFine * c.rate / 1000), 0) || 0) : (entry.type === 'crosscut' ? (entry.creditDebitType === 'debit' ? Math.trunc(entry.totalProfitLoss || 0) : '-') : '-'))
                        }
                      </TableCell>
                      <TableCell>
                        {entry.type === 'payment'
                          ? (entry.paymentType === 'outgoing' ? Math.trunc(entry.amount || 0) : '-')
                          : (entry.type === 'sales' ? (entry.saudaCuts?.reduce((s, c) => s + Math.trunc(c.cutFine * c.rate / 1000), 0) || 0) : (entry.type === 'crosscut' ? (entry.creditDebitType === 'credit' ? Math.trunc(entry.totalProfitLoss || 0) : '-') : '-'))
                        }
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {(() => {
                          const debit = getDebitAmount(entry);
                          const credit = getCreditAmount(entry);
                          totalDebit += debit;
                          totalCredit += credit;
                          return Math.trunc(totalDebit - totalCredit);
                        })()}
                      </TableCell>
                      <TableCell>
                        {(entry.saudaCuts?.length > 0 || entry.type === 'crosscut') && (
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleRow(idx); }}>
                            {expandedRows[idx] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                    {(entry.saudaCuts?.length > 0 || entry.type === 'crosscut') && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
                          <Collapse in={expandedRows[idx]}>
                            <Box sx={{ p: 2, background: '#f8fafc' }}>
                              {entry.type === 'crosscut' ? (
                                <>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Cross Cut Details</Typography>
                                  <Grid container spacing={2}>
                                    {entry.details?.map((detail, i) => (
                                      <Grid item xs={4} key={i}>
                                        <Box sx={{ p: 2, background: '#fff', borderRadius: 1, border: '1px solid #e2e8f0', height: '100%' }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>Source: {detail.sourceSaudaNo} ({detail.sourceSaudaType})</Typography>
                                          <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                              <Typography variant="body2" sx={{ color: '#64748b' }}>Qty:</Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{detail.crosscutQuantity} g</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                              <Typography variant="body2" sx={{ color: '#64748b' }}>Source Rate:</Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{detail.sourceRate?.toLocaleString('en-IN')}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                              <Typography variant="body2" sx={{ color: '#64748b' }}>Target Rate:</Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{detail.targetRate?.toLocaleString('en-IN')}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                              <Typography variant="body2" sx={{ color: '#64748b' }}>P/L:</Typography>
                                              <Typography variant="body2" sx={{ fontWeight: 600, color: detail.profitLoss >= 0 ? '#10b981' : '#ef4444' }}>
                                                ₹{detail.profitLoss?.toLocaleString('en-IN')}
                                              </Typography>
                                            </Grid>
                                          </Grid>
                                        </Box>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </>
                              ) : (
                                <>
                                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Sauda Cuts</Typography>
                                  <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Sauda No</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Booking Qty</TableCell>
                                    <TableCell>Delivered</TableCell>
                                    <TableCell>Rate</TableCell>
                                    <TableCell>Cut Fine</TableCell>
                                    <TableCell>Remaining Fine</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Bhav Cut</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {entry.saudaCuts.map((cut, i) => {
                                    const remainingFine = cut.quantity - (cut.delivered || 0);
                                    return (
                                      <TableRow key={i}>
                                        <TableCell>{cut.saudaNo}</TableCell>
                                        <TableCell>{formatDate(cut.saudaDate)}</TableCell>
                                        <TableCell>{cut.quantity}</TableCell>
                                        <TableCell>{(parseFloat(cut.delivered) || 0).toFixed(2)}</TableCell>
                                        <TableCell>{cut.rate}</TableCell>
                                        <TableCell>{(parseFloat(cut.cutFine) || 0).toFixed(2)}</TableCell>
                                        <TableCell>{remainingFine.toFixed(2)}</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }}>{Math.trunc(cut.cutFine * (cut.rate / 1000))}</TableCell>
                                        <TableCell>
                                          {cut.isBhavCut === true ? (
                                            <Chip label="Bhav Cut" size="small" color="error" />
                                          ) : (
                                            <Typography variant="body2" sx={{ color: '#64748b' }}>false</Typography>
                                          )}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                                </>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}

          {ledgerData && pendingSaudas.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#6366f1' }}>
                Pending Saudas
              </Typography>
              <TableContainer component={Paper} elevation={1}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sauda No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Quantity</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Delivered</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Rate</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pending Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingSaudas.map((sauda, i) => (
                      <TableRow key={i}>
                        <TableCell>{sauda.saudaNo}</TableCell>
                        <TableCell>
                          <Chip 
                            label={sauda.saudaType || '-'} 
                            size="small" 
                            color={sauda.saudaType === 'purchase' ? 'primary' : sauda.saudaType === 'sales' ? 'success' : 'default'} 
                          />
                        </TableCell>
                        <TableCell>{formatDate(sauda.saudaDate)}</TableCell>
                        <TableCell>{sauda.quantity}</TableCell>
                        <TableCell>{(parseFloat(sauda.delivered) || 0).toFixed(2)}</TableCell>
                        <TableCell>{sauda.rate}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{(parseFloat(sauda.pendingQty) || 0).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {ledgerData && (
            <Box sx={{ mt: 4, p: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#6366f1' }}>
                Closing Balance
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>Balance</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: (totalDebit - totalCredit) < 0 ? '#ef4444' : '#10b981' }}>{Math.trunc(totalDebit - totalCredit)}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {selectedParty && !ledgerData && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Select date range and click Fetch to view ledger
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PartyLedger;

const printStyle = document.createElement('style');
printStyle.textContent = `
  @media print {
    @page {
      size: A4;
      margin: 14mm 5mm 12mm 5mm;
      @top-center { content: "Party Ledger"; font-size: 9pt; border-bottom: 1px solid #000; padding-bottom: 2px; }
      @bottom-center { content: "Page " counter(page); font-size: 8pt; }
    }
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0; padding: 0; }
    .no-print, button, .MuiButton-root, .MuiIconButton-root, .MuiAutocomplete-root, .MuiTextField-root, .MuiDialog-root { display: none !important; }
    .MuiContainer-root { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
    table { font-size: 9pt !important; width: 100% !important; border-collapse: collapse !important; }
    thead { display: table-header-group; }
    th { font-size: 9pt !important; padding: 2px !important; border: 1px solid #000 !important; background: none !important; }
    td { font-size: 9pt !important; padding: 2px !important; border: 1px solid #ccc !important; }
    tr { page-break-inside: avoid; }
    h1, h2, h3, h4, h5, h6 { margin: 2px 0 !important; font-size: 11pt !important; font-weight: normal !important; }
    p, span, div { font-size: 9pt !important; }
  }
`;
document.head.appendChild(printStyle);
