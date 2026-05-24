import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { calculateOrderTotal, formatCurrency, getOrderPaidAmount, getOrderOutstanding } from "../../utils/financeUtils";

const PaymentModal = ({ isOpen, onClose, order, onRecordPayment }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setMethod("Cash");
      setNote("");
      setDate(
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      );
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const orderTotal = calculateOrderTotal(order);
  const alreadyPaid = getOrderPaidAmount(order);
  const outstanding = getOrderOutstanding(order);
  const progressPct = Math.min(100, (alreadyPaid / orderTotal) * 100) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }
    
    // We add a tiny epsilon tolerance for floating point comparisons
    if (numAmount > outstanding + 0.01) {
      setError("Amount cannot exceed the outstanding balance");
      return;
    }

    onRecordPayment(order.id, {
      amount: numAmount,
      method,
      note,
      date,
    });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-modal rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 transition-colors border border-white/20">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/5 dark:bg-white/5 transition-colors backdrop-blur-md">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors tracking-tight">Record Payment</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            
            {/* Stats Overview */}
            <div className="space-y-3 bg-white/50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/50 dark:border-white/10">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-600 dark:text-slate-400">Order Total</span>
                <span className="text-slate-800 dark:text-slate-200">₹{formatCurrency(orderTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-600 dark:text-slate-400">Already Paid</span>
                <span className="text-teal-600 dark:text-teal-400">₹{formatCurrency(alreadyPaid)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold border-t border-slate-200/50 dark:border-white/10 pt-2 mt-2">
                <span className="text-slate-800 dark:text-slate-200">Outstanding</span>
                <span className="text-amber-600 dark:text-amber-400">₹{formatCurrency(outstanding)}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Amount *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all shadow-inner"
                  placeholder="0.00"
                />
              </div>
              {/* Quick Action Pills */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setAmount(orderTotal.toString())}
                  className="text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  Pay in Full
                </button>
                <button
                  type="button"
                  onClick={() => setAmount(outstanding.toString())}
                  className="text-xs px-3 py-1 rounded-full border border-teal-200 dark:border-teal-900/50 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-colors"
                >
                  Pay Outstanding
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Method *
              </label>
              <div className="flex flex-wrap gap-2">
                {['Cash', 'UPI', 'Bank Transfer', 'Cheque'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      method === m 
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' 
                        : 'border border-teal-200 text-teal-700 bg-teal-50/50 dark:border-teal-800/50 dark:text-teal-400 dark:bg-teal-900/10 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all shadow-inner"
              />
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Transaction ID, Cheque No, etc."
                className="w-full px-3 py-2.5 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all shadow-inner"
              />
            </div>

            {/* Error Display */}
            {error && (
              <p className="text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-lg border border-red-100 dark:border-red-500/20">
                ⚠️ {error}
              </p>
            )}

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-5 border-t border-white/10 bg-white/5 dark:bg-white/5 flex justify-end gap-3 transition-colors backdrop-blur-md">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] transition-all transform hover:scale-105"
            >
              Record Payment
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.getElementById("PopModal")
  );
};

export default PaymentModal;
