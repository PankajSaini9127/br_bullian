import{r as p,B as e}from"./vendor-UKnYS2Ok.js";import{y as k}from"./toastify-CS0d0PNp.js";import{p as lt}from"./partyService-Ci9xbeeO.js";import{a as zt}from"./axios-DcNlVx-A.js";import{a as Mt,g as m}from"./index-BLfDXvPf.js";import"./metalPaltaService-YqdS3Gri.js";import{a as Qt,B as j,b,ae as W,P as dt,af as Ot,ag as ct,X as ut,ah as ht,h as $,ai as pt,_ as X,aj as xt,e as v,$ as _t,a0 as Bt,a1 as Ht,a2 as Y,a3 as l,a4 as Ut,a5 as Z,f as Q,a6 as gt,a7 as yt,a8 as Gt,a9 as ft,aa as mt,ak as bt,ab as St,ac as O,al as Kt,am as Xt,an as Yt,ao as J,I as jt,ap as Zt,aq as Jt,ad as vt,ar as Vt}from"./mui-DWM_i8s0.js";import"./pdf-Crbg--cW.js";const te="http://localhost:8080/api",E=zt.create({baseURL:te});E.interceptors.request.use(c=>{const u=localStorage.getItem("token");return u&&(c.headers.Authorization=`Bearer ${u}`),c.headers["Content-Type"]="application/json",c},c=>Promise.reject(c));async function ee(c){var u;try{const o=await E.post("/sauda",c);return console.log("Sauda Saved:",o.data),o.data}catch(o){throw console.error("Error Saving Sauda:",((u=o.response)==null?void 0:u.data)||o.message),o}}async function ae(c,u){var o;try{const y=await E.put(`/sauda/${c}`,u);return console.log("Sauda Updated:",y.data),y.data}catch(y){throw console.error("Error Updating Sauda:",((o=y.response)==null?void 0:o.data)||y.message),y}}async function re(c){var u;try{const o=await E.delete(`/sauda/${c}`);return console.log("Sauda Deleted:",o.data),o.data}catch(o){throw console.error("Error Deleting Sauda:",((u=o.response)==null?void 0:u.data)||o.message),o}}async function se(c,u={}){var o,y;try{const x={...u};c&&(x.type=c);const h=await E.get("/sauda",{params:x});return console.log("Sauda List Retrieved:",h.data),((o=h==null?void 0:h.data)==null?void 0:o.data)||(h==null?void 0:h.data)||[]}catch(x){throw console.error("Error Retrieving Sauda List:",((y=x.response)==null?void 0:y.data)||x.message),x}}async function oe(c,u,o={}){var y,x;try{const h={partyId:c,...o};u&&(h.saudaType=u);const S=await E.get("/sauda/pending",{params:h});return console.log("Party Pending Saudas Retrieved:",S.data),((y=S==null?void 0:S.data)==null?void 0:y.data)||(S==null?void 0:S.data)||[]}catch(h){throw console.error("Error Retrieving Party Pending Saudas:",((x=h.response)==null?void 0:x.data)||h.message),h}}Mt(E);const _={addSauda:ee,updateSauda:ae,deleteSauda:re,getSaudaList:se,getPartyPendingSaudas:oe},xe=()=>{const[c,u]=p.useState([]),[o,y]=p.useState([]),[x,h]=p.useState(""),[S,V]=p.useState([]),[Ct,B]=p.useState(!1),[A,H]=p.useState(null),[It,U]=p.useState(!1),[L,G]=p.useState(null),[f,Dt]=p.useState("purchase"),[C,tt]=p.useState(""),[I,et]=p.useState(""),[D,at]=p.useState(""),[R,z]=p.useState(1),[rt,Tt]=p.useState(1),st=10,[s,T]=p.useState({partyName:"",partyId:"",saudaDate:new Date().toISOString().split("T")[0],quantity:"",rate:"",saudaType:"purchase",saudaCategory:"kachi",isCrossCut:!1,deliveredQuantity:""}),Pt=t=>{const a=["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"],r=["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"],n=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];if(t===0)return"Zero";const i=g=>g===0?"":g<10?a[g]:g<20?r[g-10]:g<100?n[Math.floor(g/10)]+(g%10!==0?" "+a[g%10]:""):a[Math.floor(g/100)]+" Hundred"+(g%100!==0?" "+i(g%100):""),d=Math.floor(t/1e7),w=Math.floor(t%1e7/1e5),P=Math.floor(t%1e5/1e3),F=t%1e3;let N="";return d>0&&(N+=i(d)+" Crore "),w>0&&(N+=i(w)+" Lakh "),P>0&&(N+=i(P)+" Thousand "),F>0&&(N+=i(F)),N.trim()},K=t=>{if(!t)return"";const a=new Date(t),r=String(a.getDate()).padStart(2,"0"),n=String(a.getMonth()+1).padStart(2,"0"),i=a.getFullYear();return`${r}-${n}-${i}`};p.useEffect(()=>{(async()=>{try{const a=await lt.getParties();a&&a.parties&&y(a.parties)}catch(a){console.error("Error fetching parties:",a)}})()},[]),p.useEffect(()=>{const t=setTimeout(async()=>{var a;if(x)try{const r=await lt.searchParties(x);V(((a=r==null?void 0:r.data)==null?void 0:a.parties)||[])}catch(r){console.error("Error searching parties:",r)}else V(o)},1e3);return()=>clearTimeout(t)},[x,o]),p.useEffect(()=>{ot()},[f,C,I,D,R]);const ot=async()=>{var t;try{const a={};a.type=f,C&&(a.partyId=C),I&&(a.startDate=I),D&&(a.endDate=D),a.page=R,a.limit=st;const r=await _.getSaudaList(f,a);(r||r!=null&&r.saudas)&&(u((r==null?void 0:r.saudas)||[]),Tt(((t=r==null?void 0:r.pagination)==null?void 0:t.totalPages)||1))}catch(a){console.error("Error fetching sauda list:",a),k.error("Failed to fetch sauda list")}},q=t=>{const{name:a,value:r}=t.target;T(a==="quantity"||a==="rate"?n=>{const i=a==="quantity"?r:n.quantity,d=a==="rate"?r:n.rate,w={...n,[a]:r},P=i?parseFloat(i):0,F=d?parseFloat(d):0;return!isNaN(P)&&!isNaN(F)&&(w.amount=(P*(F/1e3)).toFixed(1)),w}:{...s,[a]:r})},kt=()=>{B(!0),H(null),T({partyName:"",partyId:"",saudaDate:new Date().toISOString().split("T")[0],quantity:"",rate:"",amount:"",saudaType:f,saudaCategory:"kachi",deliveredQuantity:""})},Wt=t=>{var a;H(t),T({partyName:t.partyName,partyId:((a=t.partyId)==null?void 0:a._id)||"",saudaDate:t.saudaDate,quantity:t.quantity,rate:t.rate,amount:t.totalAmount||"",saudaType:t.saudaType||t.type||f,saudaCategory:t.saudaCategory||"kachi",deliveredQuantity:t.deliveredQuantity||""}),B(!0)},M=()=>{B(!1),H(null),T({partyName:"",partyId:"",saudaDate:new Date().toISOString().split("T")[0],quantity:"",rate:"",amount:"",saudaType:"purchase",saudaCategory:"kachi",deliveredQuantity:"",isCrossCut:!1})},wt=async()=>{if(!s.partyId||!s.saudaDate||!s.quantity||!s.rate){k.error("Please fill all required fields");return}const t=parseFloat(s.quantity)||0,a=parseFloat(s.rate)||0,r=(t*(a/1e3)).toFixed(1),n={partyName:s.partyName,partyId:s.partyId,saudaDate:s.saudaDate,quantity:s.quantity,rate:s.rate,totalAmount:r,saudaType:s.saudaType,saudaCategory:s.saudaCategory,delivered:s.deliveredQuantity,isCrossCut:s.isCrossCut};try{if(A)await _.updateSauda(A._id,n),u(c.map(i=>i.id===A.id?{...i,...n}:i)),k.success("Sauda updated successfully");else{const i=await _.addSauda(n);u([...c,i]),k.success("Sauda added successfully")}M(),ot()}catch(i){console.error("Error saving sauda:",i),k.error("Failed to save sauda")}},Ft=t=>{const a=t.target.checked;T(r=>({...r,isCrossCut:a}))},Nt=t=>{G(t),U(!0)},$t=async()=>{if(L)try{await _.deleteSauda(L._id||L.id),u(c.filter(t=>t._id!==L._id&&t.id!==L.id)),k.success("Sauda deleted successfully"),U(!1),G(null)}catch(t){console.error("Error deleting sauda:",t),k.error("Failed to delete sauda")}},nt=()=>{U(!1),G(null)},Et=t=>{var i;let a=`
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
          <p><strong>Party Name:</strong> ${((i=t.partyId)==null?void 0:i.partyName)||t.partyName||"-"}</p>
          <p><strong>Sauda Date:</strong> ${K(t.saudaDate)}</p>
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
    `;const r=document.createElement("iframe");r.style.position="absolute",r.style.top="-9999px",r.style.left="-9999px",document.body.appendChild(r);const n=r.contentDocument||r.contentWindow.document;n.open(),n.write(a),n.close(),r.contentWindow.focus(),r.contentWindow.print(),setTimeout(()=>{document.body.removeChild(r)},1e3)},At=()=>c.filter(t=>{var d;const a=t.saudaType===f,r=!C||((d=t.partyId)==null?void 0:d._id)===C||t.partyId===C,n=!I||t.saudaDate>=I,i=!D||t.saudaDate<=D;return a&&r&&n&&i}),Lt=()=>{tt(""),et(""),at(""),z(1)},qt=()=>{const t=At();if(t.length===0){k.error("No sauda to print");return}const a=o.find(d=>d._id===C);let r=`
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
        <h1>${f==="purchase"?"PURCHASE":"SALES"} SAUDA LIST</h1>
        <div class="header">
          ${a?`<p><strong>Party:</strong> ${a.partyName}</p>`:""}
          ${I||D?`<p><strong>Period:</strong> ${I||"..."} to ${D||"..."}</p>`:""}
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
    `;t.forEach((d,w)=>{var it;const P=parseFloat(d.quantity)||0,F=parseFloat(d.rate)||0,N=(P*(F/1e3)).toFixed(1),g=parseFloat(d.delivered)||parseFloat(d.deliveredQuantity)||0,Rt=(P-g).toFixed(1);r+=`
        <tr>
          <td>${w+1}</td>
          <td>${((it=d.partyId)==null?void 0:it.partyName)||d.partyName||"-"}</td>
          <td>${d.saudaType==="purchase"?"Purchase":"Sales"}</td>
          <td>${K(d.saudaDate)}</td>
          <td>${d.quantity}</td>
          <td>₹${parseFloat(d.rate).toLocaleString("en-IN")}</td>
          <td>₹${parseFloat(N).toLocaleString("en-IN")}</td>
          <td>${d.status||"Pending"}</td>
          <td>${g}</td>
          <td>${Rt}</td>
        </tr>
      `}),r+=`
          </tbody>
        </table>

        <p style="margin-top: 30px; color: #666; text-align: center;">Printed: ${new Date().toLocaleString("en-GB")}</p>
      </body>
      </html>
    `;const n=document.createElement("iframe");n.style.position="absolute",n.style.top="-9999px",n.style.left="-9999px",document.body.appendChild(n);const i=n.contentDocument||n.contentWindow.document;i.open(),i.write(r),i.close(),n.contentWindow.focus(),n.contentWindow.print(),setTimeout(()=>{document.body.removeChild(n)},1e3)};return e.jsxs(Qt,{maxWidth:"xl",sx:{px:{xs:1,sm:2,md:3}},children:[e.jsx(j,{sx:{mb:4},children:e.jsx(b,{variant:"h4",sx:{mb:2,fontWeight:700,fontSize:{xs:"1.5rem",sm:"2rem",md:"2.125rem"},background:m.primary,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"},children:"Sauda Management"})}),e.jsxs(W,{container:!0,spacing:2,children:[e.jsx(W,{item:!0,xs:12,children:e.jsx(dt,{elevation:3,sx:{p:3,borderRadius:2,boxShadow:"0 8px 32px rgba(99, 102, 241, 0.15)",border:"1px solid",borderColor:"divider"},children:e.jsxs(Ot,{value:f,onChange:(t,a)=>{Dt(a),z(1)},sx:{"& .MuiTab-root":{textTransform:"none",fontWeight:600,fontSize:"1rem"}},children:[e.jsx(ct,{value:"purchase",label:e.jsxs(j,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(ut,{sx:{color:"#6366f1"}}),"Purchase"]})}),e.jsx(ct,{value:"sales",label:e.jsxs(j,{sx:{display:"flex",alignItems:"center",gap:1},children:[e.jsx(ht,{sx:{color:"#ec4899"}}),"Sales"]})})]})})}),e.jsx(W,{item:!0,xs:12,children:e.jsxs(dt,{elevation:3,sx:{p:3,borderRadius:2,boxShadow:"0 8px 32px rgba(99, 102, 241, 0.15)",border:"1px solid",borderColor:"divider"},children:[e.jsxs(j,{sx:{display:"flex",flexDirection:{xs:"column",sm:"row"},justifyContent:"space-between",alignItems:{xs:"stretch",sm:"center"},gap:2,mb:2},children:[e.jsxs(b,{variant:"h6",sx:{fontWeight:600,color:"text.primary"},children:[f==="purchase"?"Purchase":"Sales"," Sauda List"]}),e.jsxs(j,{sx:{display:"flex",flexWrap:"wrap",gap:1},children:[e.jsx($,{variant:"contained",startIcon:e.jsx(pt,{}),onClick:qt,sx:{background:m.success,boxShadow:"0 4px 12px rgba(16, 185, 129, 0.4)","&:hover":{background:m.successHover}},children:"Print All"}),e.jsxs($,{variant:"contained",startIcon:e.jsx(X,{}),onClick:kt,sx:{background:m.primary,boxShadow:"0 4px 12px rgba(99, 102, 241, 0.4)","&:hover":{background:m.primaryHover}},children:["Add ",f==="purchase"?"Purchase":"Sales"," Sauda"]})]})]}),e.jsxs(W,{container:!0,spacing:2,sx:{mb:2},children:[e.jsx(W,{item:!0,xs:12,md:4,children:e.jsx(xt,{fullWidth:!0,sx:{minWidth:{md:"200px"}},options:x?S:o,getOptionLabel:t=>t.partyName||"",isOptionEqualToValue:(t,a)=>(t==null?void 0:t._id)===(a==null?void 0:a._id),value:o.find(t=>t._id===C)||null,onChange:(t,a)=>{tt((a==null?void 0:a._id)||""),h("")},onInputChange:(t,a,r)=>{r==="input"&&h(a)},renderInput:t=>e.jsx(v,{...t,label:"Search by Party",size:"small",fullWidth:!0})})}),e.jsx(W,{item:!0,xs:12,md:3,children:e.jsx(v,{fullWidth:!0,size:"small",label:"Start Date",type:"date",value:I,onChange:t=>et(t.target.value),InputLabelProps:{shrink:!0}})}),e.jsx(W,{item:!0,xs:12,md:3,children:e.jsx(v,{fullWidth:!0,size:"small",label:"End Date",type:"date",value:D,onChange:t=>{at(t.target.value),z(1)},InputLabelProps:{shrink:!0}})}),e.jsx(W,{item:!0,xs:12,md:2,children:e.jsx($,{fullWidth:!0,variant:"outlined",onClick:Lt,sx:{borderColor:"#6366f1",color:"#6366f1","&:hover":{borderColor:"#4338ca",background:"rgba(99, 102, 241, 0.1)"}},children:"Reset"})})]}),e.jsx(_t,{children:e.jsxs(Bt,{children:[e.jsx(Ht,{children:e.jsxs(Y,{sx:{background:m.primary},children:[e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Sr No"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Sauda No"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Party Name"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Type"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Category"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Sauda Date"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Quantity"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Rate"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Total Amount"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Status"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600},children:"Delivered Qty"}),e.jsx(l,{sx:{color:"#fff",fontWeight:600,width:"120px"},children:"Actions"})]})}),e.jsxs(Ut,{children:[c.map((t,a)=>{var r;return e.jsxs(Y,{children:[e.jsx(l,{sx:{fontWeight:600},children:(R-1)*st+a+1}),e.jsx(l,{sx:{fontWeight:600},children:t.saudaNo||"SAUDA-"+String(t.id).padStart(4,"0")}),e.jsx(l,{children:((r=t==null?void 0:t.partyId)==null?void 0:r.partyName)||"-"}),e.jsx(l,{children:e.jsx(Z,{label:t.saudaType==="purchase"?"Purchase":"Sales",size:"small",icon:t.saudaType==="purchase"?e.jsx(ut,{sx:{fontSize:"14px !important"}}):e.jsx(ht,{sx:{fontSize:"14px !important"}}),sx:{fontWeight:600,fontSize:"0.72rem",bgcolor:t.saudaType==="purchase"?"rgba(224, 231, 255, 0.15)":"rgba(252, 231, 243, 0.15)",color:t.saudaType==="purchase"?"#4338ca":"#be185d","& .MuiChip-icon":{color:t.saudaType==="purchase"?"#4338ca":"#be185d"}}})}),e.jsx(l,{children:e.jsx(Z,{label:t.saudaCategory==="chorsa-999"?"Chorsa 999":t.saudaCategory==="bank-9999"?"Bank 9999":"Kachi",size:"small",sx:{fontWeight:600,fontSize:"0.72rem"}})}),e.jsx(l,{children:K(t.saudaDate)}),e.jsxs(l,{children:[t.quantity," g"]}),e.jsx(l,{children:t.rate}),e.jsx(l,{sx:{fontWeight:600},children:(()=>{const n=parseFloat(String(t.quantity).replace(/,/g,""))||0,i=parseFloat(String(t.rate).replace(/,/g,""))||0,d=(n*(i/1e3)).toFixed(1);return`₹${parseFloat(d).toLocaleString("en-IN",{maximumFractionDigits:2})}`})()}),e.jsx(l,{children:e.jsx(Z,{label:t.status||"Pending",size:"small",sx:{fontWeight:600,fontSize:"0.72rem",bgcolor:t.status==="delivered"?"rgba(209, 250, 229, 0.15)":t.status==="partial"?"rgba(254, 243, 199, 0.15)":"rgba(254, 226, 226, 0.15)",color:t.status==="delivered"?"#065f46":t.status==="partial"?"#92400e":"#991b1b"}})}),e.jsx(l,{children:e.jsxs(b,{sx:{fontWeight:600,fontSize:"0.85rem"},children:[t.delivered||0," g"]})}),e.jsxs(l,{children:[e.jsx(Q,{size:"small",onClick:()=>Et(t),sx:{color:"#10b981","&:hover":{background:"rgba(16, 185, 129, 0.1)"}},children:e.jsx(pt,{})}),e.jsx(Q,{size:"small",onClick:()=>Wt(t),sx:{color:"#6366f1","&:hover":{background:"rgba(99, 102, 241, 0.1)"}},children:e.jsx(gt,{})}),e.jsx(Q,{size:"small",onClick:()=>Nt(t),sx:{color:"#ef4444","&:hover":{background:"rgba(239, 68, 68, 0.1)"}},children:e.jsx(yt,{})})]})]},t.id)}),c.length===0&&e.jsx(Y,{children:e.jsx(l,{colSpan:10,align:"center",sx:{py:4},children:e.jsxs(b,{variant:"body2",sx:{color:"text.secondary"},children:["No ",f==="purchase"?"purchase":"sales"," sauda records found"]})})})]})]})}),rt>1&&e.jsx(j,{sx:{display:"flex",justifyContent:"center",mt:3},children:e.jsx(Gt,{count:rt,page:R,onChange:(t,a)=>{z(a)},color:"primary",size:"large"})})]})})]}),e.jsxs(ft,{open:Ct,onClose:M,maxWidth:"md",fullWidth:!0,sx:{"& .MuiDialog-paper":{m:{xs:1,sm:2}}},PaperProps:{sx:{borderRadius:{xs:2,sm:3},boxShadow:"0 20px 60px rgba(99, 102, 241, 0.3)",overflow:"hidden",width:{xs:"calc(100% - 16px)"}}},children:[e.jsxs(mt,{sx:{background:m.primary,color:"#fff",fontWeight:700,py:3,px:4,display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs(j,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(j,{sx:{width:40,height:40,borderRadius:2,background:"rgba(255, 255, 255, 0.2)",display:"flex",alignItems:"center",justifyContent:"center"},children:A?e.jsx(gt,{sx:{fontSize:28}}):e.jsx(X,{sx:{fontSize:28}})}),e.jsxs(j,{children:[e.jsx(b,{variant:"h5",sx:{fontWeight:700},children:A?"Edit Sauda":"Add New Sauda"}),e.jsxs(b,{variant:"body2",sx:{opacity:.9,mt:.5},children:[f==="purchase"?"Purchase":"Sales"," Transaction"]})]})]}),e.jsx(Q,{onClick:M,sx:{color:"#fff","&:hover":{background:"rgba(255, 255, 255, 0.2)"}},children:e.jsx(bt,{})})]}),e.jsx(St,{sx:{pt:4,pb:2,px:4},children:e.jsxs(O,{spacing:2,sx:{pt:2},children:[e.jsxs(O,{direction:{xs:"column",sm:"row"},spacing:2,children:[e.jsx(xt,{fullWidth:!0,sx:{minWidth:{md:"200px"}},options:x?S:o,getOptionLabel:t=>t.partyName||"",isOptionEqualToValue:(t,a)=>(t==null?void 0:t._id)===(a==null?void 0:a._id),value:o.find(t=>t._id===s.partyId)||null,onChange:(t,a)=>{a?T({...s,partyName:a.partyName,partyId:a._id}):(T({...s,partyName:"",partyId:""}),h(""))},onInputChange:(t,a,r)=>{r==="input"&&h(a)},renderInput:t=>e.jsx(v,{...t,fullWidth:!0,label:"Select Party *",InputLabelProps:{shrink:!0},sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2}}})}),e.jsxs(Kt,{fullWidth:!0,sx:{minWidth:{md:"200px"}},children:[e.jsx(Xt,{children:"Sauda Category *"}),e.jsxs(Yt,{value:s.saudaCategory,name:"saudaCategory",onChange:q,label:"Sauda Category *",sx:{height:56,borderRadius:2},children:[e.jsx(J,{value:"kachi",children:"Kachi"}),e.jsx(J,{value:"chorsa-999",children:"Chorsa 999"}),e.jsx(J,{value:"bank-9999",children:"Bank 9999"})]})]}),e.jsx(v,{fullWidth:!0,label:"Sauda Date *",type:"date",value:s.saudaDate,name:"saudaDate",onChange:q,InputLabelProps:{shrink:!0},sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2}}}),e.jsx(v,{fullWidth:!0,label:"Quantity *",type:"text",value:s.quantity,name:"quantity",onChange:q,onInput:t=>{t.target.value=t.target.value.replace(/[^0-9.]/g,"")},InputProps:{endAdornment:e.jsx(jt,{position:"end",children:e.jsx(b,{sx:{color:"#6366f1",fontWeight:600},children:"g"})})},helperText:s.quantity?`${(parseFloat(s.quantity)/1e3).toFixed(3)} kg`:"Please Enter Qty in Grams Only",sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2},"& .MuiFormHelperText-root":{color:"#6366f1",fontWeight:500}}})]}),e.jsxs(O,{direction:{xs:"column",sm:"row"},spacing:2,children:[e.jsx(v,{fullWidth:!0,label:"Rate *",type:"text",value:s.rate,name:"rate",onChange:q,onInput:t=>{t.target.value=t.target.value.replace(/[^0-9.]/g,"")},helperText:s.rate?`${parseFloat(s.rate).toLocaleString("en-IN")} - ${Pt(parseFloat(s.rate))}`:"Enter rate",sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2},"& .MuiFormHelperText-root":{color:"#6366f1",fontWeight:500}}}),e.jsx(v,{fullWidth:!0,label:"Total Amount",type:"text",value:s.amount?parseFloat(s.amount).toLocaleString("en-IN"):"",InputProps:{readOnly:!0,startAdornment:e.jsx(b,{sx:{color:"#ec4899",mr:1,fontSize:20},children:"₹"})},sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2}}})]}),e.jsx(O,{direction:{xs:"column",sm:"row"},spacing:2,children:e.jsx(v,{fullWidth:!0,label:"Delivered Quantity",type:"text",value:s.deliveredQuantity,name:"deliveredQuantity",onChange:q,onInput:t=>{t.target.value=t.target.value.replace(/[^0-9.]/g,"")},InputProps:{endAdornment:e.jsx(jt,{position:"end",children:e.jsx(b,{sx:{color:"#6366f1",fontWeight:600},children:"g"})})},helperText:s.deliveredQuantity?`${(parseFloat(s.deliveredQuantity)/1e3).toFixed(3)} kg`:"Optional",sx:{width:"100%","& .MuiOutlinedInput-root":{height:56,borderRadius:2},"& .MuiFormHelperText-root":{color:"#6366f1",fontWeight:500}}})}),e.jsx(Zt,{control:e.jsx(Jt,{checked:s.isCrossCut,onChange:Ft,sx:{color:"#6366f1","&.Mui-checked":{color:"#6366f1"}}}),label:"Cross Cut",sx:{fontWeight:600,color:"text.secondary"}})]})}),e.jsxs(vt,{sx:{p:4,pt:2},children:[e.jsx($,{onClick:M,startIcon:e.jsx(bt,{}),sx:{color:"text.secondary",fontWeight:600,px:3,py:1.5,borderRadius:2,"&:hover":{background:"rgba(99, 102, 241, 0.08)"}},children:"Cancel"}),e.jsx($,{variant:"contained",startIcon:A?e.jsx(Vt,{}):e.jsx(X,{}),onClick:wt,sx:{background:m.primary,fontWeight:600,px:4,py:1.5,borderRadius:2,boxShadow:"0 4px 12px rgba(99, 102, 241, 0.4)","&:hover":{background:m.primaryHover}}})]})]}),e.jsxs(ft,{open:It,onClose:nt,maxWidth:"xs",fullWidth:!0,PaperProps:{sx:{borderRadius:3,boxShadow:"0 8px 32px rgba(0, 0, 0, 0.15)"}},children:[e.jsx(mt,{sx:{background:m.danger,color:"#fff"},children:e.jsxs(j,{sx:{display:"flex",alignItems:"center",gap:2},children:[e.jsx(yt,{}),e.jsx(b,{variant:"h6",sx:{fontWeight:600},children:"Confirm Delete"})]})}),e.jsx(St,{sx:{py:3},children:e.jsx(b,{variant:"body1",sx:{color:"text.secondary"},children:"Are you sure you want to delete this sauda? This action cannot be undone."})}),e.jsxs(vt,{sx:{p:3,pt:0},children:[e.jsx($,{onClick:nt,variant:"outlined",sx:{borderColor:"divider",color:"text.secondary","&:hover":{borderColor:"primary.main",background:"rgba(99, 102, 241, 0.08)"}},children:"Cancel"}),e.jsx($,{onClick:$t,variant:"contained",sx:{background:m.danger,color:"#fff","&:hover":{background:m.dangerHover,boxShadow:"0 6px 16px rgba(239, 68, 68, 0.4)"}},children:"Delete"})]})]})]})};export{xe as default};
