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

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-';

  const getDebitAmount = (entry) => {
    if (entry.type === 'payment') {
      return entry.paymentType === 'incoming' ? Math.trunc(entry.amount || 0) : 0;
    }
    if (entry.type === 'incoming') {
      return entry.saudaCuts?.reduce((s, c) => s + Math.trunc(c.cutFine * c.rate / 1000), 0) || 0;
    }
    if (entry.type === 'crosscut') {
      return entry.creditDebitType === 'debit' ? Math.trunc(entry.totalProfitLoss || 0) : 0;
    }
    return 0;
  };

  const getCreditAmount = (entry) => {
    if (entry.type === 'payment') {
      return entry.paymentType === 'outgoing' ? Math.trunc(entry.amount || 0) : 0;
    }
    if (entry.type === 'sales') {
      return entry.saudaCuts?.reduce((s, c) => s + Math.trunc(c.cutFine * c.rate / 1000), 0) || 0;
    }
    if (entry.type === 'crosscut') {
      return entry.creditDebitType === 'credit' ? Math.trunc(entry.totalProfitLoss || 0) : 0;
    }
    return 0;
  };

  let totalDebit = 0;
  let totalCredit = 0;
  const openingBalance = Math.trunc(summary?.openingBalance || 0);
  const openingDebit = openingBalance > 0 ? openingBalance : 0;
  const openingCredit = openingBalance < 0 ? Math.abs(openingBalance) : 0;
  let runningBal = openingDebit - openingCredit;

  htmlContent += `
    <html>
    <head>
      <title>Party Ledger</title>
      <style>
        @page {
          size: A4;
          margin: 14mm 5mm 12mm 5mm;
          @top-center { content: "${party.partyName || '-'}"; font-size: 9px; border-bottom: 1px solid #333; padding-bottom: 2px; }
          @bottom-center { content: "Page " counter(page); font-size: 8px; }
        }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; padding: 0; line-height: 1.2; }
        .ledger-header { text-align: center; margin-bottom: 6px; border-bottom: 1px solid #000; padding-bottom: 4px; }
        .ledger-header h2 { margin: 0; font-size: 13px; font-weight: normal; }
        .ledger-header .sub { margin: 2px 0 0; font-size: 9px; color: #333; }
        .ledger-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .ledger-table th, .ledger-table td { border: 1px solid #333; padding: 2px 4px; text-align: left; vertical-align: top; }
        .ledger-table th { font-weight: normal; background: none; font-size: 9px; }
        .ledger-table td { font-size: 9px; }
        .ledger-table .num { text-align: right; }
        .ledger-table .center { text-align: center; }
        .ledger-table .bold { font-weight: bold; }
        .ledger-table tbody tr:nth-child(even) { background: #f9f9f9; }
        .totals-row td { border-top: 2px solid #333; font-weight: bold; }
        .opening-row td { border-top: 2px solid #333; background: #f5f5f5; font-weight: bold; }
        .closing { margin-top: 6px; border-top: 1px solid #333; padding-top: 4px; }
        .closing table { width: 100%; border-collapse: collapse; }
        .closing td { border: none; padding: 1px 0; font-size: 9px; }
        .closing .num { text-align: right; }
      </style>
    </head>
    <body>
      <div class="ledger-header">
        <h2>${party.partyName || '-'}</h2>
        <div class="sub">${startDate && endDate ? formatDate(startDate) + ' to ' + formatDate(endDate) : 'Ledger Statement'}</div>
      </div>

      <table class="ledger-table">
        <thead>
          <tr>
            <th style="width:40px;">Date</th>
            <th>Particulars</th>
            <th style="width:50px;" class="num">Fine (g)</th>
            <th style="width:60px;" class="num">Debit (&#8377;)</th>
            <th style="width:60px;" class="num">Credit (&#8377;)</th>
            <th style="width:60px;" class="num">Balance (&#8377;)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="opening-row">
            <td class="center">-</td>
            <td>Opening Balance</td>
            <td class="num">-</td>
            <td class="num">${openingDebit || ''}</td>
            <td class="num">${openingCredit || ''}</td>
            <td class="num bold">${runningBal}</td>
          </tr>
  `;

  entries.forEach((entry) => {
    const date = formatDate(entry.date);
    const debit = getDebitAmount(entry);
    const credit = getCreditAmount(entry);
    totalDebit += debit;
    totalCredit += credit;
    runningBal = Math.trunc((openingDebit + totalDebit) - (openingCredit + totalCredit));

    let particulars = '';
    let fineStr = '-';

    if (entry.type === 'payment') {
      particulars = (entry.paymentType === 'incoming' ? 'Payment In' : 'Payment Out') +
        (entry.paymentNo ? ' - ' + entry.paymentNo : '');
      fineStr = '-';
    } else if (entry.type === 'incoming') {
      particulars = 'Purchase' + (entry.invoiceNo ? ' - ' + entry.invoiceNo : '');
      if (entry.saudaCuts?.length > 0) {
        const saudaNos = entry.saudaCuts.map(c => c.saudaNo).filter(Boolean).join(', ');
        if (saudaNos) particulars += ' (' + saudaNos + ')';
      }
      fineStr = entry.totalFine ? Math.trunc(entry.totalFine) + ' g' : '-';
    } else if (entry.type === 'sales') {
      particulars = 'Sales' + (entry.invoiceNo ? ' - ' + entry.invoiceNo : '');
      if (entry.saudaCuts?.length > 0) {
        const saudaNos = entry.saudaCuts.map(c => c.saudaNo).filter(Boolean).join(', ');
        if (saudaNos) particulars += ' (' + saudaNos + ')';
      }
      fineStr = entry.totalFine ? Math.trunc(entry.totalFine) + ' g' : '-';
    } else if (entry.type === 'crosscut') {
      particulars = 'Cross Cut: ' + (entry.targetSaudaNo || '-') + ' (' + (entry.targetSaudaType || '-') + ')';
      fineStr = entry.details?.reduce((sum, d) => sum + (d.crosscutQuantity || 0), 0) + ' g';
    }

    htmlContent += `
          <tr>
            <td class="center">${date}</td>
            <td>${particulars}</td>
            <td class="num">${fineStr}</td>
            <td class="num">${debit || ''}</td>
            <td class="num">${credit || ''}</td>
            <td class="num bold">${runningBal}</td>
          </tr>
    `;

    // Add crosscut details row if it's a crosscut entry
    if (entry.type === 'crosscut' && entry.details?.length > 0) {
      entry.details.forEach((detail) => {
        htmlContent += `
          <tr>
            <td colspan="6" style="padding: 2px 8px; background: #f9f9f9; font-size: 8px;">
              <strong>Source:</strong> ${detail.sourceSaudaNo || '-'} (${detail.sourceSaudaType || '-'}) | 
              <strong>Qty:</strong> ${detail.crosscutQuantity || '-'}g | 
              <strong>Source Rate:</strong> ₹${detail.sourceRate?.toLocaleString('en-IN') || '-'} | 
              <strong>Target Rate:</strong> ₹${detail.targetRate?.toLocaleString('en-IN') || '-'} | 
              <strong>P/L:</strong> ₹${detail.profitLoss?.toLocaleString('en-IN') || '-'}
            </td>
          </tr>
        `;
      });
    }

    // Add sauda cuts details under each invoice entry
    if ((entry.type === 'incoming' || entry.type === 'sales') && entry.saudaCuts?.length > 0) {
      const hasCrossCut = entry.saudaCuts.some(c => c.isCrossCut);
      entry.saudaCuts.forEach((cut) => {
        const amount = cut.cutFine && cut.rate ? (cut.cutFine * cut.rate / 1000).toFixed(0) : '-';
        const crossCutAmount = cut.isCrossCut && cut.crosscutQuantity && cut.rate 
          ? (cut.crosscutQuantity * cut.rate / 1000).toFixed(0) 
          : '-';
        const saudaDate = cut.saudaDate ? new Date(cut.saudaDate).toLocaleDateString('en-GB') : '-';
        htmlContent += `
          <tr>
            <td colspan="6" style="padding: 2px 8px; background: #fafafa; font-size: 8px;">
             <strong> Sauda No:</strong> ${cut.saudaNo || '-'} | 
              <strong>Date:</strong> ${saudaDate} | 
              <strong>Booking:</strong> ${cut.quantity?.toFixed(2) || '-'}g | 
              <strong>Rate:</strong> ₹${cut.rate?.toFixed(2) || '-'} | 
              <strong>Cut Fine:</strong> ${cut.cutFine?.toFixed(2) || '-'}g | 
              <strong>Amount:</strong> ₹${amount}
              ${hasCrossCut ? ` | <strong>Cross Qty:</strong> ${cut.isCrossCut ? (cut.crosscutQuantity || '-') : '-'}g` : ''}
              ${hasCrossCut ? ` | <strong>Source Rate:</strong> ${cut.isCrossCut ? ('₹' + (cut.sourceRate?.toLocaleString('en-IN') || '-')) : '-'}` : ''}
              ${hasCrossCut ? ` | <strong>Target Rate:</strong> ${cut.isCrossCut ? ('₹' + (cut.targetRate?.toLocaleString('en-IN') || '-')) : '-'}` : ''}
              ${hasCrossCut ? ` | <strong>Cross Amount:</strong> ₹${crossCutAmount}` : ''}
            </td>
          </tr>
        `;
      });
    }
  });

  const closingBal = Math.trunc((openingDebit + totalDebit) - (openingCredit + totalCredit));

  htmlContent += `
          <tr class="totals-row">
            <td colspan="3" class="center">Closing Balance</td>
            <td class="num">${openingDebit + totalDebit}</td>
            <td class="num">${openingCredit + totalCredit}</td>
            <td class="num">${closingBal}</td>
          </tr>
        </tbody>
      </table>
  `;

  // Pending Saudas
  if (pendingSaudas && pendingSaudas.length > 0) {
    htmlContent += `
      <div style="margin-top: 8px;">
        <div style="font-weight: bold; font-size: 9px; margin-bottom: 2px;">Pending Saudas</div>
        <table class="ledger-table">
          <thead>
            <tr>
              <th>Sauda No</th>
              <th>Type</th>
              <th class="num">Qty</th>
              <th class="num">Delivered</th>
              <th class="num">Pending</th>
              <th class="num">Rate</th>
            </tr>
          </thead>
          <tbody>
    `;
    pendingSaudas.forEach((s) => {
      htmlContent += `
            <tr>
              <td>${s.saudaNo || '-'}</td>
              <td>${s.saudaType || '-'}</td>
              <td class="num">${s.quantity || '-'}</td>
              <td class="num">${s.delivered || '-'}</td>
              <td class="num">${s.pendingQty || '-'}</td>
              <td class="num">${s.rate || '-'}</td>
            </tr>
      `;
    });
    htmlContent += `
          </tbody>
        </table>
      </div>
    `;
  }

  htmlContent += `
      <div style="margin-top: 10px; font-size: 8px; color: #666; text-align: right;">
        Printed: ${new Date().toLocaleString('en-GB')}
      </div>
    </body>
    </html>
  `;

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
        body { font-family: Arial, sans-serif; font-size: 8px; padding: 4px; line-height: 1.1; }
        h1 { text-align: center; margin: 0 0 2px; font-size: 11px; }
        p { margin: 1px 0; }
        .header { margin-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 3px; }
        th, td { border: 1px solid #ddd; padding: 1px 2px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .section-title { font-weight: bold; margin-top: 4px; margin-bottom: 2px; }
        .total-section { margin-top: 5px; }
        .small-font { font-size: 7px; }
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
    const roundedFine = Math.floor(fine) + (dec < 0.5 ? 0 : 0.5);
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
    const hasCrossCut = invoice.saudaCuts.some(c => c.isCrossCut);
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
            ${hasCrossCut ? '<th>Cross Qty</th>' : ''}
            ${hasCrossCut ? '<th>Source Rate</th>' : ''}
            ${hasCrossCut ? '<th>Target Rate</th>' : ''}
            ${hasCrossCut ? '<th>Amount</th>' : ''}
          </tr>
        </thead>
        <tbody>
    `;
    invoice.saudaCuts.forEach((cut) => {
      const crossCutAmount = cut.isCrossCut && cut.crosscutQuantity && cut.rate 
        ? (cut.crosscutQuantity * cut.rate / 1000).toFixed(2) 
        : '-';
      htmlContent += `
        <tr>
          <td>${cut.saudaNo || '-'}</td>
          <td>${cut.quantity?.toFixed(2) || '-'}</td>
          <td>${cut.delivered?.toFixed(2) || '-'}</td>
          <td>${cut.rate?.toFixed(2) || '-'}</td>
          <td>${cut.cutFine?.toFixed(2) || '-'}</td>
          ${hasCrossCut ? `<td>${cut.isCrossCut ? (cut.crosscutQuantity || '-') : '-'}</td>` : ''}
          ${hasCrossCut ? `<td>${cut.isCrossCut ? (cut.sourceRate?.toLocaleString('en-IN') || '-') : '-'}</td>` : ''}
          ${hasCrossCut ? `<td>${cut.isCrossCut ? (cut.targetRate?.toLocaleString('en-IN') || '-') : '-'}</td>` : ''}
          ${hasCrossCut ? `<td>${crossCutAmount}</td>` : ''}
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
    const roundedFine = Math.floor(fine) + (dec < 0.5 ? 0 : 0.5);
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
    const roundedFine = Math.floor(fine) + (dec < 0.5 ? 0 : 0.5);
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
