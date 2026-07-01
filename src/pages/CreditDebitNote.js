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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import partyService from '../services/partyService';

const CreditDebitNote = () => {
  const [noteType, setNoteType] = useState('credit'); // 'credit' or 'debit'
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partyName: '',
    partyId: '',
    noteDate: new Date().toISOString().split('T')[0],
    amount: '',
    reason: '',
  });

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const response = await partyService.getParties();
      const data = response?.data || response;
      setParties(data?.parties || []);
    } catch (error) {
      console.error('Error fetching parties:', error);
      toast.error('Failed to fetch parties');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setEditingNote(null);
    setFormData({
      partyName: '',
      partyId: '',
      noteDate: new Date().toISOString().split('T')[0],
      amount: '',
      reason: '',
    });
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setFormData({
      partyName: note.partyName,
      partyId: note.partyId,
      noteDate: note.noteDate,
      amount: note.amount,
      reason: note.reason,
    });
    setModalOpen(true);
  };

  const handlePartyChange = (event, newValue) => {
    setFormData({
      ...formData,
      partyName: newValue?.partyName || '',
      partyId: newValue?._id || '',
    });
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingNote(null);
    setFormData({
      partyName: '',
      partyId: '',
      noteDate: new Date().toISOString().split('T')[0],
      amount: '',
      reason: '',
    });
  };

  const handleSaveNote = () => {
    if (!formData.partyName || !formData.amount || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    const noteData = {
      ...formData,
      id: editingNote ? editingNote.id : Date.now(),
      type: noteType,
      createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
    };

    if (editingNote) {
      setNotes(notes.map((n) => (n.id === editingNote.id ? noteData : n)));
      toast.success('Note updated successfully');
    } else {
      setNotes([...notes, noteData]);
      toast.success('Note added successfully');
    }

    handleCloseModal();
  };

  const handleDeleteNote = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter((n) => n.id !== id));
      toast.success('Note deleted successfully');
    }
  };

  const handlePrint = (note) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${noteType === 'credit' ? 'Credit' : 'Debit'} Note</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0; }
            .info { margin: 10px 0; }
            .info strong { display: inline-block; width: 150px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f0f0f0; }
            .footer { margin-top: 30px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${noteType === 'credit' ? 'CREDIT NOTE' : 'DEBIT NOTE'}</h2>
          </div>
          <div class="info">
            <strong>Note No:</strong> ${note.id}
          </div>
          <div class="info">
            <strong>Date:</strong> ${note.noteDate}
          </div>
          <div class="info">
            <strong>Party Name:</strong> ${note.partyName}
          </div>
          <div class="info">
            <strong>Reason:</strong> ${note.reason}
          </div>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount (&#8377;)</th>
            </tr>
            <tr>
              <td>${note.reason}</td>
              <td>${parseFloat(note.amount).toLocaleString('en-IN')}</td>
            </tr>
          </table>
          <div class="footer">
            <strong>Total Amount: &#8377;${parseFloat(note.amount).toLocaleString('en-IN')}</strong>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {noteType === 'credit' ? 'Credit Notes' : 'Debit Notes'}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant={noteType === 'credit' ? 'contained' : 'outlined'}
            onClick={() => setNoteType('credit')}
            sx={{ flexGrow: 1 }}
          >
            Credit Notes
          </Button>
          <Button
            variant={noteType === 'debit' ? 'contained' : 'outlined'}
            onClick={() => setNoteType('debit')}
            sx={{ flexGrow: 1 }}
          >
            Debit Notes
          </Button>
        </Stack>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              Add {noteType === 'credit' ? 'Credit' : 'Debit'} Note
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Note No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Amount (&#8377;)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notes
                  .filter((note) => note.type === noteType)
                  .map((note) => (
                    <TableRow key={note.id} hover>
                      <TableCell>{note.id}</TableCell>
                      <TableCell>{note.noteDate}</TableCell>
                      <TableCell>{note.partyName}</TableCell>
                      <TableCell>{note.reason}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        &#8377;{parseFloat(note.amount).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditNote(note)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handlePrint(note)}
                            color="secondary"
                          >
                            <PrintIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteNote(note.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {notes.filter((note) => note.type === noteType).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No {noteType === 'credit' ? 'credit' : 'debit'} notes found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingNote ? 'Edit' : 'Add'} {noteType === 'credit' ? 'Credit' : 'Debit'} Note
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <Autocomplete
                  loading={loading}
                  fullWidth
                  options={parties}
                  getOptionLabel={(option) => option.partyName || ''}
                  value={parties.find((p) => p._id === formData.partyId) || null}
                  onChange={handlePartyChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Party Name"
                      required
                    />
                  )}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name="noteDate"
                  value={formData.noteDate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Box>
            </Stack>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9.]/g, '');
              }}
              required
            />
            <TextField
              fullWidth
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              multiline
              rows={3}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained" startIcon={<SaveIcon />}>
            {editingNote ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreditDebitNote;
