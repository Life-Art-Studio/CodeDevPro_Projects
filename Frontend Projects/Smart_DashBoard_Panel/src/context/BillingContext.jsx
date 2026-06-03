import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";
import SyncQueue from "../utils/SyncQueue";
import toast from "react-hot-toast";
import { useSupplyChainContext } from "./SupplyChainContext";

const BillingContext = createContext(null);

export const BillingProvider = ({ children }) => {
  const [invoices, setInvoices] = useState([]);
  const [receiptCaptures, setReceiptCaptures] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueueItems, setSyncQueueItems] = useState([]);

  const { restockProduct } = useSupplyChainContext();

  const adjustInventoryForInvoice = (invoice, multiplier = 1) => {
    try {
      if (!restockProduct) return;
      (invoice.lineItems || []).forEach(item => {
        const sku = item.sku || (item.description?.toLowerCase().includes("fluid") ? "BRK-FL-500" : "LUB-10W30-1L");
        const qty = Number(item.quantity || 0) * multiplier;
        if (qty === 0) return;

        if (invoice.tier === "SS_to_DB") {
          restockProduct(invoice.issuerId, sku, -qty);
          restockProduct(invoice.recipientId, sku, qty);
        } else if (invoice.tier === "DB_to_Retailer") {
          restockProduct(invoice.issuerId, sku, -qty);
        }
      });
    } catch (err) {
      console.error("Failed to sync supply chain inventory:", err);
    }
  };

  // ─── Load from Storage ──────────────────────────────────────────────────────
  useEffect(() => {
    const storedInvoices = StorageService.getInvoices() || [];
    const storedReceipts = StorageService.getReceiptCaptures();
    const storedCreditNotes = JSON.parse(localStorage.getItem("creditNotes") || "[]");

    setInvoices(storedInvoices);
    setReceiptCaptures(storedReceipts || []);
    setCreditNotes(storedCreditNotes);

    setSyncQueueItems(SyncQueue.getQueue());

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    const handleInvoiceUpdate = () => {
      const refreshed = StorageService.getInvoices() || [];
      setInvoices(refreshed);
    };
    window.addEventListener("billing:invoices:updated", handleInvoiceUpdate);

    const handleStorageChange = (e) => {
      if (e.key === "invoices") {
        handleInvoiceUpdate();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleInvoiceUpdate);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleInvoiceUpdate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      window.removeEventListener("billing:invoices:updated", handleInvoiceUpdate);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleInvoiceUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ─── Sync Queue ──────────────────────────────────────────────────────────────
  const processSingleQueueItem = async (queuedItem) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const storedReceipts = StorageService.getReceiptCaptures() || [];
      const newReceipt = {
        id: queuedItem.id,
        invoiceId: queuedItem.invoiceId || null,
        uploaderId: queuedItem.uploaderId,
        rawImageBase64: queuedItem.rawImageBase64,
        extractedText: queuedItem.extractedText,
        parsedData: queuedItem.parsedData,
        confidenceScore: queuedItem.confidenceScore || 0.90,
        verificationStatus: queuedItem.verificationStatus || "Pending Review",
        uploadedAt: queuedItem.uploadedAt || new Date().toISOString()
      };
      const updated = [newReceipt, ...storedReceipts];
      setReceiptCaptures(updated);
      StorageService.saveReceiptCaptures(updated);
      return true;
    } catch (e) {
      console.error("Error processing sync item:", e);
      return false;
    }
  };

  useEffect(() => {
    if (isOnline) {
      const handleProgress = (itemId, status) => {
        setSyncQueueItems(SyncQueue.getQueue());
        if (status === "success") toast.success("Offline receipt successfully synchronized!");
        else if (status === "failed") toast.error("Failed to sync offline receipt. Retrying later...");
      };
      SyncQueue.processQueue(processSingleQueueItem, handleProgress);
    }
  }, [isOnline]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const saveCreditNotes = (notes) => {
    setCreditNotes(notes);
    localStorage.setItem("creditNotes", JSON.stringify(notes));
  };

  const isOverdue = (invoice) => {
    if (invoice.status === "Paid") return false;
    if (!invoice.dueDate) return false;
    return new Date(invoice.dueDate) < new Date(new Date().toDateString());
  };

  const getAgingDays = (invoice) => {
    if (!invoice.dueDate || invoice.status === "Paid") return 0;
    const diff = new Date() - new Date(invoice.dueDate);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  // ─── Invoice CRUD ─────────────────────────────────────────────────────────────
  const addInvoice = async (invoiceData) => {
    if (isSubmitting) return null;
    setIsSubmitting(true);
    try {
      const ids = invoices.map(inv => {
        const match = inv.id.match(/INV-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxId = ids.length > 0 ? Math.max(...ids) : 0;
      const newId = `INV-${String(maxId + 1).padStart(3, "0")}`;

      const newInvoice = {
        ...invoiceData,
        id: newId,
        createdAt: invoiceData.createdAt || new Date().toISOString().split("T")[0],
        status: invoiceData.status || "Unpaid",
        amountPaid: Number(invoiceData.amountPaid || 0),
        paymentHistory: invoiceData.paymentHistory || [],
        reminderCount: 0,
        lastReminderAt: null,
        notes: invoiceData.notes || "",
        terms: invoiceData.terms || "",
      };

      const updated = [newInvoice, ...invoices];
      setInvoices(updated);
      StorageService.saveInvoices(updated);
      
      // Sync stock adjustments to supply chain
      adjustInventoryForInvoice(newInvoice, 1);

      // Sync invoice status/payments back to matching order
      syncInvoicesToOrders(updated, [newId]);

      toast.success(`Invoice ${newId} created successfully!`);
      return newInvoice;
    } catch (e) {
      toast.error("Failed to create invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncInvoicesToOrders = (updatedInvoicesList, updatedInvoiceIds) => {
    try {
      const allOrders = StorageService.getOrders() || [];
      let ordersUpdated = false;
      
      const updatedOrders = allOrders.map(o => {
        const matchingInv = updatedInvoicesList.find(
          inv => inv.id && updatedInvoiceIds.includes(inv.id) && (inv.sourceOrderId === o.id || inv.id === `BILL-${o.id}`)
        );
        if (matchingInv) {
          ordersUpdated = true;
          let newStatus = o.status;
          if (matchingInv.status === "Paid") {
            newStatus = "Paid";
          } else if (matchingInv.status === "Partial") {
            newStatus = "Partially Paid";
          } else if (matchingInv.status === "Unpaid") {
            newStatus = o.status === "Cancelled" || o.status === "Backordered" ? o.status : "Pending";
          }
          return {
            ...o,
            paidAmount: matchingInv.amountPaid,
            status: newStatus,
            payments: (matchingInv.paymentHistory || []).map(p => ({
              id: p.reference || 'PAY-' + Date.now(),
              amount: p.amount,
              method: p.method || "Cash",
              note: `Sync from Invoice payment ${matchingInv.id}`,
              date: p.date || new Date().toISOString()
            }))
          };
        }
        return o;
      });
      
      if (ordersUpdated) {
        StorageService.saveOrders(updatedOrders);
        window.dispatchEvent(new CustomEvent("orders:updated"));
      }
    } catch (err) {
      console.error("Failed to sync invoice payments to orders:", err);
    }
  };

  const updateInvoice = (id, updatedData) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, ...updatedData } : inv
    );
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    syncInvoicesToOrders(updated, [id]);
  };

  const deleteInvoice = (id) => {
    const invoiceToDelete = invoices.find(inv => inv.id === id);
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    StorageService.saveInvoices(updated);

    // Revert inventory sync
    if (invoiceToDelete) {
      adjustInventoryForInvoice(invoiceToDelete, -1);
    }

    toast.success(`Invoice ${id} deleted.`);
  };

  // ─── Bulk Operations ──────────────────────────────────────────────────────────
  const bulkDeleteInvoices = (ids) => {
    const invoicesToDelete = invoices.filter(inv => ids.includes(inv.id));
    const updated = invoices.filter(inv => !ids.includes(inv.id));
    setInvoices(updated);
    StorageService.saveInvoices(updated);

    // Revert inventory sync for all deleted
    invoicesToDelete.forEach(inv => {
      adjustInventoryForInvoice(inv, -1);
    });

    toast.success(`${ids.length} invoice(s) deleted.`);
  };

  const bulkMarkPaid = (ids) => {
    const updated = invoices.map(inv => {
      if (!ids.includes(inv.id)) return inv;
      return {
        ...inv,
        status: "Paid",
        amountPaid: inv.total,
        paymentHistory: [
          ...(inv.paymentHistory || []),
          {
            amount: inv.total - (inv.amountPaid || 0),
            method: "Manual Bulk",
            reference: "BULK-MARK-PAID",
            date: new Date().toISOString(),
          },
        ],
      };
    });
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    syncInvoicesToOrders(updated, ids);
    toast.success(`${ids.length} invoice(s) marked as paid.`);
  };

  // ─── Payment with Method & History ──────────────────────────────────────────
  const recordPayment = (id, amount, method = "Cash", reference = "") => {
    const payment = Number(amount);
    if (isNaN(payment) || payment <= 0) {
      toast.error("Invalid payment amount.");
      return;
    }

    const updated = invoices.map(inv => {
      if (inv.id !== id) return inv;
      const newPaid = (inv.amountPaid || 0) + payment;
      const newStatus = newPaid >= inv.total ? "Paid" : "Partial";
      const historyEntry = {
        amount: payment,
        method,
        reference,
        date: new Date().toISOString(),
      };
      return {
        ...inv,
        amountPaid: Math.min(inv.total, newPaid),
        status: newStatus,
        paymentHistory: [...(inv.paymentHistory || []), historyEntry],
      };
    });

    setInvoices(updated);
    StorageService.saveInvoices(updated);
    syncInvoicesToOrders(updated, [id]);
    toast.success(`Recorded ₹${payment.toLocaleString()} via ${method} for ${id}`);
  };

  // ─── Send Reminder ────────────────────────────────────────────────────────────
  const sendReminder = (id) => {
    const updated = invoices.map(inv => {
      if (inv.id !== id) return inv;
      return {
        ...inv,
        reminderCount: (inv.reminderCount || 0) + 1,
        lastReminderAt: new Date().toISOString(),
      };
    });
    setInvoices(updated);
    StorageService.saveInvoices(updated);
    toast.success("Payment reminder sent successfully!");
  };

  // ─── Credit Notes ─────────────────────────────────────────────────────────────
  const addCreditNote = (invoiceId, amount, reason) => {
    const creditAmount = Number(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      toast.error("Invalid credit note amount.");
      return null;
    }

    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) {
      toast.error("Invoice not found.");
      return null;
    }

    const newCN = {
      id: `CN-${Date.now()}`,
      invoiceId,
      amount: creditAmount,
      reason,
      issuedAt: new Date().toISOString(),
      issuerName: invoice.issuerName,
      recipientName: invoice.recipientName,
    };

    const updatedNotes = [newCN, ...creditNotes];
    saveCreditNotes(updatedNotes);
    toast.success(`Credit Note ${newCN.id} issued for ₹${creditAmount.toLocaleString()}`);
    return newCN;
  };

  const deleteCreditNote = (cnId) => {
    const updated = creditNotes.filter(cn => cn.id !== cnId);
    saveCreditNotes(updated);
    toast.success("Credit note deleted.");
  };

  // ─── Receipt Handlers ─────────────────────────────────────────────────────────
  const addReceiptCapture = async (receiptData) => {
    const newReceipt = {
      ...receiptData,
      id: receiptData.id || `REC-${String(Date.now()).substring(7)}`,
      uploadedAt: new Date().toISOString(),
      verificationStatus: receiptData.verificationStatus || "Pending Review"
    };

    if (!isOnline) {
      toast.error("Device is offline! Saving receipt to offline sync queue.");
      SyncQueue.addToQueue(newReceipt);
      setSyncQueueItems(SyncQueue.getQueue());
      return newReceipt;
    }

    const updated = [newReceipt, ...receiptCaptures];
    setReceiptCaptures(updated);
    const pruned = StorageService.saveReceiptCaptures(updated);
    if (pruned) {
      const reloaded = StorageService.getReceiptCaptures();
      setReceiptCaptures(reloaded);
    }
    toast.success("Receipt uploaded and parsed successfully!");
    return newReceipt;
  };

  const verifyReceipt = (id, parsedData) => {
    const updated = receiptCaptures.map(rec =>
      rec.id === id ? { ...rec, parsedData, verificationStatus: "Verified" } : rec
    );
    setReceiptCaptures(updated);
    StorageService.saveReceiptCaptures(updated);
    toast.success("Receipt verified successfully!");

    const receiptObj = receiptCaptures.find(r => r.id === id);
    if (receiptObj?.invoiceId) {
      const matchInvoice = invoices.find(inv => inv.id === receiptObj.invoiceId);
      if (matchInvoice) {
        updateInvoice(receiptObj.invoiceId, { status: "Paid", amountPaid: matchInvoice.total });
        toast.success(`Invoice ${receiptObj.invoiceId} auto-marked as Paid.`);
      }
    }
  };

  const rejectReceipt = (id) => {
    const updated = receiptCaptures.map(rec =>
      rec.id === id ? { ...rec, verificationStatus: "Flagged" } : rec
    );
    setReceiptCaptures(updated);
    StorageService.saveReceiptCaptures(updated);
    toast.error("Receipt flagged/rejected.");
  };

  const deleteReceipt = (id) => {
    const updated = receiptCaptures.filter(rec => rec.id !== id);
    setReceiptCaptures(updated);
    StorageService.saveReceiptCaptures(updated);
    toast.success("Receipt capture deleted.");
  };

  return (
    <BillingContext.Provider
      value={{
        // State
        invoices,
        receiptCaptures,
        creditNotes,
        syncQueueItems,
        isOnline,
        isSubmitting,
        // Helpers
        isOverdue,
        getAgingDays,
        // Invoice CRUD
        addInvoice,
        updateInvoice,
        deleteInvoice,
        // Bulk
        bulkDeleteInvoices,
        bulkMarkPaid,
        // Payments
        recordPayment,
        sendReminder,
        // Credit Notes
        addCreditNote,
        deleteCreditNote,
        // Receipts
        addReceiptCapture,
        verifyReceipt,
        rejectReceipt,
        deleteReceipt,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) throw new Error("useBilling must be used within a BillingProvider");
  return context;
};
