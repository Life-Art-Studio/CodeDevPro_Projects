import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { calculateOrderTotal, formatCurrency } from "./financeUtils";

// ==========================================
// MAIN REPORT GENERATOR
// ==========================================
export const generateDashboardReport = (orders, metrics, currentUser) => {
  const user = currentUser ?? { name: 'My Business' };
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- 1. HEADER ---
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text(user.name, 14, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 29);
  
  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 35, pageWidth - 14, 35);

  // --- 2. EXECUTIVE SUMMARY (METRICS) ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Executive Summary", 14, 47);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  // Revenue
  doc.setTextColor(100, 116, 139);
  doc.text("Total Confirmed Revenue:", 14, 56);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(`Rs. ${formatCurrency(metrics.totalRevenue)}`, 65, 56);

  // Orders
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Total Orders Processed:", 14, 64);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${metrics.totalOrdersCount}`, 65, 64);

  // Customers
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Active Unique Buyers:", 14, 72);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${metrics.activeCustomersCount}`, 65, 72);

  // --- 3. ALL ORDERS DATA TABLE ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Complete Order Ledger", 14, 90);

  const tableColumn = ["Order ID", "Date", "Status", "Items", "Total Amount"];
  const tableRows = [];

  orders.forEach((order) => {
    tableRows.push([
      order.id,
      order.date,
      order.status,
      order.items.length.toString(),
      `Rs. ${formatCurrency(calculateOrderTotal(order))}`
    ]);
  });

  autoTable(doc, {
    startY: 96,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { fontStyle: "bold" },
      4: { halign: "right", fontStyle: "bold" } // Right align money
    },
    margin: { left: 14, right: 14 }
  });

  // --- 4. FOOTER ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "CodeDevPro Dashboard Analytics - Confidential", 
    pageWidth / 2, 
    doc.internal.pageSize.getHeight() - 10, 
    { align: "center" }
  );

  // --- 5. TRIGGER DOWNLOAD ---
  doc.save(`Business_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};