import React, { useState } from 'react';

import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Box,
} from '@mui/material';

import {
  Delete as DeleteIcon,
  Print as PrintIcon,
} from '@mui/icons-material';

import jsPDF from 'jspdf';

const SaudaDetails = () => {
  const [entries, setEntries] = useState([
    {
      srNo: 1,
      weight: '',
      rate: '',
      amount: 0,
    },
  ]);

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (index, field, value) => {
    const updated = [...entries];

    updated[index][field] = value;

    const weight =
      parseFloat(updated[index].weight) || 0;

    const rate =
      parseFloat(updated[index].rate) || 0;

    updated[index].amount = weight * rate;

    setEntries(updated);
  };

  // =========================
  // ADD ROW
  // =========================

  const addRow = () => {
    setEntries([
      ...entries,
      {
        srNo: entries.length + 1,
        weight: '',
        rate: '',
        amount: 0,
      },
    ]);
  };

  // =========================
  // DELETE ROW
  // =========================

  const deleteRow = (index) => {
    const updated = entries
      .filter((_, i) => i !== index)
      .map((item, i) => ({
        ...item,
        srNo: i + 1,
      }));

    setEntries(updated);
  };

  // =========================
  // TOTALS
  // =========================

  const totalWeight = entries.reduce(
    (sum, item) =>
      sum + (parseFloat(item.weight) || 0),
    0
  );

  const totalAmount = entries.reduce(
    (sum, item) =>
      sum + (parseFloat(item.amount) || 0),
    0
  );

  // =========================
  // PRINT
  // =========================

  const handlePrint = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 300],
    });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    doc.text('BR BULLION', 40, 10, {
      align: 'center',
    });

    doc.setFontSize(8);

    doc.text('Sauda Details', 40, 16, {
      align: 'center',
    });

    doc.line(5, 20, 75, 20);

    // =====================
    // TABLE HEADER
    // =====================

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');

    doc.text('Sr', 5, 28);
    doc.text('Weight', 20, 28);
    doc.text('Rate', 40, 28);
    doc.text('Amount', 58, 28);

    doc.line(5, 30, 75, 30);

    let y = 36;

    // =====================
    // TABLE DATA
    // =====================

    doc.setFont('helvetica', 'normal');

    entries.forEach((item) => {
      doc.text(String(item.srNo), 5, y);

      doc.text(
        String(item.weight || '-'),
        20,
        y
      );

      doc.text(
        String(item.rate || '-'),
        40,
        y
      );

      doc.text(
        String(item.amount.toFixed(2)),
        58,
        y
      );

      y += 6;
    });

    // =====================
    // TOTALS
    // =====================

    doc.line(5, y, 75, y);

    y += 8;

    doc.setFont('helvetica', 'bold');

    doc.text(
      `Total Weight: ${totalWeight.toFixed(3)}`,
      5,
      y
    );

    y += 6;

    doc.text(
      `Total Amount: Rs. ${totalAmount.toFixed(2)}`,
      5,
      y
    );

    y += 10;

    doc.line(5, y, 75, y);

    y += 6;

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');

    doc.text(
      'Thank you for your business!',
      40,
      y,
      {
        align: 'center',
      }
    );

    doc.save('sauda-details.pdf');

    doc.autoPrint();
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mt: { xs: 2, md: 4 } }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 'bold',
          }}
        >
          Sauda Details
        </Typography>

        {/* ===================== */}
        {/* TABLE */}
        {/* ===================== */}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Sr No
                </TableCell>

                <TableCell>
                  Weight
                </TableCell>

                <TableCell>
                  Rate
                </TableCell>

                <TableCell>
                  Amount
                </TableCell>

                <TableCell>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {item.srNo}
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      type="text"
                      value={item.weight}
                      onChange={(e) =>
                        handleChange(
                          index,
                          'weight',
                          e.target.value
                        )
                      }
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                    />
                  </TableCell>

                  <TableCell>
                    <TextField
                      size="small"
                      type="text"
                      value={item.rate}
                      onChange={(e) =>
                        handleChange(
                          index,
                          'rate',
                          e.target.value
                        )
                      }
                      inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
                    />
                  </TableCell>

                  <TableCell>
                    ₹ {item.amount.toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() =>
                        deleteRow(index)
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ===================== */}
        {/* BUTTONS */}
        {/* ===================== */}

        <Box
          sx={{
            mt: 3,
            display: 'flex',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={addRow}
          >
            Add Multiple Sauda
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Save & Print
          </Button>
        </Box>

        {/* ===================== */}
        {/* TOTALS */}
        {/* ===================== */}

        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 5,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Total Weight:
            {' '}
            {totalWeight.toFixed(3)}
          </Typography>

          <Typography
            variant="h6"
            fontWeight="bold"
            color="success.main"
          >
            Total Amount:
            {' '}
            ₹ {totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SaudaDetails;