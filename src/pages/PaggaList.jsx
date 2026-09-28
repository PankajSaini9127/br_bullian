import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Paper,
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
  Pagination,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Inventory as InventoryIcon,
  ListAlt as ListAltIcon,
} from '@mui/icons-material';
import paggaService from '../services/paggaService';
import { roundOffFineFormatted } from '../utils/roundOff';
import { printKachiStock } from '../utils/thermalPrinter';
import { gradients } from '../theme';
import { useThemeMode } from '../context/ThemeContext';

const PaggaList = () => {
  const { mode } = useThemeMode();
  const [tabValue, setTabValue] = useState(0); // 0: In Stock (Kachi Stock), 1: All Paggas
  const [paggaList, setPaggaList] = useState([]);
  const [kachiStockData, setKachiStockData] = useState({ totalPuggas: 0, totalWeight: 0, totalFine: 0, puggas: [] });
  const [loading, setLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 10;

  // Fetch Kachi Stock (In-stock available paggas)
  const fetchKachiStock = async () => {
    setLoading(true);
    try {
      const data = await paggaService.getKachiStock();
      setKachiStockData({
        totalPuggas: data?.totalPuggas || 0,
        totalWeight: data?.totalWeight || 0,
        totalFine: data?.totalFine || 0,
        puggas: data?.puggas || []
      });
    } catch (error) {
      console.error('Error fetching kachi stock:', error);
      toast.error('Failed to fetch kachi stock');
    } finally {
      setLoading(false);
    }
  };

  // Fetch All Paggas with pagination
  const fetchAllPaggas = async () => {
    setLoading(true);
    try {
      const response = await paggaService.getPaggaList({ search: searchQuery }, page, limit);
      setPaggaList(response?.puggas || []);
      setTotalPages(response?.pagination?.totalPages || response?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching pagga list:', error);
      toast.error('Failed to fetch pagga list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKachiStock();
  }, []);

  useEffect(() => {
    if (tabValue === 1) {
      fetchAllPaggas();
    }
  }, [tabValue, page, searchQuery]);

  const handleSearch = () => {
    setPage(1);
    if (tabValue === 1) {
      fetchAllPaggas();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    if (tabValue === 1) {
      fetchAllPaggas();
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Filter in-stock puggas based on search query
  const filteredStockPuggas = kachiStockData.puggas.filter(p => {
    if (p.isPurchaseReturn) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const pNo = (p.paggaNo || '').toLowerCase();
    const pWeight = String(p.weight || '');
    const pTouch = String(p.touch || '');
    const pFine = String(p.fine || '');
    const pParty = (p.boughtFrom || '').toLowerCase();
    return pNo.includes(q) || pWeight.includes(q) || pTouch.includes(q) || pFine.includes(q) || pParty.includes(q);
  });

  const handlePrint = async () => {
    try {
      setPrinting(true);
      // Fetch latest live kachi stock
      const freshData = await paggaService.getKachiStock();
      if (!freshData || !freshData.puggas || freshData.puggas.length === 0) {
        toast.warn('No Kachi Stock records found to print');
        return;
      }
      printKachiStock(freshData);
      toast.success('Kachi stock sent to print');
    } catch (error) {
      console.error('Error printing kachi stock:', error);
      toast.error('Failed to print kachi stock');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 0.5, md: 1 }, pb: { xs: 2, md: 3 } }}>
      {/* Header with Title and Print Button */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5, mb: 2.5 }}>
        <Box>
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
            Kachi Stock &amp; Pagga List
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage and print live Kachi stock and pagga inventory
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="medium"
          startIcon={printing ? <CircularProgress size={18} color="inherit" /> : <PrintIcon />}
          onClick={handlePrint}
          disabled={printing}
          sx={{
            background: gradients.primary,
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
            px: 3,
            py: 1,
            borderRadius: 2,
            fontWeight: 600,
            '&:hover': {
              background: gradients.primaryHover,
            },
          }}
        >
          Print Kachi Stock
        </Button>
      </Box>

      {/* KPI Cards for Kachi Stock */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 2.5,
              borderLeft: '6px solid #6366f1',
              boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Paggas in Stock
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#6366f1', mt: 0.5 }}>
                {kachiStockData.totalPuggas} Pcs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 2.5,
              borderLeft: '6px solid #10b981',
              boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                Kachi Stock Fine (999)
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                {kachiStockData.totalFine.toFixed(1)} g
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 2.5,
              borderLeft: '6px solid #f59e0b',
              boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
              background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Gross Weight
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f59e0b', mt: 0.5 }}>
                {kachiStockData.totalWeight.toFixed(1)} g
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 1.5, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Tabs for In Stock vs All */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => {
              setTabValue(val);
              setSearchQuery('');
            }}
          >
            <Tab
              icon={<InventoryIcon />}
              iconPosition="start"
              label={`In Stock (${kachiStockData.totalPuggas})`}
              sx={{ fontWeight: 600 }}
            />
            <Tab
              icon={<ListAltIcon />}
              iconPosition="start"
              label="All Paggas History"
              sx={{ fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Search Section */}
        <Box sx={{ mb: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Search (Pagga No, Party, Touch, Weight, Fine)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                placeholder="Enter search term..."
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{
                  background: gradients.primary,
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                  '&:hover': {
                    background: gradients.primaryHover,
                  },
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          {searchQuery && (
            <Box sx={{ mt: 1.5 }}>
              <Button size="small" onClick={handleClearSearch} sx={{ color: '#6366f1' }}>
                Clear Filters
              </Button>
            </Box>
          )}
        </Box>

        {/* Tab 0: IN STOCK (KACHI STOCK) */}
        {tabValue === 0 && (
          <>
            {filteredStockPuggas.length > 0 ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700, '& .MuiTableCell-root': { px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' } }}>
                  <TableHead>
                    <TableRow sx={{ background: gradients.primary }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch (%)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Source</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Received From</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStockPuggas.map((pagga, index) => (
                      <TableRow key={pagga._id || pagga.id || index} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: '#4f46e5' }}>{pagga.paggaNo || '-'}</TableCell>
                        <TableCell>{Number(pagga.weight || 0).toFixed(2)}</TableCell>
                        <TableCell>{Number(pagga.touch || 0).toFixed(2)}%</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>
                          {roundOffFineFormatted(pagga.fine || (Number(pagga.weight) * Number(pagga.touch)) / 100)}g
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={pagga.source || (pagga.invoiceId ? 'Purchase' : 'Exchange')}
                            size="small"
                            color={pagga.source === 'Exchange' ? 'secondary' : 'primary'}
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{pagga.boughtFrom || '-'}</TableCell>
                        <TableCell>
                          {pagga.date || pagga.createdAt
                            ? new Date(pagga.date || pagga.createdAt).toLocaleDateString('en-GB')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip label="In Stock" size="small" color="success" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow sx={{ background: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f1f5f9', fontWeight: 800 }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 800 }}>
                        Total ({filteredStockPuggas.length} Pcs)
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {filteredStockPuggas.reduce((sum, p) => sum + (Number(p.weight) || 0), 0).toFixed(2)}g
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>
                        {filteredStockPuggas.length > 0
                          ? (
                              (filteredStockPuggas.reduce((sum, p) => sum + (Number(p.fine) || 0), 0) /
                                filteredStockPuggas.reduce((sum, p) => sum + (Number(p.weight) || 0), 0)) *
                              100
                            ).toFixed(2)
                          : 0}
                        %
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#10b981' }}>
                        {roundOffFineFormatted(filteredStockPuggas.reduce((sum, p) => sum + (Number(p.fine) || 0), 0))}g
                      </TableCell>
                      <TableCell colSpan={4}></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {loading ? 'Loading kachi stock...' : 'No kachi stock records found'}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Tab 1: ALL PAGGAS HISTORY */}
        {tabValue === 1 && (
          <>
            {paggaList.length > 0 ? (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700, '& .MuiTableCell-root': { px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.5 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' } }}>
                  <TableHead>
                    <TableRow sx={{ background: gradients.primary }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Pagga No</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Weight (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Touch</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Buy From</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sold To</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paggaList.map((pagga, index) => (
                      <TableRow key={pagga._id || pagga.id || index} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {(page - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{pagga.paggaNo || '-'}</TableCell>
                        <TableCell>{Number(pagga.weight || 0).toFixed(2)}</TableCell>
                        <TableCell>{Number(pagga.touch || 0).toFixed(2)}%</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {(() => {
                            const weight = parseFloat(pagga.weight) || 0;
                            const touch = parseFloat(pagga.touch) || 0;
                            const fine = (weight * touch) / 100;
                            return roundOffFineFormatted(fine);
                          })()}g
                        </TableCell>
                        <TableCell>{pagga.boughtFrom || '-'}</TableCell>
                        <TableCell>
                          {pagga.isPurchaseReturn ? (
                            <Chip label={`Returned (${pagga.purchaseReturnedTo || pagga.boughtFrom || 'Vendor'})`} size="small" color="error" sx={{ height: 20, fontSize: '0.7rem' }} />
                          ) : pagga.soldTo ? (
                            <Chip label={pagga.soldTo} size="small" color="default" sx={{ height: 20, fontSize: '0.7rem' }} />
                          ) : (
                            <Chip label="Unsold (In Stock)" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </TableCell>
                        <TableCell>
                          {pagga.createdAt
                            ? new Date(pagga.createdAt).toLocaleDateString('en-GB')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {loading ? 'Loading...' : 'No pagga records found'}
                </Typography>
              </Box>
            )}

            {/* Pagination for All Paggas */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 600,
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default PaggaList;
