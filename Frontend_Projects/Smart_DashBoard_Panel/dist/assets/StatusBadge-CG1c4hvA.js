import{i as e}from"./AuthContext-D-k9dmfO.js";import{a as t,i as n,n as r}from"./financeUtils-D_CAfPxL.js";import{n as i,t as a}from"./jspdf.plugin.autotable-CT3Fah00.js";var o=(e,o,s)=>{let c=s??{name:`My Business`},l=new i,u=l.internal.pageSize.getWidth(),d=u-14;if(c.profilePic)try{l.addImage(c.profilePic,`PNG`,14,12,20,20)}catch(e){console.error(`Failed to add profile picture to invoice PDF`,e),l.setFontSize(24),l.setFont(`helvetica`,`bold`),l.setTextColor(30,58,138),l.text(c.name,14,24)}else l.setFontSize(24),l.setFont(`helvetica`,`bold`),l.setTextColor(30,58,138),l.text(c.name,14,24);l.setFontSize(10),l.setFont(`helvetica`,`normal`),l.setTextColor(100,116,139),l.setFontSize(28),l.setFont(`helvetica`,`bold`),l.setTextColor(226,232,240),l.text(`INVOICE`,d,28,{align:`right`}),l.setDrawColor(226,232,240),l.setLineWidth(.5),l.line(14,42,d,42),l.setFontSize(10),l.setFont(`helvetica`,`bold`),l.setTextColor(15,23,42),l.text(`Invoice Details`,14,52),l.setFont(`helvetica`,`normal`),l.setTextColor(100,116,139),l.text(`Invoice No:`,14,59),l.text(`Date:`,14,65),l.text(`Status:`,14,71),l.setTextColor(15,23,42),l.text(e.id,40,59),l.text(e.date,40,65),l.setFont(`helvetica`,`bold`),l.text(e.status.toUpperCase(),40,71),l.setFont(`helvetica`,`bold`),l.setTextColor(15,23,42),l.text(`Bill To:`,d,52,{align:`right`}),l.setFont(`helvetica`,`normal`),l.setTextColor(100,116,139);let f=59;l.text(o?.name||`Walk-in Customer`,d,f,{align:`right`}),o?.email&&(f+=6,l.text(o.email,d,f,{align:`right`})),o?.phone&&(f+=6,l.text(o.phone,d,f,{align:`right`})),o?.address&&(f+=6,l.text(o.address,d,f,{align:`right`}));let p=[`#`,`Item Description`,`Qty`,`Price`,`Disc %`,`GST %`,`Total`],m=[],h=0;e.items.forEach((e,t)=>{let i=r(e);h+=i,m.push([(t+1).toString(),e.name||`Unnamed Item`,e.qty.toString(),`Rs. ${n(e.price)}`,`${e.discount}%`,`${e.gst}%`,`Rs. ${n(i)}`])}),a(l,{startY:Math.max(85,f+10),head:[p],body:m,theme:`plain`,headStyles:{fillColor:[248,250,252],textColor:[100,116,139],fontStyle:`bold`,lineWidth:.1,lineColor:[226,232,240]},bodyStyles:{textColor:[15,23,42],borderBottomWidth:.1,borderBottomColor:[241,245,249],cellPadding:{top:4,right:2,bottom:4,left:2}},columnStyles:{0:{cellWidth:10,halign:`center`},1:{halign:`left`},2:{halign:`center`},3:{halign:`right`},4:{halign:`center`},5:{halign:`center`},6:{halign:`right`,fontStyle:`bold`}},margin:{left:14,right:14}});let g=l.lastAutoTable.finalY+15,_=Number(e.globalDiscount)||0,v=_/100*h,y=h-v;l.setFontSize(10),l.setFont(`helvetica`,`normal`),l.setTextColor(100,116,139),l.text(`Subtotal:`,d-40,g,{align:`right`}),l.setTextColor(15,23,42),l.text(`Rs. ${n(h)}`,d,g,{align:`right`}),v>0&&(l.setTextColor(100,116,139),l.text(`Global Discount (${_}%):`,d-40,g+8,{align:`right`}),l.setTextColor(220,38,38),l.text(`- Rs. ${n(v)}`,d,g+8,{align:`right`}));let b=v>0?g+18:g+10;l.setFillColor(248,250,252),l.rect(d-75,b-6,75,10,`F`),l.setFontSize(12),l.setFont(`helvetica`,`bold`),l.setTextColor(15,23,42),l.text(`Total Due:`,d-40,b,{align:`right`}),l.setTextColor(37,99,235),l.text(`Rs. ${n(y)}`,d-2,b,{align:`right`});let x=b+15;if(e.payments&&e.payments.length>0){l.setFontSize(11),l.setFont(`helvetica`,`bold`),l.setTextColor(15,23,42),l.text(`Payment History`,14,x);let t=e.payments.map(e=>[e.date,e.method,`Rs. ${n(e.amount)}`,e.note||`-`]);a(l,{startY:x+5,head:[[`Date`,`Method`,`Amount`,`Note`]],body:t,theme:`plain`,headStyles:{fillColor:[248,250,252],textColor:[100,116,139],fontStyle:`bold`,lineWidth:.1,lineColor:[226,232,240]},bodyStyles:{textColor:[15,23,42],borderBottomWidth:.1,borderBottomColor:[241,245,249]}}),x=l.lastAutoTable.finalY+15}let S=t(e);S>0&&(l.setFontSize(12),l.setFont(`helvetica`,`bold`),l.setTextColor(220,38,38),l.text(`Outstanding Balance:`,d-40,x,{align:`right`}),l.text(`Rs. ${n(S)}`,d-2,x,{align:`right`})),l.setFont(`helvetica`,`italic`),l.setFontSize(9),l.setTextColor(148,163,184),l.text(`Thank you for your business. Please contact us if you have any questions.`,u/2,280,{align:`center`}),l.save(`Invoice_${e.id}.pdf`)},s=(e,t)=>{let n=new i,r=n.internal.pageSize.getWidth(),o=r-14;n.setFontSize(22),n.setFont(`helvetica`,`bold`),n.setTextColor(30,58,138),n.text(`STOCK STATUS REPORT`,14,24),n.setFontSize(9),n.setFont(`helvetica`,`normal`),n.setTextColor(100,116,139),n.text(`Generated on: ${new Date().toLocaleDateString(`en-IN`,{year:`numeric`,month:`long`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})}`,14,30);let s=e.id.startsWith(`SS-`);n.setFontSize(14),n.setFont(`helvetica`,`bold`),n.setTextColor(s?124:37,s?58:99,s?237:235),n.text(s?`SUPER STOCKIST`:`DISTRIBUTOR MAPPED`,o,24,{align:`right`}),n.setDrawColor(226,232,240),n.setLineWidth(.5),n.line(14,36,o,36),n.setFontSize(10),n.setFont(`helvetica`,`bold`),n.setTextColor(100,116,139),n.text(`PARTY DETAILS:`,14,46),n.setFontSize(12),n.setFont(`helvetica`,`bold`),n.setTextColor(15,23,42),n.text(e.name,14,53),n.setFontSize(9),n.setFont(`helvetica`,`normal`),n.setTextColor(71,85,105);let c=58;n.text(`Address/Area: ${e.district||e.state||`Not Specified`}`,14,c),c+=5,n.text(`Phone: ${e.contactPhone||`Not Specified`}`,14,c),c+=5,n.setFont(`helvetica`,`bold`),n.setTextColor(15,23,42),n.text(`GST No: ${e.gstNo||`N/A`}`,14,c);let l=o-70;n.setFillColor(248,250,252),n.roundedRect(l,46,70,25,3,3,`F`),n.setDrawColor(241,245,249),n.roundedRect(l,46,70,25,3,3,`D`),n.setFontSize(9),n.setFont(`helvetica`,`bold`),n.setTextColor(100,116,139),n.text(`TOTAL WAREHOUSE STOCK`,l+5,53);let u=t.reduce((e,t)=>e+(t.currentStock||0),0),d=t.filter(e=>e.currentStock<=e.reorderLevel).length;n.setFontSize(16),n.setFont(`helvetica`,`bold`),n.setTextColor(37,99,235),n.text(`${u.toLocaleString(`en-IN`)} Units`,l+5,62),n.setFontSize(8),n.setFont(`helvetica`,`bold`),d>0?(n.setTextColor(220,38,38),n.text(`* Alert: ${d} items in low stock!`,l+5,67)):(n.setTextColor(16,185,129),n.text(`✓ All stock levels healthy`,l+5,67));let f=[`#`,`Product Details & SKU`,`Category`,`Current Stock`,`Reorder Level`,`Stock Status`],p=[];t.forEach((e,t)=>{let n=e.currentStock<=e.reorderLevel;p.push([(t+1).toString(),`${e.name}\n[SKU: ${e.sku}]`,e.category||`General`,`${e.currentStock} Units`,`${e.reorderLevel} Units`,n?`LOW STOCK`:`HEALTHY`])}),a(n,{startY:Math.max(81,c+12),head:[f],body:p,theme:`striped`,headStyles:{fillColor:[30,58,138],textColor:[255,255,255],fontStyle:`bold`,fontSize:9,halign:`left`},bodyStyles:{textColor:[15,23,42],fontSize:8.5},columnStyles:{0:{cellWidth:10,halign:`center`},1:{fontStyle:`bold`},3:{halign:`right`,fontStyle:`bold`},4:{halign:`right`},5:{halign:`center`,fontStyle:`bold`}},didParseCell:e=>{e.column.index===5&&e.cell.section===`body`&&(e.cell.raw===`LOW STOCK`?e.cell.styles.textColor=[220,38,38]:e.cell.styles.textColor=[16,185,129])},margin:{left:14,right:14}});let m=n.lastAutoTable.finalY+25;m+30<n.internal.pageSize.getHeight()&&(n.setDrawColor(203,213,225),n.setLineWidth(.5),n.line(14,m,64,m),n.setFontSize(8.5),n.setFont(`helvetica`,`normal`),n.setTextColor(100,116,139),n.text(`Warehouse Executive Signature`,14,m+5),n.line(o-50,m,o,m),n.text(`Authorized Signatory`,o-50,m+5)),n.setFont(`helvetica`,`italic`),n.setFontSize(8.5),n.setTextColor(148,163,184),n.text(`This stock status report is an official ledger statement generated from CodeDevPro Smart Panel.`,r/2,n.internal.pageSize.getHeight()-10,{align:`center`});let h=e.name.replace(/[^a-z0-9]/gi,`_`).toLowerCase();n.save(`Stock_Report_${h}_${new Date().toISOString().split(`T`)[0]}.pdf`)},c=(e,t)=>{let n=e.id.startsWith(`SS-`)?`Super Stockist`:`Distributor`,r=t.reduce((e,t)=>e+(t.currentStock||0),0),i=t.filter(e=>e.currentStock<=e.reorderLevel).length,a=`
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8"/>
      <style>
        table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .title-header { font-size: 16pt; font-weight: bold; color: #1e3a8a; }
        .sub-header { font-size: 10pt; color: #64748b; font-style: italic; }
        .section-title { font-size: 11pt; font-weight: bold; color: #1e3a8a; background-color: #f1f5f9; border: 1px solid #cbd5e1; }
        .label-cell { font-size: 10pt; font-weight: bold; color: #475569; background-color: #fafafa; border: 1px solid #e2e8f0; }
        .value-cell { font-size: 10pt; color: #0f172a; border: 1px solid #e2e8f0; }
        .th-cell { font-size: 10pt; font-weight: bold; background-color: #1e3a8a; color: #ffffff; border: 1px solid #cbd5e1; text-align: left; padding: 6px; }
        .td-cell { font-size: 10pt; color: #334155; border: 1px solid #e2e8f0; padding: 6px; }
        .low-stock { color: #dc2626; font-weight: bold; }
        .healthy-stock { color: #16a34a; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <!-- Company / Report Header -->
        <tr>
          <td colspan="7" class="title-header">STOCK STATUS LEDGER REPORT</td>
        </tr>
        <tr>
          <td colspan="7" class="sub-header">Generated on: ${new Date().toLocaleDateString(`en-IN`,{year:`numeric`,month:`long`,day:`numeric`,hour:`2-digit`,minute:`2-digit`})} • CodeDevPro Smart Panel</td>
        </tr>
        <tr><td colspan="7"></td></tr> <!-- Spacer -->

        <!-- Party Info & Stock Summary section -->
        <tr>
          <td colspan="4" class="section-title">PARTY DETAILS (${n.toUpperCase()})</td>
          <td colspan="3" class="section-title">STOCK LEDGER SUMMARY</td>
        </tr>
        <tr>
          <td class="label-cell">Party Name:</td>
          <td colspan="3" class="value-cell" style="font-weight: bold;">${e.name}</td>
          <td class="label-cell">Total Stock Units:</td>
          <td colspan="2" class="value-cell" style="font-weight: bold; color: #2563eb;">${r.toLocaleString(`en-IN`)} Units</td>
        </tr>
        <tr>
          <td class="label-cell">Address/Area:</td>
          <td colspan="3" class="value-cell">${e.district||e.state||`Not Specified`}</td>
          <td class="label-cell">Low Stock Alerts:</td>
          <td colspan="2" class="value-cell" style="font-weight: bold; color: #dc2626;">${i} Items</td>
        </tr>
        <tr>
          <td class="label-cell">Phone No:</td>
          <td colspan="3" class="value-cell">${e.contactPhone||`Not Specified`}</td>
          <td class="label-cell">Warehouse Status:</td>
          <td colspan="2" class="value-cell" style="font-weight: bold; color: ${i>0?`#dc2626`:`#16a34a`};">
            ${i>0?`CRITICAL ALERT`:`HEALTHY`}
          </td>
        </tr>
        <tr>
          <td class="label-cell">GST Number:</td>
          <td colspan="3" class="value-cell" style="font-weight: bold; font-family: monospace;">${e.gstNo||`N/A`}</td>
          <td colspan="3" class="value-cell"></td>
        </tr>
        <tr><td colspan="7"></td></tr> <!-- Spacer -->

        <!-- Items Table -->
        <thead>
          <tr>
            <th class="th-cell" style="width: 50px; text-align: center;">S.No</th>
            <th class="th-cell" style="width: 250px;">Product Name</th>
            <th class="th-cell" style="width: 120px;">SKU</th>
            <th class="th-cell" style="width: 120px;">Category</th>
            <th class="th-cell" style="width: 100px; text-align: right;">Current Stock</th>
            <th class="th-cell" style="width: 100px; text-align: right;">Reorder Level</th>
            <th class="th-cell" style="width: 120px; text-align: center;">Stock Status</th>
          </tr>
        </thead>
        <tbody>
  `;t.forEach((e,t)=>{let n=e.currentStock<=e.reorderLevel;a+=`
      <tr>
        <td class="td-cell" style="text-align: center;">${t+1}</td>
        <td class="td-cell" style="font-weight: bold;">${e.name}</td>
        <td class="td-cell" style="font-family: monospace;">${e.sku}</td>
        <td class="td-cell">${e.category||`General`}</td>
        <td class="td-cell" style="text-align: right; font-weight: bold;">${e.currentStock}</td>
        <td class="td-cell" style="text-align: right;">${e.reorderLevel}</td>
        <td class="td-cell" style="text-align: center;">
          <span class="${n?`low-stock`:`healthy-stock`}">${n?`LOW STOCK`:`HEALTHY`}</span>
        </td>
      </tr>
    `}),a+=`
        </tbody>
      </table>
    </body>
    </html>
  `;let o=new Blob([`﻿`+a],{type:`application/vnd.ms-excel;charset=utf-8;`}),s=URL.createObjectURL(o),c=document.createElement(`a`),l=e.name.replace(/[^a-z0-9]/gi,`_`).toLowerCase();c.setAttribute(`href`,s),c.setAttribute(`download`,`Stock_Report_${l}_${new Date().toISOString().split(`T`)[0]}.xls`),c.click()},l=e();function u({status:e,className:t=``}){let n=`bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`,r=(e||``).toLowerCase();return r.includes(`paid`)||r===`active`||r===`visited`?n=`bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/20`:r.includes(`pending`)||r.includes(`partially`)||r===`scheduled`?n=`bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-amber-600/20`:r.includes(`cancelled`)||r===`inactive`||r===`missed`||r===`bounced`?n=`bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/20`:r.includes(`dispatched`)&&(n=`bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 ring-1 ring-indigo-600/20`),(0,l.jsx)(`span`,{className:`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${n} ${t}`,children:e})}export{s as i,o as n,c as r,u as t};