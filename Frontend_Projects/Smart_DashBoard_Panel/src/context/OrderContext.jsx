import { createContext, useState, useContext, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useAudit } from "./AuditContext";
import { getOrderPaidAmount } from "../utils/financeUtils";
import toast from 'react-hot-toast';

const OrderContext = createContext([]);

// Helper: map a customer order → billing invoice
const orderToBillingInvoice = (order, customer, issuerDB = null) => {
  const lineItems = (order.items || []).map((item, idx) => {
    const qty = Number(item.qty || 1);
    const price = Number(item.price || 0);
    const discount = Number(item.discount || 0);
    const gstRate = Number(item.gst || 18);

    const baseTotal = qty * price;
    const discountAmount = baseTotal * (discount / 100);
    const taxableValue = baseTotal - discountAmount;
    const taxAmount = taxableValue * (gstRate / 100);
    const itemTotal = taxableValue + taxAmount;

    return {
      id: String(idx + 1),
      sku: item.sku || "LUB-10W30-1L",
      description: item.name || item.description || "Product",
      quantity: qty,
      price: price,
      discount: discount,
      gstRate: gstRate,
      taxableValue: taxableValue,
      taxAmount: taxAmount,
      total: itemTotal,
    };
  });

  const subTotal = lineItems.reduce((s, i) => s + i.taxableValue, 0);
  const tax = lineItems.reduce((s, i) => s + i.taxAmount, 0);
  const preGlobalTotal = subTotal + tax;
  const globalDiscount = Number(order.global_discount || 0);
  const globalDiscountAmount = preGlobalTotal * (globalDiscount / 100);
  const total = preGlobalTotal - globalDiscountAmount;

  let status = "Unpaid";
  if (order.status === "Paid") status = "Paid";
  else if (Number(order.paidAmount) > 0) status = "Partial";

  return {
    id: `BILL-${order.id}`,
    issuerId: issuerDB?.id || order.owner_id || "DB-001",
    issuerName: issuerDB?.name || "Distributor",
    recipientId: order.customer_id,
    recipientName: customer?.name || "Retailer",
    tier: "DB_to_Retailer",
    lineItems,
    subTotal,
    tax,
    globalDiscount,
    globalDiscountAmount,
    total,
    status,
    amountPaid: Number(order.paidAmount || 0),
    dueDate:
      order.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    createdAt: order.date || new Date().toISOString().split("T")[0],
    sourceOrderId: order.id,
    owner_id: order.owner_id,
  };
};

const syncOrderToBilling = async (order) => {
  // Billing sync is now purely DB-driven, so this frontend sync might just be a UI event
  window.dispatchEvent(new CustomEvent("billing:invoices:updated"));
};

const removeOrderFromBilling = (orderId) => {
  window.dispatchEvent(new CustomEvent("billing:invoices:updated"));
};

export const OrderProvider = ({ children }) => {
  const { currentUser, viewAsUserId, users } = useAuth();
  const { logAction } = useAudit();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchOrders = async () => {
    if (!currentUser?.org_id) {
      setOrders([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      let query = supabase.from('orders').select('*').eq('org_id', currentUser.org_id).order('date', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      
      let filteredData = data || [];
      // Unified Role-Based Hierarchy Firewall
      if (currentUser.role === 'ADMIN') {
        // ADMIN sees all orders in the organization.
        filteredData = data;
      } else if (viewAsUserId) {
        const allowedIds = users
            .filter(u => u.id === viewAsUserId || u.parent_id === viewAsUserId || (u.ancestor_ids && u.ancestor_ids.includes(viewAsUserId)))
            .map(u => u.id);
        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
      } else {
        // SS and DB see orders for all users they manage.
        const allowedIds = users.map(u => u.id);
        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id) || item.owner_id === currentUser.id);
      }
      setOrders(filteredData);

    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleOrdersUpdate = () => {
      fetchOrders();
    };

    window.addEventListener("orders:updated", handleOrdersUpdate);
    window.addEventListener("focus", handleOrdersUpdate);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    let subscription;
    if (currentUser?.org_id) {
      subscription = supabase.channel('orders_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `org_id=eq.${currentUser.org_id}` }, () => {
          fetchOrders();
        }).subscribe();
    }

    return () => {
      window.removeEventListener("orders:updated", handleOrdersUpdate);
      window.removeEventListener("focus", handleOrdersUpdate);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [currentUser, viewAsUserId]);

  const addOrder = async (order) => {
    // Normalize date to ISO YYYY-MM-DD
    let normalizedDate = order.date;
    if (normalizedDate) {
      const parsed = new Date(normalizedDate);
      if (!isNaN(parsed.getTime())) {
        normalizedDate = parsed.toISOString().split('T')[0];
      }
    } else {
      normalizedDate = new Date().toISOString().split('T')[0];
    }

    // Build payload using ONLY known columns with their exact DB names.
    // Schema: id(text), customer_id, created_by, date, status,
    //         items(jsonb), total, "paidAmount", global_discount, payments(jsonb),
    //         "paymentMode", notes, "distributorId", "dueDate"
    // IMPORTANT: Only include optional camelCase columns when they have a value,
    // because PostgREST maps JS keys case-insensitively and quoted PG identifiers
    // like "distributorId" must match exactly — omitting them avoids schema errors.
    const dbPayload = {
      date:            normalizedDate,
      status:          order.status || 'Pending',
      items:           order.items || [],
      owner_id:      viewAsUserId || currentUser?.id,
      customer_id:     order.customerId || order.customer_id,
      global_discount: (order.globalDiscount !== undefined && order.globalDiscount !== '')
                        ? Number(order.globalDiscount) : 0,
    };
    if (order.id) dbPayload.id = order.id;

    // Optional columns — only add when non-null to avoid schema mismatch
    const distId = order.distributorId || order.distributor_id;
    if (distId) dbPayload.distributorId = distId;

    if (order.notes)   dbPayload.notes        = order.notes;
    if (order.dueDate) dbPayload.dueDate   = order.dueDate;
    if (order.paidAmount > 0) dbPayload.paidAmount = order.paidAmount;
    if (order.payments?.length) dbPayload.payments  = order.payments;
    if (order.paymentMode) dbPayload.paymentMode = order.paymentMode;

    // Calculate total from items
    const sub = (dbPayload.items || []).reduce((s, item) => {
      const base = Number(item.qty || 1) * Number(item.price || 0);
      return s + (base - base * ((Number(item.discount) || 0) / 100));
    }, 0);
    dbPayload.total = sub - sub * ((dbPayload.global_discount || 0) / 100);

    try {
      let { data, error } = await supabase.from('orders').insert([dbPayload]).select().single();

      if (error && error.message?.includes('Could not find the')) {
        const fallback = { ...dbPayload };
        delete fallback.distributorId;
        delete fallback.dueDate;
        delete fallback.paidAmount;
        delete fallback.paymentMode;
        
        if (distId) fallback.distributor_id = distId;
        if (order.dueDate) fallback.due_date = order.dueDate;
        if (order.paidAmount > 0) fallback.paid_amount = order.paidAmount;
        if (order.paymentMode) fallback.payment_mode = order.paymentMode;

        const retry = await supabase.from('orders').insert([fallback]).select().single();
        if (retry.error && retry.error.message?.includes('Could not find the')) {
          delete fallback.distributor_id;
          delete fallback.due_date;
          delete fallback.paid_amount;
          delete fallback.payment_mode;
          const retry2 = await supabase.from('orders').insert([fallback]).select().single();
          data = retry2.data;
          error = retry2.error;
        } else {
          data = retry.data;
          error = retry.error;
        }
      }

      if (error) throw error;

      const savedOrder = data;
      setOrders(prev => [savedOrder, ...prev]);
      logAction('Create Order', 'Orders', `Created order ${savedOrder.id}`);
      syncOrderToBilling(savedOrder);
      toast.success('Order created successfully!');
      return true;
    } catch (err) {
      console.error('Error adding order:', err);
      toast.error(`Failed to add order: ${err.message || 'Unknown error'}`);
      return false;
    }
  };

  const deleteOrder = async (id) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      
      setOrders(prev => prev.filter((order) => order.id !== id));
      logAction("Delete Order", "Orders", `Deleted order ${id}`);
      removeOrderFromBilling(id);
      toast.success("Order deleted.");
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("Failed to delete order");
    }
  };

  const updateOrder = async (id, updatedOrder) => {
    const original = orders.find((o) => o.id === id) || {};

    const dbUpdate = {};
    if (updatedOrder.date !== undefined)   dbUpdate.date   = updatedOrder.date;
    if (updatedOrder.status !== undefined) dbUpdate.status = updatedOrder.status;
    if (updatedOrder.items !== undefined)  dbUpdate.items  = updatedOrder.items;
    if (updatedOrder.notes !== undefined)  dbUpdate.notes  = updatedOrder.notes;
    if (updatedOrder.total !== undefined)  dbUpdate.total  = updatedOrder.total;
    if (updatedOrder.payments !== undefined)   dbUpdate.payments    = updatedOrder.payments;
    if (updatedOrder.paymentMode !== undefined) dbUpdate.paymentMode = updatedOrder.paymentMode;

    const distId = updatedOrder.distributorId ?? updatedOrder.distributor_id ?? original.distributorId ?? original.distributor_id;
    if (distId !== undefined) dbUpdate.distributorId = distId;

    const paidAmt = updatedOrder.paidAmount ?? updatedOrder.paid_amount ?? original.paidAmount;
    if (paidAmt !== undefined) dbUpdate.paidAmount = paidAmt;

    const dueDate = updatedOrder.dueDate ?? updatedOrder.due_date ?? original.dueDate;
    if (dueDate !== undefined) dbUpdate.dueDate = dueDate;

    const globalDisc = updatedOrder.globalDiscount ?? updatedOrder.global_discount ?? original.global_discount;
    if (globalDisc !== undefined) dbUpdate.global_discount = Number(globalDisc);

    try {
      let { error } = await supabase.from('orders').update(dbUpdate).eq('id', id);

      if (error && error.message?.includes('Could not find the')) {
        const fallback = { ...dbUpdate };
        delete fallback.distributorId;
        delete fallback.dueDate;
        delete fallback.paidAmount;
        delete fallback.paymentMode;

        if (distId !== undefined) fallback.distributor_id = distId;
        if (paidAmt !== undefined) fallback.paid_amount = paidAmt;
        if (dueDate !== undefined) fallback.due_date = dueDate;
        if (updatedOrder.paymentMode !== undefined) fallback.payment_mode = updatedOrder.paymentMode;

        const retry = await supabase.from('orders').update(fallback).eq('id', id);
        if (retry.error && retry.error.message?.includes('Could not find the')) {
          delete fallback.distributor_id;
          delete fallback.paid_amount;
          delete fallback.due_date;
          delete fallback.payment_mode;
          const retry2 = await supabase.from('orders').update(fallback).eq('id', id);
          error = retry2.error;
        } else {
          error = retry.error;
        }
      }

      if (error) throw error;

      const mergedOrder = { ...original, ...dbUpdate };
      setOrders(prev => prev.map((order) => order.id === id ? mergedOrder : order));
      logAction('Update Order', 'Orders', `Updated order ${id} (Status: ${mergedOrder.status})`);

      try {
        syncOrderToBilling(mergedOrder);
      } catch (e) {
        console.error('Failed to sync order payment update to billing:', e);
      }
      return true;
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error('Failed to update order');
      return false;
    }
  };

  const clearAllOrders = async () => {
    try {
      if (currentUser?.role === "ADMIN") {
        if (viewAsUserId) {
          await supabase.from('orders').delete().eq('owner_id', viewAsUserId);
        } else {
          // This will fail if not using service_role, but if RLS allows it:
          await supabase.from('orders').delete().neq('id', '0'); 
        }
      } else if (currentUser?.role === "SALES") {
        await supabase.from('orders').delete().eq('owner_id', currentUser.id);
      }
      setOrders([]);
    } catch (err) {
      console.error("Failed to clear orders:", err);
    }
  };

  return (
    <OrderContext.Provider value={{ orders, isLoading, fetchOrders, addOrder, deleteOrder, updateOrder, clearAllOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

const useOrderContext = () => {
  return useContext(OrderContext);
};

export default useOrderContext;
