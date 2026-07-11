import{r as l,B as t}from"./vendor-UKnYS2Ok.js";import{y as c}from"./toastify-CS0d0PNp.js";import{p as M}from"./partyService-Ci9xbeeO.js";import{a as U}from"./axios-DcNlVx-A.js";import{a as J,g as i}from"./index-BLfDXvPf.js";import{a as K,B as b,b as P,ac as g,h as f,ay as Q,az as X,_ as Y,$ as Z,P as V,a0 as ee,a1 as te,a2 as D,a3 as o,a4 as ae,f as k,a6 as re,ai as se,a7 as ne,a9 as oe,aa as ie,ab as de,aj as le,e as m,ad as ce,av as he}from"./mui-DWM_i8s0.js";import"./pdf-Crbg--cW.js";const pe="http://localhost:8080/api",p=U.create({baseURL:pe});p.interceptors.request.use(r=>{const h=localStorage.getItem("token");return h&&(r.headers.Authorization=`Bearer ${h}`),r.headers["Content-Type"]="application/json",r},r=>Promise.reject(r));J(p);const N={createNote:r=>p.post("/notes",r),getNotes:(r={})=>p.get("/notes",{params:r}),getNoteById:r=>p.get(`/notes/${r}`),updateNote:(r,h)=>p.put(`/notes/${r}`,h),deleteNote:r=>p.delete(`/notes/${r}`)},be=()=>{const[r,h]=l.useState("credit"),[T,w]=l.useState([]),[$,v]=l.useState(!1),[x,I]=l.useState(null),[F,L]=l.useState([]),[_,y]=l.useState(!1),[W,A]=l.useState(!1),[n,u]=l.useState({partyName:"",partyId:"",noteDate:new Date().toISOString().split("T")[0],amount:"",fine:"",reason:""});l.useEffect(()=>{B()},[]),l.useEffect(()=>{S()},[r]);const B=async()=>{try{y(!0);const e=await M.getParties(),a=(e==null?void 0:e.data)||e;L((a==null?void 0:a.parties)||[])}catch(e){console.error("Error fetching parties:",e),c.error("Failed to fetch parties")}finally{y(!1)}},S=async()=>{var e;try{y(!0);const a=await N.getNotes({noteType:r}),s=(a==null?void 0:a.data)||a,d=((e=s==null?void 0:s.data)==null?void 0:e.notes)||(s==null?void 0:s.notes)||(s==null?void 0:s.data)||s;w(Array.isArray(d)?d:[])}catch(a){console.error("Error fetching notes:",a),c.error("Failed to fetch notes"),w([])}finally{y(!1)}},j=e=>{const{name:a,value:s}=e.target;u({...n,[a]:s})},O=()=>{v(!0),I(null),u({partyName:"",partyId:"",noteDate:new Date().toISOString().split("T")[0],amount:"",fine:"",reason:""})},R=e=>{I(e);const a=e.partyId||e.party;u({partyName:(a==null?void 0:a.partyName)||e.partyName||"",partyId:(a==null?void 0:a._id)||e.partyId||"",noteDate:e.date?e.date.split("T")[0]:e.noteDate||new Date().toISOString().split("T")[0],amount:e.amount!==void 0?String(e.amount):"",fine:e.fine!==void 0?String(e.fine):"",reason:e.reason||""}),v(!0)},H=(e,a)=>{u({...n,partyName:(a==null?void 0:a.partyName)||"",partyId:(a==null?void 0:a._id)||""})},C=()=>{v(!1),I(null),u({partyName:"",partyId:"",noteDate:new Date().toISOString().split("T")[0],amount:"",fine:"",reason:""})},z=async()=>{var a,s;if(!n.partyId){c.error("Please select a party");return}if(!n.amount&&!n.fine){c.error("Please fill either Amount or Fine");return}const e={noteType:r,date:n.noteDate,partyId:n.partyId,reason:n.reason,amount:n.amount?parseFloat(n.amount):0,fine:n.fine?parseFloat(n.fine):0};try{A(!0),x?(await N.updateNote(x._id||x.id,e),c.success("Note updated successfully")):(await N.createNote(e),c.success("Note added successfully")),C(),S()}catch(d){console.error("Error saving note:",d),c.error(((s=(a=d==null?void 0:d.response)==null?void 0:a.data)==null?void 0:s.message)||"Failed to save note")}finally{A(!1)}},q=async e=>{if(window.confirm("Are you sure you want to delete this note?"))try{await N.deleteNote(e),c.success("Note deleted successfully"),S()}catch(a){console.error("Error deleting note:",a),c.error("Failed to delete note")}},G=e=>{var s,d,E;const a=window.open("","_blank");a.document.write(`
      <html>
        <head>
          <title>${r==="credit"?"Credit":"Debit"} Note</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 0; }
            .info { margin: 10px 0; }
            .info strong { display: inline-block; width: 150px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #f0f0f0; }
            .footer { margin-top: 30px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${r==="credit"?"CREDIT NOTE":"DEBIT NOTE"}</h2>
          </div>
          <div class="info">
            <strong>Note No:</strong> ${e.noteNo||((s=e._id)==null?void 0:s.slice(-6))||e.id}
          </div>
          <div class="info">
            <strong>Date:</strong> ${e.date||e.noteDate}
          </div>
          <div class="info">
            <strong>Party Name:</strong> ${((d=e.partyId)==null?void 0:d.partyName)||e.partyName||((E=e.party)==null?void 0:E.partyName)||"-"}
          </div>
          <div class="info">
            <strong>Reason:</strong> ${e.reason}
          </div>
          <table>
            <tr>
              <th>Description</th>
              <th>Amount (&#8377;)</th>
              <th>Fine (g)</th>
            </tr>
            <tr>
              <td>${e.reason}</td>
              <td>${parseFloat(e.amount).toLocaleString("en-IN")}</td>
              <td>${e.fine?parseFloat(e.fine).toLocaleString("en-IN"):"-"}</td>
            </tr>
          </table>
          <div class="footer">
            <strong>Total Amount: &#8377;${parseFloat(e.amount).toLocaleString("en-IN")}</strong><br/>
            <strong>Total Fine: ${e.fine?parseFloat(e.fine).toLocaleString("en-IN")+"g":"-"}</strong>
          </div>
        </body>
      </html>
    `),a.document.close(),a.print()};return t.jsxs(K,{maxWidth:"xl",sx:{mt:4,mb:4},children:[t.jsxs(b,{sx:{mb:3},children:[t.jsx(P,{variant:"h4",component:"h1",gutterBottom:!0,children:r==="credit"?"Credit Notes":"Debit Notes"}),t.jsxs(g,{direction:"row",spacing:2,sx:{mt:2},children:[t.jsx(f,{variant:r==="credit"?"contained":"outlined",onClick:()=>h("credit"),sx:{flexGrow:1,...r==="credit"&&{background:i.success,boxShadow:"0 4px 12px rgba(16, 185, 129, 0.4)","&:hover":{background:i.successHover}}},children:"Credit Notes"}),t.jsx(f,{variant:r==="debit"?"contained":"outlined",onClick:()=>h("debit"),sx:{flexGrow:1,...r==="debit"&&{background:i.danger,boxShadow:"0 4px 12px rgba(239, 68, 68, 0.4)","&:hover":{background:i.dangerHover}}},children:"Debit Notes"})]})]}),t.jsx(Q,{children:t.jsxs(X,{children:[t.jsx(b,{sx:{mb:2,display:"flex",justifyContent:"flex-end"},children:t.jsxs(f,{variant:"contained",startIcon:t.jsx(Y,{}),onClick:O,sx:{background:r==="credit"?i.success:i.danger,boxShadow:r==="credit"?"0 4px 12px rgba(16, 185, 129, 0.4)":"0 4px 12px rgba(239, 68, 68, 0.4)","&:hover":{background:r==="credit"?i.successHover:i.dangerHover}},children:["Add ",r==="credit"?"Credit":"Debit"," Note"]})}),t.jsx(Z,{component:V,children:t.jsxs(ee,{children:[t.jsx(te,{children:t.jsxs(D,{sx:{background:r==="credit"?i.success:i.danger},children:[t.jsx(o,{sx:{color:"#fff",fontWeight:600},children:"Note No"}),t.jsx(o,{sx:{color:"#fff",fontWeight:600},children:"Date"}),t.jsx(o,{sx:{color:"#fff",fontWeight:600},children:"Party Name"}),t.jsx(o,{sx:{color:"#fff",fontWeight:600},children:"Reason"}),t.jsx(o,{sx:{color:"#fff",fontWeight:600},children:"Amount (₹)"}),t.jsx(o,{sx:{color:"#fff",fontWeight:600},children:"Fine (g)"}),t.jsx(o,{sx:{color:"#fff",fontWeight:600},children:"Actions"})]})}),t.jsxs(ae,{children:[T.map(e=>{var a,s,d;return t.jsxs(D,{hover:!0,children:[t.jsx(o,{children:e.noteNo||((a=e._id)==null?void 0:a.slice(-6))||e.id}),t.jsx(o,{children:e.date?new Date(e.date).toLocaleDateString("en-GB"):e.noteDate}),t.jsx(o,{children:((s=e.partyId)==null?void 0:s.partyName)||e.partyName||((d=e.party)==null?void 0:d.partyName)||"-"}),t.jsx(o,{children:e.reason}),t.jsxs(o,{sx:{fontWeight:600},children:["₹",parseFloat(e.amount).toLocaleString("en-IN")]}),t.jsx(o,{sx:{fontWeight:600},children:e.fine?parseFloat(e.fine).toLocaleString("en-IN"):"-"}),t.jsx(o,{children:t.jsxs(g,{direction:"row",spacing:1,children:[t.jsx(k,{size:"small",onClick:()=>R(e),color:"primary",children:t.jsx(re,{})}),t.jsx(k,{size:"small",onClick:()=>G(e),color:"secondary",children:t.jsx(se,{})}),t.jsx(k,{size:"small",onClick:()=>q(e._id||e.id),color:"error",children:t.jsx(ne,{})})]})})]},e._id||e.id)}),T.length===0&&t.jsx(D,{children:t.jsx(o,{colSpan:7,align:"center",sx:{py:4},children:t.jsxs(P,{color:"text.secondary",children:["No ",r==="credit"?"credit":"debit"," notes found"]})})})]})]})})]})}),t.jsxs(oe,{open:$,onClose:C,maxWidth:"sm",fullWidth:!0,children:[t.jsxs(ie,{children:[x?"Edit":"Add"," ",r==="credit"?"Credit":"Debit"," Note"]}),t.jsx(de,{children:t.jsxs(g,{spacing:2,sx:{mt:1},children:[t.jsxs(g,{direction:{xs:"column",md:"row"},spacing:2,children:[t.jsx(b,{sx:{width:{xs:"100%",md:"50%"}},children:t.jsx(le,{loading:_,fullWidth:!0,options:F,getOptionLabel:e=>e.partyName||"",isOptionEqualToValue:(e,a)=>(e==null?void 0:e._id)===(a==null?void 0:a._id),value:F.find(e=>e._id===n.partyId)||null,onChange:H,renderInput:e=>t.jsx(m,{...e,label:"Party Name",required:!0})})}),t.jsx(b,{sx:{width:{xs:"100%",md:"50%"}},children:t.jsx(m,{fullWidth:!0,label:"Date",type:"date",name:"noteDate",value:n.noteDate,onChange:j,InputLabelProps:{shrink:!0},required:!0})})]}),t.jsxs(g,{direction:{xs:"column",md:"row"},spacing:2,children:[t.jsx(m,{fullWidth:!0,label:"Amount",type:"number",name:"amount",value:n.amount,onChange:j,onInput:e=>{e.target.value=e.target.value.replace(/[^0-9.]/g,"")}}),t.jsx(m,{fullWidth:!0,label:"Fine (g)",type:"number",name:"fine",value:n.fine,onChange:j,onInput:e=>{e.target.value=e.target.value.replace(/[^0-9.]/g,"")}})]}),t.jsx(m,{fullWidth:!0,label:"Reason",name:"reason",value:n.reason,onChange:j,multiline:!0,rows:3})]})}),t.jsxs(ce,{children:[t.jsx(f,{onClick:C,children:"Cancel"}),t.jsx(f,{onClick:z,variant:"contained",startIcon:t.jsx(he,{}),disabled:W,sx:{background:r==="credit"?i.success:i.danger,"&:hover":{background:r==="credit"?i.successHover:i.dangerHover}},children:W?"Saving...":x?"Update":"Save"})]})]})]})};export{be as default};
