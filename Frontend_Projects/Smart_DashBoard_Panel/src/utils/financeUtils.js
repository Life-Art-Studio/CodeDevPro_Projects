// src/utils/financeUtils.js

export const calculateRowTotal = (item) => {
  const itemTotal = Number(item.qty || 0) * Number(item.price || 0);
  const afterDiscount = itemTotal - (itemTotal * ((Number(item.discount) || 0) / 100));
  return afterDiscount + (afterDiscount * ((Number(item.gst) || 0) / 100));
};

export const calculateOrderTotal = (order) => {
  if (!order || !order.items) return 0;
  const subtotal = order.items.reduce((sum, item) => sum + calculateRowTotal(item), 0);
  const discountVal = order.globalDiscount !== undefined ? order.globalDiscount : order.global_discount;
  const globalDiscountAmt = subtotal * ((Number(discountVal) || 0) / 100);
  return subtotal - globalDiscountAmt;
};

export const formatCurrency = (amount) => {
  return Number(amount || 0).toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

export const getOrderPaidAmount = (order) => {
  if (!order) return 0;
  if (order.status === 'Paid' && (!order.payments || order.payments.length === 0)) {
    return calculateOrderTotal(order);
  }
  const paidVal = order.paidAmount !== undefined ? order.paidAmount : order.paid_amount;
  return Number(paidVal) || 0;
};

export const getOrderOutstanding = (order) => {
  if (!order) return 0;
  return Math.max(0, calculateOrderTotal(order) - getOrderPaidAmount(order));
};

export const deriveOrderStatus = (order) => {
  if (!order) return 'Pending';
  const total = calculateOrderTotal(order);
  const paid = getOrderPaidAmount(order);
  
  if (paid === 0 && order.status === 'Cancelled') return 'Cancelled';
  if (paid === 0 && order.status === 'Backordered') return 'Backordered';
  if (paid === 0) return 'Pending';
  if (paid >= total) return 'Paid';
  return 'Partially Paid';
};