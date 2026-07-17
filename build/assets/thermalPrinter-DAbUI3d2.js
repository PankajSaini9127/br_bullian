async function U(e,a,P,N,C,$){let d="";const y=t=>t?new Date(t).toLocaleDateString("en-GB"):"-",f=t=>{var F,z;return t.type==="payment"?t.paymentType==="incoming"?Math.trunc(t.amount||0):0:t.type==="Purchase"?t.amount?Math.trunc(t.amount):((F=t.saudaCuts)==null?void 0:F.reduce((v,c)=>v+Math.trunc(c.cutFine*c.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="debit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?((z=t.saudaCuts)==null?void 0:z.reduce((v,c)=>v+Math.trunc(c.cutFine*c.rate/1e3),0))||0:t.type==="debit-note"?Math.trunc(t.amount||0):0},s=t=>{var F,z;return t.type==="payment"?t.paymentType==="outgoing"?Math.trunc(t.amount||0):0:t.type==="sales"?((F=t.saudaCuts)==null?void 0:F.reduce((v,c)=>v+Math.trunc(c.cutFine*c.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="credit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?0:t.type==="Purchase Return"?t.amount?Math.trunc(t.amount):((z=t.saudaCuts)==null?void 0:z.reduce((v,c)=>v+Math.trunc(c.cutFine*c.rate/1e3),0))||0:t.type==="credit-note"?Math.trunc(t.amount||0):0};console.log(P);let g=0,u=0;const h=Math.trunc((e==null?void 0:e.openingBalance)||0),r=h>0?h:0,l=h<0?Math.abs(h):0;let m=r-l;d+=`
    <html>
    <head>
      <title>Party Ledger</title>
      <style>
        @page {
          size: A4;
          margin: 14mm 5mm 12mm 5mm;
          @top-center { content: "${e.partyName||"-"}"; font-size: 9px; border-bottom: 1px solid #333; padding-bottom: 2px; }
          @bottom-center { content: "Page " counter(page); font-size: 8px; }
        }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; padding: 0; line-height: 1.2; }
        .ledger-header { text-align: center; margin-bottom: 6px; border-bottom: 1px solid #000; padding-bottom: 4px; }
        .ledger-header h2 { margin: 0; font-size: 13px; font-weight: normal; }
        .ledger-header .sub { margin: 2px 0 0; font-size: 9px; color: #333; }
        .ledger-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .ledger-table th, .ledger-table td { border: 1px dotted #ccc; padding: 2px 4px; text-align: left; vertical-align: top; }
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
        <h2>${e.partyName||"-"}</h2>
        <div class="sub">${C&&$?y(C)+" to "+y($):"Ledger Statement"}</div>
      </div>

      <table class="ledger-table">
        <thead>
          <tr>
            <th style="width:40px;">Date</th>
            <th style="width:80px;">Type</th>
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
            <td>-</td>
            <td>Opening Balance</td>
            <td class="num">-</td>
            <td class="num">${r||""}</td>
            <td class="num">${l||""}</td>
            <td class="num bold">${m}</td>
          </tr>
  `;const w=t=>t.type==="payment"?t.paymentType==="incoming"?"Payment":"Payment Outgoing":t.type==="Purchase"?"Purchase":t.type==="Purchase Return"?"Purchase Return":t.type==="sales"?"Sales Invoice":t.type==="sales-return"?"Sales Return":t.type==="crosscut"?"Cross Cut":t.type==="credit-note"?"Credit Note":t.type==="debit-note"?"Debit Note":"-";let b=null,x=null;a.forEach(t=>{var R,L,W;const F=y(t.date),z=f(t),v=s(t);g+=z,u+=v,m=Math.trunc(r+g-(l+u));let c=t.type;if(b!==null&&b!==c&&(d+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
      `),b==="Purchase"&&c==="Purchase"){const p=t.invoiceNo;x!==null&&x!==p&&(d+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
        `)}b=c,x=t.invoiceNo;let D="",S="-";if(t.type==="payment"?(D=(t.paymentType==="incoming"?"Payment In":"Payment Out")+(t.paymentNo?" - "+t.paymentNo:"")+(t.remark?" ("+t.remark+")":""),S="-"):t.type==="Purchase"?(D="Purchase"+(t.invoiceNo?" - "+t.invoiceNo:""),S=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="Purchase Return"?(D="Purchase Return"+(t.invoiceNo?" - "+t.invoiceNo:""),S=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales"?(D="Sales"+(t.invoiceNo?" - "+t.invoiceNo:""),S=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales-return"?(D="Sales Return"+(t.invoiceNo?" - "+t.invoiceNo:""),S=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="crosscut"?(D="Cross Cut: "+(t.targetSaudaNo||"-")+" ("+(t.targetSaudaType||"-")+")",S=((R=t.details)==null?void 0:R.reduce((p,n)=>p+(n.crosscutQuantity||0),0))+" g"):t.type==="credit-note"?(D="Credit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),S=t.fine?t.fine+" g":"-"):t.type==="debit-note"&&(D="Debit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),S=t.fine?t.fine+" g":"-"),d+=`
          <tr>
            <td class="center">${F}</td>
            <td>${w(t)}</td>
            <td>${D}</td>
            <td class="num">${S}</td>
            <td class="num">${z||""}</td>
            <td class="num">${v||""}</td>
            <td class="num bold">${m}</td>
          </tr>
    `,t.type==="crosscut"&&((L=t.details)==null?void 0:L.length)>0&&t.details.forEach(p=>{var n,T,I;d+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #f9f9f9; font-size: 8px;">
              <strong>Source:</strong> ${p.sourceSaudaNo||"-"} (${p.sourceSaudaType||"-"}) | 
              <strong>Qty:</strong> ${p.crosscutQuantity||"-"}g | 
              <strong>Source Rate:</strong> ₹${((n=p.sourceRate)==null?void 0:n.toLocaleString("en-IN"))||"-"} | 
              <strong>Target Rate:</strong> ₹${((T=p.targetRate)==null?void 0:T.toLocaleString("en-IN"))||"-"} | 
              <strong>P/L:</strong> ₹${((I=p.profitLoss)==null?void 0:I.toLocaleString("en-IN"))||"-"}
            </td>
          </tr>
        `}),(t.type==="Purchase"||t.type==="Purchase Return"||t.type==="sales"||t.type==="sales-return")&&((W=t.saudaCuts)==null?void 0:W.length)>0){const p=t.saudaCuts.some(n=>n.isCrossCut);t.saudaCuts.forEach(n=>{var E,A,G,Q,O;const T=n.cutFine&&n.rate?(n.cutFine*n.rate/1e3).toFixed(0):"-",I=n.isCrossCut&&n.crosscutQuantity&&n.rate?(n.crosscutQuantity*n.rate/1e3).toFixed(0):"-",H=n.saudaDate?new Date(n.saudaDate).toLocaleDateString("en-GB"):"-";d+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #fafafa; font-size: 8px;">
             <strong> Sauda No:</strong> ${n.saudaNo||"-"} | 
            <strong>Date:</strong> ${H} | 
            <strong>Booking:</strong> ${((E=n.quantity)==null?void 0:E.toFixed(2))||"-"}g | 
            <strong>Rate:</strong> ₹${((A=n.rate)==null?void 0:A.toFixed(2))||"-"} | 
            <strong>Cut Fine:</strong> ${((G=n.cutFine)==null?void 0:G.toFixed(2))||"-"}g | 
            <strong>Amount:</strong> ₹${T}
            ${p?` | <strong>Cross Qty:</strong> ${n.isCrossCut&&n.crosscutQuantity||"-"}g`:""}
            ${p?` | <strong>Source Rate:</strong> ${n.isCrossCut?"₹"+(((Q=n.sourceRate)==null?void 0:Q.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${p?` | <strong>Target Rate:</strong> ${n.isCrossCut?"₹"+(((O=n.targetRate)==null?void 0:O.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${p?` | <strong>Cross Amount:</strong> ₹${I}`:""}
          </td>
        </tr>
      `})}});const o=Math.trunc(r+g-(l+u));d+=`
          <tr class="totals-row">
            <td colspan="4" class="center">Closing Balance</td>
            <td class="num">${r+g}</td>
            <td class="num">${l+u}</td>
            <td class="num">${o!==0?o>0?o+" (dena hai)":o+" (lena hai)":o}</td>
          </tr>
        </tbody>
      </table>
  `,N&&N.length>0&&(d+=`
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
    `,N.forEach(t=>{const F=((parseFloat(t.quantity)||0)-(parseFloat(t.delivered)||0)).toFixed(1);d+=`
            <tr>
              <td>${t.saudaNo||"-"}</td>
              <td>${t.saudaType||"-"}</td>
              <td class="num">${t.quantity||"-"}</td>
              <td class="num">${t.delivered||"-"}</td>
              <td class="num">${F||"-"}</td>
              <td class="num">${t.rate||"-"}</td>
            </tr>
      `}),d+=`
          </tbody>
        </table>
      </div>
    `),d+=`
      <div style="margin-top: 10px; font-size: 8px; color: #666; text-align: right;">
        Printed: ${new Date().toLocaleString("en-GB")}
      </div>
    </body>
    </html>
  `;const i=document.createElement("iframe");i.style.position="absolute",i.style.top="-9999px",i.style.left="-9999px",document.body.appendChild(i);const M=i.contentDocument||i.contentWindow.document;return M.open(),M.write(d),M.close(),i.contentWindow.focus(),i.contentWindow.print(),setTimeout(()=>{document.body.removeChild(i)},1e3),!0}function q(e){var m,w,b,x;const a=o=>o?new Date(o).toLocaleDateString("en-GB"):"-",P=((m=e==null?void 0:e.incoming)==null?void 0:m.payments)||[],N=((w=e==null?void 0:e.outgoing)==null?void 0:w.payments)||[],C=((b=e==null?void 0:e.incoming)==null?void 0:b.total)||0,$=((x=e==null?void 0:e.outgoing)==null?void 0:x.total)||0,d=(e==null?void 0:e.balance)||0,y=(e==null?void 0:e.cashInHand)||0,f=[];P.forEach(o=>{var i;f.push({date:o.paymentDate,particular:((i=o.partyId)==null?void 0:i.partyName)||"-",voucherType:"Receipt",voucherNo:o.paymentNo||"-",remark:o.remark||"",debit:o.amount||0,credit:0})}),N.forEach(o=>{var i;f.push({date:o.paymentDate,particular:((i=o.partyId)==null?void 0:i.partyName)||"-",voucherType:"Payment",voucherNo:o.paymentNo||"-",remark:o.remark||"",debit:0,credit:o.amount||0})}),f.sort((o,i)=>new Date(o.date)-new Date(i.date));let s=0;const g=f.map(o=>(s=s+o.debit-o.credit,{...o,balance:s}));let u="";g.forEach(o=>{u+=`
      <tr>
        <td class="center">${a(o.date)}</td>
        <td>${o.particular}${o.remark?" ("+o.remark+")":""}</td>
        <td class="center">${o.voucherType}</td>
        <td class="center">${o.voucherNo}</td>
        <td class="num">${o.debit>0?Math.trunc(o.debit):""}</td>
        <td class="num">${o.credit>0?Math.trunc(o.credit):""}</td>
        <td class="num bold">${Math.trunc(o.balance)}</td>
      </tr>
    `});const h=`
    <html>
    <head>
      <title>Cash Book</title>
      <style>
        @page {
          size: A4;
          margin: 14mm 5mm 12mm 5mm;
          @top-center { content: "Cash Book"; font-size: 9px; border-bottom: 1px solid #333; padding-bottom: 2px; }
          @bottom-center { content: "Page " counter(page); font-size: 8px; }
        }
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; padding: 0; line-height: 1.2; }
        .ledger-header { text-align: center; margin-bottom: 6px; border-bottom: 1px solid #000; padding-bottom: 4px; }
        .ledger-header h2 { margin: 0; font-size: 13px; font-weight: normal; }
        .ledger-header .sub { margin: 2px 0 0; font-size: 9px; color: #333; }
        .ledger-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .ledger-table th, .ledger-table td { border: 1px dotted #ccc; padding: 2px 4px; text-align: left; vertical-align: top; }
        .ledger-table th { font-weight: normal; background: none; font-size: 9px; }
        .ledger-table td { font-size: 9px; }
        .ledger-table .num { text-align: right; }
        .ledger-table .center { text-align: center; }
        .ledger-table .bold { font-weight: bold; }
        .ledger-table tbody tr:nth-child(even) { background: #f9f9f9; }
        .totals-row td { border-top: 2px solid #333; font-weight: bold; }
        .closing { margin-top: 6px; border-top: 1px solid #333; padding-top: 4px; }
        .closing table { width: 100%; border-collapse: collapse; }
        .closing td { border: none; padding: 1px 0; font-size: 9px; }
        .closing .num { text-align: right; }
      </style>
    </head>
    <body>
      <div class="ledger-header">
        <h2>Cash Book</h2>
        <div class="sub">${new Date().toLocaleDateString("en-GB")}</div>
      </div>

      <table class="ledger-table">
        <thead>
          <tr>
            <th style="width:40px;">Date</th>
            <th>Particulars</th>
            <th style="width:50px;" class="center">Type</th>
            <th style="width:70px;" class="center">Voucher No</th>
            <th style="width:60px;" class="num">Debit (&#8377;)</th>
            <th style="width:60px;" class="num">Credit (&#8377;)</th>
            <th style="width:60px;" class="num">Balance (&#8377;)</th>
          </tr>
        </thead>
        <tbody>
          ${u}
          <tr class="totals-row">
            <td colspan="4" class="center">Total</td>
            <td class="num">${Math.trunc(C)}</td>
            <td class="num">${Math.trunc($)}</td>
            <td class="num">${Math.trunc(d)}</td>
          </tr>
        </tbody>
      </table>

      <div class="closing">
        <table>
          <tr>
            <td><strong>Total Incoming:</strong></td>
            <td class="num">&#8377;${Math.trunc(C)}</td>
          </tr>
          <tr>
            <td><strong>Total Outgoing:</strong></td>
            <td class="num">&#8377;${Math.trunc($)}</td>
          </tr>
          <tr>
            <td><strong>Closing Balance:</strong></td>
            <td class="num">&#8377;${Math.trunc(d)}</td>
          </tr>
          <tr>
            <td><strong>Cash In Hand:</strong></td>
            <td class="num">&#8377;${Math.trunc(y)}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 10px; font-size: 8px; color: #666; text-align: right;">
        Printed: ${new Date().toLocaleString("en-GB")}
      </div>
    </body>
    </html>
  `,r=document.createElement("iframe");r.style.position="absolute",r.style.top="-9999px",r.style.left="-9999px",document.body.appendChild(r);const l=r.contentDocument||r.contentWindow.document;return l.open(),l.write(h),l.close(),r.contentWindow.focus(),r.contentWindow.print(),setTimeout(()=>{document.body.removeChild(r)},1e3),!0}async function V(e){var u;let a="";console.log(e);const P=((u=e.partyId)==null?void 0:u.partyName)||e.partyName||"-",N=e.invoiceDate?new Date(e.invoiceDate).toLocaleDateString("en-GB"):"-",C=e.salesInvoiceNo||"SINV-"+String(e._id||e.id).padStart(4,"0"),$=e.isReturn||!1;console.log($),a+=`
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
      <h1>${$?"SALES RETURN":"Sales Invoice"}</h1>
      <div class="header">
        <p>Name: ${P}</p>
        <p>Date: ${N}</p>
        <p>Invoice No: ${C}</p>
      </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
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
  `;const d=e.paggaIds||[];let y=0,f=0;d.forEach((h,r)=>{const l=parseFloat(h.weight)||0,m=parseFloat(h.touch)||0,w=l*m/100,b=w%1,x=Math.floor(w)+(b<.45?0:b<.9?.5:1);y+=l,f+=x,a+=`
      <tr>
        <td>${r+1}</td>
        <td>${h.paggaNo||"-"}</td>
        <td>${l.toFixed(2)}</td>
        <td>${m.toFixed(2)}</td>
        <td>${x.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${y.toFixed(2)}g</p>
      <p>Total Fine: ${f.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const s=document.createElement("iframe");s.style.position="absolute",s.style.top="-9999px",s.style.left="-9999px",document.body.appendChild(s);const g=s.contentDocument||s.contentWindow.document;return g.open(),g.write(a),g.close(),s.contentWindow.focus(),s.contentWindow.print(),setTimeout(()=>{document.body.removeChild(s)},1e3),!0}async function _(e){var u,h;let a="";const P=((u=e.partyId)==null?void 0:u.partyName)||e.partyName||"-",N=e.invoiceDate?new Date(e.invoiceDate).toLocaleDateString("en-GB"):"-",C=e.invoiceNo||"INV-"+String(e.id).padStart(4,"0"),$=e.isReturn||!1;a+=`
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
      <h1>BR BULLION - ${$?"Purchase Return":"Purchase Invoice"}</h1>
      <div class="header">
        <p>Name: ${P}</p>
        <p>Date: ${N}</p>
        <p>Invoice No: ${C}</p>
      </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
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
  `;const d=((h=e.items)==null?void 0:h.filter(r=>r.paggaNo||r.weight||r.touch||r.fine))||[];let y=0,f=0;d.forEach((r,l)=>{const m=parseFloat(r.weight)||0,w=parseFloat(r.touch)||0,b=m*w/100,x=b%1,o=Math.floor(b)+(x<.45?0:x<.9?.5:1);y+=m,f+=o,a+=`
      <tr>
        <td>${l+1}</td>
        <td>${r.paggaNo||"-"}</td>
        <td>${m.toFixed(2)}</td>
        <td>${w.toFixed(2)}</td>
        <td>${o.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${y.toFixed(2)}g</p>
      <p>Total Fine: ${f.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const s=document.createElement("iframe");s.style.position="absolute",s.style.top="-9999px",s.style.left="-9999px",document.body.appendChild(s);const g=s.contentDocument||s.contentWindow.document;return g.open(),g.write(a),g.close(),s.contentWindow.focus(),s.contentWindow.print(),setTimeout(()=>{document.body.removeChild(s)},1e3),!0}export{V as a,U as b,q as c,_ as p};
