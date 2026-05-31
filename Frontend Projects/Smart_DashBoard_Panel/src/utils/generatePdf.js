import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import  StorageService  from "../services/storageService";

import { calculateRowTotal, formatCurrency, getOrderPaidAmount, getOrderOutstanding } from "./financeUtils";

// ==========================================
// MAIN INVOICE GENERATOR
// ==========================================

export const generateInvoicePDF = (order, customer) => {
  const user = StorageService.getCurrentUser() ?? { name: 'My Business' };
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