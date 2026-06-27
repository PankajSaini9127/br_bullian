import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Button,
} from '@mui/material';
import {
  ArrowDownward as IncomingIcon,
  ArrowUpward as OutgoingIcon,
  AccountBalance as BalanceIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import caseService from '../services/caseService';

const CaseBook = () => {
  const [cashBook, setCashBook] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCashBook();
  }, []);

  const fetchCashBook = async () => {
    setLoading(true);
    try {
      const response = await caseService.getCashBook();
      setCashBook(response);
    } catch (error) {
      console.error('Error fetching cash book:', error);
      toast.error('Failed to load cash book data');
    } finally {
      setLoading(false);
    }
  };

  const incomingPayments = cashBook?.incoming?.payments || [];
  const outgoingPayments = cashBook?.outgoing?.payments || [];
  const totalIncoming = cashBook?.incoming?.total || 0;
  const totalOutgoing = cashBook?.outgoing?.total || 0;
  const balance = cashBook?.balance || 0;

  const handlePrint = () => {
    window.print();
  };

  // Prepare combined transactions for tally-style print
  const allTransactions = [];
  incomingPayments.forEach((payment, index) => {
    allTransactions.push({
      date: payment.paymentDate,
      particular: payment.partyId?.partyName || '-',
      voucherType: 'Receipt',
      voucherNo: payment.paymentNo || '-',
      debit: payment.amount || 0,
      credit: 0,
      type: 'incoming'
    });
  });
  outgoingPayments.forEach((payment, index) => {
    allTransactions.push({
      date: payment.paymentDate,
      particular: payment.partyId?.partyName || '-',
      voucherType: 'Payment',
      voucherNo: payment.paymentNo || '-',
      debit: 0,
      credit: payment.amount || 0,
      type: 'outgoing'
    });
  });

  // Sort by date
  allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate running balance
  let runningBalance = 0;
  const transactionsWithBalance = allTransactions.map((t) => {
    runningBalance = runningBalance + t.debit - t.credit;
    return { ...t, balance: runningBalance };
  });

  // Print styles
  const printStyles = `
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
      .print-only {
        display: block !important;
      }
      .screen-only {
        display: none !important;
      }
      .MuiPaper-root {
        box-shadow: none !important;
        border: 1px solid #ddd !important;
      }
      table {
        width: 100% !important;
        page-break-inside: auto;
        border-collapse: collapse !important;
      }
      th, td {
        border: 1px solid #ddd !important;
        padding: 8px !important;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      .MuiStack-root {
        display: flex !important;
        flex-wrap: wrap !important;
      }
    }
    @media screen {
      .print-only {
        display: none !important;
      }
    }
  `;

  return (
    <>
      <style>{printStyles}</style>
      <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4, px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, color: '#1e293b' }}>
            Cash Book
          </Typography>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            className="no-print"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              fontWeight: 600,
            }}
          >
            Print
          </Button>
        </Box>

      {/* Summary Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} useFlexGap flexWrap="wrap">
        <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IncomingIcon sx={{ mr: 1, color: '#10b981', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Total In</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#10b981' }}>
                ₹{totalIncoming.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <OutgoingIcon sx={{ mr: 1, color: '#ef4444', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Total Out</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#ef4444' }}>
                ₹{totalOutgoing.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BalanceIcon sx={{ mr: 1, color: '#6366f1', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Balance</Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: balance >= 0 ? '#6366f1' : '#ef4444' }}>
                ₹{balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* Print-only Table */}
      <Box className="print-only" sx={{ display: 'none' }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
          Cash Book
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
          Date: {new Date().toLocaleDateString('en-GB')}
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f0f0f0', fontWeight: 700 }}>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #000', textAlign: 'center' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #000' }}>Particulars</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #000', textAlign: 'center' }}>Voucher Type</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #000', textAlign: 'center' }}>Voucher No</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #000', textAlign: 'right' }}>Debit</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #000', textAlign: 'right' }}>Credit</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #000', textAlign: 'right' }}>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionsWithBalance.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'center' }}>
                    {transaction.date ? new Date(transaction.date).toLocaleDateString('en-GB') : '-'}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #000' }}>{transaction.particular}</TableCell>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'center' }}>{transaction.voucherType}</TableCell>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'center' }}>{transaction.voucherNo}</TableCell>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'right' }}>
                    {transaction.debit > 0 ? `₹${transaction.debit.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'right' }}>
                    {transaction.credit > 0 ? `₹${transaction.credit.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #000', textAlign: 'right', fontWeight: 600 }}>
                    ₹{transaction.balance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ background: '#f0f0f0', fontWeight: 700 }}>
                <TableCell sx={{ border: '1px solid #000' }} colSpan={4} textAlign="right">Total</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right' }}>
                  ₹{totalIncoming.toFixed(2)}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right' }}>
                  ₹{totalOutgoing.toFixed(2)}
                </TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'right' }}>
                  ₹{balance.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, p: 2, bgcolor: '#f1f5f9', border: '1px solid #ddd', fontWeight: 700 }}>
          <Typography variant="h6">
            Balance: ₹{balance.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      {/* Screen-only content */}
      <Box className="screen-only">
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'block', md: 'flex' } }}>
          {/* Left Column - Incoming Payments */}
          <Box sx={{ width: { md: 'calc(50% - 4px)' } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#10b981' }}>
                <IncomingIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Incoming Payments
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
              ) : incomingPayments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                  <Typography>No incoming payments</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: '#dcfce7' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Sr No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Payment No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Party</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incomingPayments.map((payment, index) => (
                        <TableRow key={payment._id} sx={{ '&:hover': { background: '#f8fafc' } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{payment.paymentNo || '-'}</TableCell>
                          <TableCell>{payment.partyId?.partyName || '-'}</TableCell>
                          <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: '#166534' }}>
                            ₹{(payment.amount || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Right Column - Outgoing Payments */}
        <Box sx={{ width: { md: 'calc(50% - 4px)' }, mt: { xs: 3, md: 0 } }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#ef4444' }}>
                <OutgoingIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Outgoing Payments
              </Typography>
              
              {loading ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
              ) : outgoingPayments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: '#94a3b8' }}>
                  <Typography>No outgoing payments</Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: '#fee2e2' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Sr No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Payment No</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Party</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {outgoingPayments.map((payment, index) => (
                        <TableRow key={payment._id} sx={{ '&:hover': { background: '#f8fafc' } }}>
                          <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{payment.paymentNo || '-'}</TableCell>
                          <TableCell>{payment.partyId?.partyName || '-'}</TableCell>
                          <TableCell sx={{ textAlign: 'right', fontWeight: 600, color: '#991b1b' }}>
                            ₹{(payment.amount || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>
      </Box>
    </Container>
    </>
  );
};

export default CaseBook;
