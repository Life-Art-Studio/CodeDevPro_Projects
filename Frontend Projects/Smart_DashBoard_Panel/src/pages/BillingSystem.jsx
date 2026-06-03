import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { useBilling } from "../context/BillingContext";
import { useSupplyChainContext } from "../context/SupplyChainContext";
import useCustomerContext from "../context/CustomerContext";
import useOrderContext from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useProductContext } from "../context/ProductContext";
import ResponsiveTable from "../components/ui/ResponsiveTable";
import ReceiptScanner from "../components/Billing/ReceiptScanner";
import InvoicePreview from "../components/Billing/InvoicePreview";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Plus, FileText, ShieldAlert, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, IndianRupee, Database,
  Wifi, WifiOff, Eye, Download, Trash2, X, RefreshCw,
  AlertTriangle, Send, CreditCard, BarChart2, Filter,
  FileDown, ChevronDown, Tag, Bell, SlidersHorizontal,
  TrendingUp, Users, Receipt, Banknote, Layers, Calendar,
  ShoppingCart, PackageCheck, ClipboardList,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Overdue badge helper ────────────────────────────────────────────────────────
const isInvoiceOverdue = (inv) => {
  if (inv.status === "Paid") return false;
  if (!inv.dueDate) return false;
  return new Date(inv.dueDate) < new Date(new Date().toDateString());
};

const agingDays = (inv) => {
  if (!inv.dueDate || inv.status === "Paid") return 0;
  return Math.max(0, Math.floor((new Date() - new Date(inv.dueDate)) / 86400000));
};

// ── CSV Export utility ─────────────────────────────────────────────────────────
const exportToCSV = (data, filename = "invoices.csv") => {
  if (!data.length) { toast.error("No data to export."); return; }
  const headers = ["Invoice ID", "Date", "Due Date", "Issuer", "Recipient", "Tier", "SubTotal", "Tax", "Total", "Paid", "Outstanding", "Status", "Overdue Days"];
  const rows = data.map(inv => [
    inv.id, inv.createdAt, inv.dueDate || "",
    inv.issuerName, inv.recipientName, inv.tier,
    inv.subTotal, inv.tax, inv.total,
    inv.amountPaid || 0,
    (inv.total - (inv.amountPaid || 0)).toFixed(2),
    inv.status,
    isInvoiceOverdue(inv) ? agingDays(inv) : 0
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${data.length} invoices to CSV`);
};

// ── PDF Download Generator ─────────────────────────────────────────────────────
const generatePDF = (invoice, { superStockists = [], distributors = [], customers = [] } = {}) => {
  try {
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const lm = 14, rm = pw - 14;

    let issuerEntity = null;
    if (invoice.issuerId?.startsWith("SS-")) issuerEntity = superStockists.find(s => s.id === invoice.issuerId);
    else if (invoice.issuerId?.startsWith("DB-")) issuerEntity = distributors.find(d => d.id === invoice.issuerId);
    if (!issuerEntity) issuerEntity = distributors.find(d => d.userId === invoice.issuerId) || distributors[0] || null;

    let recipientEntity = null;
    if (invoice.recipientId?.startsWith("DB-")) recipientEntity = distributors.find(d => d.id === invoice.recipientId);
    else if (invoice.recipientId?.startsWith("SS-")) recipientEntity = superStockists.find(s => s.id === invoice.recipientId);
    else recipientEntity = customers.find(c => c.id === invoice.recipientId);

    doc.setFillColor(22, 40, 100); doc.rect(0, 0, pw, 42, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(255, 255, 255);
    doc.text(issuerEntity?.name || invoice.issuerName || "Distributor", lm, 16);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(180, 200, 255);
    const il1 = [issuerEntity?.district, issuerEntity?.state].filter(Boolean).join(", ");
    if (il1) doc.text(il1, lm, 23);
    const il2 = [issuerEntity?.contactPhone ? `Ph: ${issuerEntity.contactPhone}` : null, issuerEntity?.email ? `Email: ${issuerEntity.email}` : null].filter(Boolean).join("   |   ");
    if (il2) doc.text(il2, lm, 29);
    if (issuerEntity?.gstNo) doc.text(`GSTIN: ${issuerEntity.gstNo}`, lm, 35);
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(255, 220, 80);
    doc.text("TAX INVOICE", rm, 22, { align: "right" });
    doc.setFontSize(9); doc.setTextColor(180, 200, 255);
    doc.text(invoice.tier === "SS_to_DB" ? "Super Stockist → Distributor" : "Distributor → Retailer", rm, 30, { align: "right" });

    let y = 50;
    doc.setFillColor(245, 247, 255); doc.roundedRect(lm, y, pw - 28, 26, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(30, 40, 80);
    doc.text("Invoice No:", lm + 3, y + 8); doc.text("Date:", lm + 3, y + 15); doc.text("Due Date:", lm + 3, y + 22);
    doc.setFont("helvetica", "normal"); doc.setTextColor(50, 60, 100);
    doc.text(invoice.id, lm + 28, y + 8);
    doc.text(invoice.createdAt, lm + 28, y + 15);
    doc.text(invoice.dueDate || "—", lm + 28, y + 22);
    const sc = invoice.status === "Paid" ? [16, 185, 129] : invoice.status === "Partial" ? [245, 158, 11] : [239, 68, 68];
    doc.setFillColor(...sc); doc.roundedRect(rm - 30, y + 6, 30, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    doc.text(invoice.status.toUpperCase(), rm - 15, y + 13, { align: "center" });

    y = 84; const colW = (pw - 28) / 2 - 4;
    doc.setFillColor(230, 235, 255); doc.rect(lm, y, colW, 5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(40, 60, 140);
    doc.text("BILLED BY", lm + 2, y + 3.5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(15, 23, 42);
    doc.text(issuerEntity?.name || invoice.issuerName, lm + 2, y + 11);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(80, 90, 120);
    let iy = y + 17;
    if (issuerEntity?.district || issuerEntity?.state) { doc.text([issuerEntity.district, issuerEntity.state].filter(Boolean).join(", "), lm + 2, iy); iy += 5; }
    if (issuerEntity?.contactPhone) { doc.text(`Phone: ${issuerEntity.contactPhone}`, lm + 2, iy); iy += 5; }
    if (issuerEntity?.email) { doc.text(`Email: ${issuerEntity.email}`, lm + 2, iy); iy += 5; }
    if (issuerEntity?.gstNo) { doc.text(`GSTIN: ${issuerEntity.gstNo}`, lm + 2, iy); iy += 5; }
    doc.text(`Entity ID: ${invoice.issuerId}`, lm + 2, iy);

    const rx = lm + colW + 8;
    doc.setFillColor(230, 255, 240); doc.rect(rx, y, colW, 5, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(20, 120, 60);
    doc.text("BILLED TO", rx + 2, y + 3.5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(15, 23, 42);
    doc.text(recipientEntity?.name || invoice.recipientName, rx + 2, y + 11);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(80, 90, 120);
    let ry = y + 17;
    if (recipientEntity?.district || recipientEntity?.state) { doc.text([recipientEntity.district, recipientEntity.state].filter(Boolean).join(", "), rx + 2, ry); ry += 5; }
    if (recipientEntity?.shopName) { doc.text(`Shop: ${recipientEntity.shopName}`, rx + 2, ry); ry += 5; }
    if (recipientEntity?.contactPhone || recipientEntity?.phone) { doc.text(`Phone: ${recipientEntity.contactPhone || recipientEntity.phone}`, rx + 2, ry); ry += 5; }
    if (recipientEntity?.gstNo) { doc.text(`GSTIN: ${recipientEntity.gstNo}`, rx + 2, ry); ry += 5; }
    doc.text(`ID: ${invoice.recipientId}`, rx + 2, ry);

    const tsy = Math.max(iy, ry) + 12;
    autoTable(doc, {
      head: [["#", "Item Description", "Qty", "Unit Price (₹)", "Total (₹)"]],
      body: (invoice.lineItems || []).map((item, i) => [
        i + 1, item.description, item.quantity,
        Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        Number(item.total).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      ]),
      startY: tsy, theme: "grid",
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [22, 40, 100], textColor: [255, 255, 255], fontStyle: "bold", halign: "left" },
      columnStyles: { 0: { cellWidth: 10, halign: "center" }, 2: { cellWidth: 18, halign: "center" }, 3: { cellWidth: 35, halign: "right" }, 4: { cellWidth: 38, halign: "right" } },
      alternateRowStyles: { fillColor: [245, 247, 255] },
    });

    const fy = doc.lastAutoTable.finalY + 6, tx = rm - 90;
    doc.setDrawColor(200, 210, 230); doc.setLineWidth(0.3); doc.line(tx, fy, rm, fy);

    const cgst = Number(invoice.tax) / 2;
    const sgst = Number(invoice.tax) / 2;
    const fmt = (n) => `\u20b9${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

    // Subtotal row
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text("Subtotal (Taxable Value)", tx + 2, fy + 7);
    doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(fmt(invoice.subTotal), rm, fy + 7, { align: "right" });

    // CGST row — blue tint background
    doc.setFillColor(235, 245, 255);
    doc.roundedRect(tx, fy + 10, rm - tx, 8, 1, 1, "F");
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(37, 99, 235);
    doc.text("CGST (Central GST @ 50%)", tx + 4, fy + 15.5);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(cgst), rm - 2, fy + 15.5, { align: "right" });

    // SGST row — orange tint background
    doc.setFillColor(255, 247, 235);
    doc.roundedRect(tx, fy + 19, rm - tx, 8, 1, 1, "F");
    doc.setFont("helvetica", "normal"); doc.setTextColor(234, 88, 12);
    doc.text("SGST (State GST @ 50%)", tx + 4, fy + 24.5);
    doc.setFont("helvetica", "bold");
    doc.text(fmt(sgst), rm - 2, fy + 24.5, { align: "right" });

    // Total GST summary
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
    doc.text("Total GST", tx + 2, fy + 34);
    doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text(fmt(invoice.tax), rm, fy + 34, { align: "right" });

    // Separator line before Grand Total
    doc.setDrawColor(200, 210, 230); doc.setLineWidth(0.3); doc.line(tx, fy + 37, rm, fy + 37);

    const gty = fy + 43;
    doc.setFillColor(22, 40, 100); doc.rect(tx, gty - 4, rm - tx, 11, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(255, 255, 255);
    doc.text("GRAND TOTAL", tx + 2, gty + 3.5);
    doc.text(`₹${Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, rm - 2, gty + 3.5, { align: "right" });

    const outstanding = invoice.total - (invoice.amountPaid || 0);
    if (outstanding > 0) {
      doc.setFillColor(255, 235, 235); doc.rect(tx, gty + 10, rm - tx, 9, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(200, 40, 40);
      doc.text("OUTSTANDING", tx + 2, gty + 16);
      doc.text(`₹${outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, rm - 2, gty + 16, { align: "right" });
    }

    if (invoice.notes) {
      const ny = gty + (outstanding > 0 ? 26 : 14);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(80, 90, 120);
      doc.text("Notes:", lm, ny);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100, 110, 130);
      doc.text(invoice.notes, lm, ny + 5, { maxWidth: pw - 28 });
    }

    doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.setTextColor(160, 170, 190);
    doc.text("This is a computer-generated invoice and does not require a physical signature.", pw / 2, ph - 10, { align: "center" });
    doc.line(lm, ph - 14, rm, ph - 14);
    doc.save(`invoice_${invoice.id}.pdf`);
    toast.success(`PDF downloaded for ${invoice.id}`);
  } catch (e) {
    console.error(e);
    toast.error("Failed to generate PDF document");
  }
};

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  if (status === "Paid") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <CheckCircle className="h-3 w-3" /> Paid
    </span>
  );
  if (status === "Partial") return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <Clock className="h-3 w-3" /> Partial
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400">
      <ShieldAlert className="h-3 w-3" /> Unpaid
    </span>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const BillingSystem = () => {
  const {
    invoices, receiptCaptures, creditNotes, syncQueueItems, isOnline,
    addInvoice, deleteInvoice, recordPayment, verifyReceipt, rejectReceipt, deleteReceipt,
    bulkDeleteInvoices, bulkMarkPaid, sendReminder, addCreditNote, deleteCreditNote,
  } = useBilling();

  const { distributors, superStockists } = useSupplyChainContext();
  const { customers } = useCustomerContext();
  const { orders: allOrders } = useOrderContext();
  const { currentUser } = useAuth();
  const { products } = useProductContext();

  // ── Entity resolution ──────────────────────────────────────────────────────
  const mySSEntity = useMemo(() =>
    superStockists.find(ss => ss.userId === currentUser?.id) || superStockists[0] || null,
    [superStockists, currentUser]);

  const myDBEntity = useMemo(() =>
    distributors.find(db => db.userId === currentUser?.id) || null,
    [distributors, currentUser]);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // ── Role & Tab State ───────────────────────────────────────────────────────
  const [activeRole, setActiveRole] = useState(() => {
    if (currentUser?.role === "SALES") return "db";
    return "ss";
  });
  const [dbSubTab, setDbSubTab] = useState("receivables");

  // Selected Entity state variables
  const [selectedSSId, setSelectedSSId] = useState("");
  const [selectedDBId, setSelectedDBId] = useState("");
  const [selectedRetailerId, setSelectedRetailerId] = useState("");

  // Initialize selected entity defaults
  useEffect(() => {
    if (superStockists.length > 0 && !selectedSSId) {
      setSelectedSSId(mySSEntity?.id || superStockists[0].id);
    }
  }, [superStockists, mySSEntity, selectedSSId]);

  useEffect(() => {
    if (distributors.length > 0 && !selectedDBId) {
      setSelectedDBId(myDBEntity?.id || distributors[0].id);
    }
  }, [distributors, myDBEntity, selectedDBId]);

  // ── Modal State ────────────────────────────────────────────────────────────
  const [showScanner, setShowScanner] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // ── Payment Form State ──────────────────────────────────────────────────────
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentReference, setPaymentReference] = useState("");

  // ── Credit Note State ───────────────────────────────────────────────────────
  const [cnAmount, setCnAmount] = useState("");
  const [cnReason, setCnReason] = useState("");

  // ── Invoice Form State ──────────────────────────────────────────────────────
  const [invoiceSource, setInvoiceSource] = useState("manual"); // "manual" | "from_order"
  const [recipientType, setRecipientType] = useState("customer");
  const [selectedRecipientId, setSelectedRecipientId] = useState("");
  const [orderFilterCustomerId, setOrderFilterCustomerId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [dueDateInput, setDueDateInput] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceTerms, setInvoiceTerms] = useState("Payment due within 30 days. Late fees may apply.");
  const [formItems, setFormItems] = useState([{ id: "1", sku: "", description: "", quantity: 1, price: 0, gstRate: 18 }]);

  // ── Filter State ───────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ── Bulk Selection State ───────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState([]);

  // ── Offline Simulation ─────────────────────────────────────────────────────
  const [simulatedOffline, setSimulatedOffline] = useState(false);

  useEffect(() => {
    if (simulatedOffline) {
      Object.defineProperty(navigator, "onLine", { value: false, configurable: true });
      window.dispatchEvent(new Event("offline"));
    } else {
      Object.defineProperty(navigator, "onLine", { value: true, configurable: true });
      window.dispatchEvent(new Event("online"));
    }
  }, [simulatedOffline]);

  // ── Default recipient ──────────────────────────────────────────────────────
  useEffect(() => {
    if (activeRole === "ss" && distributors.length > 0) setSelectedRecipientId(distributors[0].id);
    else if (activeRole === "db") {
      if (recipientType === "customer" && customers.length > 0) setSelectedRecipientId(customers[0].id);
      else if (recipientType === "db" && distributors.length > 0) setSelectedRecipientId(distributors[0].id);
    }
  }, [activeRole, distributors, customers, recipientType]);

  // ── Route Deep Linking / Pre-populating Invoices from Orders ────────────────
  useEffect(() => {
    const action = searchParams.get("action") || location.state?.action;
    const customerId = searchParams.get("customerId") || location.state?.customerId;
    const orderId = searchParams.get("orderId") || location.state?.orderId;

    if (action === "create-invoice") {
      setActiveRole("db");
      setDbSubTab("receivables");
      setInvoiceSource("from_order");
      setShowInvoiceModal(true);
      if (customerId) {
        setOrderFilterCustomerId(customerId);
        setSelectedRecipientId(customerId);
        setRecipientType("customer");
        if (orderId) {
          const timer = setTimeout(() => {
            handleSelectOrder(orderId);
          }, 150);
          return () => clearTimeout(timer);
        }
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, location.state, allOrders]);

  // ── Filtered invoices ──────────────────────────────────────────────────────
  const getRoleFilteredInvoices = () => {
    let result = [...invoices];
    if (activeRole === "ss") {
      result = result.filter(inv => inv.issuerId === selectedSSId && inv.tier === "SS_to_DB");
    } else if (activeRole === "db") {
      if (dbSubTab === "receivables") {
        result = result.filter(inv => inv.issuerId === selectedDBId && inv.tier === "DB_to_Retailer");
      } else {
        result = result.filter(inv => inv.recipientId === selectedDBId && inv.tier === "SS_to_DB");
      }
    } else {
      result = result.filter(inv => inv.tier === "DB_to_Retailer");
      if (selectedRetailerId) {
        result = result.filter(inv => inv.recipientId === selectedRetailerId);
      }
    }
    if (statusFilter !== "All") result = result.filter(inv => inv.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv =>
        inv.id.toLowerCase().includes(q) ||
        (inv.issuerName || "").toLowerCase().includes(q) ||
        (inv.recipientName || "").toLowerCase().includes(q)
      );
    }
    if (dateFrom) result = result.filter(inv => inv.createdAt >= dateFrom);
    if (dateTo) result = result.filter(inv => inv.createdAt <= dateTo);
    return result;
  };

  const roleInvoices = getRoleFilteredInvoices();

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const rel = getRoleFilteredInvoices();
    let totalBilled = 0, totalCollected = 0, totalOutstanding = 0, overdueCount = 0;
    rel.forEach(inv => {
      totalBilled += inv.total;
      totalCollected += inv.amountPaid || 0;
      totalOutstanding += (inv.total - (inv.amountPaid || 0));
      if (isInvoiceOverdue(inv)) overdueCount++;
    });
    const efficiency = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;
    return { totalBilled, totalCollected, totalOutstanding, efficiency, overdueCount, totalInvoices: rel.length };
  }, [invoices, activeRole, dbSubTab, statusFilter, searchQuery, dateFrom, dateTo]);

  // ── Monthly Revenue Chart Data ──────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months = {};
    const all = getRoleFilteredInvoices();
    all.forEach(inv => {
      const m = (inv.createdAt || "").substring(0, 7);
      if (!m) return;
      if (!months[m]) months[m] = { month: m, billed: 0, collected: 0 };
      months[m].billed += inv.total;
      months[m].collected += inv.amountPaid || 0;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [invoices, activeRole, dbSubTab]);

  // ── Top Outstanding Customers ───────────────────────────────────────────────
  const topOutstanding = useMemo(() => {
    const map = {};
    roleInvoices.forEach(inv => {
      const key = inv.recipientName || inv.recipientId;
      const outstanding = inv.total - (inv.amountPaid || 0);
      if (outstanding > 0) {
        if (!map[key]) map[key] = { name: key, outstanding: 0, count: 0 };
        map[key].outstanding += outstanding;
        map[key].count++;
      }
    });
    return Object.values(map).sort((a, b) => b.outstanding - a.outstanding).slice(0, 5);
  }, [roleInvoices]);

  // ── Aging Buckets ───────────────────────────────────────────────────────────
  const agingBuckets = useMemo(() => {
    const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
    roleInvoices.filter(isInvoiceOverdue).forEach(inv => {
      const d = agingDays(inv);
      if (d <= 30) buckets["0-30"]++;
      else if (d <= 60) buckets["31-60"]++;
      else if (d <= 90) buckets["61-90"]++;
      else buckets["90+"]++;
    });
    return buckets;
  }, [roleInvoices]);

  // ── Order-based invoice helpers ─────────────────────────────────────────────
  // Orders that belong to the selected customer and are not yet fully invoiced
  const ordersForCustomer = useMemo(() => {
    if (!orderFilterCustomerId) return [];
    return allOrders.filter(o => o.customerId === orderFilterCustomerId);
  }, [allOrders, orderFilterCustomerId]);

  // Populate form items when an order is selected
  const handleSelectOrder = (orderId) => {
    setSelectedOrderId(orderId);
    if (!orderId) {
      setFormItems([{ id: "1", sku: "", description: "", quantity: 1, price: 0, gstRate: 18 }]);
      setDueDateInput("");
      setInvoiceNotes("");
      return;
    }
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const mappedItems = (order.items || []).map((item, idx) => {
      const matchedProd = products.find(p => p.name === item.name || p.sku === item.sku) || products[idx] || products[0] || null;
      return {
        id: String(idx + 1),
        sku: matchedProd ? matchedProd.sku : "LUB-10W30-1L",
        description: item.name || item.description || "Product",
        quantity: Number(item.qty || 1),
        price: Number(item.price || 0),
        gstRate: Number(item.gst || 18),
      };
    });
    setFormItems(mappedItems.length > 0 ? mappedItems : [{ id: "1", sku: "", description: "", quantity: 1, price: 0, gstRate: 18 }]);
    setDueDateInput(order.dueDate || "");
    setInvoiceNotes(`Auto-generated from Order #${order.id}`);
    // Set recipient to this order's customer
    setSelectedRecipientId(order.customerId);
  };

  // ── Form Handlers ──────────────────────────────────────────────────────────
  const handleAddFormItem = () =>
    setFormItems([...formItems, { id: String(Date.now()), sku: "", description: "", quantity: 1, price: 0, gstRate: 18 }]);

  const handleFormItemChange = (idx, field, value) => {
    const updated = [...formItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormItems(updated);
  };

  const handleRemoveFormItem = (idx) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== idx));
  };

  const formSubTotal = formItems.reduce((s, item) => s + Number(item.quantity) * Number(item.price), 0);
  const formTax = formItems.reduce((s, item) => {
    const lineTotal = Number(item.quantity) * Number(item.price);
    return s + lineTotal * ((Number(item.gstRate) || 18) / 100);
  }, 0);
  const formTotal = formSubTotal + formTax;

  const handleCreateInvoiceSubmit = async (e) => {
    e.preventDefault();
    const invalidItem = formItems.find(it => !it.description || Number(it.price) <= 0 || Number(it.quantity) <= 0);
    if (invalidItem) { toast.error("Please fill in all item details (description, qty, price)."); return; }

    let issuerId = "", issuerName = "", recipientId = "", recipientName = "", tier = "";
    if (activeRole === "ss") {
      const ssEntity = superStockists.find(s => s.id === selectedSSId) || mySSEntity || superStockists[0];
      issuerId = ssEntity?.id || "SS-001";
      issuerName = ssEntity?.name || currentUser?.name || "Super Stockist";
      const db = distributors.find(d => d.id === selectedRecipientId);
      recipientId = selectedRecipientId;
      recipientName = db?.name || "Distributor";
      tier = "SS_to_DB";
    } else {
      const dbEntity = distributors.find(d => d.id === selectedDBId) || myDBEntity || distributors[0];
      issuerId = dbEntity?.id || "DB-001";
      issuerName = dbEntity?.name || currentUser?.name || "Distributor";
      if (recipientType === "customer") {
        const cust = customers.find(c => c.id === selectedRecipientId);
        recipientId = cust?.id || selectedRecipientId;
        recipientName = cust?.name || "Retailer";
      } else {
        const db = distributors.find(d => d.id === selectedRecipientId);
        recipientId = db?.id || selectedRecipientId;
        recipientName = db?.name || "Distributor";
      }
      tier = "DB_to_Retailer";
    }

    const lineItems = formItems.map((item, idx) => {
      const baseTotal = Number(item.quantity) * Number(item.price);
      return {
        id: String(idx + 1),
        sku: item.sku || (item.description?.toLowerCase().includes("fluid") ? "BRK-FL-500" : "LUB-10W30-1L"),
        description: item.description,
        quantity: Number(item.quantity),
        price: Number(item.price),
        gstRate: Number(item.gstRate) || 18,
        total: baseTotal + baseTotal * ((Number(item.gstRate) || 18) / 100),
      };
    });

    const payload = {
      issuerId, issuerName, recipientId, recipientName, tier, lineItems,
      subTotal: formSubTotal, tax: formTax, total: formTotal,
      dueDate: dueDateInput || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "Unpaid", amountPaid: 0,
      notes: invoiceNotes, terms: invoiceTerms,
      ...(invoiceSource === "from_order" && selectedOrderId ? { sourceOrderId: selectedOrderId } : {}),
    };

    const newInv = await addInvoice(payload);
    if (newInv) {
      setShowInvoiceModal(false);
      setFormItems([{ id: "1", sku: "", description: "", quantity: 1, price: 0, gstRate: 18 }]);
      setDueDateInput(""); setInvoiceNotes("");
      setInvoiceTerms("Payment due within 30 days. Late fees may apply.");
      setInvoiceSource("manual");
      setSelectedOrderId("");
      setOrderFilterCustomerId("");
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) { toast.error("Please enter a valid amount."); return; }
    const outstanding = selectedInvoice.total - (selectedInvoice.amountPaid || 0);
    if (amount > outstanding) { toast.error(`Amount exceeds outstanding ₹${outstanding.toLocaleString()}`); return; }
    recordPayment(selectedInvoice.id, amount, paymentMethod, paymentReference);
    setShowPaymentModal(false);
    setPaymentAmount(""); setPaymentMethod("Cash"); setPaymentReference("");
    setSelectedInvoice(null);
  };

  const handleCreditNoteSubmit = (e) => {
    e.preventDefault();
    addCreditNote(selectedInvoice.id, cnAmount, cnReason);
    setShowCreditNoteModal(false);
    setCnAmount(""); setCnReason(""); setSelectedInvoice(null);
  };

  // ── Bulk Handlers ──────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === roleInvoices.length) setSelectedIds([]);
    else setSelectedIds(roleInvoices.map(inv => inv.id));
  };

  // ── Table Columns ──────────────────────────────────────────────────────────
  const tableColumns = [
    {
      label: "",
      key: "select",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => toggleSelect(row.id)}
          onClick={e => e.stopPropagation()}
          className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
        />
      )
    },
    { label: "Invoice ID", key: "id", render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-800 dark:text-slate-200">{row.id}</span>
        {row.sourceOrderId && <span className="text-[9px] text-indigo-400">Order: {row.sourceOrderId}</span>}
      </div>
    )},
    { label: "Date / Due", key: "createdAt", render: (row) => (
      <div className="flex flex-col text-xs gap-0.5">
        <span className="text-slate-600 dark:text-slate-400">{row.createdAt}</span>
        <span className={`${isInvoiceOverdue(row) ? "text-red-500 font-bold" : "text-slate-400"}`}>
          Due: {row.dueDate || "—"}
          {isInvoiceOverdue(row) && (
            <span className="ml-1.5 text-[9px] bg-red-500 text-white rounded px-1 py-0.5 font-bold">
              {agingDays(row)}d OVERDUE
            </span>
          )}
        </span>
      </div>
    )},
    { label: "Issuer → Recipient", key: "issuerName", render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-xs text-slate-700 dark:text-slate-300">{row.issuerName}</span>
        <span className="text-[10px] text-slate-400">→ {row.recipientName}</span>
      </div>
    )},
    { label: "Total / GST Breakdown", key: "total", render: (row) => {
      const outstanding = row.total - (row.amountPaid || 0);
      const cgst = (Number(row.tax) || 0) / 2;
      const sgst = (Number(row.tax) || 0) / 2;
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">₹{row.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          <span className="text-[9px] text-slate-500 dark:text-slate-400">
            Sub: ₹{(row.subTotal || 0).toLocaleString("en-IN")} | Tax: ₹{(row.tax || 0).toLocaleString("en-IN")}
          </span>
          <span className="text-[9px] text-indigo-500/80 font-medium">
            (CGST: ₹{cgst.toLocaleString("en-IN")} | SGST: ₹{sgst.toLocaleString("en-IN")})
          </span>
          {outstanding > 0 && <span className="text-[10px] font-bold text-red-500">₹{outstanding.toLocaleString("en-IN")} due</span>}
        </div>
      );
    }},
    { label: "Status", key: "status", render: (row) => (
      <div className="flex flex-col gap-1">
        <StatusBadge status={row.status} />
        {row.reminderCount > 0 && (
          <span className="text-[9px] text-amber-500 flex items-center gap-0.5">
            <Bell className="h-2.5 w-2.5" /> {row.reminderCount} reminder{row.reminderCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    )},
    { label: "Actions", key: "actions", render: (row) => (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        {/* Preview */}
        <button
          onClick={() => { setSelectedInvoice(row); setShowPreviewModal(true); }}
          className="p-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-colors"
          title="Preview Invoice"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        {/* Download PDF */}
        <button
          onClick={() => generatePDF(row, { superStockists, distributors, customers })}
          className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Download PDF"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
        {/* Record Payment */}
        {row.status !== "Paid" && (
          <button
            onClick={() => { setSelectedInvoice(row); setShowPaymentModal(true); }}
            className="px-2 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors"
            title="Record Payment"
          >
            Pay
          </button>
        )}
        {/* Send Reminder */}
        {row.status !== "Paid" && (
          <button
            onClick={() => sendReminder(row.id)}
            className="p-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors"
            title="Send Reminder"
          >
            <Bell className="h-3.5 w-3.5" />
          </button>
        )}
        {/* Credit Note */}
        <button
          onClick={() => { setSelectedInvoice(row); setShowCreditNoteModal(true); }}
          className="p-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 transition-colors"
          title="Issue Credit Note"
        >
          <Receipt className="h-3.5 w-3.5" />
        </button>
        {/* Delete */}
        <button
          onClick={() => {
            toast((t) => (
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-sm">Delete <strong>{row.id}</strong>?</span>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { toast.dismiss(t.id); deleteInvoice(row.id); }} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold">Delete</button>
                  <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200">Cancel</button>
                </div>
              </div>
            ), { duration: Infinity });
          }}
          className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    )}
  ];

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 min-h-0 flex flex-col z-0">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 bg-transparent font-sans transition-colors animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* ── Top HUD ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-[#1a1d27]/40 p-4 rounded-2xl border border-slate-200/20 dark:border-slate-800/40 backdrop-blur-md">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Role View:</span>
                <select
                  value={activeRole}
                  onChange={e => { setActiveRole(e.target.value); setSelectedIds([]); }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {superStockists.length > 0 && (
                    <option value="ss">Super Stockist</option>
                  )}
                  {distributors.length > 0 && (
                    <option value="db">Distributor</option>
                  )}
                  <option value="retailer">Retailer View</option>
                </select>

                {activeRole === "ss" && superStockists.length > 0 && (
                  <select
                    value={selectedSSId}
                    onChange={e => { setSelectedSSId(e.target.value); setSelectedIds([]); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer animate-in fade-in duration-200"
                  >
                    {superStockists.map(ss => (
                      <option key={ss.id} value={ss.id}>{ss.name} ({ss.id})</option>
                    ))}
                  </select>
                )}

                {activeRole === "db" && distributors.length > 0 && (
                  <select
                    value={selectedDBId}
                    onChange={e => { setSelectedDBId(e.target.value); setSelectedIds([]); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer animate-in fade-in duration-200"
                  >
                    {distributors.map(db => (
                      <option key={db.id} value={db.id}>{db.name} ({db.id})</option>
                    ))}
                  </select>
                )}

                {activeRole === "retailer" && customers.length > 0 && (
                  <select
                    value={selectedRetailerId}
                    onChange={e => { setSelectedRetailerId(e.target.value); setSelectedIds([]); }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200/40 dark:border-slate-800/60 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer animate-in fade-in duration-200"
                  >
                    <option value="">All Retailers</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2 border-l border-slate-200/30 dark:border-slate-800/40 pl-4">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  {isOnline ? <Wifi className="h-3.5 w-3.5 text-emerald-500" /> : <WifiOff className="h-3.5 w-3.5 text-amber-500 animate-pulse" />}
                  Network:
                </span>
                <button
                  onClick={() => setSimulatedOffline(!simulatedOffline)}
                  className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${simulatedOffline ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
                >
                  {simulatedOffline ? "SIMULATING OFFLINE" : "SIMULATE OFFLINE"}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {syncQueueItems.length > 0 && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-xl text-xs font-semibold">
                  <Database className="h-3.5 w-3.5 animate-bounce" />
                  {syncQueueItems.length} Queued Offline
                </div>
              )}
              <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-ping"}`} />
              <span className="text-xs font-semibold uppercase tracking-wider">{isOnline ? "ONLINE" : "OFFLINE"}</span>
            </div>
          </div>

          {/* ── Page Header ──────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                {activeRole === "ss" && "Super Stockist Ledger"}
                {activeRole === "db" && "Distributor Invoice Panel"}
                {activeRole === "retailer" && "Retailer Invoices & Capture"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {activeRole === "ss" && "Manage outbound invoicing and collection ledgers for Distributors."}
                {activeRole === "db" && "Track incoming inventory costs and retail receivables."}
                {activeRole === "retailer" && "Review distributor bills and upload purchase invoice PDFs."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(activeRole === "ss" || (activeRole === "db" && dbSubTab === "receivables")) && (
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-transform"
                >
                  <Plus className="h-4 w-4" />
                  {activeRole === "ss" ? "Create SS Invoice" : "Generate Retail Invoice"}
                </button>
              )}
              <button
                onClick={() => exportToCSV(roleInvoices, `invoices_${activeRole}_${new Date().toISOString().split("T")[0]}.csv`)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 transition-colors"
              >
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-700 hover:to-indigo-700 text-white shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform"
              >
                <FileText className="h-4 w-4" /> Upload PDF
              </button>
            </div>
          </div>

          {/* ── DB Sub-tabs ───────────────────────────────────────────────────── */}
          {activeRole === "db" && (
            <div className="flex gap-2 border-b border-slate-200/20 dark:border-slate-800/40">
              {["receivables", "payables"].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setDbSubTab(tab); setSelectedIds([]); }}
                  className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all capitalize ${dbSubTab === tab ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
                >
                  {tab === "receivables" ? "Receivables Ledger (Outbound)" : "Payables Ledger (Inbound SS Invoice)"}
                </button>
              ))}
            </div>
          )}

          {/* ── Stats Cards ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Billed", value: `₹${stats.totalBilled.toLocaleString()}`, sub: `${stats.totalInvoices} invoices`, icon: <FileText className="h-6 w-6" />, color: "blue" },
              { label: "Collected", value: `₹${stats.totalCollected.toLocaleString()}`, sub: `${stats.efficiency}% collection rate`, icon: <ArrowDownRight className="h-6 w-6" />, color: "emerald" },
              { label: "Outstanding", value: `₹${stats.totalOutstanding.toLocaleString()}`, sub: "Pending collections", icon: <ArrowUpRight className="h-6 w-6" />, color: "red" },
              { label: "Overdue Invoices", value: stats.overdueCount, sub: `0-30d: ${agingBuckets["0-30"]} | 31-60d: ${agingBuckets["31-60"]} | 60+d: ${agingBuckets["61-90"] + agingBuckets["90+"]}`, icon: <AlertTriangle className="h-6 w-6" />, color: "amber" },
            ].map(({ label, value, sub, icon, color }) => (
              <div key={label} className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-slate-200/10 dark:border-slate-800/50 shadow-sm flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-slate-400">{label}</span>
                  <h3 className={`text-xl font-bold mt-1 text-${color}-500`}>{value}</h3>
                  <span className="text-[10px] text-slate-500 truncate block">{sub}</span>
                </div>
                <div className={`p-3 bg-${color}-500/10 text-${color}-500 rounded-xl shrink-0`}>{icon}</div>
              </div>
            ))}
          </div>

          {/* ── Main Content Grid ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* ── Ledger Table ─────────────────────────────────────────────────── */}
            <div className="xl:col-span-2 flex flex-col gap-4 bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-slate-200/10 dark:border-slate-800/50 shadow-sm">
              
              {/* Toolbar */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" /> Transaction Ledger
                    <span className="text-xs font-normal text-slate-400">({roleInvoices.length} records)</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search invoice, party..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="text-xs px-3 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
                    />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="text-xs px-2 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-1.5 rounded-lg border transition-colors ${showFilters ? "border-blue-500 bg-blue-500/10 text-blue-500" : "border-slate-200/40 dark:border-slate-800/60 text-slate-500 hover:text-blue-500"}`}
                      title="Date Filters"
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Date Range Filters */}
                {showFilters && (
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200/20 dark:border-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500 font-semibold">Date Range:</span>
                    </div>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none" />
                    <span className="text-xs text-slate-400">to</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none" />
                    {(dateFrom || dateTo) && (
                      <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1">
                        <X className="h-3 w-3" /> Clear
                      </button>
                    )}
                  </div>
                )}

                {/* Bulk Action Bar */}
                {selectedIds.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedIds.length} invoice{selectedIds.length > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { bulkMarkPaid(selectedIds); setSelectedIds([]); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        <CheckCircle className="h-3 w-3" /> Mark Paid
                      </button>
                      <button
                        onClick={() => exportToCSV(roleInvoices.filter(inv => selectedIds.includes(inv.id)), "selected_invoices.csv")}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FileDown className="h-3 w-3" /> Export
                      </button>
                      <button
                        onClick={() => {
                          toast((t) => (
                            <div className="flex flex-col gap-2">
                              <span className="font-semibold text-sm">Delete {selectedIds.length} invoice(s)?</span>
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => { toast.dismiss(t.id); bulkDeleteInvoices(selectedIds); setSelectedIds([]); }} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold">Delete All</button>
                                <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 px-3 py-1 rounded text-xs font-semibold">Cancel</button>
                              </div>
                            </div>
                          ), { duration: Infinity });
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                      <button onClick={() => setSelectedIds([])} className="p-1.5 rounded text-slate-400 hover:text-slate-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Select All Row */}
                {roleInvoices.length > 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === roleInvoices.length && roleInvoices.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-xs text-slate-500">Select all {roleInvoices.length}</span>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="min-h-[300px]">
                {roleInvoices.length > 0 ? (
                  <ResponsiveTable columns={tableColumns} data={roleInvoices} keyField="id" />
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <FileText className="h-8 w-8 text-slate-400" />
                    <span className="text-sm">No transaction records found matching filters</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Sidebar Panels ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Monthly Revenue Chart */}
              <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-slate-200/10 dark:border-slate-800/50 shadow-sm">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <BarChart2 className="h-4 w-4 text-indigo-500" /> Monthly Revenue (6m)
                </h3>
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={monthlyData} barGap={2}>
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} tickFormatter={v => v.substring(5)} />
                      <YAxis hide />
                      <Tooltip
                        formatter={(v, n) => [`₹${v.toLocaleString()}`, n === "billed" ? "Billed" : "Collected"]}
                        contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                      />
                      <Bar dataKey="billed" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={18} />
                      <Bar dataKey="collected" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={18} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400">No data yet</div>
                )}
                <div className="flex items-center gap-4 mt-2 justify-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded bg-indigo-500" /> Billed</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 rounded bg-emerald-500" /> Collected</div>
                </div>
              </div>

              {/* Top Outstanding */}
              <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-slate-200/10 dark:border-slate-800/50 shadow-sm">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4 text-red-500" /> Top Outstanding
                </h3>
                {topOutstanding.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {topOutstanding.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.count} invoice{item.count > 1 ? "s" : ""}</p>
                        </div>
                        <span className="text-xs font-bold text-red-500 shrink-0">₹{item.outstanding.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-xs text-slate-400">No outstanding balances</div>
                )}
              </div>

              {/* PDF Invoices Panel */}
              <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-slate-200/10 dark:border-slate-800/50 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-800/40 pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-500" /> PDF Invoices
                    </h3>
                    <p className="text-[11px] text-slate-500">Uploaded PDF invoice documents</p>
                  </div>
                </div>
                {receiptCaptures.length > 0 ? (
                  <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                    {receiptCaptures.map(rec => {
                      const calculatedSum = Number(rec.parsedData?.subTotal || 0) + Number(rec.parsedData?.tax || 0);
                      const hasDiscrepancy = Math.abs(calculatedSum - Number(rec.parsedData?.total || 0)) > 0.01;
                      return (
                        <div
                          key={rec.id}
                          className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col gap-2 ${rec.verificationStatus === "Verified" ? "bg-slate-50/50 dark:bg-slate-800/10 border-slate-200/30 dark:border-slate-800/40" : rec.verificationStatus === "Flagged" ? "bg-red-500/5 border-red-500/20" : "bg-indigo-500/5 border-indigo-500/20"}`}
                          onClick={() => setSelectedReceipt(rec)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{rec.id}</span>
                            <div className="flex items-center gap-1">
                              {hasDiscrepancy && rec.verificationStatus === "Pending Review" && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 flex items-center gap-0.5 animate-pulse">
                                  <ShieldAlert className="h-2.5 w-2.5" /> Anomaly
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.verificationStatus === "Verified" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : rec.verificationStatus === "Flagged" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"}`}>
                                {rec.verificationStatus}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>₹{(rec.parsedData?.total || 0).toLocaleString()} · {Math.round(rec.confidenceScore * 100)}% confidence</span>
                            {rec.verificationStatus === "Pending Review" && (
                              <button
                                onClick={e => { e.stopPropagation(); setShowScanner(true); }}
                                className="text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-0.5"
                              >
                                <Eye className="h-3 w-3" /> Verify
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-20 flex flex-col items-center justify-center text-slate-500 gap-1">
                    <FileText className="h-6 w-6 text-slate-400" />
                    <span className="text-xs">No PDFs uploaded yet.</span>
                  </div>
                )}
              </div>

              {/* Credit Notes Panel */}
              {creditNotes.length > 0 && (
                <div className="bg-white dark:bg-[#1a1d27] p-5 rounded-2xl border border-slate-200/10 dark:border-slate-800/50 shadow-sm">
                  <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <Receipt className="h-4 w-4 text-purple-500" /> Credit Notes
                  </h3>
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {creditNotes.map(cn => (
                      <div key={cn.id} className="flex items-center justify-between p-2.5 bg-purple-500/5 border border-purple-500/20 rounded-lg text-xs">
                        <div>
                          <p className="font-bold text-purple-600 dark:text-purple-400">{cn.id}</p>
                          <p className="text-slate-500 text-[10px]">Against {cn.invoiceId} · {cn.reason}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-600">₹{cn.amount.toLocaleString()}</span>
                          <button onClick={() => deleteCreditNote(cn.id)} className="text-red-400 hover:text-red-500 p-1">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Modals ──────────────────────────────────────────────────────────── */}

          {/* Scanner */}
          {showScanner && (
            <ReceiptScanner onClose={() => setShowScanner(false)} onSaveSuccess={() => toast.success("Sync capture complete!")} />
          )}

          {/* Invoice Preview Modal */}
          {showPreviewModal && selectedInvoice && (
            <InvoicePreview
              invoice={selectedInvoice}
              onClose={() => { setShowPreviewModal(false); setSelectedInvoice(null); }}
              onDownloadPDF={(inv) => generatePDF(inv, { superStockists, distributors, customers })}
              superStockists={superStockists}
              distributors={distributors}
              customers={customers}
            />
          )}

          {/* Create Invoice Modal */}
          {showInvoiceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/20 dark:border-slate-800/40 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-800/40 px-6 py-4">
                  <h3 className="text-lg font-bold">
                    {activeRole === "ss" ? "Create SS Outbound Invoice" : "Generate Retail Invoice"}
                  </h3>
                  <button onClick={() => setShowInvoiceModal(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleCreateInvoiceSubmit} className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 flex flex-col gap-4">
                  
                  {/* ── Source Toggle (DB role only) ─────────────────────── */}
                  {activeRole === "db" && (
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setInvoiceSource("manual"); setSelectedOrderId(""); setOrderFilterCustomerId(""); setFormItems([{ id: "1", description: "", quantity: 1, price: 0, gstRate: 18 }]); setInvoiceNotes(""); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${invoiceSource === "manual" ? "bg-white dark:bg-slate-900 shadow text-indigo-600 dark:text-indigo-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      >
                        <Plus className="h-3.5 w-3.5" /> Manual Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => { setInvoiceSource("from_order"); setSelectedOrderId(""); setFormItems([{ id: "1", description: "", quantity: 1, price: 0, gstRate: 18 }]); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${invoiceSource === "from_order" ? "bg-white dark:bg-slate-900 shadow text-emerald-600 dark:text-emerald-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" /> From Customer Order
                      </button>
                    </div>
                  )}

                  {/* ── FROM ORDER PICKER ─────────────────────────────────── */}
                  {activeRole === "db" && invoiceSource === "from_order" ? (
                    <div className="flex flex-col gap-3">
                      {/* Step 1: Customer selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-black">1</span>
                          Select Customer
                        </label>
                        <select
                          value={orderFilterCustomerId}
                          onChange={e => { setOrderFilterCustomerId(e.target.value); setSelectedRecipientId(e.target.value); setSelectedOrderId(""); setFormItems([{ id: "1", description: "", quantity: 1, price: 0, gstRate: 18 }]); }}
                          className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">— Choose a customer —</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name} {c.shopName ? `· ${c.shopName}` : ""}</option>
                          ))}
                        </select>
                      </div>

                      {/* Step 2: Order selector */}
                      {orderFilterCustomerId && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[9px] flex items-center justify-center font-black">2</span>
                            Select Order
                            <span className="text-[10px] text-slate-400 font-normal ml-1">({ordersForCustomer.length} order{ordersForCustomer.length !== 1 ? "s" : ""} found)</span>
                          </label>

                          {ordersForCustomer.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                              <ClipboardList className="h-5 w-5" /> No orders found for this customer
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-0.5">
                              {ordersForCustomer.map(order => {
                                const orderTotal = (order.items || []).reduce((s, item) => {
                                  const base = Number(item.qty || 1) * Number(item.price || 0);
                                  const afterDisc = base - base * ((Number(item.discount) || 0) / 100);
                                  return s + afterDisc + afterDisc * ((Number(item.gst) || 18) / 100);
                                }, 0);
                                const isSelected = selectedOrderId === order.id;
                                const statusClr = order.status === "Paid" ? "text-emerald-500" : order.status === "Partial" ? "text-amber-500" : "text-red-500";
                                return (
                                  <button
                                    type="button"
                                    key={order.id}
                                    onClick={() => handleSelectOrder(order.id)}
                                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${isSelected ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10" : "border-slate-200/50 dark:border-slate-800/50 hover:border-indigo-400 hover:bg-indigo-500/5"}`}
                                  >
                                    <div className="flex items-center justify-between mb-1.5">
                                      <div className="flex items-center gap-2">
                                        {isSelected
                                          ? <PackageCheck className="h-3.5 w-3.5 text-emerald-500" />
                                          : <ShoppingCart className="h-3.5 w-3.5 text-slate-400" />
                                        }
                                        <span className={`text-xs font-bold ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                                          Order #{order.id}
                                        </span>
                                        <span className={`text-[10px] font-semibold ${statusClr}`}>{order.status || "Pending"}</span>
                                      </div>
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹{orderTotal.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                                      <span>{order.date || "—"} · {(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}</span>
                                      {order.dueDate && <span>Due: {order.dueDate}</span>}
                                    </div>
                                    {/* Item pill tags */}
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {(order.items || []).slice(0, 3).map((item, i) => (
                                        <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                                          {item.name || item.description} ×{item.qty}
                                        </span>
                                      ))}
                                      {(order.items || []).length > 3 && (
                                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-400">+{order.items.length - 3} more</span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Step 3: Due date override */}
                      {selectedOrderId && (
                        <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Override Due Date</label>
                            <input type="date" value={dueDateInput} onChange={e => setDueDateInput(e.target.value)}
                              className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none" />
                          </div>
                          <div className="flex items-end">
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                              <PackageCheck className="h-4 w-4" />
                              {formItems.length} item{formItems.length !== 1 ? "s" : ""} auto-loaded from order
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* ── MANUAL RECIPIENT SECTION ──────────────────────────── */
                    <div className="grid grid-cols-2 gap-4">
                      {activeRole === "ss" ? (
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Select Recipient Distributor *</label>
                          <select value={selectedRecipientId} onChange={e => setSelectedRecipientId(e.target.value)}
                            className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none">
                            {distributors.length === 0 && <option value="">No distributors found</option>}
                            {distributors.map(db => <option key={db.id} value={db.id}>{db.name} ({db.id})</option>)}
                          </select>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Recipient Type</label>
                            <select value={recipientType} onChange={e => { setRecipientType(e.target.value); setSelectedRecipientId(e.target.value === "customer" ? (customers[0]?.id || "") : (distributors[0]?.id || "")); }}
                              className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none">
                              <option value="customer">Retailer / Customer</option>
                              <option value="db">Distributor (Inter-DB)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                              {recipientType === "customer" ? "Select Customer *" : "Select Distributor"}
                            </label>
                            <select value={selectedRecipientId} onChange={e => setSelectedRecipientId(e.target.value)}
                              className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none">
                              {recipientType === "customer"
                                ? customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.shopName || c.id}</option>)
                                : distributors.map(db => <option key={db.id} value={db.id}>{db.name} ({db.id})</option>)}
                            </select>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Due Date</label>
                        <input type="date" value={dueDateInput} onChange={e => setDueDateInput(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none" />
                      </div>
                    </div>
                  )}
                  {/* Line Items */}
                  <div className="flex flex-col gap-2 border-t border-slate-200/20 dark:border-slate-800/40 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Line Items</span>
                      <button type="button" onClick={handleAddFormItem}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors">
                        <Plus className="h-3 w-3" /> Add Item
                      </button>
                    </div>
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_56px_80px_56px_32px] gap-1 text-[10px] font-semibold text-slate-400 px-1">
                      <span>Description</span><span className="text-center">Qty</span>
                      <span className="text-right">Price (₹)</span><span className="text-center">GST%</span><span />
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                      {formItems.map((item, idx) => (
                        <div key={item.id} className="grid grid-cols-[1fr_56px_80px_56px_32px] gap-1 items-center">
                          <select
                            required
                            value={item.sku || ""}
                            onChange={e => {
                              const prod = products.find(p => p.sku === e.target.value);
                              if (prod) {
                                const updated = [...formItems];
                                updated[idx] = {
                                  ...updated[idx],
                                  sku: prod.sku,
                                  description: prod.name,
                                  price: activeRole === "ss" ? (prod.mrp / prod.ssDivisor).toFixed(2) : (prod.mrp / prod.dbDivisor).toFixed(2)
                                };
                                setFormItems(updated);
                              }
                            }}
                            className="text-xs px-2.5 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none w-full"
                          >
                            <option value="">-- Choose Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.sku}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                          <input type="number" required min="1" placeholder="Qty"
                            value={item.quantity} onChange={e => handleFormItemChange(idx, "quantity", e.target.value)}
                            className="text-center text-xs px-1.5 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none" />
                          <input type="number" required min="0.01" step="0.01" placeholder="Price"
                            value={item.price} onChange={e => handleFormItemChange(idx, "price", e.target.value)}
                            className="text-right text-xs px-2 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none" />
                          <select value={item.gstRate} onChange={e => handleFormItemChange(idx, "gstRate", e.target.value)}
                            className="text-[10px] px-1 py-1.5 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none">
                            {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                          </select>
                          <button type="button" onClick={() => handleRemoveFormItem(idx)} className="p-1 text-red-500 hover:bg-red-500/10 rounded">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Running Total — CGST / SGST breakdown */}
                    <div className="mt-2 border border-slate-200/30 dark:border-slate-800/50 rounded-xl overflow-hidden">
                      <div className="flex justify-between text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800/20">
                        <span className="text-slate-500">Subtotal (Taxable)</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">₹{formSubTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border-t border-blue-100 dark:border-blue-900/30">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                          CGST (50%)
                        </span>
                        <span className="font-bold text-blue-700 dark:text-blue-300">₹{(formTax / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20 border-t border-orange-100 dark:border-orange-900/30">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                          SGST (50%)
                        </span>
                        <span className="font-bold text-orange-700 dark:text-orange-300">₹{(formTax / 2).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-200/30 dark:border-slate-800/50">
                        <span className="text-slate-500">Total GST</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">₹{formTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm px-3 py-2 bg-[#162864] text-white font-bold border-t border-indigo-900">
                        <span>Grand Total</span>
                        <span>₹{formTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Terms */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200/20 dark:border-slate-800/40 pt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Notes to Recipient</label>
                      <textarea value={invoiceNotes} onChange={e => setInvoiceNotes(e.target.value)} rows={3}
                        placeholder="e.g. Thank you for your business!"
                        className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Terms & Conditions</label>
                      <textarea value={invoiceTerms} onChange={e => setInvoiceTerms(e.target.value)} rows={3}
                        placeholder="e.g. Payment due within 30 days..."
                        className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none resize-none" />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex items-center justify-end gap-3 border-t border-slate-200/20 dark:border-slate-800/40 pt-4">
                    <button type="button" onClick={() => setShowInvoiceModal(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/30 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      Cancel
                    </button>
                    <button type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                      Issue Invoice
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Record Payment Modal */}
          {showPaymentModal && selectedInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/20 dark:border-slate-800/40 shadow-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-800/40 pb-4 mb-4">
                  <h3 className="text-base font-bold">Record Payment</h3>
                  <button onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handlePaymentSubmit} className="flex flex-col gap-4">
                  <div className="text-xs bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-200/20 dark:border-slate-800/40 flex flex-col gap-1.5">
                    <div className="flex justify-between"><span className="text-slate-400">Invoice:</span><strong>{selectedInvoice.id}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">From:</span><span>{selectedInvoice.issuerName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Total:</span><strong>₹{selectedInvoice.total.toLocaleString()}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">Outstanding:</span><strong className="text-red-500">₹{(selectedInvoice.total - (selectedInvoice.amountPaid || 0)).toLocaleString()}</strong></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Amount to Pay (₹) *</label>
                      <input type="number" required min="1" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                        placeholder={`Max ₹${selectedInvoice.total - (selectedInvoice.amountPaid || 0)}`}
                        className="w-full text-sm font-bold px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Payment Method *</label>
                      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none">
                        {["Cash", "UPI", "Bank Transfer", "Cheque", "Credit Card", "NEFT", "RTGS", "IMPS"].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reference / UTR No.</label>
                      <input type="text" value={paymentReference} onChange={e => setPaymentReference(e.target.value)}
                        placeholder="e.g. UTR123456789"
                        className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-slate-200/20 dark:border-slate-800/40 pt-4">
                    <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedInvoice(null); }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/30 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20">
                      Submit Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Credit Note Modal */}
          {showCreditNoteModal && selectedInvoice && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/20 dark:border-slate-800/40 shadow-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-800/40 pb-4 mb-4">
                  <h3 className="text-base font-bold flex items-center gap-2"><Receipt className="h-4 w-4 text-purple-500" /> Issue Credit Note</h3>
                  <button onClick={() => { setShowCreditNoteModal(false); setSelectedInvoice(null); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleCreditNoteSubmit} className="flex flex-col gap-4">
                  <div className="text-xs bg-purple-500/5 border border-purple-500/20 p-3 rounded-lg">
                    <p>Invoice: <strong className="text-purple-600 dark:text-purple-400">{selectedInvoice.id}</strong> · Total: <strong>₹{selectedInvoice.total.toLocaleString()}</strong></p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Credit Amount (₹) *</label>
                    <input type="number" required min="1" value={cnAmount} onChange={e => setCnAmount(e.target.value)}
                      placeholder="Amount to credit"
                      className="w-full text-sm px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5">Reason / Note *</label>
                    <textarea required rows={3} value={cnReason} onChange={e => setCnReason(e.target.value)}
                      placeholder="e.g. Returned goods, Price adjustment..."
                      className="w-full text-xs px-3 py-2 border border-slate-200/40 dark:border-slate-800/60 rounded-lg bg-white dark:bg-slate-900 focus:outline-none resize-none" />
                  </div>
                  <div className="flex justify-end gap-3 border-t border-slate-200/20 dark:border-slate-800/40 pt-4">
                    <button type="button" onClick={() => { setShowCreditNoteModal(false); setSelectedInvoice(null); }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/30 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                    <button type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg">
                      Issue Credit Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Receipt Detail Modal */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/20 dark:border-slate-800/40 shadow-2xl p-6">
                <div className="flex items-center justify-between border-b border-slate-200/20 dark:border-slate-800/40 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold">PDF Scan Analysis — {selectedReceipt.id}</h3>
                    <p className="text-[10px] text-slate-400">Uploaded: {new Date(selectedReceipt.uploadedAt).toLocaleString()}</p>
                  </div>
                  <button onClick={() => setSelectedReceipt(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-200/20 dark:border-slate-800/40">
                      <span className="text-slate-400">OCR Parsed Data:</span>
                      <div className="mt-2 flex flex-col gap-1 font-medium">
                        <p>Vendor: <strong className="text-slate-800 dark:text-slate-200">{selectedReceipt.parsedData?.vendorName || "Unknown"}</strong></p>
                        <p>Date: <strong>{selectedReceipt.parsedData?.invoiceDate || "N/A"}</strong></p>
                        <p>Subtotal: <strong>₹{(selectedReceipt.parsedData?.subTotal || 0).toLocaleString()}</strong></p>
                        <p>GST (18%): <strong>₹{(selectedReceipt.parsedData?.tax || 0).toLocaleString()}</strong></p>
                        <p className="text-sm font-bold text-blue-500">Total: ₹{(selectedReceipt.parsedData?.total || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-slate-200/20 dark:border-slate-800/40 flex flex-col justify-between">
                      <div>
                        <span className="text-slate-400">Confidence:</span>
                        <h4 className="text-xl font-bold mt-1 text-indigo-500">{Math.round(selectedReceipt.confidenceScore * 100)}%</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Pixel text clarity index</p>
                      </div>
                      <div className="flex items-center gap-1.5 border-t border-slate-200/20 dark:border-slate-800/40 pt-2">
                        <span className="text-[10px] text-slate-400">Status:</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedReceipt.verificationStatus === "Verified" ? "bg-emerald-500/10 text-emerald-500" : selectedReceipt.verificationStatus === "Flagged" ? "bg-red-500/10 text-red-500" : "bg-indigo-500/10 text-indigo-500"}`}>
                          {selectedReceipt.verificationStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1 uppercase tracking-wider">Raw Extracted Text</span>
                    <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto">
                      {selectedReceipt.extractedText}
                    </pre>
                  </div>
                  <div className="flex items-center justify-end gap-3 border-t border-slate-200/20 dark:border-slate-800/40 pt-4">
                    <button onClick={() => { deleteReceipt(selectedReceipt.id); setSelectedReceipt(null); }}
                      className="mr-auto text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                    {selectedReceipt.verificationStatus === "Pending Review" && (
                      <>
                        <button onClick={() => { rejectReceipt(selectedReceipt.id); setSelectedReceipt(null); }}
                          className="px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                          Flag / Reject
                        </button>
                        <button onClick={() => { verifyReceipt(selectedReceipt.id, selectedReceipt.parsedData); setSelectedReceipt(null); }}
                          className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
                          Approve / Verify
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BillingSystem;
