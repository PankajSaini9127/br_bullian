import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import partyService from '../services/partyService';

const PartyList = () => {
  const [parties, setParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    partyName: '',
    contactNo: '',
    email: '',
    type: 'Customer',
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState(null);


  useEffect(() => {
    const fetchParties = async () => {
      try {
        const parties = await partyService.getParties();

        if(parties && parties.parties) {
          setParties(parties.parties || []);
        }
      } catch (error) {
        console.error('Error fetching parties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredParties = parties.filter(
    (party) =>
      party.partyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      party.contactNo?.includes(searchTerm)
  );

  const handleAddParty = () => {
    setEditingParty(null);
    setFormData({ partyName: '', contactNo: '', email: '', type: 'Customer' });
    setOpenDialog(true);
  };

  const handleEditParty = (party) => {
    setEditingParty(party);
    setFormData(party);
    setOpenDialog(true);
  };

  const handleDeleteParty = (party) => {
    setPartyToDelete(party);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteParty = async () => {
    try {
      await partyService.deletePartyDetails(partyToDelete._id);
      setParties(parties.filter((party) => party._id !== partyToDelete._id));
      setDeleteConfirmOpen(false);
      setPartyToDelete(null);
    } catch (error) {
      console.error('Delete Party Error:', error);
    }
  };

  const cancelDeleteParty = () => {
    setDeleteConfirmOpen(false);
    setPartyToDelete(null);
  };

  const handleSaveParty = async () => {
    try {
      if (editingParty) {
        // Update Party API Call
        const updatedParty = {
          ...formData,
          _id: editingParty._id
        };
        await partyService.updatePartyDetails(editingParty._id, updatedParty);

        setParties(
          parties.map((party) =>
            party._id === editingParty._id ? updatedParty : party
          )
        );
      } else {
        // Save Party API Call

        const response = await partyService.addPartyDetails(formData);

        // Add New Party In State
        setParties([
          ...parties,
          response.data || {
            ...formData,
            _id: parties.length + 1
          }
        ]);
      }

      setOpenDialog(false);

    } catch (error) {
      console.error('Save Party Error:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingParty(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Party List
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search parties..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#6366f1' }} />,
            }}
            sx={{
              flexGrow: 1,
              maxWidth: 400,
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddParty}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #be185d 100%)',
                boxShadow: '0 6px 16px rgba(99, 102, 241, 0.5)',
              },
            }}
          >
            Add Party
          </Button>
        </Box>
      </Box>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          border: '1px solid #e2e8f0',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Sr No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Contact No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredParties.map((party, index) => (
                <TableRow
                  key={party._id || party.id}
                  sx={{
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{party.partyName}</TableCell>
                  <TableCell>{party.contactNo}</TableCell>
                  <TableCell>{party.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={party.type}
                      size="small"
                      sx={{
                        bgcolor: party.type === 'Customer' ? '#dbeafe' : '#fce7f3',
                        color: party.type === 'Customer' ? '#1e40af' : '#be185d',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditParty(party)}
                      sx={{ color: '#6366f1', '&:hover': { background: '#e0e7ff' } }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteParty(party)}
                      sx={{ color: '#ec4899', '&:hover': { background: '#fce7f3' } }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', color: '#fff' }}>
          {editingParty ? 'Edit Party' : 'Add New Party'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Party Name"
            fullWidth
            variant="outlined"
            value={formData.partyName}
            onChange={(e) => setFormData({ ...formData, partyName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Contact No"
            fullWidth
            variant="outlined"
            value={formData.contactNo}
            onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6366f1' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveParty}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4338ca 0%, #be185d 100%)',
              },
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={cancelDeleteParty} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{partyToDelete?.partyName}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={cancelDeleteParty} sx={{ color: '#6366f1' }}>
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteParty}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PartyList;
