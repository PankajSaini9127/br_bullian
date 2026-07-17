import{r as d,B as e}from"./vendor-UKnYS2Ok.js";import{y as S}from"./toastify-CS0d0PNp.js";import{p as nt}from"./partyService-P-vmZ_y-.js";import{s as R}from"./saudaService-DPkDFeyX.js";import"./metalPaltaService--mSAIEAs.js";import{g as h}from"./index-C79XlsqY.js";import{a as Rt,B as x,b as p,af as v,P as it,ag as zt,ah as lt,X as dt,ai as ct,h as D,aj as ut,$ as G,ak as ht,e as g,a0 as Mt,a1 as Qt,a2 as Ot,a3 as U,a4 as i,a5 as _t,a6 as K,f as z,a7 as pt,a8 as xt,a9 as Bt,aa as gt,ab as ft,al as yt,ac as mt,ad as M,am as Ht,an as Gt,ao as Ut,ap as X,I as bt,aq as Kt,ar as Xt,ae as jt,as as Yt}from"./mui-BWoEF6q2.js";import"./axios-DcNlVx-A.js";import"./pdf-Crbg--cW.js";const ne=()=>{const[W,$]=d.useState([]),[k,St]=d.useState([]),[P,q]=d.useState(""),[Y,Z]=d.useState([]),[vt,Q]=d.useState(!1),[F,O]=d.useState(null),[Ct,_]=d.useState(!1),[w,B]=d.useState(null),[u,It]=d.useState("purchase"),[f,J]=d.useState(""),[y,V]=d.useState(""),[m,tt]=d.useState(""),[A,E]=d.useState(1),[et,Tt]=d.useState(1),at=10,[s,b]=d.useState({partyName:"",partyId:"",saudaDate:new Date().toISOString().split("T")[0],quantity:"",rate:"",saudaType:"purchase",saudaCategory:"kachi",isCrossCut:!1,deliveredQuantity:""}),Dt=t=>{const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],r=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];if(t===0)return"Zero";const n=c=>c===0?"":c<10?a[c]:c<20?r[c-10]:c<100?o[Math.floor(c/10)]+(c%10!==0?" "+a[c%10]:""):a[Math.floor(c/100)]+" Hundred"+(c%100!==0?" "+n(c%100):""),l=Math.floor(t/1e7),C=Math.floor(t%1e7/1e5),j=Math.floor(t%1e5/1e3),I=t%1e3;let T="";return l>0&&(T+=n(l)+" Crore "),C>0&&(T+=n(C)+" Lakh "),j>0&&(T+=n(j)+" Thousand "),I>0&&(T+=n(I)),T.trim()},H=t=>{if(!t)return"";const a=new Date(t),r=String(a.getDate()).padStart(2,"0"),o=String(a.getMonth()+1).padStart(2,"0"),n=a.getFullYear();return`${r}-${o}-${n}`};d.useEffect(()=>{(async()=>{try{const a=await nt.getParties();a&&a.parties&&St(a.parties)}catch(a){console.error("Error fetching parties:",a)}})()},[]),d.useEffect(()=>{const t=setTimeout(async()=>{var a;if(P)try{const r=await nt.searchParties(P);Z(((a=r==null?void 0:r.data)==null?void 0:a.parties)||[])}catch(r){console.error("Error searching parties:",r)}else Z(k)},1e3);return()=>clearTimeout(t)},[P,k]),d.useEffect(()=>{rt()},[u,f,y,m,A]);const rt=async()=>{var t;try{const a={};a.type=u,f&&(a.partyId=f),y&&(a.startDate=y),m&&(a.endDate=m),a.page=A,a.limit=at;const r=await R.getSaudaList(u,a);(r||r!=null&&r.saudas)&&($((r==null?void 0:r.saudas)||[]),Tt(((t=r==null?void 0:r.pagination)==null?void 0:t.totalPages)||1))}catch(a){console.error("Error fetching sauda list:",a),S.error("Failed to fetch sauda list")}},N=t=>{const{name:a,value:r}=t.target;b(a==="quantity"||a==="rate"?o=>{const n=a==="quantity"?r:o.quantity,l=a==="rate"?r:o.rate,C={...o,[a]:r},j=n?parseFloat(n):0,I=l?parseFloat(l):0;return!isNaN(j)&&!isNaN(I)&&(C.amount=(j*(I/1e3)).toFixed(1)),C}:{...s,[a]:r})},Wt=()=>{Q(!0),O(null),b({partyName:"",partyId:"",saudaDate:new Date().toISOString().split("T")[0],quantity:"",rate:"",amount:"",saudaType:u,saudaCategory:"kachi",deliveredQuantity:""})},kt=t=>{var a;O(t),b({partyName:t.partyName,partyId:((a=t.partyId)==null?void 0:a._id)||"",saudaDate:t.saudaDate,quantity:t.quantity,rate:t.rate,amount:t.totalAmount||"",saudaType:t.saudaType||t.type||u,saudaCategory:t.saudaCategory||"kachi",deliveredQuantity:t.deliveredQuantity||""}),Q(!0)},L=()=>{Q(!1),O(null),b({partyName:"",partyId:"",saudaDate:new Date().toISOString().split("T")[0],quantity:"",rate:"",amount:"",saudaType:"purchase",saudaCategory:"kachi",deliveredQuantity:"",isCrossCut:!1})},Ft=async()=>{if(!s.partyId||!s.saudaDate||!s.quantity||!s.rate){S.error("Please fill all required fields");return}const t=parseFloat(s.quantity)||0,a=parseFloat(s.rate)||0,r=(t*(a/1e3)).toFixed(1),o={partyName:s.partyName,partyId:s.partyId,saudaDate:s.saudaDate,quantity:s.quantity,rate:s.rate,totalAmount:r,saudaType:s.saudaType,saudaCategory:s.saudaCategory,delivered:s.deliveredQuantity,isCrossCut:s.isCrossCut};try{if(F)await R.updateSauda(F._id,o),$(W.map(n=>n.id===F.id?{...n,...o}:n)),S.success("Sauda updated successfully");else{const n=await R.addSauda(o);$([...W,n]),S.success("Sauda added successfully")}L(),rt()}catch(n){console.error("Error saving sauda:",n),S.error("Failed to save sauda")}},Pt=t=>{const a=t.target.checked;b(r=>({...r,isCrossCut:a}))},wt=t=>{B(t),_(!0)},Nt=async()=>{if(w)try{await R.deleteSauda(w._id||w.id),$(W.filter(t=>t._id!==w._id&&t.id!==w.id)),S.success("Sauda deleted successfully"),_(!1),B(null)}catch(t){console.error("Error deleting sauda:",t),S.error("Failed to delete sauda")}},st=()=>{_(!1),B(null)},$t=t=>{var n;let a=`
      <html>
      <head>
        <title>Sauda Print</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 14px; padding: 30px; }
          h1 { text-align: center; margin-bottom: 20px; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>SAUDA DETAILS</h1>
        <div class="header">
          <p><strong>Sauda Type:</strong> ${t.saudaType==="purchase"?"Purchase":"Sales"}</p>
          <p><strong>Party Name:</strong> ${((n=t.partyId)==null?void 0:n.partyName)||t.partyName||"-"}</p>
          <p><strong>Sauda Date:</strong> ${H(t.saudaDate)}</p>
        </div>

        <div class="details">
          <table>
            <tr>
              <td class="label">Sauda No</td>
              <td class="value">${t.saudaNo||t._id||"-"}</td>
            </tr>
            <tr>
              <td class="label">Quantity</td>
              <td class="value">${t.quantity} g</td>
            </tr>
            <tr>
              <td class="label">Rate</td>
              <td class="value">₹${parseFloat(t.rate).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td class="label">Total Amount</td>
              <td class="value">₹${((parseFloat(t.quantity)||0)*(parseFloat(t.rate)||0)/1e3).toFixed(1)}</td>
            </tr>
            <tr>
              <td class="label">Status</td>
              <td class="value">${t.status||"Pending"}</td>
            </tr>
            <tr>
              <td class="label">Delivered Quantity</td>
              <td class="value">${t.delivered||t.deliveredQuantity||0} g</td>
            </tr>
            <tr>
              <td class="label">Pending Quantity</td>
              <td class="value">${(parseFloat(t.quantity)-(parseFloat(t.delivered)||parseFloat(t.deliveredQuantity)||0)).toFixed(1)} g</td>
            </tr>
          </table>
        </div>

        <p style="margin-top: 40px; color: #666; text-align: center;">Printed: ${new Date().toLocaleString("en-GB")}</p>
      </body>
      </html>
    `;const r=document.createElement("iframe");r.style.position="absolute",r.style.top="-9999px",r.style.left="-9999px",document.body.appendChild(r);const o=r.contentDocument||r.contentWindow.document;o.open(),o.write(a),o.close(),r.contentWindow.focus(),r.contentWindow.print(),setTimeout(()=>{document.body.removeChild(r)},1e3)},qt=()=>W.filter(t=>{var l;const a=t.saudaType===u,r=!f||((l=t.partyId)==null?void 0:l._id)===f||t.partyId===f,o=!y||t.saudaDate>=y,n=!m||t.saudaDate<=m;return a&&r&&o&&n}),At=()=>{J(""),V(""),tt(""),E(1)},Et=()=>{const t=qt();if(t.length===0){S.error("No sauda to print");return}const a=k.find(l=>l._id===f);let r=`
      <html>
      <head>
        <title>SAUDA LIST</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
          h1 { text-align: center; margin-bottom: 15px; font-size: 18px; }
          .header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${u==="purchase"?"PURCHASE":"SALES"} SAUDA LIST</h1>
        <div class="header">
          ${a?`<p><strong>Party:</strong> ${a.partyName}</p>`:""}
          ${y||m?`<p><strong>Period:</strong> ${y||"..."} to ${m||"..."}</p>`:""}
          <p><strong>Total Records:</strong> ${t.length}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr</th>
              <th>Party Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Qty (g)</th>
              <th>Rate</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Delivered (g)</th>
              <th>Pending (g)</th>
            </tr>
          </thead>
          <tbody>
    `;t.forEach((l,C)=>{var ot;const j=parseFloat(l.quantity)||0,I=parseFloat(l.rate)||0,T=(j*(I/1e3)).toFixed(1),c=parseFloat(l.delivered)||parseFloat(l.deliveredQuantity)||0,Lt=(j-c).toFixed(1);r+=`
        <tr>
          <td>${C+1}</td>
          <td>${((ot=l.partyId)==null?void 0:ot.partyName)||l.partyName||"-"}</td>
          <td>${l.saudaType==="purchase"?"Purchase":"Sales"}</td>
          <td>${H(l.saudaDate)}</td>
          <td>${l.quantity}</td>
          <td>₹${parseFloat(l.rate).toLocaleString("en-IN")}</td>
          <td>₹${parseFloat(T).toLocaleString("en-IN")}</td>
          <td>${l.status||"Pending"}</td>
          <td>${c}</td>
          <td>${Lt}</td>
        </tr>
      `}),r+=`
          </tbody>
        </table>

        <p style="margin-top: 30px; color: #666; text-align: center;">Printed: ${new Date().toLocaleString("en-GB")}</p>
      </body>
      </html>
    `;const o=document.createElement("iframe");o.style.position="absolute",o.style.top="-9999px",o.style.left="-9999px",document.body.appendChild(o);const n=o.contentDocument||o.contentWindow.document;n.open(),n.write(r),n.close(),o.contentWindow.focus(),o.contentWindow.print(),setTimeout(()=>{document.body.removeChild(o)},1e3)};return e.jsxs(Rt,{maxWidth:"xl",sx:{px:{xs:1,sm:2,md:3}},children:[e.jsx(x,{sx:{mb:4},children:e.jsx(p,{variant:"h4",sx:{mb:2,fontWeight:700,fontSize:{xs:"1.5rem",sm:"2rem",md:"2.125rem"},background:h.primary,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"Sauda Management"})}),e.jsxs(v,{container:!0,spacing:2,children:[e.jsx(v,{item:!0,xs:12,children:e.jsx(it,{elevation:3,sx:{p:3,borderRadius:2,boxShadow:"0 8px 32px rgba(99, 102, 241, 0.15)",border:"1px solid",borderColor:"divider"},children:e.jsxs(zt,{value:u,onChange:(t,a)=>{It(a),E(1)},sx:{"& .MuiTab-root":{textTransform:"none",fontWeight:600,fontSize:"1rem"}},children:[e.jsx(lt,{value:"purchase",label:e.jsxs(x,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(dt,{sx:{color:"#6366f1"}}),"Purchase"]})}),e.jsx(lt,{value:"sales",label:e.jsxs(x,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(ct,{sx:{color:"#ec4899"}}),"Sales"]})})]})})}),e.jsx(v,{item:!0,xs:12,children:e.jsxs(it,{elevation:3,sx:{p:3,borderRadius:2,boxShadow:"0 8px 32px rgba(99, 102, 241, 0.15)",border:"1px solid",borderColor:"divider"},children:[e.jsxs(x,{sx:{display:"flex",flexDirection:{xs:"column",sm:"row"},justifyContent:"space-between",alignItems:{xs:"stretch",sm:"center"},gap:2,mb:2},children:[e.jsxs(p,{variant:"h6",sx:{fontWeight:600,color:"text.primary"},children:[u==="purchase"?"Purchase":"Sales"," Sauda List"]}),e.jsxs(x,{sx:{display:"flex",flexWrap:"wrap",gap:1},children:[e.jsx(D,{variant:"contained",startIcon:e.jsx(ut,{}),onClick:Et,sx:{background:h.success,boxShadow:"0 4px 12px rgba(16, 185, 129, 0.4)","&:hover":{background:h.successHover}},children:"Print All"}),e.jsxs(D,{variant:"contained",startIcon:e.jsx(G,{}),onClick:Wt,sx:{background:h.primary,boxShadow:"0 4px 12px rgba(99, 102, 241, 0.4)","&:hover":{background:h.primaryHover}},children:["Add ",u==="purchase"?"Purchase":"Sales"," Sauda"]})]})]}),e.jsxs(v,{container:!0,spacing:2,sx:{mb:2},children:[e.jsx(v,{item:!0,xs:12,sm:4,children:e.jsx(ht,{fullWidth:!0,sx:{minWidth:{md:"200px"}},options:P?Y:k,getOptionLabel:t=>t.partyName||"",isOptionEqualToValue:(t,a)=>(t==null?void 0:t._id)===(a==null?void 0:a._id),value:k.find(t=>t._id===f)||null,onChange:(t,a)=>{J((a==null?void 0:a._id)||""),q("")},onInputChange:(t,a,r)=>{r==="input"&&q(a)},renderInput:t=>e.jsx(g,{...t,label:"Search by Party",size:"small",fullWidth:!0})})}),e.jsx(v,{item:!0,xs:6,sm:3,children:e.jsx(g,{fullWidth:!0,size:"small",label:"Start Date",type:"date",value:y,onChange:t=>V(t.target.value),InputLabelProps:{shrink:!0}})}),e.jsx(v,{item:!0,xs:6,sm:3,children:e.jsx(g,{fullWidth:!0,size:"small",label:"End Date",type:"date",value:m,onChange:t=>{tt(t.target.value),E(1)},InputLabelProps:{shrink:!0}})}),e.jsx(v,{item:!0,xs:12,sm:2,children:e.jsx(D,{fullWidth:!0,variant:"outlined",onClick:At,sx:{borderColor:"#6366f1",color:"#6366f1","&:hover":{borderColor:"#4338ca",background:"rgba(99, 102, 241, 0.1)"}},children:"Reset"})})]}),e.jsx(Mt,{children:e.jsxs(Qt,{children:[e.jsx(Ot,{children:e.jsxs(U,{sx:{background:h.primary},children:[e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Sr No"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Sauda No"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Party Name"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Type"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Category"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Sauda Date"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Quantity"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Rate"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Total Amount"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Status"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600},children:"Delivered Qty"}),e.jsx(i,{sx:{color:"#fff",fontWeight:600,width:"120px"},children:"Actions"})]})}),e.jsxs(_t,{children:[W.map((t,a)=>{var r;return e.jsxs(U,{children:[e.jsx(i,{sx:{fontWeight:600},children:(A-1)*at+a+1}),e.jsx(i,{sx:{fontWeight:600},children:t.saudaNo||"SAUDA-"+String(t.id).padStart(4,"0")}),e.jsx(i,{children:((r=t==null?void 0:t.partyId)==null?void 0:r.partyName)||"-"}),e.jsx(i,{children:e.jsx(K,{label:t.saudaType==="purchase"?"Purchase":"Sales",size:"small",icon:t.saudaType==="purchase"?e.jsx(dt,{sx:{fontSize:"14px !important"}}):e.jsx(ct,{sx:{fontSize:"14px !important"}}),sx:{fontWeight:600,fontSize:"0.72rem",bgcolor:t.saudaType==="purchase"?"rgba(224, 231, 255, 0.15)":"rgba(252, 231, 243, 0.15)",color:t.saudaType==="purchase"?"#4338ca":"#be185d","& .MuiChip-icon":{color:t.saudaType==="purchase"?"#4338ca":"#be185d"}}})}),e.jsx(i,{children:e.jsx(K,{label:t.saudaCategory==="chorsa-999"?"Chorsa 999":t.saudaCategory==="bank-9999"?"Bank 9999":"Kachi",size:"small",sx:{fontWeight:600,fontSize:"0.72rem"}})}),e.jsx(i,{children:H(t.saudaDate)}),e.jsxs(i,{children:[t.quantity," g"]}),e.jsx(i,{children:t.rate}),e.jsx(i,{sx:{fontWeight:600},children:(()=>{const o=parseFloat(String(t.quantity).replace(/,/g,""))||0,n=parseFloat(String(t.rate).replace(/,/g,""))||0,l=(o*(n/1e3)).toFixed(1);return`₹${parseFloat(l).toLocaleString("en-IN",{maximumFractionDigits:2})}`})()}),e.jsx(i,{children:e.jsx(K,{label:t.status||"Pending",size:"small",sx:{fontWeight:600,fontSize:"0.72rem",bgcolor:t.status==="delivered"?"rgba(209, 250, 229, 0.15)":t.status==="partial"?"rgba(254, 243, 199, 0.15)":"rgba(254, 226, 226, 0.15)",color:t.status==="delivered"?"#065f46":t.status==="partial"?"#92400e":"#991b1b"}})}),e.jsx(i,{children:e.jsxs(p,{sx:{fontWeight:600,fontSize:"0.85rem"},children:[t.delivered||0," g"]})}),e.jsxs(i,{children:[e.jsx(z,{size:"small",onClick:()=>$t(t),sx:{color:"#10b981","&:hover":{background:"rgba(16, 185, 129, 0.1)"}},children:e.jsx(ut,{})}),e.jsx(z,{size:"small",onClick:()=>kt(t),sx:{color:"#6366f1","&:hover":{background:"rgba(99, 102, 241, 0.1)"}},children:e.jsx(pt,{})}),e.jsx(z,{size:"small",onClick:()=>wt(t),sx:{color:"#ef4444","&:hover":{background:"rgba(239, 68, 68, 0.1)"}},children:e.jsx(xt,{})})]})]},t.id)}),W.length===0&&e.jsx(U,{children:e.jsx(i,{colSpan:10,align:"center",sx:{py:4},children:e.jsxs(p,{variant:"body2",sx:{color:"text.secondary"},children:["No ",u==="purchase"?"purchase":"sales"," sauda records found"]})})})]})]})}),et>1&&e.jsx(x,{sx:{display:"flex",justifyContent:"center",mt:3},children:e.jsx(Bt,{count:et,page:A,onChange:(t,a)=>{E(a)},color:"primary",size:"large"})})]})})]}),e.jsxs(gt,{open:vt,onClose:L,maxWidth:"md",fullWidth:!0,sx:{"& .MuiDialog-paper":{m:{xs:1,sm:2}}},PaperProps:{sx:{borderRadius:{xs:2,sm:3},boxShadow:"0 20px 60px rgba(99, 102, 241, 0.3)",overflow:"hidden",width:{xs:"calc(100% - 16px)"}}},children:[e.jsxs(ft,{sx:{background:h.primary,color:"#fff",fontWeight:700,py:3,px:4,display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs(x,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(x,{sx:{width:40,height:40,borderRadius:2,background:"rgba(255, 255, 255, 0.2)",display:"flex",alignItems:"center",justifyContent:"center"},children:F?e.jsx(pt,{sx:{fontSize:28}}):e.jsx(G,{sx:{fontSize:28}})}),e.jsxs(x,{children:[e.jsx(p,{variant:"h5",sx:{fontWeight:700},children:F?"Edit Sauda":"Add New Sauda"}),e.jsxs(p,{variant:"body2",sx:{opacity:.9,mt:.5},children:[u==="purchase"?"Purchase":"Sales"," Transaction"]})]})]}),e.jsx(z,{onClick:L,sx:{color:"#fff","&:hover":{background:"rgba(255, 255, 255, 0.2)"}},children:e.jsx(yt,{})})]}),e.jsx(mt,{sx:{pt:4,pb:2,px:4},children:e.jsxs(M,{spacing:2,sx:{pt:2},children:[e.jsxs(M,{direction:{xs:"column",sm:"row"},spacing:2,children:[e.jsx(ht,{fullWidth:!0,sx:{minWidth:{md:"200px"}},options:P?Y:k,getOptionLabel:t=>t.partyName||"",isOptionEqualToValue:(t,a)=>(t==null?void 0:t._id)===(a==null?void 0:a._id),value:s.partyId?{_id:s.partyId,partyName:s.partyName}:null,onChange:(t,a)=>{a?b({...s,partyName:a.partyName,partyId:a._id}):(b({...s,partyName:"",partyId:""}),q(""))},onInputChange:(t,a,r)=>{r==="input"&&q(a)},renderInput:t=>e.jsx(g,{...t,fullWidth:!0,label:"Select Party *",InputLabelProps:{shrink:!0},sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2}}})}),e.jsxs(Ht,{fullWidth:!0,sx:{minWidth:{md:"200px"}},children:[e.jsx(Gt,{children:"Sauda Category *"}),e.jsxs(Ut,{value:s.saudaCategory,name:"saudaCategory",onChange:N,label:"Sauda Category *",sx:{height:56,borderRadius:2},children:[e.jsx(X,{value:"kachi",children:"Kachi"}),e.jsx(X,{value:"chorsa-999",children:"Chorsa 999"}),e.jsx(X,{value:"bank-9999",children:"Bank 9999"})]})]}),e.jsx(g,{fullWidth:!0,label:"Sauda Date *",type:"date",value:s.saudaDate,name:"saudaDate",onChange:N,InputLabelProps:{shrink:!0},sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2}}}),e.jsx(g,{fullWidth:!0,label:"Quantity *",type:"text",value:s.quantity,name:"quantity",onChange:N,onInput:t=>{t.target.value=t.target.value.replace(/[^0-9.]/g,"")},InputProps:{endAdornment:e.jsx(bt,{position:"end",children:e.jsx(p,{sx:{color:"#6366f1",fontWeight:600},children:"g"})})},helperText:s.quantity?`${(parseFloat(s.quantity)/1e3).toFixed(3)} kg`:"Please Enter Qty in Grams Only",sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2},"& .MuiFormHelperText-root":{color:"#6366f1",fontWeight:500}}})]}),e.jsxs(M,{direction:{xs:"column",sm:"row"},spacing:2,children:[e.jsx(g,{fullWidth:!0,label:"Rate *",type:"text",value:s.rate,name:"rate",onChange:N,onInput:t=>{t.target.value=t.target.value.replace(/[^0-9.]/g,"")},helperText:s.rate?`${parseFloat(s.rate).toLocaleString("en-IN")} - ${Dt(parseFloat(s.rate))}`:"Enter rate",sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2},"& .MuiFormHelperText-root":{color:"#6366f1",fontWeight:500}}}),e.jsx(g,{fullWidth:!0,label:"Total Amount",type:"text",value:s.amount?parseFloat(s.amount).toLocaleString("en-IN"):"",InputProps:{readOnly:!0,startAdornment:e.jsx(p,{sx:{color:"#ec4899",mr:1,fontSize:20},children:"₹"})},sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2}}})]}),e.jsx(M,{direction:{xs:"column",sm:"row"},spacing:2,children:e.jsx(g,{fullWidth:!0,label:"Delivered Quantity",type:"text",value:s.deliveredQuantity,name:"deliveredQuantity",onChange:N,onInput:t=>{t.target.value=t.target.value.replace(/[^0-9.]/g,"")},InputProps:{endAdornment:e.jsx(bt,{position:"end",children:e.jsx(p,{sx:{color:"#6366f1",fontWeight:600},children:"g"})})},helperText:s.deliveredQuantity?`${(parseFloat(s.deliveredQuantity)/1e3).toFixed(3)} kg`:"Optional",sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2},"& .MuiFormHelperText-root":{color:"#6366f1",fontWeight:500}}})}),e.jsx(Kt,{control:e.jsx(Xt,{checked:s.isCrossCut,onChange:Pt,sx:{color:"#6366f1","&.Mui-checked":{color:"#6366f1"}}}),label:"Cross Cut",sx:{fontWeight:600,color:"text.secondary"}})]})}),e.jsxs(jt,{sx:{p:4,pt:2},children:[e.jsx(D,{onClick:L,startIcon:e.jsx(yt,{}),sx:{color:"text.secondary",fontWeight:600,px:3,py:1.5,borderRadius:2,"&:hover":{background:"rgba(99, 102, 241, 0.08)"}},children:"Cancel"}),e.jsx(D,{variant:"contained",startIcon:F?e.jsx(Yt,{}):e.jsx(G,{}),onClick:Ft,sx:{background:h.primary,fontWeight:600,px:4,py:1.5,borderRadius:2,boxShadow:"0 4px 12px rgba(99, 102, 241, 0.4)","&:hover":{background:h.primaryHover}}})]})]}),e.jsxs(gt,{open:Ct,onClose:st,maxWidth:"xs",fullWidth:!0,PaperProps:{sx:{borderRadius:3,boxShadow:"0 8px 32px rgba(0, 0, 0, 0.15)"}},children:[e.jsx(ft,{sx:{background:h.danger,color:"#fff"},children:e.jsxs(x,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(xt,{}),e.jsx(p,{variant:"h6",sx:{fontWeight:600},children:"Confirm Delete"})]})}),e.jsx(mt,{sx:{py:3},children:e.jsx(p,{variant:"body1",sx:{color:"text.secondary"},children:"Are you sure you want to delete this sauda? This action cannot be undone."})}),e.jsxs(jt,{sx:{p:3,pt:0},children:[e.jsx(D,{onClick:st,variant:"outlined",sx:{borderColor:"divider",color:"text.secondary","&:hover":{borderColor:"primary.main",background:"rgba(99, 102, 241, 0.08)"}},children:"Cancel"}),e.jsx(D,{onClick:Nt,variant:"contained",sx:{background:h.danger,color:"#fff","&:hover":{background:h.dangerHover,boxShadow:"0 6px 16px rgba(239, 68, 68, 0.4)"}},children:"Delete"})]})]})]})};export{ne as default};
