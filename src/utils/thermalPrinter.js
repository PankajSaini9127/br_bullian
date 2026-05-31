const THERMAL_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
const THERMAL_CHAR_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

function escPosCommands() {
  return {
    init: new Uint8Array([0x1B, 0x40]),
    boldOn: new Uint8Array([0x1B, 0x45, 0x01]),
    boldOff: new Uint8Array([0x1B, 0x45, 0x00]),
    alignLeft: new Uint8Array([0x1B, 0x61, 0x00]),
    alignCenter: new Uint8Array([0x1B, 0x61, 0x01]),
    alignRight: new Uint8Array([0x1B, 0x61, 0x02]),
    doubleHeight: new Uint8Array([0x1D, 0x21, 0x11]),
    normalSize: new Uint8Array([0x1D, 0x21, 0x00]),
    cut: new Uint8Array([0x1D, 0x56, 0x01]),
    lineFeed: new Uint8Array([0x0A]),
    divider: '-'.repeat(32),
  };
}

function textToBytes(text) {
  return new TextEncoder().encode(text + '\n');
}

async function connectToPrinter() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    return { device, server, characteristic };
  } catch (error) {
    console.error('Bluetooth connection failed:', error);
    throw new Error('Bluetooth connection failed. Make sure your printer is paired and in range. Error: ' + error.message);
  }
}

async function sendToPrinter(characteristic, data) {
  const chunkSize = 512;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await characteristic.writeValueWithoutResponse(chunk);
  }
}

async function disconnectPrinter(device) {
  try {
    if (device && device.gatt && device.gatt.connected) {
      await device.gatt.disconnect();
    }
  } catch (error) {
    console.error('Bluetooth disconnect error:', error);
  }
}

export async function printPartyLedger(party, entries, summary, pendingSaudas, startDate, endDate) {
  let htmlContent = '';
  
  htmlContent += `
    <html>
    <head>
      <title>Party Ledger</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        h1 { text-align: center; margin-bottom: 10px; }
        .header { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
        .closing-section { margin-top: 30px; }
        .small-font { font-size: 10px; }
        .invoice-group { margin-bottom: 30px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>PARTY LEDGER</h1>
      <div class="header">
        <p><strong>Party:</strong> ${party.partyName || '-'}</p>
        ${startDate || endDate ? `<p><strong>Period:</strong> ${startDate || '...'} to ${endDate || '...'}</p>` : ''}
      </div>
  `;

  let runningBal = 0;
  let allPendingSaudas = pendingSaudas || [];
  
  entries.forEach((entry, index) => {
    const date = new Date(entry.date).toLocaleDateString('en-GB');
    let type, invNo, fine;
    
    if (entry.type === 'payment') {
      type = entry.paymentType === 'incoming' ? 'PAY-IN' : 'PAY-OUT';
      invNo = entry.paymentNo;
      fine = entry.paymentNo;
    } else {
      type = entry.type === 'incoming' ? 'IN' : 'SL';
      invNo = entry.invoiceNo || '-';
      fine = entry.totalFine?.toFixed(2) || '-';
    }
    
    // Calculate total amount
    let totalAmount = 0;
    if (entry.type === 'payment') {
      totalAmount = entry.amount || 0;
    } else if (entry.type === 'incoming' && entry.saudaCuts) {
      entry.saudaCuts.forEach((cut) => {
        totalAmount += (cut.cutFine * cut.rate / 1000);
      });
    } else if (entry.type === 'sales') {
      totalAmount = entry.totalFine || 0;
    }
    
    let debit, credit;
    if (entry.type === 'payment') {
      debit = entry.paymentType === 'incoming' ? totalAmount.toFixed(2) : '-';
      credit = entry.paymentType === 'outgoing' ? totalAmount.toFixed(2) : '-';
      runningBal += entry.paymentType === 'incoming' ? -totalAmount : totalAmount;
    } else {
      debit = entry.type === 'incoming' ? totalAmount.toFixed(2) : '-';
      credit = entry.type === 'sales' ? totalAmount.toFixed(2) : '-';
      runningBal += entry.type === 'incoming' ? -totalAmount : totalAmount;
    }
    const bal = runningBal.toFixed(2);

    htmlContent += `<div class="invoice-group">`;
    htmlContent += `<div class="section-title">${index + 1} - <strong>${invNo}</strong> - ${date} (${type})</div>`;
    
    // Invoice details table
    const columnHeader = entry.type === 'payment' ? 'Payment No' : 'Fine';
    htmlContent += `
      <table style="margin-bottom: 0;">
        <thead>
          <tr>
            <th>${columnHeader}</th>
            <th>Dr</th>
            <th>Cr</th>
            <th>Bal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${fine}</td>
            <td>${debit}</td>
            <td>${credit}</td>
            <td>${bal}</td>
          </tr>
        </tbody>
      </table>
    `;

    // Sauda Cuts table below invoice
    if (entry.saudaCuts && entry.saudaCuts.length > 0) {
      htmlContent += `
        <table class="small-font" style="margin-top: 0;">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Sauda</th>
              <th>Book Qty</th>
              <th>Rate</th>
              <th>Cut Fine</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
      `;
      entry.saudaCuts.forEach((cut, cutIndex) => {
        const cutAmount = (cut.cutFine * cut.rate / 1000);
        htmlContent += `
          <tr>
            <td>${cutIndex + 1}</td>
            <td>${cut.saudaNo || '-'}</td>
            <td>${cut.quantity?.toFixed(2) || '-'}</td>
            <td>${cut.rate?.toFixed(2) || '-'}</td>
            <td>${cut.cutFine?.toFixed(2) || '-'}</td>
            <td>₹${cutAmount.toFixed(2)}</td>
          </tr>
        `;
      });
      htmlContent += `
          </tbody>
        </table>
      `;
    }
    
    htmlContent += `</div>`;
  });

  // Pending Saudas table
  if (allPendingSaudas.length > 0) {
    htmlContent += `
      <div class="section-title">PENDING SAUDAS</div>
      <table>
        <thead>
          <tr>
            <th>Sauda No</th>
            <th>Booking Qty</th>
            <th>Delivered</th>
            <th>Pending</th>
          </tr>
        </thead>
        <tbody>
    `;
    allPendingSaudas.forEach((s) => {
      htmlContent += `
        <tr>
          <td>${s.saudaNo || '-'}</td>
          <td>${s.quantity?.toFixed(2) || '-'}</td>
          <td>${s.delivered?.toFixed(2) || '-'}</td>
          <td>${s.pendingQty?.toFixed(2) || '-'}</td>
        </tr>
      `;
    });
    htmlContent += `
        </tbody>
      </table>
    `;
  }

  // Closing Balance table
  let totalIncomingFromCuts = 0;
  let totalSalesFine = 0;
  let totalPaymentIn = 0;
  let totalPaymentOut = 0;
  
  entries.forEach((entry) => {
    if (entry.type === 'payment') {
      if (entry.paymentType === 'incoming') {
        totalPaymentIn += (entry.amount || 0);
      } else if (entry.paymentType === 'outgoing') {
        totalPaymentOut += (entry.amount || 0);
      }
    } else if (entry.type === 'incoming' && entry.saudaCuts) {
      entry.saudaCuts.forEach((cut) => {
        totalIncomingFromCuts += (cut.cutFine * cut.rate / 1000);
      });
    } else if (entry.type === 'sales') {
      totalSalesFine += (entry.totalFine || 0);
    }
  });

  const balance = (totalIncomingFromCuts + totalPaymentIn) - (totalSalesFine + totalPaymentOut);

  htmlContent += `
    <div class="section-title closing-section">CLOSING BALANCE</div>
    <table>
      <tbody>
        <tr>
          <td><strong>Total Incoming (from Sauda Cuts)</strong></td>
          <td>₹${totalIncomingFromCuts.toFixed(2)}</td>
        </tr>
        ${totalPaymentIn > 0 ? `
        <tr>
          <td><strong>Total Incoming (Payments)</strong></td>
          <td>₹${totalPaymentIn.toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr>
          <td><strong>Total Outgoing (Sales)</strong></td>
          <td>₹${totalSalesFine.toFixed(2)}</td>
        </tr>
        ${totalPaymentOut > 0 ? `
        <tr>
          <td><strong>Total Outgoing (Payments)</strong></td>
          <td>₹${totalPaymentOut.toFixed(2)}</td>
        </tr>
        ` : ''}
        <tr>
          <td><strong>Balance (Remaining)</strong></td>
          <td><strong>₹${balance.toFixed(2)}</strong></td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 30px; color: #666;">Printed: ${new Date().toLocaleString('en-GB')}</p>
  `;

  htmlContent += `
    </body>
    </html>
  `;

  // Print directly without opening new tab using iframe
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.top = '-9999px';
  printFrame.style.left = '-9999px';
  document.body.appendChild(printFrame);
  
  const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
  printDoc.open();
  printDoc.write(htmlContent);
  printDoc.close();
  
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();
  
  setTimeout(() => {
    document.body.removeChild(printFrame);
  }, 1000);

  return true;
}

export function isBluetoothSupported() {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
}

export async function printInvoiceThermal(invoice) {
  let htmlContent = '';
  
  const partyName = invoice.partyId?.partyName || invoice.partyName || '-';
  const invDate = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : '-';
  const invNo = invoice.invoiceNo || 'INV-' + String(invoice.id).padStart(4, '0');

  htmlContent += `
    <html>
    <head>
      <title>Invoice</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
        h1 { text-align: center; margin-bottom: 10px; font-size: 18px; }
        .header { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .section-title { font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
        .total-section { margin-top: 30px; }
        .small-font { font-size: 10px; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>BR BULLION - INCOMING INVOICE</h1>
      <div class="header">
        <p><strong>Party:</strong> ${partyName}</p>
        <p><strong>Date:</strong> ${invDate}</p>
        <p><strong>Invoice:</strong> ${invNo}</p>
      </div>
  `;

  // Items table
  htmlContent += `
    <div class="section-title">INVOICE ITEMS</div>
    <table>
      <thead>
        <tr>
          <th>Sr</th>
          <th>Pagga No</th>
          <th>Weight(g)</th>
          <th>Touch</th>
          <th>Fine(g)</th>
        </tr>
      </thead>
      <tbody>
  `;

  const items = invoice.items?.filter(i => i.paggaNo || i.weight || i.touch || i.fine) || [];
  let totalWt = 0, totalFine = 0;

  items.forEach((item, i) => {
    const wt = parseFloat(item.weight) || 0;
    const touch = parseFloat(item.touch) || 0;
    const fine = wt * touch / 100;
    const dec = fine % 1;
    const roundedFine = Math.floor(fine) + (dec <= 0.49 ? 0 : dec <= 0.99 ? 0.5 : 1);
    totalWt += wt;
    totalFine += roundedFine;

    htmlContent += `
      <tr>
        <td>${i + 1}</td>
        <td>${item.paggaNo || '-'}</td>
        <td>${wt.toFixed(2)}</td>
        <td>${touch.toFixed(2)}</td>
        <td>${roundedFine.toFixed(2)}</td>
      </tr>
    `;
  });

  htmlContent += `
      </tbody>
    </table>
  `;

  // Sauda Cuts table (smaller font)
  if (invoice.saudaCuts && invoice.saudaCuts.length > 0) {
    htmlContent += `
      <div class="section-title">SAUDA CUTS DETAILS</div>
      <table class="small-font">
        <thead>
          <tr>
            <th>Sauda No</th>
            <th>Booking Qty</th>
            <th>Delivered</th>
            <th>Rate</th>
            <th>Cut Fine</th>
          </tr>
        </thead>
        <tbody>
    `;
    invoice.saudaCuts.forEach((cut) => {
      htmlContent += `
        <tr>
          <td>${cut.saudaNo || '-'}</td>
          <td>${cut.quantity?.toFixed(2) || '-'}</td>
          <td>${cut.delivered?.toFixed(2) || '-'}</td>
          <td>${cut.rate?.toFixed(2) || '-'}</td>
          <td>${cut.cutFine?.toFixed(2) || '-'}</td>
        </tr>
      `;
    });
    htmlContent += `
        </tbody>
      </table>
    `;
  }

  // Total section
  htmlContent += `
    <div class="section-title total-section">TOTAL</div>
    <table>
      <tbody>
        <tr>
          <td><strong>Total Weight</strong></td>
          <td>${totalWt.toFixed(2)}g</td>
        </tr>
        <tr>
          <td><strong>Total Fine</strong></td>
          <td>${totalFine.toFixed(2)}g</td>
        </tr>
      </tbody>
    </table>
    <p style="margin-top: 30px; color: #666;">Printed: ${new Date().toLocaleString('en-GB')}</p>
  `;

  htmlContent += `
    </body>
    </html>
  `;

  // Print directly without opening new tab using iframe
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.top = '-9999px';
  printFrame.style.left = '-9999px';
  document.body.appendChild(printFrame);
  
  const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
  printDoc.open();
  printDoc.write(htmlContent);
  printDoc.close();
  
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();
  
  setTimeout(() => {
    document.body.removeChild(printFrame);
  }, 1000);

  return true;
}

export async function printSalesInvoiceBluetooth(invoice) {
  let htmlContent = '';
  
  const partyName = invoice.partyId?.partyName || invoice.partyName || '-';
  const invDate = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : '-';
  const invNo = invoice.salesInvoiceNo || 'SINV-' + String(invoice._id || invoice.id).padStart(4, '0');

  htmlContent += `
    <html>
    <head>
      <title>Sales Invoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 16px; 
          padding: 5px;
          width: 80mm;
          text-align: center;
        }
        h1 { 
          text-align: center; 
          margin-bottom: 5px; 
          font-size: 16px; 
          font-weight: bold;
        }
        .header { margin-bottom: 10px; }
        p { margin: 2px 0; font-size: 14px; font-weight: bold; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 10px; 
        }
        th, td { 
          padding: 2px; 
          text-align: left; 
          font-size: 12px;
          font-weight: 700;
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold; 
        }
        .total-section { margin-top: 10px; }
        .footer { margin-top: 10px; font-size: 10px; text-align: center; }
        @media print {
          body { padding: 0; }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>Outgoing Sales Invoice</h1>
      <div class="header">
        <p>Name: ${partyName}</p>
        <p>Date: ${invDate}</p>
        <p>Invoice No: ${invNo}</p>
      </div>
  `;

  // Add separator line
  htmlContent += `<hr style="border: 1px solid #ddd; margin: 5px 0;">`;

  // Table header
  htmlContent += `
    <table>
      <thead>
        <tr>
          <th>Sr</th>
          <th>Pagga</th>
          <th>Wt(g)</th>
          <th>Touch</th>
          <th>Fine(g)</th>
        </tr>
      </thead>
      <tbody>
  `;

  const items = invoice.paggaIds || [];
  let totalWt = 0, totalFine = 0;

  items.forEach((item, i) => {
    const wt = parseFloat(item.weight) || 0;
    const touch = parseFloat(item.touch) || 0;
    const fine = wt * touch / 100;
    const dec = fine % 1;
    const roundedFine = Math.floor(fine) + (dec <= 0.49 ? 0 : dec <= 0.99 ? 0.5 : 1);
    totalWt += wt;
    totalFine += roundedFine;

    htmlContent += `
      <tr>
        <td>${i + 1}</td>
        <td>${item.paggaNo || '-'}</td>
        <td>${wt.toFixed(2)}</td>
        <td>${touch.toFixed(2)}</td>
        <td>${roundedFine.toFixed(2)}</td>
      </tr>
    `;
  });

  htmlContent += `
      </tbody>
    </table>
  `;

  // Add separator line
  htmlContent += `<hr style="border: 1px solid #ddd; margin: 5px 0;">`;

  // Total section
  htmlContent += `
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${totalWt.toFixed(2)}g</p>
      <p>Total Fine: ${totalFine.toFixed(2)}g</p>
    </div>
  `;

  // Footer
  htmlContent += `<hr style="border: 1px solid #ddd; margin: 10px 0;">`;
  htmlContent += `<div class="footer">Thank you for your business!</div>`;

  htmlContent += `
    </body>
    </html>
  `;

  // Print directly without opening new tab using iframe
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.top = '-9999px';
  printFrame.style.left = '-9999px';
  document.body.appendChild(printFrame);
  
  const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
  printDoc.open();
  printDoc.write(htmlContent);
  printDoc.close();
  
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();
  
  setTimeout(() => {
    document.body.removeChild(printFrame);
  }, 1000);

  return true;
}

export async function printInvoiceBluetooth(invoice) {
  let htmlContent = '';
  
  const partyName = invoice.partyId?.partyName || invoice.partyName || '-';
  const invDate = invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : '-';
  const invNo = invoice.invoiceNo || 'INV-' + String(invoice.id).padStart(4, '0');

  htmlContent += `
    <html>
    <head>
      <title>Invoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          font-size: 16px; 
          padding: 5px;
          width: 80mm;
          text-align: center;
        }
        h1 { 
          text-align: center; 
          margin-bottom: 5px; 
          font-size: 16px; 
          font-weight: bold;
        }
        .header { margin-bottom: 10px; }
        p { margin: 2px 0; font-size: 14px; font-weight: bold; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 10px; 
        }
        th, td { 
          padding: 2px; 
          text-align: left; 
          font-size: 12px;
          font-weight: 700;
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold; 
        }
        .total-section { margin-top: 10px; }
        .footer { margin-top: 10px; font-size: 10px; text-align: center; }
        @media print {
          body { padding: 0; }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>BR BULLION - INCOMING INVOICE</h1>
      <div class="header">
        <p>Name: ${partyName}</p>
        <p>Date: ${invDate}</p>
        <p>Invoice No: ${invNo}</p>
      </div>
  `;

  // Add separator line
  htmlContent += `<hr style="border: 1px solid #ddd; margin: 5px 0;">`;

  // Table header
  htmlContent += `
    <table>
      <thead>
        <tr>
          <th>Sr</th>
          <th>Pagga</th>
          <th>Wt(g)</th>
          <th>Touch</th>
          <th>Fine(g)</th>
        </tr>
      </thead>
      <tbody>
  `;

  const items = invoice.items?.filter(i => i.paggaNo || i.weight || i.touch || i.fine) || [];
  let totalWt = 0, totalFine = 0;

  items.forEach((item, i) => {
    const wt = parseFloat(item.weight) || 0;
    const touch = parseFloat(item.touch) || 0;
    const fine = wt * touch / 100;
    const dec = fine % 1;
    const roundedFine = Math.floor(fine) + (dec <= 0.49 ? 0 : dec <= 0.99 ? 0.5 : 1);
    totalWt += wt;
    totalFine += roundedFine;

    htmlContent += `
      <tr>
        <td>${i + 1}</td>
        <td>${item.paggaNo || '-'}</td>
        <td>${wt.toFixed(2)}</td>
        <td>${touch.toFixed(2)}</td>
        <td>${roundedFine.toFixed(2)}</td>
      </tr>
    `;
  });

  htmlContent += `
      </tbody>
    </table>
  `;

  // Add separator line
  htmlContent += `<hr style="border: 1px solid #ddd; margin: 5px 0;">`;

  // Total section
  htmlContent += `
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${totalWt.toFixed(2)}g</p>
      <p>Total Fine: ${totalFine.toFixed(2)}g</p>
    </div>
  `;

  // Footer
  htmlContent += `<hr style="border: 1px solid #ddd; margin: 10px 0;">`;
  htmlContent += `<div class="footer">Thank you for your business!</div>`;

  htmlContent += `
    </body>
    </html>
  `;

  // Print directly without opening new tab using iframe
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'absolute';
  printFrame.style.top = '-9999px';
  printFrame.style.left = '-9999px';
  document.body.appendChild(printFrame);
  
  const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
  printDoc.open();
  printDoc.write(htmlContent);
  printDoc.close();
  
  printFrame.contentWindow.focus();
  printFrame.contentWindow.print();
  
  setTimeout(() => {
    document.body.removeChild(printFrame);
  }, 1000);

  return true;
}
