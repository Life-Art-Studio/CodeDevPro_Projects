import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";
import SyncQueue from "../utils/SyncQueue";
import toast from "react-hot-toast";
import { useSupplyChainContext } from "./SupplyChainContext";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabase";

const BillingContext = createContext(null);

export const BillingProvider = ({ children }) => {
  const { currentUser, users, viewAsUserId } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [receiptCaptures, setReceiptCaptures] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncQueueItems, setSyncQueueItems] = useState([]);

  const { restockProduct } = useSupplyChainContext();

  const adjustInventoryForInvoice = (invoice, multiplier = 1) => {
    try {
      if (!restockProduct) return;
      if (invoice.sourceOrderId) return; // Already deducted during order creation
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

  // ─── Load from Supabase ──────────────────────────────────────────
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!currentUser?.org_id) {
        setInvoices([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // Strict Tenant Frontend Firewall
        let query = supabase.from('invoices').select('*').eq('org_id', currentUser.org_id).order('createdAt', { ascending: false });

        const { data: supabaseInvoices, error } = await query;
        if (error) throw error;
        let filteredData = supabaseInvoices || [];
        // Unified Role-Based Hierarchy Firewall
              if (viewAsUserId) {
                        const allowedIds = users
                            .filter(u => u.id === viewAsUserId || u.parent_id === viewAsUserId || (u.ancestor_ids && u.ancestor_ids.includes(viewAsUserId)))
                            .map(u => u.id);
                        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
                      } else {
                        // WITHOUT View As mode: Admins, SS, DB see data for all users they manage.
                        const allowedIds = users.map(u => u.id);
                        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
                      }

        setInvoices(filteredData);
      } catch (err) {
        console.error("Failed to fetch invoices from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();

    // Remove local storage fallbacks for receipts and credit notes
    setReceiptCaptures([]);
    setCreditNotes([]);

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    if (currentUser?.org_id) {
      const subscription = supabase.channel('invoices_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `org_id=eq.${currentUser.org_id}` }, () => {
          fetchInvoices();
        }).subscribe();

      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
        supabase.removeChannel(subscription);
      };
    }

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, [currentUser, viewAsUserId, users]);

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
      const newInvoice = {
        ...invoiceData,
        status: invoiceData.status || "Unpaid",
        amountPaid: 0,
        paymentHistory: [],
        reminderCount: 0,
        lastReminderAt: null,
        notes: invoiceData.notes || "Generated via Order System",
        terms: invoiceData.terms || "Payment due within specified due date. Late fees may apply.",
        createdAt: new Date().toISOString(),
        owner_id: currentUser?.id,
      };

      // Sync to Supabase
      const { data, error } = await supabase.from('invoices').insert([newInvoice]).select();
      if (error) {
        console.warn("Supabase insert failed, relying on local error throwing:", error);
        throw error;
      }
      const insertedInvoice = data[0];

      const updated = [insertedInvoice, ...invoices];
      setInvoices(updated);
      
      // Notify other contexts (e.g., other tabs, sales reps) that invoices have changed
      window.dispatchEvent(new CustomEvent('billing:invoices:updated'));
      // Sync stock adjustments to supply chain
      adjustInventoryForInvoice(insertedInvoice, 1);

      // Sync invoice status/payments back to matching order
      syncInvoicesToOrders(updated, [insertedInvoice.id]);

      toast.success(`Invoice created successfully!`);
      return insertedInvoice;
    } catch (e) {
      toast.error("Failed to create invoice");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const syncInvoicesToOrders = async (updatedInvoicesList, updatedInvoiceIds) => {
    try {
      const { supabase } = await import('../lib/supabase');
      // Fetch matching orders from Supabase based on invoice sourceOrderId
      const targetInvoices = updatedInvoicesList.filter(inv => inv.id && updatedInvoiceIds.includes(inv.id));
      if (targetInvoices.length === 0) return;
      
      const orderIds = targetInvoices.map(inv => inv.sourceOrderId || inv.id.replace('BILL-', '')).filter(Boolean);
      if (orderIds.length === 0) return;

      const { data: allOrders } = await supabase.from('orders').select('*').in('id', orderIds);
      if (!allOrders) return;

      for (const o of allOrders) {
        const matchingInv = targetInvoices.find(
          inv => inv.sourceOrderId === o.id || inv.id === `BILL-${o.id}`
        );
        
        if (matchingInv) {
          let newStatus = o.status;
          if (matchingInv.status === "Paid") {
            newStatus = "Paid";
          } else if (matchingInv.status === "Partial") {
            newStatus = "Partially Paid";
          } else if (matchingInv.status === "Unpaid") {
            newStatus = o.status === "Cancelled" || o.status === "Backordered" ? o.status : "Pending";
          }
          
          const dbUpdate = {
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
          
          await supabase.from('orders').update(dbUpdate).eq('id', o.id);
        }
      }
      window.dispatchEvent(new CustomEvent("orders:updated"));
    } catch (err) {
      console.error("Failed to sync invoice payments to orders:", err);
    }
  };

  const updateInvoice = async (id, updatedData) => {
    const updated = invoices.map(inv =>
      inv.id === id ? { ...inv, ...updatedData } : inv
    );
    setInvoices(updated);
    
    try {
      const invoiceToUpdate = updated.find(inv => inv.id === id);
      if (invoiceToUpdate) {
        const { error } = await supabase.from('invoices').update(invoiceToUpdate).eq('id', id);
        if (error) console.warn("Supabase update failed:", error);
      }
    } catch (err) {
      console.error("Supabase update exception:", err);
    }
    
    syncInvoicesToOrders(updated, [id]);
  };

  const deleteInvoice = async (id) => {
    const invoiceToDelete = invoices.find(inv => inv.id === id);
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);

    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) console.warn("Supabase delete failed:", error);
    } catch (err) {
      console.error("Supabase delete exception:", err);
    }

    // Revert inventory sync
    if (invoiceToDelete) {
      adjustInventoryForInvoice(invoiceToDelete, -1);
    }

    toast.success(`Invoice ${id} deleted.`);
  };

  // ─── Bulk Operations ──────────────────────────────────────────────────────────
  const bulkDeleteInvoices = async (ids) => {
    const invoicesToDelete = invoices.filter(inv => ids.includes(inv.id));
    const updated = invoices.filter(inv => !ids.includes(inv.id));
    setInvoices(updated);

    try {
      const { error } = await supabase.from('invoices').delete().in('id', ids);
      if (error) console.warn("Supabase bulk delete failed:", error);
    } catch (err) {
      console.error("Supabase bulk delete exception:", err);
    }

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
    toast.success("Receipt uploaded and parsed successfully!");
    return newReceipt;
  };

  const verifyReceipt = (id, parsedData) => {
    const updated = receiptCaptures.map(rec =>
      rec.id === id ? { ...rec, parsedData, verificationStatus: "Verified" } : rec
    );
    setReceiptCaptures(updated);
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
    toast.error("Receipt flagged/rejected.");
  };

  const deleteReceipt = (id) => {
    const updated = receiptCaptures.filter(rec => rec.id !== id);
    setReceiptCaptures(updated);
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
        isLoading,
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
