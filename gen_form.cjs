const fs = require('fs');

const dialog0 = fs.readFileSync('dialog_0.jsx', 'utf8');

const imports = `import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, IconButton, Grid, Paper, Divider, Collapse,
  Table, TableHead, TableBody, TableRow, TableCell, Chip,
  TextField, InputAdornment, Button, Autocomplete, Alert, Stack, CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  Check as CheckIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { gradients } from '../../../theme';
`;

const propsList = [
    'modalOpen', 'handleCloseModal', 'editingChorsa', 'formData', 'setFormData',
    'parties', 'partySearchQuery', 'setPartySearchQuery', 'partySearchResults',
    'formPendingPakkiGroups', 'loadingFormPending', 'expandedFormGroups', 'setExpandedFormGroups',
    'handleInputChange', 'handleSaveChorsa', 'formatDate', 'pageTitle'
];

const componentStr = `${imports}
const PakkiFormModal = ({
  ${propsList.join(',\n  ')}
}) => {
  const cardColor = formData.type === 'buy' ? '#10b981' : '#f59e0b';
  
  return (
    ${dialog0}
  );
};

export default PakkiFormModal;
`;

fs.writeFileSync('src/components/Chorsa999/PakkiFormModal.jsx', componentStr);
console.log('Saved PakkiFormModal.jsx');
