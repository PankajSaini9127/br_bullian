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
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { gradients } from '../theme';

const UserProfile = () => {
  const { user, setUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', mobileNumber: '' });
  const [companyForm, setCompanyForm] = useState({ companyName: '', openingBalance: '', openingBalanceDate: '', openingFine: '', openingFineDate: '', openingFine9999: '', openingFine9999Date: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.getProfile();
      const raw = response?.data?.data || response?.data || {};
      const userData = raw?.user || raw;
      const companyData = raw?.companyProfile || raw?.company || {};
      setProfileData({ ...userData, company: companyData });
      setUserForm({
        username: userData?.username || '',
        email: userData?.email || '',
        mobileNumber: userData?.mobileNumber || userData?.phone || '',
      });
      setCompanyForm({
        companyName: companyData?.companyName || '',
        openingBalance: formatNumber(companyData?.openingBalance) || '',
        openingBalanceDate: companyData?.openingBalanceDate ? companyData?.openingBalanceDate.split('T')[0] : '',
        openingFine: companyData?.openingFine?.toString() || '',
        openingFineDate: companyData?.openingFineDate ? companyData?.openingFineDate.split('T')[0] : '',
        openingFine9999: companyData?.openingFine9999?.toString() || '',
        openingFine9999Date: companyData?.openingFine9999Date ? companyData?.openingFine9999Date.split('T')[0] : '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData(user);
      setUserForm({
        username: user?.username || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || user?.phone || '',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    try {
      const response = await userService.updateProfile({
        username: userForm.username,
        email: userForm.email,
        mobileNumber: userForm.mobileNumber,
        companyName: companyForm.companyName,
        openingBalance: parseFloat(companyForm.openingBalance.replace(/,/g, '')) || 0,
        openingBalanceDate: companyForm.openingBalanceDate || undefined,
        openingFine: parseFloat(companyForm.openingFine) || 0,
        openingFineDate: companyForm.openingFineDate || undefined,
        openingFine9999: parseFloat(companyForm.openingFine9999) || 0,
        openingFine9999Date: companyForm.openingFine9999Date || undefined,
      });
      const raw = response?.data?.data || response?.data || {};
      const userData = raw?.user || raw;
      const companyData = raw?.companyProfile || raw?.company || {};
      setProfileData({ ...userData, company: companyData });
      const updatedUser = { ...user, username: userData?.username, email: userData?.email, mobileNumber: userData?.mobileNumber };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingUser(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancelUser = () => {
    setUserForm({
      username: profileData?.username || '',
      email: profileData?.email || '',
      mobileNumber: profileData?.mobileNumber || profileData?.phone || '',
    });
    setIsEditingUser(false);
  };

  const handleSaveCompany = async () => {
    try {
      const response = await userService.updateProfile({
        username: userForm.username,
        email: userForm.email,
        mobileNumber: userForm.mobileNumber,
        companyName: companyForm.companyName,
        openingBalance: parseFloat(companyForm.openingBalance.replace(/,/g, '')) || 0,
        openingBalanceDate: companyForm.openingBalanceDate || undefined,
        openingFine: parseFloat(companyForm.openingFine) || 0,
        openingFineDate: companyForm.openingFineDate || undefined,
        openingFine9999: parseFloat(companyForm.openingFine9999) || 0,
        openingFine9999Date: companyForm.openingFine9999Date || undefined,
      });
      const raw = response?.data?.data || response?.data || {};
      const userData = raw?.user || raw;
      const companyData = raw?.companyProfile || raw?.company || {};
      setProfileData({ ...userData, company: companyData });
      setCompanyForm({
        companyName: companyData?.companyName || '',
        openingBalance: formatNumber(companyData?.openingBalance) || '',
        openingBalanceDate: companyData?.openingBalanceDate ? companyData?.openingBalanceDate.split('T')[0] : '',
        openingFine: companyData?.openingFine?.toString() || '',
        openingFineDate: companyData?.openingFineDate ? companyData?.openingFineDate.split('T')[0] : '',
        openingFine9999: companyData?.openingFine9999?.toString() || '',
        openingFine9999Date: companyData?.openingFine9999Date ? companyData?.openingFine9999Date.split('T')[0] : '',
      });
      setIsEditingCompany(false);
      toast.success('Company profile updated successfully');
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company profile');
    }
  };

  const handleCancelCompany = () => {
    const c = profileData?.company || {};
    setCompanyForm({
      companyName: c?.companyName || '',
      openingBalance: formatNumber(c?.openingBalance) || '',
      openingBalanceDate: c?.openingBalanceDate ? c?.openingBalanceDate.split('T')[0] : '',
      openingFine: c?.openingFine?.toString() || '',
      openingFineDate: c?.openingFineDate ? c?.openingFineDate.split('T')[0] : '',
      openingFine9999: c?.openingFine9999?.toString() || '',
      openingFine9999Date: c?.openingFine9999Date ? c?.openingFine9999Date.split('T')[0] : '',
    });
    setIsEditingCompany(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatNumber = (val) => {
    const num = val.toString().replace(/,/g, '');
    if (!num) return '';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return '';
    return parsed.toLocaleString('en-IN');
  };

  const handleBalanceChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      setCompanyForm({ ...companyForm, openingBalance: formatNumber(raw) });
    }
  };

  const company = profileData?.company;

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 1, md: 2 }, mb: 2, px: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }, color: 'text.primary' }}>
        Profile
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ background: gradients.primary, p: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: 2 }}>
          {tabValue === 0 ? (
            <Avatar sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, bgcolor: 'rgba(255,255,255,0.2)', fontSize: { xs: 20, sm: 28 }, fontWeight: 700 }}>
              {getInitials(profileData?.name || profileData?.username)}
            </Avatar>
          ) : (
            <Box sx={{ width: { xs: 56, sm: 72 }, height: { xs: 56, sm: 72 }, borderRadius: 2, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BusinessIcon sx={{ color: '#fff', fontSize: { xs: 28, sm: 36 } }} />
            </Box>
          )}
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
              {tabValue === 0 ? (profileData?.name || profileData?.username || 'User') : (company?.companyName || 'Company')}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
              {tabValue === 0 ? (profileData?.email || '') : (company?.isActive !== false ? 'Active' : 'Inactive')}
            </Typography>
            {tabValue === 0 && profileData?.role && (
              <Chip label={profileData.role} size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, textTransform: 'capitalize' }} />
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: { xs: 1.5, sm: 2 } }}>
            <Tab icon={<PersonIcon />} iconPosition="start" label="User Details" />
            <Tab icon={<BusinessIcon />} iconPosition="start" label="Company Details" />
          </Tabs>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
          ) : tabValue === 0 ? (
            isEditingUser ? (
              <Stack spacing={2}>
                <TextField label="Username" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} size="small" fullWidth />
                <TextField label="Email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} size="small" fullWidth />
                <TextField label="Mobile Number" value={userForm.mobileNumber} onChange={(e) => setUserForm({ ...userForm, mobileNumber: e.target.value })} size="small" fullWidth />
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button startIcon={<CancelIcon />} onClick={handleCancelUser} sx={{ color: '#6366f1' }}>Cancel</Button>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveUser} sx={{ background: gradients.primary, fontWeight: 600 }}>Save</Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Username</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{profileData?.username || '-'}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Email</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{profileData?.email || '-'}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Mobile Number</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{profileData?.mobileNumber || profileData?.phone || '-'}</Typography>
                </Box>
                <Divider />
                {profileData?.role && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Role</Typography>
                    <Chip label={profileData.role} size="small" sx={{ textTransform: 'capitalize', fontWeight: 600 }} />
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditingUser(true)} sx={{ background: gradients.primary, fontWeight: 600 }}>Edit Profile</Button>
                </Box>
              </Stack>
            )
          ) : !company ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                No company profile found. Create one below.
              </Typography>
              <TextField label="Company Name" value={companyForm.companyName} onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })} size="small" fullWidth />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Opening Balance (₹)" value={companyForm.openingBalance} onChange={handleBalanceChange} size="small" fullWidth inputMode="decimal" />
                <TextField label="As on Date" type="date" value={companyForm.openingBalanceDate} onChange={(e) => setCompanyForm({ ...companyForm, openingBalanceDate: e.target.value })} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Opening Fine 999 (Chorsa) (g)" type="number" value={companyForm.openingFine} onChange={(e) => setCompanyForm({ ...companyForm, openingFine: e.target.value })} size="small" fullWidth />
                <TextField label="As on Date" type="date" value={companyForm.openingFineDate} onChange={(e) => setCompanyForm({ ...companyForm, openingFineDate: e.target.value })} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Opening Fine 9999 (Bank) (g)" type="number" value={companyForm.openingFine9999} onChange={(e) => setCompanyForm({ ...companyForm, openingFine9999: e.target.value })} size="small" fullWidth />
                <TextField label="As on Date" type="date" value={companyForm.openingFine9999Date} onChange={(e) => setCompanyForm({ ...companyForm, openingFine9999Date: e.target.value })} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleSaveCompany} sx={{ background: gradients.primary, fontWeight: 600 }}>Create Company</Button>
              </Box>
            </Stack>
          ) : isEditingCompany ? (
            <Stack spacing={2}>
              <TextField label="Company Name" value={companyForm.companyName} onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })} size="small" fullWidth />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Opening Balance (₹)" value={companyForm.openingBalance} onChange={handleBalanceChange} size="small" fullWidth inputMode="decimal" />
                <TextField label="As on Date" type="date" value={companyForm.openingBalanceDate} onChange={(e) => setCompanyForm({ ...companyForm, openingBalanceDate: e.target.value })} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Opening Fine 999 (Chorsa) (g)" type="number" value={companyForm.openingFine} onChange={(e) => setCompanyForm({ ...companyForm, openingFine: e.target.value })} size="small" fullWidth />
                <TextField label="As on Date" type="date" value={companyForm.openingFineDate} onChange={(e) => setCompanyForm({ ...companyForm, openingFineDate: e.target.value })} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Opening Fine 9999 (Bank) (g)" type="number" value={companyForm.openingFine9999} onChange={(e) => setCompanyForm({ ...companyForm, openingFine9999: e.target.value })} size="small" fullWidth />
                <TextField label="As on Date" type="date" value={companyForm.openingFine9999Date} onChange={(e) => setCompanyForm({ ...companyForm, openingFine9999Date: e.target.value })} size="small" fullWidth InputLabelProps={{ shrink: true }} />
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button startIcon={<CancelIcon />} onClick={handleCancelCompany} sx={{ color: '#6366f1' }}>Cancel</Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveCompany} sx={{ background: gradients.primary, fontWeight: 600 }}>Save</Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Company Name</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{company?.companyName || '-'}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Opening Balance</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>₹{Math.trunc(company?.openingBalance || 0).toLocaleString('en-IN')}</Typography>
                {company?.openingBalanceDate && (
                  <Typography variant="body2" color="text.secondary">As on {new Date(company.openingBalanceDate).toLocaleDateString('en-GB')}</Typography>
                )}
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Opening Fine 999 (Chorsa)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{Math.trunc(company?.openingFine || 0).toLocaleString('en-IN')}g</Typography>
                {company?.openingFineDate && (
                  <Typography variant="body2" color="text.secondary">As on {new Date(company.openingFineDate).toLocaleDateString('en-GB')}</Typography>
                )}
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Opening Fine 9999 (Bank)</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{Math.trunc(company?.openingFine9999 || 0).toLocaleString('en-IN')}g</Typography>
                {company?.openingFine9999Date && (
                  <Typography variant="body2" color="text.secondary">As on {new Date(company.openingFine9999Date).toLocaleDateString('en-GB')}</Typography>
                )}
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Status</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: company?.isActive !== false ? '#10b981' : '#ef4444' }}>{company?.isActive !== false ? 'Active' : 'Inactive'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditingCompany(true)} sx={{ background: gradients.primary, fontWeight: 600 }}>Edit Profile</Button>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserProfile;
