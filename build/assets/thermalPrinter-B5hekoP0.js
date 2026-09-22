async function K(e,a,F,v,N,x){let s="";const i=t=>t?new Date(t).toLocaleDateString("en-GB"):"-",g=t=>{var S,z;return t.type==="payment"?t.paymentType==="incoming"?Math.trunc(t.amount||0):0:t.type==="Purchase"?t.amount?Math.trunc(t.amount):((S=t.saudaCuts)==null?void 0:S.reduce((C,b)=>C+Math.trunc(b.cutFine*b.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="debit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?((z=t.saudaCuts)==null?void 0:z.reduce((C,b)=>C+Math.trunc(b.cutFine*b.rate/1e3),0))||0:t.type==="debit-note"?Math.trunc(t.amount||0):0},n=t=>{var S,z;return t.type==="payment"?t.paymentType==="outgoing"?Math.trunc(t.amount||0):0:t.type==="sales"?((S=t.saudaCuts)==null?void 0:S.reduce((C,b)=>C+Math.trunc(b.cutFine*b.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="credit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?0:t.type==="Purchase Return"?t.amount?Math.trunc(t.amount):((z=t.saudaCuts)==null?void 0:z.reduce((C,b)=>C+Math.trunc(b.cutFine*b.rate/1e3),0))||0:t.type==="credit-note"?Math.trunc(t.amount||0):0};console.log(F);let l=0,u=0;const h=Math.trunc((e==null?void 0:e.openingBalance)||0),r=h>0?h:0,c=h<0?Math.abs(h):0;let m=r-c;s+=`
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
        <div class="sub">${N&&x?i(N)+" to "+i(x):"Ledger Statement"}</div>
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
            <td class="num">${c||""}</td>
            <td class="num bold">${m}</td>
          </tr>
  `;const $=t=>t.type==="payment"?t.paymentType==="incoming"?"Payment":"Payment Outgoing":t.type==="Purchase"?"Purchase":t.type==="Purchase Return"?"Purchase Return":t.type==="sales"?"Sales Invoice":t.type==="sales-return"?"Sales Return":t.type==="crosscut"?"Cross Cut":t.type==="credit-note"?"Credit Note":t.type==="debit-note"?"Debit Note":"-";let y=null,w=null;a.forEach(t=>{var R,L,W;const S=i(t.date),z=g(t),C=n(t);l+=z,u+=C,m=Math.trunc(r+l-(c+u));let b=t.type;if(y!==null&&y!==b&&(s+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
      `),y==="Purchase"&&b==="Purchase"){const f=t.invoiceNo;w!==null&&w!==f&&(s+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
        `)}y=b,w=t.invoiceNo;let P="",T="-";if(t.type==="payment"?(P=(t.paymentType==="incoming"?"Payment In":"Payment Out")+(t.paymentNo?" - "+t.paymentNo:"")+(t.remark?" ("+t.remark+")":""),T="-"):t.type==="Purchase"?(P="Purchase"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="Purchase Return"?(P="Purchase Return"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales"?(P="Sales"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales-return"?(P="Sales Return"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="crosscut"?(P="Cross Cut: "+(t.targetSaudaNo||"-")+" ("+(t.targetSaudaType||"-")+")",T=((R=t.details)==null?void 0:R.reduce((f,d)=>f+(d.crosscutQuantity||0),0))+" g"):t.type==="credit-note"?(P="Credit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),T=t.fine?t.fine+" g":"-"):t.type==="debit-note"&&(P="Debit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),T=t.fine?t.fine+" g":"-"),s+=`
          <tr>
            <td class="center">${S}</td>
            <td>${$(t)}</td>
            <td>${P}</td>
            <td class="num">${T}</td>
            <td class="num">${z||""}</td>
            <td class="num">${C||""}</td>
            <td class="num bold">${m}</td>
          </tr>
    `,t.type==="crosscut"&&((L=t.details)==null?void 0:L.length)>0&&t.details.forEach(f=>{var d,D,I;s+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #f9f9f9; font-size: 8px;">
              <strong>Source:</strong> ${f.sourceSaudaNo||"-"} (${f.sourceSaudaType||"-"}) | 
              <strong>Qty:</strong> ${f.crosscutQuantity||"-"}g | 
              <strong>Source Rate:</strong> ₹${((d=f.sourceRate)==null?void 0:d.toLocaleString("en-IN"))||"-"} | 
              <strong>Target Rate:</strong> ₹${((D=f.targetRate)==null?void 0:D.toLocaleString("en-IN"))||"-"} | 
              <strong>P/L:</strong> ₹${((I=f.profitLoss)==null?void 0:I.toLocaleString("en-IN"))||"-"}
            </td>
          </tr>
        `}),(t.type==="Purchase"||t.type==="Purchase Return"||t.type==="sales"||t.type==="sales-return")&&((W=t.saudaCuts)==null?void 0:W.length)>0){const f=t.saudaCuts.some(d=>d.isCrossCut);t.saudaCuts.forEach(d=>{var E,A,G,Q,O;const D=d.cutFine&&d.rate?(d.cutFine*d.rate/1e3).toFixed(0):"-",I=d.isCrossCut&&d.crosscutQuantity&&d.rate?(d.crosscutQuantity*d.rate/1e3).toFixed(0):"-",H=d.saudaDate?new Date(d.saudaDate).toLocaleDateString("en-GB"):"-";s+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #fafafa; font-size: 8px;">
             <strong> Sauda No:</strong> ${d.saudaNo||"-"} | 
            <strong>Date:</strong> ${H} | 
            <strong>Booking:</strong> ${((E=d.quantity)==null?void 0:E.toFixed(2))||"-"}g | 
            <strong>Rate:</strong> ₹${((A=d.rate)==null?void 0:A.toFixed(2))||"-"} | 
            <strong>Cut Fine:</strong> ${((G=d.cutFine)==null?void 0:G.toFixed(2))||"-"}g | 
            <strong>Amount:</strong> ₹${D}
            ${f?` | <strong>Cross Qty:</strong> ${d.isCrossCut&&d.crosscutQuantity||"-"}g`:""}
            ${f?` | <strong>Source Rate:</strong> ${d.isCrossCut?"₹"+(((Q=d.sourceRate)==null?void 0:Q.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${f?` | <strong>Target Rate:</strong> ${d.isCrossCut?"₹"+(((O=d.targetRate)==null?void 0:O.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${f?` | <strong>Cross Amount:</strong> ₹${I}`:""}
          </td>
        </tr>
      `})}});const o=Math.trunc(r+l-(c+u));s+=`
          <tr class="totals-row">
            <td colspan="4" class="center">Closing Balance</td>
            <td class="num">${r+l}</td>
            <td class="num">${c+u}</td>
            <td class="num">${o!==0?o>0?o+" (dena hai)":o+" (lena hai)":o}</td>
          </tr>
        </tbody>
      </table>
  `,v&&v.length>0&&(s+=`
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
    `,v.forEach(t=>{const S=((parseFloat(t.quantity)||0)-(parseFloat(t.delivered)||0)).toFixed(1);s+=`
            <tr>
              <td>${t.saudaNo||"-"}</td>
              <td>${t.saudaType||"-"}</td>
              <td class="num">${t.quantity||"-"}</td>
              <td class="num">${t.delivered||"-"}</td>
              <td class="num">${S||"-"}</td>
              <td class="num">${t.rate||"-"}</td>
            </tr>
      `}),s+=`
          </tbody>
        </table>
      </div>
    `),s+=`
      <div style="margin-top: 10px; font-size: 8px; color: #666; text-align: right;">
        Printed: ${new Date().toLocaleString("en-GB")}
      </div>
    </body>
    </html>
  `;const p=document.createElement("iframe");p.style.position="absolute",p.style.top="-9999px",p.style.left="-9999px",document.body.appendChild(p);const M=p.contentDocument||p.contentWindow.document;return M.open(),M.write(s),M.close(),p.contentWindow.focus(),p.contentWindow.print(),setTimeout(()=>{document.body.removeChild(p)},1e3),!0}function q(e){var m,$,y,w;const a=o=>o?new Date(o).toLocaleDateString("en-GB"):"-",F=((m=e==null?void 0:e.incoming)==null?void 0:m.payments)||[],v=(($=e==null?void 0:e.outgoing)==null?void 0:$.payments)||[],N=((y=e==null?void 0:e.incoming)==null?void 0:y.total)||0,x=((w=e==null?void 0:e.outgoing)==null?void 0:w.total)||0,s=(e==null?void 0:e.balance)||0,i=(e==null?void 0:e.cashInHand)||0,g=[];F.forEach(o=>{var p;g.push({date:o.paymentDate,particular:((p=o.partyId)==null?void 0:p.partyName)||"-",voucherType:"Receipt",voucherNo:o.paymentNo||"-",remark:o.remark||"",debit:o.amount||0,credit:0})}),v.forEach(o=>{var p;g.push({date:o.paymentDate,particular:((p=o.partyId)==null?void 0:p.partyName)||"-",voucherType:"Payment",voucherNo:o.paymentNo||"-",remark:o.remark||"",debit:0,credit:o.amount||0})}),g.sort((o,p)=>new Date(o.date)-new Date(p.date));let n=0;const l=g.map(o=>(n=n+o.debit-o.credit,{...o,balance:n}));let u="";l.forEach(o=>{u+=`
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
            <td class="num">${Math.trunc(N)}</td>
            <td class="num">${Math.trunc(x)}</td>
            <td class="num">${Math.trunc(s)}</td>
          </tr>
        </tbody>
      </table>

      <div class="closing">
        <table>
          <tr>
            <td><strong>Total Incoming:</strong></td>
            <td class="num">&#8377;${Math.trunc(N)}</td>
          </tr>
          <tr>
            <td><strong>Total Outgoing:</strong></td>
            <td class="num">&#8377;${Math.trunc(x)}</td>
          </tr>
          <tr>
            <td><strong>Closing Balance:</strong></td>
            <td class="num">&#8377;${Math.trunc(s)}</td>
          </tr>
          <tr>
            <td><strong>Cash In Hand:</strong></td>
            <td class="num">&#8377;${Math.trunc(i)}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 10px; font-size: 8px; color: #666; text-align: right;">
        Printed: ${new Date().toLocaleString("en-GB")}
      </div>
    </body>
    </html>
  `,r=document.createElement("iframe");r.style.position="absolute",r.style.top="-9999px",r.style.left="-9999px",document.body.appendChild(r);const c=r.contentDocument||r.contentWindow.document;return c.open(),c.write(h),c.close(),r.contentWindow.focus(),r.contentWindow.print(),setTimeout(()=>{document.body.removeChild(r)},1e3),!0}async function U(e){var u;let a="";console.log(e);const F=((u=e.partyId)==null?void 0:u.partyName)||e.partyName||"-",v=e.invoiceDate?new Date(e.invoiceDate).toLocaleDateString("en-GB"):"-",N=e.salesInvoiceNo||"SINV-"+String(e._id||e.id).padStart(4,"0"),x=e.isReturn||!1;console.log(x),a+=`
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
      <h1>${x?"SALES RETURN":"Sales Invoice"}</h1>
      <div class="header">
        <p>Name: ${F}</p>
        <p>Date: ${v}</p>
        <p>Invoice No: ${N}</p>
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
  `;const s=e.paggaIds||[];let i=0,g=0;s.forEach((h,r)=>{const c=parseFloat(h.weight)||0,m=parseFloat(h.touch)||0,$=c*m/100,y=$%1,w=Math.floor($)+(y<.45?0:y<.9?.5:1);i+=c,g+=w,a+=`
      <tr>
        <td>${r+1}</td>
        <td>${h.paggaNo||"-"}</td>
        <td>${c.toFixed(2)}</td>
        <td>${m.toFixed(2)}</td>
        <td>${w.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${i.toFixed(2)}g</p>
      <p>Total Fine: ${g.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const n=document.createElement("iframe");n.style.position="absolute",n.style.top="-9999px",n.style.left="-9999px",document.body.appendChild(n);const l=n.contentDocument||n.contentWindow.document;return l.open(),l.write(a),l.close(),n.contentWindow.focus(),n.contentWindow.print(),setTimeout(()=>{document.body.removeChild(n)},1e3),!0}async function V(e){var u,h;let a="";const F=((u=e.partyId)==null?void 0:u.partyName)||e.partyName||"-",v=e.invoiceDate?new Date(e.invoiceDate).toLocaleDateString("en-GB"):"-",N=e.invoiceNo||"INV-"+String(e.id).padStart(4,"0"),x=e.isReturn||!1;a+=`
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
      <h1>BR JEWELLERS - ${x?"Purchase Return":"Purchase Invoice"}</h1>
      <div class="header">
        <p>Name: ${F}</p>
        <p>Date: ${v}</p>
        <p>Invoice No: ${N}</p>
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
  `;const s=((h=e.items)==null?void 0:h.filter(r=>r.paggaNo||r.weight||r.touch||r.fine))||[];let i=0,g=0;s.forEach((r,c)=>{const m=parseFloat(r.weight)||0,$=parseFloat(r.touch)||0,y=m*$/100,w=y%1,o=Math.floor(y)+(w<.45?0:w<.9?.5:1);i+=m,g+=o,a+=`
      <tr>
        <td>${c+1}</td>
        <td>${r.paggaNo||"-"}</td>
        <td>${m.toFixed(2)}</td>
        <td>${$.toFixed(2)}</td>
        <td>${o.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${i.toFixed(2)}g</p>
      <p>Total Fine: ${g.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const n=document.createElement("iframe");n.style.position="absolute",n.style.top="-9999px",n.style.left="-9999px",document.body.appendChild(n);const l=n.contentDocument||n.contentWindow.document;return l.open(),l.write(a),l.close(),n.contentWindow.focus(),n.contentWindow.print(),setTimeout(()=>{document.body.removeChild(n)},1e3),!0}function J(e){const a=(e==null?void 0:e.puggas)||[],F=(e==null?void 0:e.totalPuggas)??a.length,v=(e==null?void 0:e.totalWeight)??a.reduce((n,l)=>n+(Number(l.weight)||0),0),N=(e==null?void 0:e.totalFine)??a.reduce((n,l)=>n+(Number(l.fine)||0),0);let x="";a.forEach((n,l)=>{const u=parseFloat(n.weight)||0,h=parseFloat(n.touch)||0,r=n.fine?parseFloat(n.fine):u*h/100,c=r%1,m=Math.floor(r)+(c<.45?0:c<.9?.5:1),$=n.boughtFrom||n.partyName||"-";x+=`
      <tr>
        <td>${l+1}</td>
        <td>${n.paggaNo||"-"}</td>
        <td>${u.toFixed(2)}</td>
        <td>${h.toFixed(2)}</td>
        <td>${m.toFixed(2)}</td>
        <td>${$}</td>
      </tr>
    `});const s=`
    <html>
    <head>
      <title>Kachi Stock</title>
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
      <h1>BR JEWELLERS - Kachi Stock</h1>
      <div class="header">
        <p><strong>Report:</strong> Kachi Stock (Available Paggas)</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-GB")}</p>
        <p><strong>Total Paggas in Stock:</strong> ${F}</p>
      </div>

      <div class="section-title">KACHI STOCK ITEMS</div>
      <table>
        <thead>
          <tr>
            <th>Sr</th>
            <th>Pagga No</th>
            <th>Weight(g)</th>
            <th>Touch</th>
            <th>Fine(g)</th>
            <th>Received From</th>
          </tr>
        </thead>
        <tbody>
          ${x||'<tr><td colspan="6" style="text-align:center;">No kachi stock records found</td></tr>'}
        </tbody>
      </table>

      <div class="section-title total-section">TOTAL</div>
      <table>
        <tbody>
          <tr>
            <td><strong>Total Paggas</strong></td>
            <td>${F} Pcs</td>
          </tr>
          <tr>
            <td><strong>Total Weight</strong></td>
            <td>${v.toFixed(2)}g</td>
          </tr>
          <tr>
            <td><strong>Total Fine</strong></td>
            <td>${N.toFixed(2)}g</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 25px; color: #666;">Printed: ${new Date().toLocaleString("en-GB")}</p>
    </body>
    </html>
  `,i=document.createElement("iframe");i.style.position="absolute",i.style.top="-9999px",i.style.left="-9999px",document.body.appendChild(i);const g=i.contentDocument||i.contentWindow.document;return g.open(),g.write(s),g.close(),i.contentWindow.focus(),i.contentWindow.print(),setTimeout(()=>{document.body.contains(i)&&document.body.removeChild(i)},1e3),!0}export{U as a,J as b,K as c,q as d,V as p};
