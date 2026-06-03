import { createContext, useState, useContext, useEffect } from "react";
import StorageService from "../services/storageService";
import { useAuth } from "./AuthContext";
import { useAudit } from "./AuditContext";

const OrderContext = createContext([]);

// ─── Helper: map a customer order → billing invoice ───────────────────────────
const orderToBillingInvoice = (order, customer, issuerDB = null) => {
  // Build billing line items from order items
  const lineItems = (order.items || []).map((item, idx) => {
    const baseTotal = Number(item.qty || 1) * Number(item.price || 0);
    const afterDiscount = baseTotal - baseTotal * ((Number(item.discount) || 0) / 100);
    const itemTotal = afterDiscount + afterDiscount * ((Number(item.gst) || 18) / 100);
    return {
      id: String(idx + 1),
      description: item.name || item.description || "Product",
      quantity: Number(item.qty || 1),
      price: Number(item.price || 0),
      total: itemTotal,
    };
  });

  const subTotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = lineItems.reduce((s, i) => s + (i.total - i.price * i.quantity), 0);
  const total = subTotal + tax;

  // Map order payment status → billing status
  let status = "Unpaid";
  if (order.status === "Paid") status = "Paid";
  else if (Number(order.paidAmount) > 0) status = "Partial";

  return {
    // Prefix with BILL- so we can upsert/remove it by order id
    id: `BILL-${order.id}`,
    issuerId: issuerDB?.id || order.createdBy || "DB-001",
    issuerName: issuerDB?.name || "Distributor",
    recipientId: order.customerId,
    recipientName: customer?.name || "Retailer",
    tier: "DB_to_Retailer",
    lineItems,
    subTotal,
    tax,
    total,
    status,
    amountPaid: Number(order.paidAmount || 0),
    dueDate:
      order.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    createdAt: order.date || new Date().toISOString().split("T")[0],
    sourceOrderId: order.id, // back-reference to original order
  };
};

// Upsert a billing invoice derived from an order (create or update)
const syncOrderToBilling = (order) => {
  try {
    const allCustomers = StorageService.getCustomers() || [];
    const customer = allCustomers.find((c) => c.id === order.customerId);

    // Find the real distributor entity that belongs to the user who created this order
    const allDistributors = StorageService.getDistributors() || [];
    const issuerDB =
      allDistributors.find((d) => d.userId === order.createdBy) ||
      allDistributors[0] ||
      null;

    const billingInvoice = orderToBillingInvoice(order, customer, issuerDB);

    const existingInvoices = StorageService.getInvoices() || [];
    const idx = existingInvoices.findIndex((inv) => inv.id === billingInvoice.id);

    const updatedInvoices =
      idx >= 0
        ? existingInvoices.map((inv) =>
            inv.id === billingInvoice.id ? billingInvoice : inv
          )
        : [billingInvoice, ...existingInvoices];

    StorageService.saveInvoices(updatedInvoices);
    // Notify BillingContext (same tab) to re-read invoices
    window.dispatchEvent(new CustomEvent("billing:invoices:updated"));
  } catch (e) {
    console.error("Failed to sync order to billing:", e);
  }
};

// Remove the billing invoice when the source order is deleted
const removeOrderFromBilling = (orderId) => {
  try {
    const billingId = `BILL-${orderId}`;
    const existing = StorageService.getInvoices() || [];
    StorageService.saveInvoices(existing.filter((inv) => inv.id !== billingId));
    window.dispatchEvent(new CustomEvent("billing:invoices:updated"));
  } catch (e) {
    console.error("Failed to remove billing invoice for order:", e);
  }
};
// ──────────────────────────────────────────────────────────────────────────────

export const OrderProvider = ({ children }) => {
  const { currentUser, viewAsUserId } = useAuth();
  const { logAction } = useAudit();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const allOrders = StorageService.getOrders() ?? [];
    if (currentUser?.role === "ADMIN") {
      if (viewAsUserId) {
        setOrders(allOrders.filter((o) => o.createdBy === viewAsUserId));
      } else {
        setOrders(allOrders);
      }
    } else if (currentUser?.role === "SALES") {
      setOrders(allOrders.filter((o) => o.createdBy === currentUser.id));
    } else {
      setOrders([]);
    }
  }, [currentUser, viewAsUserId]);

  const addOrder = (order) => {
    const allOrders = StorageService.getOrders() ?? [];
    const newOrder = { ...order, createdBy: viewAsUserId || currentUser?.id };
    const updatedAll = [newOrder, ...allOrders];
    StorageService.saveOrders(updatedAll);
    setOrders([newOrder, ...orders]);
    logAction("Create Order", "Orders", `Created order ${newOrder.id}`);
    // Auto-create matching billing invoice disabled to prevent duplicate invoices for retailer
    // syncOrderToBilling(newOrder);
  };

  const deleteOrder = (id) => {
    const allOrders = StorageService.getOrders() ?? [];
    const updatedAll = allOrders.filter((o) => o.id !== id);
    StorageService.saveOrders(updatedAll);
    setOrders(orders.filter((order) => order.id !== id));
    logAction("Delete Order", "Orders", `Deleted order ${id}`);
    // Remove the matching billing invoice too
    // removeOrderFromBilling(id);
  };

  const updateOrder = (id, updatedOrder) => {
    const allOrders = StorageService.getOrders() ?? [];
    const updatedAll = allOrders.map((o) =>
      o.id === id ? { ...o, ...updatedOrder } : o
    );
    StorageService.saveOrders(updatedAll);
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, ...updatedOrder } : order
      )
    );
    logAction(
      "Update Order",
      "Orders",
      `Updated order ${id} (Status: ${updatedOrder.status})`
    );
    // Sync the merged order back to billing disabled to prevent duplicate invoices for retailer
    // const original = allOrders.find((o) => o.id === id) || {};
    // syncOrderToBilling({ ...original, ...updatedOrder });
  };

  const clearAllOrders = () => {
    const allOrders = StorageService.getOrders() ?? [];
    if (currentUser?.role === "ADMIN") {
      StorageService.clearOrders();
      setOrders([]);
    } else if (currentUser?.role === "SALES") {
      const remainingOrders = allOrders.filter(
        (o) => o.createdBy !== currentUser.id
      );
      StorageService.saveOrders(remainingOrders);
      setOrders([]);
    }
  };

  return (
    <OrderContext.Provider
      value={{ orders, addOrder, deleteOrder, updateOrder, clearAllOrders }}
    >
      {children}
    </OrderContext.Provider>
  );
};

const useOrderContext = () => {
  return useContext(OrderContext);
};

export default useOrderContext;
