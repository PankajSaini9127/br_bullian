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
import noteService from '../services/noteService';
import { gradients } from '../theme';

const CreditDebitNote = () => {
  const [noteType, setNoteType] = useState('credit'); // 'credit' or 'debit'
  const [notes, setNotes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    partyName: '',
    partyId: '',
    noteDate: new Date().toISOString().split('T')[0],
    amount: '',
    fine: '',
    reason: '',
  });

  useEffect(() => {
    fetchParties();
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [noteType]);

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

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await noteService.getNotes({ noteType });
      const resData = response?.data || response;
      const notesList = resData?.data?.notes || resData?.notes || resData?.data || resData;
      setNotes(Array.isArray(notesList) ? notesList : []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
      setNotes([]);
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
      fine: '',
      reason: '',
    });
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    const party = note.partyId || note.party;
    setFormData({
      partyName: party?.partyName || note.partyName || '',
      partyId: party?._id || note.partyId || '',
      noteDate: note.date ? note.date.split('T')[0] : note.noteDate || new Date().toISOString().split('T')[0],
      amount: note.amount !== undefined ? String(note.amount) : '',
      fine: note.fine !== undefined ? String(note.fine) : '',
      reason: note.reason || '',
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
      fine: '',
      reason: '',
    });
  };

  const handleSaveNote = async () => {
    if (!formData.partyId) {
      toast.error('Please select a party');
      return;
    }

    if (!formData.amount && !formData.fine) {
      toast.error('Please fill either Amount or Fine');
      return;
    }

    const noteData = {
      noteType,
      date: formData.noteDate,
      partyId: formData.partyId,
      reason: formData.reason,
      amount: formData.amount ? parseFloat(formData.amount) : 0,
      fine: formData.fine ? parseFloat(formData.fine) : 0,
    };

    try {
      setSaving(true);
      if (editingNote) {
        await noteService.updateNote(editingNote._id || editingNote.id, noteData);
        toast.success('Note updated successfully');
      } else {
        await noteService.createNote(noteData);
        toast.success('Note added successfully');
      }
      handleCloseModal();
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error(error?.response?.data?.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await noteService.deleteNote(id);
        toast.success('Note deleted successfully');
        fetchNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Failed to delete note');
      }
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
            <strong>Note No:</strong> ${note.noteNo || note._id?.slice(-6) || note.id}
          </div>
          <div class="info">
            <strong>Date:</strong> ${note.date || note.noteDate}
          </div>
          <div class="info">
            <strong>Party Name:</strong> ${note.partyId?.partyName || note.partyName || note.party?.partyName || '-'}
          </div>
          <div class="info">
            <strong>Reason:</strong> ${note.reason}
          </div>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount (&#8377;)</th>
              <th>Fine (g)</th>
            </tr>
            <tr>
              <td>${note.reason}</td>
              <td>${parseFloat(note.amount).toLocaleString('en-IN')}</td>
              <td>${note.fine ? parseFloat(note.fine).toLocaleString('en-IN') : '-'}</td>
            </tr>
          </table>
          <div class="footer">
            <strong>Total Amount: &#8377;${parseFloat(note.amount).toLocaleString('en-IN')}</strong><br/>
            <strong>Total Fine: ${note.fine ? parseFloat(note.fine).toLocaleString('en-IN') + 'g' : '-'}</strong>
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
            sx={{
              flexGrow: 1,
              ...(noteType === 'credit' && {
                background: gradients.success,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                '&:hover': { background: gradients.successHover },
              }),
            }}
          >
            Credit Notes
          </Button>
          <Button
            variant={noteType === 'debit' ? 'contained' : 'outlined'}
            onClick={() => setNoteType('debit')}
            sx={{
              flexGrow: 1,
              ...(noteType === 'debit' && {
                background: gradients.danger,
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                '&:hover': { background: gradients.dangerHover },
              }),
            }}
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
              sx={{
                background: noteType === 'credit' ? gradients.success : gradients.danger,
                boxShadow: noteType === 'credit' ? '0 4px 12px rgba(16, 185, 129, 0.4)' : '0 4px 12px rgba(239, 68, 68, 0.4)',
                '&:hover': { background: noteType === 'credit' ? gradients.successHover : gradients.dangerHover },
              }}
            >
              Add {noteType === 'credit' ? 'Credit' : 'Debit'} Note
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ background: noteType === 'credit' ? gradients.success : gradients.danger }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Note No</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Party Name</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Amount (&#8377;)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Fine (g)</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notes
                  .map((note) => (
                    <TableRow key={note._id || note.id} hover>
                      <TableCell>{note.noteNo || note._id?.slice(-6) || note.id}</TableCell>
                      <TableCell>{note.date ? new Date(note.date).toLocaleDateString('en-GB') : note.noteDate}</TableCell>
                      <TableCell>{note.partyId?.partyName || note.partyName || note.party?.partyName || '-'}</TableCell>
                      <TableCell>{note.reason}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        &#8377;{parseFloat(note.amount).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {note.fine ? parseFloat(note.fine).toLocaleString('en-IN') : '-'}
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
                            onClick={() => handleDeleteNote(note._id || note.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                {notes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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
              />
              <TextField
                fullWidth
                label="Fine (g)"
                type="number"
                name="fine"
                value={formData.fine}
                onChange={handleInputChange}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                }}
              />
            </Stack>
            <TextField
              fullWidth
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained" startIcon={<SaveIcon />} disabled={saving}
            sx={{
              background: noteType === 'credit' ? gradients.success : gradients.danger,
              '&:hover': { background: noteType === 'credit' ? gradients.successHover : gradients.dangerHover },
            }}
          >
            {saving ? 'Saving...' : editingNote ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreditDebitNote;
