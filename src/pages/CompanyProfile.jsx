import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Stack,
  Button,
  TextField,
  Divider,
  Switch,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import companyService from '../services/companyService';
import { gradients } from '../theme';

const CompanyProfile = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    openingBalance: '',
    openingFine: '',
    openingFine9999: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await companyService.getCompanies({ page: 1, limit: 1 });
      const data = response?.data?.data || response?.data || {};
      const list = data?.companies || data || [];
      setCompanies(list);
      if (list.length > 0) {
        const c = list[0];
        setFormData({
          companyName: c.companyName || '',
          openingBalance: c.openingBalance?.toString() || '',
          openingFine: c.openingFine?.toString() || '',
          openingFine9999: c.openingFine9999?.toString() || '',
          isActive: c.isActive !== false,
        });
      }
    } catch (error) {
      console.error('Error fetching company:', error);
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const company = companies[0];
    if (!company) return;
    try {
      const payload = {
        companyName: formData.companyName,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        openingFine: parseFloat(formData.openingFine) || 0,
        openingFine9999: parseFloat(formData.openingFine9999) || 0,
        isActive: formData.isActive,
      };
      await companyService.updateCompany(company._id, payload);
      toast.success('Company profile updated successfully');
      setIsEditing(false);
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company profile');
    }
  };

  const handleCancel = () => {
    const c = companies[0];
    if (c) {
      setFormData({
        companyName: c.companyName || '',
        openingBalance: c.openingBalance?.toString() || '',
        openingFine: c.openingFine?.toString() || '',
        openingFine9999: c.openingFine9999?.toString() || '',
        isActive: c.isActive !== false,
      });
    }
    setIsEditing(false);
  };

  const company = companies[0];

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 1, md: 2 }, mb: 2, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, color: 'text.primary' }}>
        Company Profile
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
        <Box sx={{ background: gradients.primary, p: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, borderRadius: 2, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BusinessIcon sx={{ color: '#fff', fontSize: { xs: 28, sm: 36 } }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
              {company?.companyName || 'Company'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              {company?.isActive !== false ? 'Active' : 'Inactive'}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
          ) : !company ? (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              <Typography>No company profile found</Typography>
            </Box>
          ) : isEditing ? (
            <Stack spacing={2}>
              <TextField
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                size="small"
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Opening Balance (₹)"
                  type="number"
                  value={formData.openingBalance}
                  onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Opening Fine 999 (Chorsa) (g)"
                  type="number"
                  value={formData.openingFine}
                  onChange={(e) => setFormData({ ...formData, openingFine: e.target.value })}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Opening Fine 9999 (Bank) (g)"
                  type="number"
                  value={formData.openingFine9999}
                  onChange={(e) => setFormData({ ...formData, openingFine9999: e.target.value })}
                  size="small"
                  fullWidth
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
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button startIcon={<CancelIcon />} onClick={handleCancel} sx={{ color: '#6366f1' }}>
                  Cancel
                </Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} sx={{ background: gradients.primary, fontWeight: 600 }}>
                  Save
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Company Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{company.companyName || '-'}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Opening Balance</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  ₹{Math.trunc(company.openingBalance || 0).toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Opening Fine 999 (Chorsa)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {Math.trunc(company.openingFine || 0).toLocaleString('en-IN')}g
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Opening Fine 9999 (Bank)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {Math.trunc(company.openingFine9999 || 0).toLocaleString('en-IN')}g
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Status</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: company.isActive !== false ? '#10b981' : '#ef4444' }}>
                  {company.isActive !== false ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)} sx={{ background: gradients.primary, fontWeight: 600 }}>
                  Edit Profile
                </Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CompanyProfile;
