const fs = require('fs');

const dialog1 = fs.readFileSync('dialog_1.jsx', 'utf8');

const imports = `import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button
} from '@mui/material';
import {
  Delete as DeleteIcon
} from '@mui/icons-material';
import { gradients } from '../../../theme';
`;

const propsList = [
    'deleteConfirmationOpen', 'handleCancelDelete', 'handleConfirmDelete'
];

const componentStr = `${imports}
const PakkiDeleteModal = ({
  ${propsList.join(',\n  ')}
}) => {
  return (
    ${dialog1}
  );
};

export default PakkiDeleteModal;
`;

fs.writeFileSync('src/components/Chorsa999/PakkiDeleteModal.jsx', componentStr);
console.log('Saved PakkiDeleteModal.jsx');
