import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button
} from '@mui/material';
import {
  Delete as DeleteIcon
} from '@mui/icons-material';
import { gradients } from '../../theme';

const PakkiDeleteModal = ({
  deleteConfirmationOpen,
  handleCancelDelete,
  handleConfirmDelete
}) => {
  return (
    <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ background: gradients.danger, color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DeleteIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Are you sure you want to delete this pakki? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleCancelDelete}
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                background: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            sx={{
              background: gradients.danger,
              color: '#fff',
              '&:hover': {
                background: gradients.dangerHover,
                boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default PakkiDeleteModal;
