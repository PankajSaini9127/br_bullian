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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import paggaService from '../services/paggaService';
import { roundOffFineFormatted } from '../utils/roundOff';
import { gradients } from '../theme';

const PaggaList = () => {
  const [paggaList, setPaggaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 10;

  const fetchPaggaList = async () => {
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
    fetchPaggaList();
  }, [page, searchQuery]);

  const handleSearch = () => {
    setPage(1);
    fetchPaggaList();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    fetchPaggaList();
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 }, pt: { xs: 0.5, md: 1 }, pb: { xs: 2, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{
          mb: 2.5,
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          background: gradients.primary,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Pagga List
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: { xs: 1.5, sm: 3 },
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          border: '1px solid', borderColor: 'divider',
        }}
      >
        {/* Search Section */}
        <Box sx={{ mb: 2.5 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={9}>
              <TextField
                fullWidth
                label="Search (Pagga No, Touch, Fine)"
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
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleClearSearch} sx={{ color: '#6366f1' }}>
                Clear Filters
              </Button>
            </Box>
          )}
        </Box>

        {/* Table Section */}
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
                  <TableRow
                    key={pagga._id || pagga.id}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {(page - 1) * limit + index + 1}
                    </TableCell>
                    <TableCell>{pagga.paggaNo || '-'}</TableCell>
                    <TableCell>{pagga.weight || 0}</TableCell>
                    <TableCell>{pagga.touch || 0}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {(() => {
                        const weight = parseFloat(pagga.weight) || 0;
                        const touch = parseFloat(pagga.touch) || 0;
                        const fine = weight * touch / 100;
                        return roundOffFineFormatted(fine);
                      })()}
                    </TableCell>
                    <TableCell>{pagga.boughtFrom || '-'}</TableCell>
                    <TableCell>{pagga.soldTo || '-'}</TableCell>
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

        {/* Pagination */}
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
      </Paper>
    </Container>
  );
};

export default PaggaList;
