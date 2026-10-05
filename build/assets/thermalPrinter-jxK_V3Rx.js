async function q(e,a,N,w,v,x){let s="";const i=t=>t?new Date(t).toLocaleDateString("en-GB"):"-",u=t=>{var S,z;return t.type==="payment"?t.paymentType==="incoming"?Math.trunc(t.amount||0):0:t.type==="Purchase"?t.amount?Math.trunc(t.amount):((S=t.saudaCuts)==null?void 0:S.reduce((C,m)=>C+Math.trunc(m.cutFine*m.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="debit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?((z=t.saudaCuts)==null?void 0:z.reduce((C,m)=>C+Math.trunc(m.cutFine*m.rate/1e3),0))||0:t.type==="debit-note"?Math.trunc(t.amount||0):0},o=t=>{var S,z;return t.type==="payment"?t.paymentType==="outgoing"?Math.trunc(t.amount||0):0:t.type==="sales"?((S=t.saudaCuts)==null?void 0:S.reduce((C,m)=>C+Math.trunc(m.cutFine*m.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="credit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?0:t.type==="Purchase Return"?t.amount?Math.trunc(t.amount):((z=t.saudaCuts)==null?void 0:z.reduce((C,m)=>C+Math.trunc(m.cutFine*m.rate/1e3),0))||0:t.type==="credit-note"?Math.trunc(t.amount||0):0};console.log(N);let l=0,h=0;const p=Math.abs(Math.trunc((e==null?void 0:e.openingBalance)||0)),r=(e==null?void 0:e.openingBalanceType)==="dena",c=p>0&&r?p:0,g=p>0&&!r?p:0;let f=c-g;s+=`
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
        <div class="sub">${v&&x?i(v)+" to "+i(x):"Ledger Statement"}</div>
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
            <td>Opening Balance ${p>0?r?"(Dena)":"(Lena)":""}</td>
            <td class="num">-</td>
            <td class="num">${c||""}</td>
            <td class="num">${g||""}</td>
            <td class="num bold">${f}</td>
          </tr>
  `;const F=t=>t.type==="payment"?t.paymentType==="incoming"?"Payment":"Payment Outgoing":t.type==="Purchase"?"Purchase":t.type==="Purchase Return"?"Purchase Return":t.type==="sales"?"Sales Invoice":t.type==="sales-return"?"Sales Return":t.type==="crosscut"?"Cross Cut":t.type==="credit-note"?"Credit Note":t.type==="debit-note"?"Debit Note":"-";let y=null,n=null;a.forEach(t=>{var L,W,E;const S=i(t.date),z=u(t),C=o(t);l+=z,h+=C,f=Math.trunc(c+l-(g+h));let m=t.type;if(y!==null&&y!==m&&(s+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
      `),y==="Purchase"&&m==="Purchase"){const b=t.invoiceNo;n!==null&&n!==b&&(s+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
        `)}y=m,n=t.invoiceNo;let P="",T="-";if(t.type==="payment"?(P=(t.paymentType==="incoming"?"Payment In":"Payment Out")+(t.paymentNo?" - "+t.paymentNo:"")+(t.remark?" ("+t.remark+")":""),T="-"):t.type==="Purchase"?(P="Purchase"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="Purchase Return"?(P="Purchase Return"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales"?(P="Sales"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales-return"?(P="Sales Return"+(t.invoiceNo?" - "+t.invoiceNo:""),T=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="crosscut"?(P="Cross Cut: "+(t.targetSaudaNo||"-")+" ("+(t.targetSaudaType||"-")+")",T=((L=t.details)==null?void 0:L.reduce((b,d)=>b+(d.crosscutQuantity||0),0))+" g"):t.type==="credit-note"?(P="Credit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),T=t.fine?t.fine+" g":"-"):t.type==="debit-note"&&(P="Debit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),T=t.fine?t.fine+" g":"-"),s+=`
          <tr>
            <td class="center">${S}</td>
            <td>${F(t)}</td>
            <td>${P}</td>
            <td class="num">${T}</td>
            <td class="num">${z||""}</td>
            <td class="num">${C||""}</td>
            <td class="num bold">${f}</td>
          </tr>
    `,t.type==="crosscut"&&((W=t.details)==null?void 0:W.length)>0&&t.details.forEach(b=>{var d,I,M;s+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #f9f9f9; font-size: 8px;">
              <strong>Source:</strong> ${b.sourceSaudaNo||"-"} (${b.sourceSaudaType||"-"}) | 
              <strong>Qty:</strong> ${b.crosscutQuantity||"-"}g | 
              <strong>Source Rate:</strong> ₹${((d=b.sourceRate)==null?void 0:d.toLocaleString("en-IN"))||"-"} | 
              <strong>Target Rate:</strong> ₹${((I=b.targetRate)==null?void 0:I.toLocaleString("en-IN"))||"-"} | 
              <strong>P/L:</strong> ₹${((M=b.profitLoss)==null?void 0:M.toLocaleString("en-IN"))||"-"}
            </td>
          </tr>
        `}),(t.type==="Purchase"||t.type==="Purchase Return"||t.type==="sales"||t.type==="sales-return")&&((E=t.saudaCuts)==null?void 0:E.length)>0){const b=t.saudaCuts.some(d=>d.isCrossCut);t.saudaCuts.forEach(d=>{var A,G,Q,O,H;const I=d.cutFine&&d.rate?(d.cutFine*d.rate/1e3).toFixed(0):"-",M=d.isCrossCut&&d.crosscutQuantity&&d.rate?(d.crosscutQuantity*d.rate/1e3).toFixed(0):"-",K=d.saudaDate?new Date(d.saudaDate).toLocaleDateString("en-GB"):"-";s+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #fafafa; font-size: 8px;">
             <strong> Sauda No:</strong> ${d.saudaNo||"-"} | 
            <strong>Date:</strong> ${K} | 
            <strong>Booking:</strong> ${((A=d.quantity)==null?void 0:A.toFixed(2))||"-"}g | 
            <strong>Rate:</strong> ₹${((G=d.rate)==null?void 0:G.toFixed(2))||"-"} | 
            <strong>Cut Fine:</strong> ${((Q=d.cutFine)==null?void 0:Q.toFixed(2))||"-"}g | 
            <strong>Amount:</strong> ₹${I}
            ${b?` | <strong>Cross Qty:</strong> ${d.isCrossCut&&d.crosscutQuantity||"-"}g`:""}
            ${b?` | <strong>Source Rate:</strong> ${d.isCrossCut?"₹"+(((O=d.sourceRate)==null?void 0:O.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${b?` | <strong>Target Rate:</strong> ${d.isCrossCut?"₹"+(((H=d.targetRate)==null?void 0:H.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${b?` | <strong>Cross Amount:</strong> ₹${M}`:""}
          </td>
        </tr>
      `})}});const $=Math.trunc(c+l-(g+h));s+=`
          <tr class="totals-row">
            <td colspan="4" class="center">Closing Balance</td>
            <td class="num">${c+l}</td>
            <td class="num">${g+h}</td>
            <td class="num">${$!==0?$>0?$+" (dena hai)":$+" (lena hai)":$}</td>
          </tr>
        </tbody>
      </table>
  `,w&&w.length>0&&(s+=`
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
    `,w.forEach(t=>{const S=((parseFloat(t.quantity)||0)-(parseFloat(t.delivered)||0)).toFixed(1);s+=`
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
  `;const D=document.createElement("iframe");D.style.position="absolute",D.style.top="-9999px",D.style.left="-9999px",document.body.appendChild(D);const R=D.contentDocument||D.contentWindow.document;return R.open(),R.write(s),R.close(),D.contentWindow.focus(),D.contentWindow.print(),setTimeout(()=>{document.body.removeChild(D)},1e3),!0}function U(e){var g,f,F,y;const a=n=>n?new Date(n).toLocaleDateString("en-GB"):"-",N=((g=e==null?void 0:e.incoming)==null?void 0:g.payments)||[],w=((f=e==null?void 0:e.outgoing)==null?void 0:f.payments)||[],v=((F=e==null?void 0:e.incoming)==null?void 0:F.total)||0,x=((y=e==null?void 0:e.outgoing)==null?void 0:y.total)||0,s=(e==null?void 0:e.balance)||0,i=(e==null?void 0:e.cashInHand)||0,u=[];N.forEach(n=>{var $;u.push({date:n.paymentDate,particular:(($=n.partyId)==null?void 0:$.partyName)||"-",voucherType:"Receipt",voucherNo:n.paymentNo||"-",remark:n.remark||"",debit:n.amount||0,credit:0})}),w.forEach(n=>{var $;u.push({date:n.paymentDate,particular:(($=n.partyId)==null?void 0:$.partyName)||"-",voucherType:"Payment",voucherNo:n.paymentNo||"-",remark:n.remark||"",debit:0,credit:n.amount||0})}),u.sort((n,$)=>new Date(n.date)-new Date($.date));let o=0;const l=u.map(n=>(o=o+n.debit-n.credit,{...n,balance:o}));let h="";l.forEach(n=>{h+=`
      <tr>
        <td class="center">${a(n.date)}</td>
        <td>${n.particular}${n.remark?" ("+n.remark+")":""}</td>
        <td class="center">${n.voucherType}</td>
        <td class="center">${n.voucherNo}</td>
        <td class="num">${n.debit>0?Math.trunc(n.debit):""}</td>
        <td class="num">${n.credit>0?Math.trunc(n.credit):""}</td>
        <td class="num bold">${Math.trunc(n.balance)}</td>
      </tr>
    `});const p=`
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
          ${h}
          <tr class="totals-row">
            <td colspan="4" class="center">Total</td>
            <td class="num">${Math.trunc(v)}</td>
            <td class="num">${Math.trunc(x)}</td>
            <td class="num">${Math.trunc(s)}</td>
          </tr>
        </tbody>
      </table>

      <div class="closing">
        <table>
          <tr>
            <td><strong>Total Incoming:</strong></td>
            <td class="num">&#8377;${Math.trunc(v)}</td>
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
  `,r=document.createElement("iframe");r.style.position="absolute",r.style.top="-9999px",r.style.left="-9999px",document.body.appendChild(r);const c=r.contentDocument||r.contentWindow.document;return c.open(),c.write(p),c.close(),r.contentWindow.focus(),r.contentWindow.print(),setTimeout(()=>{document.body.removeChild(r)},1e3),!0}async function V(e){var h;let a="";console.log(e);const N=((h=e.partyId)==null?void 0:h.partyName)||e.partyName||"-",w=e.invoiceDate?new Date(e.invoiceDate).toLocaleDateString("en-GB"):"-",v=e.salesInvoiceNo||"SINV-"+String(e._id||e.id).padStart(4,"0"),x=e.isReturn||!1;console.log(x),a+=`
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
        <p>Name: ${N}</p>
        <p>Date: ${w}</p>
        <p>Invoice No: ${v}</p>
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
  `;const s=e.paggaIds||[];let i=0,u=0;s.forEach((p,r)=>{const c=parseFloat(p.weight)||0,g=parseFloat(p.touch)||0,f=c*g/100,F=f%1,y=Math.floor(f)+(F<.45?0:F<.9?.5:1);i+=c,u+=y,a+=`
      <tr>
        <td>${r+1}</td>
        <td>${p.paggaNo||"-"}</td>
        <td>${c.toFixed(2)}</td>
        <td>${g.toFixed(2)}</td>
        <td>${y.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${i.toFixed(2)}g</p>
      <p>Total Fine: ${u.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const o=document.createElement("iframe");o.style.position="absolute",o.style.top="-9999px",o.style.left="-9999px",document.body.appendChild(o);const l=o.contentDocument||o.contentWindow.document;return l.open(),l.write(a),l.close(),o.contentWindow.focus(),o.contentWindow.print(),setTimeout(()=>{document.body.removeChild(o)},1e3),!0}async function J(e){var h,p;let a="";const N=((h=e.partyId)==null?void 0:h.partyName)||e.partyName||"-",w=e.invoiceDate?new Date(e.invoiceDate).toLocaleDateString("en-GB"):"-",v=e.invoiceNo||"INV-"+String(e.id).padStart(4,"0"),x=e.isReturn||!1;a+=`
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
        <p>Name: ${N}</p>
        <p>Date: ${w}</p>
        <p>Invoice No: ${v}</p>
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
  `;const s=((p=e.items)==null?void 0:p.filter(r=>r.paggaNo||r.weight||r.touch||r.fine))||[];let i=0,u=0;s.forEach((r,c)=>{const g=parseFloat(r.weight)||0,f=parseFloat(r.touch)||0,F=g*f/100,y=F%1,n=Math.floor(F)+(y<.45?0:y<.9?.5:1);i+=g,u+=n,a+=`
      <tr>
        <td>${c+1}</td>
        <td>${r.paggaNo||"-"}</td>
        <td>${g.toFixed(2)}</td>
        <td>${f.toFixed(2)}</td>
        <td>${n.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${i.toFixed(2)}g</p>
      <p>Total Fine: ${u.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const o=document.createElement("iframe");o.style.position="absolute",o.style.top="-9999px",o.style.left="-9999px",document.body.appendChild(o);const l=o.contentDocument||o.contentWindow.document;return l.open(),l.write(a),l.close(),o.contentWindow.focus(),o.contentWindow.print(),setTimeout(()=>{document.body.removeChild(o)},1e3),!0}function B(e){const a=((e==null?void 0:e.puggas)||[]).filter(o=>!o.isPurchaseReturn),N=a.length,w=a.reduce((o,l)=>o+(Number(l.weight)||0),0),v=a.reduce((o,l)=>o+(Number(l.fine)||0),0);let x="";a.forEach((o,l)=>{const h=parseFloat(o.weight)||0,p=parseFloat(o.touch)||0,r=o.fine?parseFloat(o.fine):h*p/100,c=r%1,g=Math.floor(r)+(c<.45?0:c<.9?.5:1),f=o.boughtFrom||o.partyName||"-";x+=`
      <tr>
        <td>${l+1}</td>
        <td>${o.paggaNo||"-"}</td>
        <td>${h.toFixed(2)}</td>
        <td>${p.toFixed(2)}</td>
        <td>${g.toFixed(2)}</td>
        <td>${f}</td>
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
        <p><strong>Total Paggas in Stock:</strong> ${N}</p>
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
            <td>${N} Pcs</td>
          </tr>
          <tr>
            <td><strong>Total Weight</strong></td>
            <td>${w.toFixed(2)}g</td>
          </tr>
          <tr>
            <td><strong>Total Fine</strong></td>
            <td>${v.toFixed(2)}g</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 25px; color: #666;">Printed: ${new Date().toLocaleString("en-GB")}</p>
    </body>
    </html>
  `,i=document.createElement("iframe");i.style.position="absolute",i.style.top="-9999px",i.style.left="-9999px",document.body.appendChild(i);const u=i.contentDocument||i.contentWindow.document;return u.open(),u.write(s),u.close(),i.contentWindow.focus(),i.contentWindow.print(),setTimeout(()=>{document.body.contains(i)&&document.body.removeChild(i)},1e3),!0}export{V as a,B as b,q as c,U as d,J as p};
