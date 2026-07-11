async function U(o,a,v,N,C,y){let d="";const u=t=>t?new Date(t).toLocaleDateString("en-GB"):"-",x=t=>{var D,P;return t.type==="payment"?t.paymentType==="incoming"?Math.trunc(t.amount||0):0:t.type==="Purchase"?t.amount?Math.trunc(t.amount):((D=t.saudaCuts)==null?void 0:D.reduce((w,p)=>w+Math.trunc(p.cutFine*p.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="debit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?((P=t.saudaCuts)==null?void 0:P.reduce((w,p)=>w+Math.trunc(p.cutFine*p.rate/1e3),0))||0:t.type==="debit-note"?Math.trunc(t.amount||0):0},r=t=>{var D,P;return t.type==="payment"?t.paymentType==="outgoing"?Math.trunc(t.amount||0):0:t.type==="sales"?((D=t.saudaCuts)==null?void 0:D.reduce((w,p)=>w+Math.trunc(p.cutFine*p.rate/1e3),0))||0:t.type==="crosscut"?t.creditDebitType==="credit"?Math.trunc(t.totalProfitLoss||0):0:t.type==="sales-return"?0:t.type==="Purchase Return"?t.amount?Math.trunc(t.amount):((P=t.saudaCuts)==null?void 0:P.reduce((w,p)=>w+Math.trunc(p.cutFine*p.rate/1e3),0))||0:t.type==="credit-note"?Math.trunc(t.amount||0):0};let c=0,f=0;const s=Math.trunc((v==null?void 0:v.openingBalance)||0),i=s>0?s:0,h=s<0?Math.abs(s):0;let m=i-h;d+=`
    <html>
    <head>
      <title>Party Ledger</title>
      <style>
        @page {
          size: A4;
          margin: 14mm 5mm 12mm 5mm;
          @top-center { content: "${o.partyName||"-"}"; font-size: 9px; border-bottom: 1px solid #333; padding-bottom: 2px; }
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
        <h2>${o.partyName||"-"}</h2>
        <div class="sub">${C&&y?u(C)+" to "+u(y):"Ledger Statement"}</div>
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
            <td class="num">${i||""}</td>
            <td class="num">${h||""}</td>
            <td class="num bold">${m}</td>
          </tr>
  `;const $=t=>t.type==="payment"?t.paymentType==="incoming"?"Payment":"Payment Outgoing":t.type==="Purchase"?"Purchase":t.type==="Purchase Return"?"Purchase Return":t.type==="sales"?"Sales Invoice":t.type==="sales-return"?"Sales Return":t.type==="crosscut"?"Cross Cut":t.type==="credit-note"?"Credit Note":t.type==="debit-note"?"Debit Note":"-";let b=null,e=null;a.forEach(t=>{var R,L,W;const D=u(t.date),P=x(t),w=r(t);c+=P,f+=w,m=Math.trunc(i+c-(h+f));let p=t.type;if(b!==null&&b!==p&&(d+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
      `),b==="Purchase"&&p==="Purchase"){const g=t.invoiceNo;e!==null&&e!==g&&(d+=`
          <tr>
            <td colspan="7" style="height: 8px; border-top: 2px solid #000; border-left: none; border-right: none; border-bottom: none;"></td>
          </tr>
        `)}b=p,e=t.invoiceNo;let S="",z="-";if(t.type==="payment"?(S=(t.paymentType==="incoming"?"Payment In":"Payment Out")+(t.paymentNo?" - "+t.paymentNo:"")+(t.remark?" ("+t.remark+")":""),z="-"):t.type==="Purchase"?(S="Purchase"+(t.invoiceNo?" - "+t.invoiceNo:""),z=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="Purchase Return"?(S="Purchase Return"+(t.invoiceNo?" - "+t.invoiceNo:""),z=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales"?(S="Sales"+(t.invoiceNo?" - "+t.invoiceNo:""),z=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="sales-return"?(S="Sales Return"+(t.invoiceNo?" - "+t.invoiceNo:""),z=t.totalFine?Math.trunc(t.totalFine)+" g":"-"):t.type==="crosscut"?(S="Cross Cut: "+(t.targetSaudaNo||"-")+" ("+(t.targetSaudaType||"-")+")",z=((R=t.details)==null?void 0:R.reduce((g,n)=>g+(n.crosscutQuantity||0),0))+" g"):t.type==="credit-note"?(S="Credit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),z=t.fine?t.fine+" g":"-"):t.type==="debit-note"&&(S="Debit Note"+(t.noteNo?" - "+t.noteNo:"")+(t.reason?" ("+t.reason+")":""),z=t.fine?t.fine+" g":"-"),d+=`
          <tr>
            <td class="center">${D}</td>
            <td>${$(t)}</td>
            <td>${S}</td>
            <td class="num">${z}</td>
            <td class="num">${P||""}</td>
            <td class="num">${w||""}</td>
            <td class="num bold">${m}</td>
          </tr>
    `,t.type==="crosscut"&&((L=t.details)==null?void 0:L.length)>0&&t.details.forEach(g=>{var n,T,M;d+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #f9f9f9; font-size: 8px;">
              <strong>Source:</strong> ${g.sourceSaudaNo||"-"} (${g.sourceSaudaType||"-"}) | 
              <strong>Qty:</strong> ${g.crosscutQuantity||"-"}g | 
              <strong>Source Rate:</strong> ₹${((n=g.sourceRate)==null?void 0:n.toLocaleString("en-IN"))||"-"} | 
              <strong>Target Rate:</strong> ₹${((T=g.targetRate)==null?void 0:T.toLocaleString("en-IN"))||"-"} | 
              <strong>P/L:</strong> ₹${((M=g.profitLoss)==null?void 0:M.toLocaleString("en-IN"))||"-"}
            </td>
          </tr>
        `}),(t.type==="Purchase"||t.type==="Purchase Return"||t.type==="sales"||t.type==="sales-return")&&((W=t.saudaCuts)==null?void 0:W.length)>0){const g=t.saudaCuts.some(n=>n.isCrossCut);t.saudaCuts.forEach(n=>{var E,A,G,Q,O;const T=n.cutFine&&n.rate?(n.cutFine*n.rate/1e3).toFixed(0):"-",M=n.isCrossCut&&n.crosscutQuantity&&n.rate?(n.crosscutQuantity*n.rate/1e3).toFixed(0):"-",B=n.saudaDate?new Date(n.saudaDate).toLocaleDateString("en-GB"):"-";d+=`
          <tr>
            <td colspan="7" style="padding: 2px 8px; background: #fafafa; font-size: 8px;">
             <strong> Sauda No:</strong> ${n.saudaNo||"-"} | 
            <strong>Date:</strong> ${B} | 
            <strong>Booking:</strong> ${((E=n.quantity)==null?void 0:E.toFixed(2))||"-"}g | 
            <strong>Rate:</strong> ₹${((A=n.rate)==null?void 0:A.toFixed(2))||"-"} | 
            <strong>Cut Fine:</strong> ${((G=n.cutFine)==null?void 0:G.toFixed(2))||"-"}g | 
            <strong>Amount:</strong> ₹${T}
            ${g?` | <strong>Cross Qty:</strong> ${n.isCrossCut&&n.crosscutQuantity||"-"}g`:""}
            ${g?` | <strong>Source Rate:</strong> ${n.isCrossCut?"₹"+(((Q=n.sourceRate)==null?void 0:Q.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${g?` | <strong>Target Rate:</strong> ${n.isCrossCut?"₹"+(((O=n.targetRate)==null?void 0:O.toLocaleString("en-IN"))||"-"):"-"}`:""}
            ${g?` | <strong>Cross Amount:</strong> ₹${M}`:""}
          </td>
        </tr>
      `})}});const l=Math.trunc(i+c-(h+f));d+=`
          <tr class="totals-row">
            <td colspan="4" class="center">Closing Balance</td>
            <td class="num">${i+c}</td>
            <td class="num">${h+f}</td>
            <td class="num">${l!==0?l>0?l+" (dena hai)":l+" (lena hai)":l}</td>
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
    `,N.forEach(t=>{const D=((parseFloat(t.quantity)||0)-(parseFloat(t.delivered)||0)).toFixed(1);d+=`
            <tr>
              <td>${t.saudaNo||"-"}</td>
              <td>${t.saudaType||"-"}</td>
              <td class="num">${t.quantity||"-"}</td>
              <td class="num">${t.delivered||"-"}</td>
              <td class="num">${D||"-"}</td>
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
  `;const F=document.createElement("iframe");F.style.position="absolute",F.style.top="-9999px",F.style.left="-9999px",document.body.appendChild(F);const I=F.contentDocument||F.contentWindow.document;return I.open(),I.write(d),I.close(),F.contentWindow.focus(),F.contentWindow.print(),setTimeout(()=>{document.body.removeChild(F)},1e3),!0}function q(o){var h,m,$,b;const a=e=>e?new Date(e).toLocaleDateString("en-GB"):"-",v=((h=o==null?void 0:o.incoming)==null?void 0:h.payments)||[],N=((m=o==null?void 0:o.outgoing)==null?void 0:m.payments)||[],C=(($=o==null?void 0:o.incoming)==null?void 0:$.total)||0,y=((b=o==null?void 0:o.outgoing)==null?void 0:b.total)||0,d=(o==null?void 0:o.balance)||0,u=[];v.forEach(e=>{var l;u.push({date:e.paymentDate,particular:((l=e.partyId)==null?void 0:l.partyName)||"-",voucherType:"Receipt",voucherNo:e.paymentNo||"-",remark:e.remark||"",debit:e.amount||0,credit:0})}),N.forEach(e=>{var l;u.push({date:e.paymentDate,particular:((l=e.partyId)==null?void 0:l.partyName)||"-",voucherType:"Payment",voucherNo:e.paymentNo||"-",remark:e.remark||"",debit:0,credit:e.amount||0})}),u.sort((e,l)=>new Date(e.date)-new Date(l.date));let x=0;const r=u.map(e=>(x=x+e.debit-e.credit,{...e,balance:x}));let c="";r.forEach(e=>{c+=`
      <tr>
        <td class="center">${a(e.date)}</td>
        <td>${e.particular}${e.remark?" ("+e.remark+")":""}</td>
        <td class="center">${e.voucherType}</td>
        <td class="center">${e.voucherNo}</td>
        <td class="num">${e.debit>0?Math.trunc(e.debit):""}</td>
        <td class="num">${e.credit>0?Math.trunc(e.credit):""}</td>
        <td class="num bold">${Math.trunc(e.balance)}</td>
      </tr>
    `});const f=`
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
          ${c}
          <tr class="totals-row">
            <td colspan="4" class="center">Total</td>
            <td class="num">${Math.trunc(C)}</td>
            <td class="num">${Math.trunc(y)}</td>
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
            <td class="num">&#8377;${Math.trunc(y)}</td>
          </tr>
          <tr>
            <td><strong>Closing Balance:</strong></td>
            <td class="num">&#8377;${Math.trunc(d)}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 10px; font-size: 8px; color: #666; text-align: right;">
        Printed: ${new Date().toLocaleString("en-GB")}
      </div>
    </body>
    </html>
  `,s=document.createElement("iframe");s.style.position="absolute",s.style.top="-9999px",s.style.left="-9999px",document.body.appendChild(s);const i=s.contentDocument||s.contentWindow.document;return i.open(),i.write(f),i.close(),s.contentWindow.focus(),s.contentWindow.print(),setTimeout(()=>{document.body.removeChild(s)},1e3),!0}async function V(o){var f;let a="";console.log(o);const v=((f=o.partyId)==null?void 0:f.partyName)||o.partyName||"-",N=o.invoiceDate?new Date(o.invoiceDate).toLocaleDateString("en-GB"):"-",C=o.salesInvoiceNo||"SINV-"+String(o._id||o.id).padStart(4,"0"),y=o.isReturn||!1;console.log(y),a+=`
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
      <h1>${y?"SALES RETURN":"Sales Invoice"}</h1>
      <div class="header">
        <p>Name: ${v}</p>
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
  `;const d=o.paggaIds||[];let u=0,x=0;d.forEach((s,i)=>{const h=parseFloat(s.weight)||0,m=parseFloat(s.touch)||0,$=h*m/100,b=$%1,e=Math.floor($)+(b<.45?0:b<.9?.5:1);u+=h,x+=e,a+=`
      <tr>
        <td>${i+1}</td>
        <td>${s.paggaNo||"-"}</td>
        <td>${h.toFixed(2)}</td>
        <td>${m.toFixed(2)}</td>
        <td>${e.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${u.toFixed(2)}g</p>
      <p>Total Fine: ${x.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const r=document.createElement("iframe");r.style.position="absolute",r.style.top="-9999px",r.style.left="-9999px",document.body.appendChild(r);const c=r.contentDocument||r.contentWindow.document;return c.open(),c.write(a),c.close(),r.contentWindow.focus(),r.contentWindow.print(),setTimeout(()=>{document.body.removeChild(r)},1e3),!0}async function H(o){var f,s;let a="";const v=((f=o.partyId)==null?void 0:f.partyName)||o.partyName||"-",N=o.invoiceDate?new Date(o.invoiceDate).toLocaleDateString("en-GB"):"-",C=o.invoiceNo||"INV-"+String(o.id).padStart(4,"0"),y=o.isReturn||!1;a+=`
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
      <h1>BR BULLION - ${y?"Purchase Return":"Purchase Invoice"}</h1>
      <div class="header">
        <p>Name: ${v}</p>
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
  `;const d=((s=o.items)==null?void 0:s.filter(i=>i.paggaNo||i.weight||i.touch||i.fine))||[];let u=0,x=0;d.forEach((i,h)=>{const m=parseFloat(i.weight)||0,$=parseFloat(i.touch)||0,b=m*$/100,e=b%1,l=Math.floor(b)+(e<.45?0:e<.9?.5:1);u+=m,x+=l,a+=`
      <tr>
        <td>${h+1}</td>
        <td>${i.paggaNo||"-"}</td>
        <td>${m.toFixed(2)}</td>
        <td>${$.toFixed(2)}</td>
        <td>${l.toFixed(2)}</td>
      </tr>
    `}),a+=`
      </tbody>
    </table>
  `,a+='<hr style="border: 1px solid #ddd; margin: 5px 0;">',a+=`
    <div class="total-section">
      <p style="font-weight: 500; font-size: 12px;">Gross Wt: ${u.toFixed(2)}g</p>
      <p>Total Fine: ${x.toFixed(2)}g</p>
    </div>
  `,a+='<hr style="border: 1px solid #ddd; margin: 10px 0;">',a+='<div class="footer">Thank you for your business!</div>',a+=`
    </body>
    </html>
  `;const r=document.createElement("iframe");r.style.position="absolute",r.style.top="-9999px",r.style.left="-9999px",document.body.appendChild(r);const c=r.contentDocument||r.contentWindow.document;return c.open(),c.write(a),c.close(),r.contentWindow.focus(),r.contentWindow.print(),setTimeout(()=>{document.body.removeChild(r)},1e3),!0}export{V as a,U as b,q as c,H as p};
