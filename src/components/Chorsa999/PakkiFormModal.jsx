import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, IconButton, Grid, Paper, Divider, Collapse,
  Table, TableHead, TableBody, TableRow, TableCell, Chip,
  TextField, InputAdornment, Button, Autocomplete, Alert, Stack, CircularProgress, LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { gradients } from '../../theme';

const PakkiFormModal = ({
  modalOpen,
  handleCloseModal,
  editingChorsa,
  formData,
  setFormData,
  parties,
  partySearchQuery,
  setPartySearchQuery,
  partySearchResults,
  formPendingPakkiGroups,
  loadingFormPending,
  expandedFormGroups,
  setExpandedFormGroups,
  handleInputChange,
  handleSaveChorsa,
  formatDate,
  pageTitle
}) => {
  const cardColor = formData.type === 'buy' ? '#10b981' : '#f59e0b';
  
  return (
    <Dialog 
        open={modalOpen} 
        onClose={handleCloseModal} 
        maxWidth="md" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 } } }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)',
            overflow: 'hidden',
            width: { xs: 'calc(100% - 16px)' },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: gradients.primary,
            color: '#fff',
            fontWeight: 700,
            py: 3,
            px: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {editingChorsa ? <EditIcon sx={{ fontSize: 28 }} /> : <AddIcon sx={{ fontSize: 28 }} />}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {editingChorsa ? `Edit ${pageTitle}` : `Add New ${pageTitle}`}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {pageTitle} {formData.type === 'buy' ? 'Buy' : 'Sell'} Transaction
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleCloseModal}
            sx={{
              color: '#fff',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 4, pb: 2, px: 4 }}>
          <Grid container spacing={2} sx={{ pt: 2 }}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  fullWidth
                  options={partySearchQuery ? partySearchResults : parties}
                  getOptionLabel={(option) => option.partyName || ''}
                  isOptionEqualToValue={(option, value) => option?._id === value?._id}
                  value={formData.partyId ? { _id: formData.partyId, partyName: formData.partyName } : null}
                  onChange={(e, newValue) => {
                    if (newValue) {
                      setFormData({
                        ...formData,
                        partyName: newValue.partyName,
                        partyId: newValue._id,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        partyName: '',
                        partyId: '',
                      });
                      setPartySearchQuery('');
                    }
                  }}
                  onInputChange={(event, newInputValue, reason) => {
                    if (reason === 'input') {
                      setPartySearchQuery(newInputValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      label="Select Party *"
                      InputLabelProps={{
                        ...params.InputLabelProps,
                        shrink: true,
                      }}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          height: 56,
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              {formData.partyId && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <PendingIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        Pending Pakki Saudas
                      </Typography>
                      {loadingFormPending && (
                        <LinearProgress sx={{ width: 80, ml: 1, borderRadius: 2 }} />
                      )}
                    </Box>

                    {!loadingFormPending && formPendingPakkiGroups.length === 0 && (
                      <Alert
                        severity="success"
                        sx={{ borderRadius: 2, fontWeight: 500 }}
                      >
                        🎉 Is party ke saare pakki saudas deliver ho gaye hain!
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      {formPendingPakkiGroups.map((group) => {
                        const groupKey = `${group.saudaType}-${group.saudaCategory}`;
                        const isExpanded = expandedFormGroups[groupKey];
                        const deliveredPct = group.totalQuantity > 0
                          ? Math.round((group.totalDelivered / group.totalQuantity) * 100)
                          : 0;
                        const isBuy = group.saudaType === 'purchase';
                        const categoryLabel = group.saudaCategory === 'bank-9999' ? 'Bank 9999' : 'Chorsa 999';
                        const cardColor = isBuy
                          ? (group.saudaCategory === 'bank-9999' ? '#0ea5e9' : '#6366f1')
                          : (group.saudaCategory === 'bank-9999' ? '#14b8a6' : '#ec4899');

                        return (
                          <Grid item xs={12} md={6} key={groupKey}>
                            <Paper
                              elevation={2}
                              sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: `2px solid ${cardColor}22`,
                                boxShadow: `0 4px 16px ${cardColor}22`,
                              }}
                            >
                              {/* Card Header */}
                              <Box
                                sx={{
                                  background: `linear-gradient(135deg, ${cardColor}dd, ${cardColor}99)`,
                                  px: 2.5,
                                  py: 1.5,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <Box>
                                  <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {isBuy ? '🛒 Purchase' : '💰 Sales'} — {categoryLabel}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                    {group.saudas.length} sauda{group.saudas.length > 1 ? 's' : ''} pending
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`${group.totalRemaining} g remaining`}
                                  size="small"
                                  sx={{
                                    background: 'rgba(255,255,255,0.25)',
                                    color: '#fff',
                                    fontWeight: 700,
                                    backdropFilter: 'blur(4px)',
                                  }}
                                />
                              </Box>

                              {/* Progress Bar */}
                              <Box sx={{ px: 2.5, pt: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Total: {group.totalQuantity} g
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: cardColor, fontWeight: 700 }}>
                                    Delivered: {group.totalDelivered} g ({deliveredPct}%)
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={deliveredPct}
                                  sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: `${cardColor}22`,
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: cardColor,
                                      borderRadius: 4,
                                    },
                                  }}
                                />
                              </Box>

                              {/* Expand/Collapse Toggle */}
                              <Box
                                sx={{
                                  px: 2.5,
                                  py: 1,
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  cursor: 'pointer',
                                }}
                                onClick={() =>
                                  setExpandedFormGroups((prev) => ({
                                    ...prev,
                                    [groupKey]: !prev[groupKey],
                                  }))
                                }
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ color: cardColor, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}
                                >
                                  {isExpanded ? 'Hide details' : 'Show details'}
                                  {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                                </Typography>
                              </Box>

                              {/* Sauda Detail Rows */}
                              <Collapse in={isExpanded}>
                                <Divider />
                                <Box sx={{ px: 2, pb: 1.5 }}>
                                      <Table size="small" sx={{ minWidth: { xs: 500, sm: '100%' } }}>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Sauda No</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Date</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Qty (g)</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Delivered</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Remaining</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem', py: 0.5 }}>Status</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {group.saudas.map((s) => (
                                        <TableRow key={s._id} sx={{ '&:hover': { background: `${cardColor}11` } }}>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, fontWeight: 600, color: cardColor }}>#{s.saudaNo}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{formatDate(s.saudaDate)}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75 }}>{s.quantity}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#10b981', fontWeight: 600 }}>{s.delivered}</TableCell>
                                          <TableCell sx={{ fontSize: '0.78rem', py: 0.75, color: '#ef4444', fontWeight: 700 }}>{s.remaining}</TableCell>
                                          <TableCell sx={{ py: 0.75 }}>
                                            <Chip
                                              label={s.status}
                                              size="small"
                                              sx={{
                                                fontSize: '0.68rem',
                                                fontWeight: 700,
                                                backgroundColor: s.status === 'pending' ? '#fef3c7' : '#dbeafe',
                                                color: s.status === 'pending' ? '#92400e' : '#1e40af',
                                              }}
                                            />
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date *"
                  type="date"
                  value={formData.date}
                  name="date"
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Weight"
                  type="text"
                  value={formData.weight}
                  name="weight"
                  onChange={handleInputChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#6366f1', fontWeight: 600 }}>g</Typography></InputAdornment>,
                  }}
                  helperText={formData.weight ? `${(parseFloat(formData.weight) / 1000).toFixed(3)} kg per piece` : 'Optional: Weight per piece in grams'}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      borderRadius: 2,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#6366f1',
                      fontWeight: 500,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pcs"
                  type="text"
                  value={formData.pcs}
                  name="pcs"
                  onChange={handleInputChange}
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end"><Typography sx={{ color: '#6366f1', fontWeight: 600 }}>pcs</Typography></InputAdornment>,
                  }}
                  helperText={formData.pcs ? `${formData.pcs} pieces` : 'Optional: Number of pieces'}
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      borderRadius: 2,
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#6366f1',
                      fontWeight: 500,
                    },
                  }}
                />
              </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2 }}>
          <Button
            onClick={handleCloseModal}
            startIcon={<CloseIcon />}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={editingChorsa ? <CheckIcon /> : <AddIcon />}
            onClick={handleSaveChorsa}
            sx={{
              background: gradients.primary,
              fontWeight: 600,
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
              '&:hover': {
                background: gradients.primaryHover,
              },
            }}
          />
        </DialogActions>
      </Dialog>
  );
};

export default PakkiFormModal;
