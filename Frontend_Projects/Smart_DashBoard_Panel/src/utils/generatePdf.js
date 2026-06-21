import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { calculateRowTotal, formatCurrency, getOrderPaidAmount, getOrderOutstanding } from "./financeUtils";

// ==========================================
// MAIN INVOICE GENERATOR
// ==========================================

export const generateInvoicePDF = (order, customer, currentUser) => {
  const user = currentUser ?? { name: 'My Business' };
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightMargin = pageWidth - 14;

  // ------------------------------------------
  // 1. TOP HEADER
  // ------------------------------------------
  
  // Left Side: Company Branding (Profile Picture OR User Name)
  if (user.profilePic) {
    try {
      doc.addImage(user.profilePic, "PNG", 14, 12, 20, 20);
    } catch (e) {
      console.error("Failed to add profile picture to invoice PDF", e);
      // Fallback to text name if image addition fails
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 58, 138); 
      doc.text(user.name, 14, 24);
    }
  } else {
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138); 
    doc.text(user.name, 14, 24);
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); 
//   doc.text("Frontend Mentor", 14, 30);
//   doc.text("Srinagar, Jammu & Kashmir", 14, 35);

  // Right Side: "INVOICE" Watermark
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(226, 232, 240); 
  doc.text("INVOICE", rightMargin, 28, { align: "right" });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 42, rightMargin, 42);

  // ------------------------------------------
  // 2. INVOICE & CUSTOMER INFO
  // ------------------------------------------
  const infoStartY = 52;

  // LEFT: Invoice Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Invoice Details", 14, infoStartY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  
  doc.text("Invoice No:", 14, infoStartY + 7);
  doc.text("Date:", 14, infoStartY + 13);
  doc.text("Status:", 14, infoStartY + 19);

  // Locked values at X: 40 for perfect column alignment
  doc.setTextColor(15, 23, 42);
  doc.text(order.id, 40, infoStartY + 7);
  doc.text(order.date, 40, infoStartY + 13);
  
  doc.setFont("helvetica", "bold");
  doc.text(order.status.toUpperCase(), 40, infoStartY + 19);

  // RIGHT: Customer Details
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Bill To:", rightMargin, infoStartY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);

  let currentY = infoStartY + 7;
  doc.text(customer?.name || "Walk-in Customer", rightMargin, currentY, { align: "right" });

  if (customer?.email) {
    currentY += 6;
    doc.text(customer.email, rightMargin, currentY, { align: "right" });
  }
  if (customer?.phone) {
    currentY += 6;
    doc.text(customer.phone, rightMargin, currentY, { align: "right" });
  }
  if (customer?.address) {
    currentY += 6;
    doc.text(customer.address, rightMargin, currentY, { align: "right" });
  }

  // ------------------------------------------
  // 3. THE DATA TABLE
  // ------------------------------------------
  const tableColumn = ["#", "Item Description", "Qty", "Price", "Disc %", "GST %", "Total"];
  const tableRows = [];
  let subtotal = 0;

  order.items.forEach((item, index) => {
    const rowTotal = calculateRowTotal(item);
    subtotal += rowTotal;

    tableRows.push([
      (index + 1).toString(),
      item.name || "Unnamed Item",
      item.qty.toString(),
      `Rs. ${formatCurrency(item.price)}`,
      `${item.discount}%`,
      `${item.gst}%`,
      `Rs. ${formatCurrency(rowTotal)}`
    ]);
  });

  autoTable(doc, {
    startY: Math.max(85, currentY + 10), 
    head: [tableColumn],
    body: tableRows,
    theme: "plain",
    headStyles: {
      fillColor: [248, 250, 252],
      textColor: [100, 116, 139],
      fontStyle: "bold",
      lineWidth: 0.1,
      lineColor: [226, 232, 240]
    },
    bodyStyles: {
      textColor: [15, 23, 42],
      borderBottomWidth: 0.1,
      borderBottomColor: [241, 245, 249],
      cellPadding: { top: 4, right: 2, bottom: 4, left: 2 } // Cleaner cell spacing
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { halign: "left" },
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "right", fontStyle: "bold" }
    },
    margin: { left: 14, right: 14 }
  });

  // ------------------------------------------
  // 4. TOTALS SECTION
  // ------------------------------------------
  const finalY = doc.lastAutoTable.finalY + 15;

  const globalDiscountPct = Number(order.globalDiscount) || 0;
  const globalDiscountAmt = subtotal * (globalDiscountPct / 100);
  const finalTotal = subtotal - globalDiscountAmt;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);

  // Subtotal
  doc.text("Subtotal:", rightMargin - 40, finalY, { align: "right" });
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${formatCurrency(subtotal)}`, rightMargin, finalY, { align: "right" });

  // Discount
  if (globalDiscountAmt > 0) {
    doc.setTextColor(100, 116, 139);
    doc.text(`Global Discount (${globalDiscountPct}%):`, rightMargin - 40, finalY + 8, { align: "right" });

    doc.setTextColor(220, 38, 38);
    doc.text(`- Rs. ${formatCurrency(globalDiscountAmt)}`, rightMargin, finalY + 8, { align: "right" });
  }

  // Final Total Box
  const totalY = globalDiscountAmt > 0 ? finalY + 18 : finalY + 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(rightMargin - 75, totalY - 6, 75, 10, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Total Due:", rightMargin - 40, totalY, { align: "right" });

  doc.setTextColor(37, 99, 235);
  doc.text(`Rs. ${formatCurrency(finalTotal)}`, rightMargin - 2, totalY, { align: "right" });

  let nextY = totalY + 15;

  if (order.payments && order.payments.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Payment History", 14, nextY);

    const paymentRows = order.payments.map(p => [
      p.date,
      p.method,
      `Rs. ${formatCurrency(p.amount)}`,
      p.note || "-"
    ]);

    autoTable(doc, {
      startY: nextY + 5,
      head: [["Date", "Method", "Amount", "Note"]],
      body: paymentRows,
      theme: "plain",
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: [100, 116, 139],
        fontStyle: "bold",
        lineWidth: 0.1,
        lineColor: [226, 232, 240]
      },
      bodyStyles: {
        textColor: [15, 23, 42],
        borderBottomWidth: 0.1,
        borderBottomColor: [241, 245, 249]
      }
    });

    nextY = doc.lastAutoTable.finalY + 15;
  }

  const outstanding = getOrderOutstanding(order);
  if (outstanding > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text("Outstanding Balance:", rightMargin - 40, nextY, { align: "right" });
    doc.text(`Rs. ${formatCurrency(outstanding)}`, rightMargin - 2, nextY, { align: "right" });
  }

  // ------------------------------------------
  // 5. FOOTER
  // ------------------------------------------
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Thank you for your business. Please contact us if you have any questions.", 
    pageWidth / 2, 
    280, 
    { align: "center" }
  );

  // ------------------------------------------
  // 6. TRIGGER DOWNLOAD
  // ------------------------------------------
  doc.save(`Invoice_${order.id}.pdf`);
};

// ==========================================
// WAREHOUSE STOCK LEDGER REPORT GENERATOR
// ==========================================
export const generateWarehouseStockPDF = (entity, ledgerItems) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightMargin = pageWidth - 14;

  // --- 1. TOP BRANDING / REPORT WATERMARK ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138); // Navy Blue
  doc.text("STOCK STATUS REPORT", 14, 24);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); 
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 14, 30);

  // Right Side: Warehouse Tag
  const isSS = entity.id.startsWith("SS-");
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(isSS ? 124 : 37, isSS ? 58 : 99, isSS ? 237 : 235); // Purple for SS, Blue for DB
  doc.text(isSS ? "SUPER STOCKIST" : "DISTRIBUTOR MAPPED", rightMargin, 24, { align: "right" });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 36, rightMargin, 36);

  // --- 2. PARTY (WAREHOUSE) HEADER INFORMATION ---
  const infoStartY = 46;

  // LEFT COLUMN: Party Details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("PARTY DETAILS:", 14, infoStartY);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(entity.name, 14, infoStartY + 7);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  let currentY = infoStartY + 12;
  doc.text(`Address/Area: ${entity.district || entity.state || "Not Specified"}`, 14, currentY);
  currentY += 5;
  doc.text(`Phone: ${entity.contactPhone || "Not Specified"}`, 14, currentY);
  currentY += 5;
  
  // GST No
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`GST No: ${entity.gstNo || "N/A"}`, 14, currentY);

  // RIGHT COLUMN: Stock Summary Box
  const summaryBoxWidth = 70;
  const summaryBoxHeight = 25;
  const summaryBoxX = rightMargin - summaryBoxWidth;
  const summaryBoxY = infoStartY;

  // Background light slate
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 3, 3, "F");
  
  // Border
  doc.setDrawColor(241, 245, 249);
  doc.roundedRect(summaryBoxX, summaryBoxY, summaryBoxWidth, summaryBoxHeight, 3, 3, "D");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL WAREHOUSE STOCK", summaryBoxX + 5, summaryBoxY + 7);

  const totalStockSum = ledgerItems.reduce((sum, item) => sum + (item.currentStock || 0), 0);
  const lowStockCount = ledgerItems.filter(item => item.currentStock <= item.reorderLevel).length;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(`${totalStockSum.toLocaleString("en-IN")} Units`, summaryBoxX + 5, summaryBoxY + 16);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  if (lowStockCount > 0) {
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`* Alert: ${lowStockCount} items in low stock!`, summaryBoxX + 5, summaryBoxY + 21);
  } else {
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text("✓ All stock levels healthy", summaryBoxX + 5, summaryBoxY + 21);
  }

  // --- 3. DATA TABLE ---
  const tableColumn = ["#", "Product Details & SKU", "Category", "Current Stock", "Reorder Level", "Stock Status"];
  const tableRows = [];

  ledgerItems.forEach((item, index) => {
    const isLow = item.currentStock <= item.reorderLevel;
    tableRows.push([
      (index + 1).toString(),
      `${item.name}\n[SKU: ${item.sku}]`,
      item.category || "General",
      `${item.currentStock} Units`,
      `${item.reorderLevel} Units`,
      isLow ? "LOW STOCK" : "HEALTHY"
    ]);
  });

  autoTable(doc, {
    startY: Math.max(summaryBoxY + summaryBoxHeight + 10, currentY + 12),
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [30, 58, 138], // Navy Blue
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left"
    },
    bodyStyles: {
      textColor: [15, 23, 42],
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { fontStyle: "bold" },
      3: { halign: "right", fontStyle: "bold" },
      4: { halign: "right" },
      5: { halign: "center", fontStyle: "bold" }
    },
    didParseCell: (data) => {
      // Add custom color rendering for stock status
      if (data.column.index === 5 && data.cell.section === "body") {
        if (data.cell.raw === "LOW STOCK") {
          data.cell.styles.textColor = [220, 38, 38]; // Red
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        }
      }
    },
    margin: { left: 14, right: 14 }
  });

  // --- 4. SIGNATURE / VERIFICATION FOOTER ---
  const finalY = doc.lastAutoTable.finalY + 25;
  const signatureWidth = 50;

  // Signature lines if fits on page, else on next
  if (finalY + 30 < doc.internal.pageSize.getHeight()) {
    // Left side: Prepared By
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, finalY, 14 + signatureWidth, finalY);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Warehouse Executive Signature", 14, finalY + 5);

    // Right side: Authorized By
    doc.line(rightMargin - signatureWidth, finalY, rightMargin, finalY);
    doc.text("Authorized Signatory", rightMargin - signatureWidth, finalY + 5);
  }

  // --- 5. PAGE FOOTER ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `This stock status report is an official ledger statement generated from CodeDevPro Smart Panel.`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // --- 6. TRIGGER DOWNLOAD ---
  const cleanedName = entity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`Stock_Report_${cleanedName}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ==========================================
// WAREHOUSE STOCK LEDGER EXCEL GENERATOR
// ==========================================
export const generateWarehouseStockExcel = (entity, ledgerItems) => {
  const isSS = entity.id.startsWith("SS-");
  const partyType = isSS ? "Super Stockist" : "Distributor";
  const totalStockSum = ledgerItems.reduce((sum, item) => sum + (item.currentStock || 0), 0);
  const lowStockCount = ledgerItems.filter(item => item.currentStock <= item.reorderLevel).length;

  const dateString = new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  let html = `
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
          <td colspan="7" class="sub-header">Generated on: ${dateString} • CodeDevPro Smart Panel</td>
        </tr>
        <tr><td colspan="7"></td></tr> <!-- Spacer -->

        <!-- Party Info & Stock Summary section -->
        <tr>
          <td colspan="4" class="section-title">PARTY DETAILS (${partyType.toUpperCase()})</td>
          <td colspan="3" class="section-title">STOCK LEDGER SUMMARY</td>
        </tr>
        <tr>
          <td class="label-cell">Party Name:</td>
          <td colspan="3" class="value-cell" style="font-weight: bold;">${entity.name}</td>
          <td class="label-cell">Total Stock Units:</td>
          <td colspan="2" class="value-cell" style="font-weight: bold; color: #2563eb;">${totalStockSum.toLocaleString("en-IN")} Units</td>
        </tr>
        <tr>
          <td class="label-cell">Address/Area:</td>
          <td colspan="3" class="value-cell">${entity.district || entity.state || "Not Specified"}</td>
          <td class="label-cell">Low Stock Alerts:</td>
          <td colspan="2" class="value-cell" style="font-weight: bold; color: #dc2626;">${lowStockCount} Items</td>
        </tr>
        <tr>
          <td class="label-cell">Phone No:</td>
          <td colspan="3" class="value-cell">${entity.contactPhone || "Not Specified"}</td>
          <td class="label-cell">Warehouse Status:</td>
          <td colspan="2" class="value-cell" style="font-weight: bold; color: ${lowStockCount > 0 ? '#dc2626' : '#16a34a'};">
            ${lowStockCount > 0 ? 'CRITICAL ALERT' : 'HEALTHY'}
          </td>
        </tr>
        <tr>
          <td class="label-cell">GST Number:</td>
          <td colspan="3" class="value-cell" style="font-weight: bold; font-family: monospace;">${entity.gstNo || "N/A"}</td>
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
  `;

  ledgerItems.forEach((item, index) => {
    const isLow = item.currentStock <= item.reorderLevel;
    html += `
      <tr>
        <td class="td-cell" style="text-align: center;">${index + 1}</td>
        <td class="td-cell" style="font-weight: bold;">${item.name}</td>
        <td class="td-cell" style="font-family: monospace;">${item.sku}</td>
        <td class="td-cell">${item.category || "General"}</td>
        <td class="td-cell" style="text-align: right; font-weight: bold;">${item.currentStock}</td>
        <td class="td-cell" style="text-align: right;">${item.reorderLevel}</td>
        <td class="td-cell" style="text-align: center;">
          <span class="${isLow ? 'low-stock' : 'healthy-stock'}">${isLow ? 'LOW STOCK' : 'HEALTHY'}</span>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanedName = entity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute("href", url);
  link.setAttribute("download", `Stock_Report_${cleanedName}_${new Date().toISOString().split('T')[0]}.xls`);
  link.click();
};