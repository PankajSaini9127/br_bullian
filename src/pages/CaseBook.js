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
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
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
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          Cash Book Report
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Date: {new Date().toLocaleDateString('en-GB')}
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#10b981' }}>
          Incoming Payments
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#dcfce7' }}>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd' }}>Sr No</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd' }}>Payment No</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd' }}>Party</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd', textAlign: 'right' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incomingPayments.map((payment, index) => (
                <TableRow key={payment._id}>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{index + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{payment.paymentNo || '-'}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{payment.partyId?.partyName || '-'}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd', textAlign: 'right' }}>
                    ₹{(payment.amount || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ background: '#dcfce7', fontWeight: 700 }}>
                <TableCell sx={{ border: '1px solid #ddd' }} colSpan={3}>Total</TableCell>
                <TableCell sx={{ border: '1px solid #ddd', textAlign: 'right' }}>
                  ₹{totalIncoming.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600, color: '#ef4444' }}>
          Outgoing Payments
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#fee2e2' }}>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd' }}>Sr No</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd' }}>Payment No</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd' }}>Party</TableCell>
                <TableCell sx={{ fontWeight: 600, border: '1px solid #ddd', textAlign: 'right' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outgoingPayments.map((payment, index) => (
                <TableRow key={payment._id}>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{index + 1}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{payment.paymentNo || '-'}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd' }}>{payment.partyId?.partyName || '-'}</TableCell>
                  <TableCell sx={{ border: '1px solid #ddd', textAlign: 'right' }}>
                    ₹{(payment.amount || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ background: '#fee2e2', fontWeight: 700 }}>
                <TableCell sx={{ border: '1px solid #ddd' }} colSpan={3}>Total</TableCell>
                <TableCell sx={{ border: '1px solid #ddd', textAlign: 'right' }}>
                  ₹{totalOutgoing.toFixed(2)}
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
        <Stack direction="row" spacing={3} sx={{ display: { xs: 'block', md: 'flex' } }}>
          {/* Left Column - Incoming Payments */}
          <Box sx={{ width: { md: 'calc(50% - 12px)' } }}>
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
        <Box sx={{ width: { md: 'calc(50% - 12px)' }, mt: { xs: 3, md: 0 } }}>
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
