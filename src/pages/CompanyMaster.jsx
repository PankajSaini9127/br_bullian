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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Switch,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import companyService from '../services/companyService';
import { gradients } from '../theme';

const CompanyMaster = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    openingBalance: '',
    openingFine: '',
    isActive: true,
  });

  const limit = 10;

  useEffect(() => {
    fetchCompanies();
  }, [page]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companyService.getCompanies({ page, limit });
      const data = response?.data?.data || response?.data || {};
      setCompanies(data?.companies || data || []);
      setTotalPages(data?.pagination?.totalPages || data?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEdit(false);
    setEditingId(null);
    setFormData({ companyName: '', openingBalance: '', openingFine: '', isActive: true });
    setOpenModal(true);
  };

  const handleEdit = (company) => {
    setIsEdit(true);
    setEditingId(company._id);
    setFormData({
      companyName: company.companyName || '',
      openingBalance: company.openingBalance?.toString() || '',
      openingFine: company.openingFine?.toString() || '',
      isActive: company.isActive !== false,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEdit(false);
    setEditingId(null);
    setFormData({ companyName: '', openingBalance: '', openingFine: '', isActive: true });
  };

  const handleSave = async () => {
    if (!formData.companyName) {
      toast.error('Company name is required');
      return;
    }
    try {
      const payload = {
        companyName: formData.companyName,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        openingFine: parseFloat(formData.openingFine) || 0,
        isActive: formData.isActive,
      };
      if (isEdit) {
        await companyService.updateCompany(editingId, payload);
        toast.success('Company updated successfully');
      } else {
        await companyService.createCompany(payload);
        toast.success('Company created successfully');
      }
      handleCloseModal();
      fetchCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company');
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await companyService.deleteCompany(deletingId);
      toast.success('Company deleted successfully');
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: { xs: 1, md: 2 }, mb: 2, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, color: 'text.primary' }}>
          Company Master
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{ background: gradients.primary, fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          Add Company
        </Button>
      </Box>

      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: gradients.primary }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Company Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'right' }}>Opening Balance</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'right' }}>Opening Fine</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600, width: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>Loading...</TableCell>
                  </TableRow>
                ) : companies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  companies.map((company, index) => (
                    <TableRow key={company._id} sx={{ '&:nth-of-type(odd)': { background: 'rgba(0, 0, 0, 0.02)' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{(page - 1) * limit + index + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <BusinessIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                          {company.companyName}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                        ₹{Math.trunc(company.openingBalance || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>
                        {Math.trunc(company.openingFine || 0).toLocaleString('en-IN')}g
                      </TableCell>
                      <TableCell>
                        <Switch checked={company.isActive !== false} size="small" disabled />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEdit(company)} sx={{ color: '#6366f1' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(company._id)} sx={{ color: '#ef4444' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, v) => setPage(v)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>{isEdit ? 'Edit' : 'Add'} Company</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Stack spacing={1.5} sx={{ mt: 0.5 }}>
            <TextField
              label="Company Name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
              size="small"
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label="Opening Balance (₹)"
                type="number"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                size="small"
              />
              <TextField
                label="Opening Fine (g)"
                type="number"
                value={formData.openingFine}
                onChange={(e) => setFormData({ ...formData, openingFine: e.target.value })}
                size="small"
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                size="small"
              />
              <Typography variant="body2">Active</Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#6366f1' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ background: gradients.primary, fontWeight: 600 }}>
            {isEdit ? 'Update' : 'Add'} Company
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle sx={{ pb: 1 }}>Confirm Delete</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>Are you sure you want to delete this company?</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: '#6366f1' }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmDelete} sx={{ background: gradients.danger, fontWeight: 600 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CompanyMaster;
