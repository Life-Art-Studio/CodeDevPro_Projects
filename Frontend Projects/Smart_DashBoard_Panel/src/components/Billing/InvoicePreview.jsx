import React from "react";
import { X, Download, Printer, Building2, User, Calendar, CreditCard, FileText, CheckCircle, Clock, ShieldAlert, AlertTriangle } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

const InvoicePreview = ({ invoice, onClose, onDownloadPDF, superStockists = [], distributors = [], customers = [] }) => {
  if (!invoice) return null;

  // Resolve entities
  let issuerEntity = null;
  if (invoice.issuerId?.startsWith("SS-")) {
    issuerEntity = superStockists.find(s => s.id === invoice.issuerId);
  } else if (invoice.issuerId?.startsWith("DB-")) {
    issuerEntity = distributors.find(d => d.id === invoice.issuerId);
  }
  if (!issuerEntity) {
    issuerEntity = distributors.find(d => d.userId === invoice.issuerId) || distributors[0] || null;
  }

  let recipientEntity = null;
  if (invoice.recipientId?.startsWith("DB-")) {
    recipientEntity = distributors.find(d => d.id === invoice.recipientId);
  } else if (invoice.recipientId?.startsWith("SS-")) {
    recipientEntity = superStockists.find(s => s.id === invoice.recipientId);
  } else {
    recipientEntity = customers.find(c => c.id === invoice.recipientId);
  }

  const outstanding = invoice.total - (invoice.amountPaid || 0);
  const isOverdue = invoice.status !== "Paid" && invoice.dueDate && new Date(invoice.dueDate) < new Date();

  const statusConfig = {
    Paid:    { cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: <CheckCircle className="h-3.5 w-3.5" />, label: "PAID" },
    Partial: { cls: "bg-amber-500/15 text-amber-600 border-amber-500/30",   icon: <Clock className="h-3.5 w-3.5" />,       label: "PARTIAL" },
    Unpaid:  { cls: "bg-red-500/15 text-red-600 border-red-500/30",          icon: <ShieldAlert className="h-3.5 w-3.5" />, label: "UNPAID" },
  };
  const statusCfg = statusConfig[invoice.status] || statusConfig.Unpaid;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[95vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-slate-200/20 dark:border-slate-700/40 bg-white dark:bg-slate-900"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-[#162864] to-indigo-800 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-yellow-300" />
            <span className="font-bold text-base tracking-wide">Invoice Preview</span>
            <span className="text-xs text-indigo-200 ml-1">#{invoice.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { window.print(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button
              onClick={() => onDownloadPDF(invoice)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-yellow-400 hover:bg-yellow-300 text-slate-900 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors ml-1"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* ── Invoice Body (scrollable) ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950 p-6 print:p-0">
          {/* The actual invoice paper */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200/30 dark:border-slate-800/50 overflow-hidden print:shadow-none print:border-0">

            {/* Invoice Header Band */}
            <div className="bg-[#162864] px-8 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-extrabold text-white tracking-tight">
                    {issuerEntity?.name || invoice.issuerName || "Company Name"}
                  </h1>
                  <div className="text-indigo-200 text-xs mt-1.5 space-y-0.5">
                    {(issuerEntity?.district || issuerEntity?.state) && (
                      <p>{[issuerEntity.district, issuerEntity.state].filter(Boolean).join(", ")}</p>
                    )}
                    {issuerEntity?.contactPhone && <p>Ph: {issuerEntity.contactPhone}</p>}
                    {issuerEntity?.email && <p>{issuerEntity.email}</p>}
                    {issuerEntity?.gstNo && <p>GSTIN: {issuerEntity.gstNo}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-300 font-extrabold text-2xl tracking-widest">TAX INVOICE</p>
                  <p className="text-indigo-200 text-xs mt-1">
                    {invoice.tier === "SS_to_DB" ? "Super Stockist → Distributor" : "Distributor → Retailer"}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Strip */}
            <div className="bg-indigo-50 dark:bg-slate-800/40 px-8 py-3 flex flex-wrap gap-x-8 gap-y-1 text-xs border-b border-indigo-100 dark:border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-500">
                <FileText className="h-3.5 w-3.5" />
                <span className="font-semibold">Invoice No:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{invoice.id}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-semibold">Issued:</span>
                <span className="text-slate-700 dark:text-slate-300">{invoice.createdAt}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-semibold">Due:</span>
                <span className={`font-semibold ${isOverdue ? "text-red-500" : "text-slate-700 dark:text-slate-300"}`}>
                  {invoice.dueDate || "—"}
                  {isOverdue && <span className="ml-1.5 text-[9px] bg-red-500 text-white rounded px-1 py-0.5">OVERDUE</span>}
                </span>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.cls}`}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </div>
            </div>

            {/* Billed By / To */}
            <div className="grid grid-cols-2 gap-0 border-b border-slate-100 dark:border-slate-800/50">
              {/* Billed By */}
              <div className="px-8 py-5 border-r border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 mb-3">
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Billed By</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {issuerEntity?.name || invoice.issuerName}
                </p>
                <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                  {(issuerEntity?.district || issuerEntity?.state) && (
                    <p>{[issuerEntity.district, issuerEntity.state].filter(Boolean).join(", ")}</p>
                  )}
                  {issuerEntity?.contactPhone && <p>Phone: {issuerEntity.contactPhone}</p>}
                  {issuerEntity?.email && <p>Email: {issuerEntity.email}</p>}
                  {issuerEntity?.gstNo && <p className="font-mono text-xs">GSTIN: {issuerEntity.gstNo}</p>}
                  <p className="text-slate-400">ID: {invoice.issuerId}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="px-8 py-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <User className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Billed To</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {recipientEntity?.name || invoice.recipientName}
                </p>
                <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                  {(recipientEntity?.district || recipientEntity?.state) && (
                    <p>{[recipientEntity.district, recipientEntity.state].filter(Boolean).join(", ")}</p>
                  )}
                  {recipientEntity?.shopName && <p>Shop: {recipientEntity.shopName}</p>}
                  {(recipientEntity?.contactPhone || recipientEntity?.phone) && (
                    <p>Phone: {recipientEntity.contactPhone || recipientEntity.phone}</p>
                  )}
                  {recipientEntity?.email && <p>Email: {recipientEntity.email}</p>}
                  {recipientEntity?.gstNo && <p className="font-mono text-xs">GSTIN: {recipientEntity.gstNo}</p>}
                  <p className="text-slate-400">ID: {invoice.recipientId}</p>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="px-8 py-5">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#162864] text-white">
                    <th className="text-left px-3 py-2.5 rounded-tl-lg w-8">#</th>
                    <th className="text-left px-3 py-2.5">Description</th>
                    <th className="text-center px-3 py-2.5 w-12">Qty</th>
                    <th className="text-right px-3 py-2.5 w-24">Unit Price</th>
                    <th className="text-center px-3 py-2.5 w-16">Disc %</th>
                    <th className="text-center px-3 py-2.5 w-16">GST %</th>
                    <th className="text-right px-3 py-2.5 rounded-tr-lg w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.lineItems || []).map((item, i) => (
                    <tr
                      key={i}
                      className={`border-b border-slate-100 dark:border-slate-800/40 ${i % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-800/10" : ""}`}
                    >
                      <td className="px-3 py-2.5 text-center text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-300">{item.description}</td>
                      <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-400">
                        ₹{Number(item.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-400">
                        {item.discount ? `${item.discount}%` : "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-600 dark:text-slate-400">
                        {item.gstRate ? `${item.gstRate}%` : "18%"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                        ₹{Number(item.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-4 flex justify-end">
                <div className="w-72 space-y-1">
                  {/* Subtotal */}
                  <div className="flex justify-between text-xs text-slate-500 py-0.5">
                    <span>Subtotal (Taxable Value)</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      ₹{Number(invoice.subTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* CGST + SGST breakdown */}
                  <div className="border border-slate-100 dark:border-slate-800/50 rounded-lg overflow-hidden">
                    <div className="flex justify-between text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                        CGST (Central GST — 50%)
                      </span>
                      <span className="font-bold text-blue-700 dark:text-blue-300">
                        ₹{(Number(invoice.tax) / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs px-3 py-1.5 bg-orange-50 dark:bg-orange-950/20">
                      <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                        SGST (State GST — 50%)
                      </span>
                      <span className="font-bold text-orange-700 dark:text-orange-300">
                        ₹{(Number(invoice.tax) / 2).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Total GST */}
                  <div className="flex justify-between text-xs text-slate-500 py-0.5 px-1">
                    <span className="font-semibold">Total GST</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      ₹{Number(invoice.tax).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Global Discount */}
                  {Number(invoice.globalDiscount) > 0 && (
                    <div className="flex justify-between text-xs bg-amber-500/5 border border-amber-200/40 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-lg">
                      <span className="font-semibold">Global Discount ({invoice.globalDiscount}%)</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        -₹{Number(invoice.globalDiscountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  {/* Grand Total */}
                  <div className="flex justify-between text-sm font-bold bg-[#162864] text-white px-3 py-2 rounded-lg mt-1">
                    <span>Grand Total</span>
                    <span>₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>

                  {invoice.amountPaid > 0 && (
                    <div className="flex justify-between text-xs px-1">
                      <span className="text-emerald-600">Amount Paid</span>
                      <span className="font-semibold text-emerald-600">
                        ₹{Number(invoice.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {outstanding > 0 && (
                    <div className="flex justify-between text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg font-bold">
                      <span>Outstanding Balance</span>
                      <span>₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment History */}
            {invoice.paymentHistory?.length > 0 && (
              <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payment History</span>
                </div>
                <div className="space-y-1.5">
                  {invoice.paymentHistory.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">{p.method}</span>
                        {p.reference && <span className="text-emerald-600/70">• Ref: {p.reference}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <span className="text-slate-400">{new Date(p.date).toLocaleDateString()}</span>
                        <span className="font-bold text-emerald-600">₹{Number(p.amount).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800/50 grid grid-cols-2 gap-4">
                {invoice.notes && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Notes</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Terms & Conditions</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{invoice.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/20">
              <p className="text-[10px] text-slate-400 text-center italic">
                This is a computer-generated invoice and does not require a physical signature. · Generated by Smart Dashboard Panel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
