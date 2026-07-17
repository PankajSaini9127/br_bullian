const fs = require('fs');

const dialog2 = fs.readFileSync('dialog_2.jsx', 'utf8');

const imports = `import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Stack
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Sell as SellIcon
} from '@mui/icons-material';
import { gradients } from '../../../theme';
`;

const propsList = [
    'bhavcutModalOpen', 'setBhavcutModalOpen', 'formData', 'bhavcutWeight',
    'bhavcutDate', 'setBhavcutDate', 'bhavcutRate', 'setBhavcutRate',
    'handleBhavcutSubmit', 'pageTitle'
];

const componentStr = `${imports}
const PakkiBhavcutModal = ({
  ${propsList.join(',\n  ')}
}) => {
  return (
    ${dialog2}
  );
};

export default PakkiBhavcutModal;
`;

fs.writeFileSync('src/components/Chorsa999/PakkiBhavcutModal.jsx', componentStr);
console.log('Saved PakkiBhavcutModal.jsx');
