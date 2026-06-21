import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./financeUtils";

export const generateBeatPDF = (beat, customers, orders, visits, getOrderPaidAmount, getOrderOutstanding, currentUser) => {
  const user = currentUser ?? { name: 'My Business' };
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightMargin = pageWidth - 14;

  // ------------------------------------------
  // 1. TOP HEADER
  // ------------------------------------------
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138); 
  doc.text(user.name, 14, 24);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(226, 232, 240); 
  doc.text("BEAT REPORT", rightMargin, 28, { align: "right" });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 42, rightMargin, 42);

  // ------------------------------------------
  // 2. BEAT INFO
  // ------------------------------------------
  const infoStartY = 52;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Beat Details", 14, infoStartY);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Beat ID:", 14, infoStartY + 7);
  doc.text("Beat Name:", 14, infoStartY + 13);
  doc.text("Generated:", 14, infoStartY + 19);

  doc.setTextColor(15, 23, 42);
  doc.text(beat.id, 40, infoStartY + 7);
  doc.setFont("helvetica", "bold");
  doc.text(beat.name, 40, infoStartY + 13);
  doc.setFont("helvetica", "normal");
  doc.text(new Date().toLocaleDateString(), 40, infoStartY + 19);

  // ------------------------------------------
  // 3. PERFORMANCE SUMMARY
  // ------------------------------------------
  const assignedIds = beat.assignedCustomers || [];
  const beatOrders = orders.filter(o => assignedIds.includes(o.customerId));
  const paidOrders = beatOrders.filter(o => o.status === 'Paid' || o.status === 'Partially Paid');
  
  const totalOrders = beatOrders.length;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + getOrderPaidAmount(o), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const outstandingBalance = beatOrders.reduce((sum, o) => sum + getOrderOutstanding(o), 0);

  const beatVisits = visits.filter(v => v.beatId === beat.id);
  const visitedCount = beatVisits.filter(v => v.status === 'Visited').length;
  const missedCount = beatVisits.filter(v => v.status === 'Missed').length;
  const visitRate = (visitedCount + missedCount) > 0 ? (visitedCount / (visitedCount + missedCount)) * 100 : 0;

  const allDates = [
    ...beatOrders.map(o => new Date(o.date).getTime()),
    ...beatVisits.map(v => new Date(v.visitDate).getTime())
  ].filter(d => !isNaN(d));
  const lastActivity = allDates.length > 0 ? new Date(Math.max(...allDates)).toLocaleDateString() : 'No Activity';

  doc.setFont("helvetica", "bold");
  doc.text("Performance Summary", rightMargin, infoStartY, { align: "right" });

  doc.setFont("helvetica", "normal");
  let sumY = infoStartY + 7;
  doc.text(`Total Revenue: Rs. ${formatCurrency(totalRevenue)}`, rightMargin, sumY, { align: "right" });
  doc.text(`Total Orders: ${totalOrders}`, rightMargin, sumY + 6, { align: "right" });
  doc.text(`Visit Rate: ${visitRate.toFixed(0)}%`, rightMargin, sumY + 12, { align: "right" });
  doc.text(`Avg Order Value: Rs. ${formatCurrency(averageOrderValue)}`, rightMargin, sumY + 18, { align: "right" });
  doc.text(`Outstanding: Rs. ${formatCurrency(outstandingBalance)}`, rightMargin, sumY + 24, { align: "right" });
  doc.text(`Last Activity: ${lastActivity}`, rightMargin, sumY + 30, { align: "right" });

  // ------------------------------------------
  // 4. CUSTOMER ROSTER TABLE
  // ------------------------------------------
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  let nextY = Math.max(infoStartY + 25, sumY + 35) + 5;
  doc.text("Assigned Customers", 14, nextY);

  const rosterCols = ["ID", "Name", "Phone", "Orders", "Revenue", "Outstanding"];
  const rosterRows = assignedIds.map(cid => {
    const cust = customers.find(c => c.id === cid) || { name: 'Unknown', phone: 'N/A' };
    const custOrders = beatOrders.filter(o => o.customerId === cid);
    const custRev = custOrders.filter(o => o.status === 'Paid' || o.status === 'Partially Paid').reduce((s, o) => s + getOrderPaidAmount(o), 0);
    const custOut = custOrders.reduce((s, o) => s + getOrderOutstanding(o), 0);
    return [
      cid,
      cust.name,
      cust.phone || "-",
      custOrders.length.toString(),
      `Rs. ${formatCurrency(custRev)}`,
      `Rs. ${formatCurrency(custOut)}`
    ];
  });

  autoTable(doc, {
    startY: nextY + 5,
    head: [rosterCols],
    body: rosterRows,
    theme: "plain",
    headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: "bold", lineWidth: 0.1, lineColor: [226, 232, 240] },
    bodyStyles: { textColor: [15, 23, 42], borderBottomWidth: 0.1, borderBottomColor: [241, 245, 249] }
  });

  // ------------------------------------------
  // 5. VISIT HISTORY TABLE
  // ------------------------------------------
  nextY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Recent Visits (Last 20)", 14, nextY);

  const visitCols = ["Date", "Customer", "Status", "Notes", "Next Visit"];
  const recentVisits = [...beatVisits].sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate)).slice(0, 20);
  
  const visitRows = recentVisits.map(v => {
    const cust = customers.find(c => c.id === v.customerId)?.name || v.customerId;
    return [
      v.visitDate,
      cust,
      v.status,
      v.notes || "-",
      v.nextVisitDate || "-"
    ];
  });

  autoTable(doc, {
    startY: nextY + 5,
    head: [visitCols],
    body: visitRows,
    theme: "plain",
    headStyles: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: "bold", lineWidth: 0.1, lineColor: [226, 232, 240] },
    bodyStyles: { textColor: [15, 23, 42], borderBottomWidth: 0.1, borderBottomColor: [241, 245, 249] }
  });

  // ------------------------------------------
  // 6. FOOTER
  // ------------------------------------------
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Generated by SmartSaaS Dashboard", 
    pageWidth / 2, 
    280, 
    { align: "center" }
  );

  const formattedDate = new Date().toISOString().split('T')[0];
  const safeName = beat.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`BeatReport_${safeName}_${formattedDate}.pdf`);
};
