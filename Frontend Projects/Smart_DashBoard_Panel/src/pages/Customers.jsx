import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import CustomerDetail from "./CustomerDetail";
import AddCustomerModal from "../pages/PopUps/AddCustomerModal";
import useCustomerContext from "../context/CustomerContext";
import useOrderContext from "../context/OrderContext";
import { calculateOrderTotal } from "../utils/financeUtils";
import EditCustomerModal from "../pages/PopUps/EditCustomer";
const Customers = () => {
  // 2. Component State
  const { customers, addCustomer, deleteCustomer,updateCustomer } = useCustomerContext();
  const { orders } = useOrderContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("totalTransaction");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingFilterActive, setPendingFilterActive] = useState(false);
  const location = useLocation();

  useEffect(() => setCurrentPage(1), [searchTerm]);

  useEffect(() => {
    if (location.state?.filterStatus === 'Pending') {
      setPendingFilterActive(true);
      window.history.replaceState({}, '');
    }
    if (location.state?.openCustomerId) {
       const cust = customers.find(c => c.id === location.state.openCustomerId);
       if (cust) {
         setViewingCustomer(cust);
       }
       window.history.replaceState({}, '');
    }
  }, [location.state, customers]);
 
  // 3. THE HANDLER TO ADD THE DATA TO THE TABLE
  const handleAddCustomer = (newCustomerData) => {
    addCustomer(newCustomerData);
  };
  const handleEditCustomer = (customerToEdit) => {
    setSelectedCustomer(customerToEdit);
    setEditModalOpen(true);
  };
  // 3. The Search Filter Logic
  // This automatically updates the table every time you type a letter!
  const safeOrders = Array.isArray(orders) ? orders : [];

  const displayCustomers = pendingFilterActive
    ? customers.filter((c) => safeOrders.some(o => o.customerId === c.id && (o.status === "Pending" || o.status === "Partially Paid")))
    : customers;

  const filteredCustomers = displayCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const customerMetrics = useMemo(() => {
    return customers.reduce((acc, customer) => {
      const custOrders = safeOrders.filter(o => o.customerId === customer.id);
      const total = custOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
      acc[customer.id] = {
        totalTransaction: custOrders.length > 0 ? total : (parseFloat(String(customer.spend || "0").replace(/[^0-9.-]+/g, "")) || 0),
        totalOrders: custOrders.length,
        latestOrderAmount: custOrders.length > 0 ? calculateOrderTotal(custOrders[0]) : 0,
      };
      return acc;
    }, {});
  }, [customers, safeOrders]);

  const getLatestOrderTotal = (customer) => customerMetrics[customer.id]?.latestOrderAmount || 0;
  const getTotalOrders = (customer) => customerMetrics[customer.id]?.totalOrders || 0;
  const getTotalTransaction = (customer) => customerMetrics[customer.id]?.totalTransaction || 0;

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortOption === "totalTransaction") {
      return getTotalTransaction(b) - getTotalTransaction(a);
    } else if (sortOption === "lastOrderAmount") {
      return getLatestOrderTotal(b) - getLatestOrderTotal(a);
    } else if (sortOption === "totalOrders") {
      return getTotalOrders(b) - getTotalOrders(a);
    }
    return 0;
  });

  const handleSortTransaction = (e) => {
    setSortOption(e.target.value);
  };

  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleExportCustomersCSV = () => {
    if (customers.length === 0) {
      toast.error("No customers to export.");
      return;
    }
    const headers = ["ID", "Name", "Email", "Phone", "Address",
                      "Status", "Total Spend", "Date Added"];
    const rows = customers.map(c => [
      c.id, c.name, c.email, c.phone, `"${c.address}"`,
      c.status, getTotalTransaction(c).toFixed(2), `"${c.date}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };
  return (
    <>
      {/* If viewingCustomer is TRUE, show the Detail Page! */}
      {viewingCustomer ? (
        <CustomerDetail
          customer={viewingCustomer}
          onBack={() => setViewingCustomer(null)}
          defaultOrderId={location.state?.openOrderId}
          defaultOrderFilter={location.state?.filterStatus}
        />
      ) : (
        /* If viewingCustomer is FALSE, show the normal Table! */
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-6 lg:p-8">
          {/* DROP THE MODAL COMPONENT HERE (It stays invisible until isModalOpen is true) */}
          <AddCustomerModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddCustomer}
          />
          <EditCustomerModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            customer={selectedCustomer}
          />
          {/* --- Page Header --- */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors tracking-tight">Customers</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">
                Manage your client list and view their status.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportCustomersCSV}
                className="bg-white/10 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-slate-200 font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 hover:bg-white/20 dark:hover:bg-white/10"
              >
                <span>📥</span> Export CSV
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] hover:scale-105"
              >
                <span>➕</span> Add Customer
              </button>
            </div>
          </div>

          {/* Pending Filter Banner */}
          {pendingFilterActive && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-4 py-3 rounded-xl flex justify-between items-center animate-in slide-in-from-top-2">
              <span className="font-medium flex items-center gap-2">⚠️ Showing customers with pending orders</span>
              <button 
                onClick={() => setPendingFilterActive(false)}
                className="text-amber-600/50 hover:text-amber-600 dark:text-amber-400/50 dark:hover:text-amber-400 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* --- Table Toolbar (Search & Filter) --- */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row justify-between gap-4 transition-colors">
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by name, address, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all backdrop-blur-md shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
              />
            </div>

            {/* Mock Filter Button */}
            
          </div>

          {/* --- The Data Table --- */}
          <div className="glass-panel rounded-2xl overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                {/* Table Headers */}
                <thead>
                  <tr className="bg-white/10 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/10 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider transition-colors">
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4 hidden sm:table-cell">
                      Customer ID
                    </th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden md:table-cell">
                      <select name="sort-transaction" id="sort-transaction" value={sortOption} onChange={handleSortTransaction} className="bg-transparent font-semibold uppercase outline-none cursor-pointer dark:text-slate-300 dark:bg-[#0a0c14]">
                        <option value="totalTransaction">Total Transaction</option>
                        <option value="lastOrderAmount">Last Order Amount</option>
                        <option value="totalOrders">Total Orders</option>
                      </select>
                    </th>
                    <th className="px-6 py-4 hidden lg:table-cell">
                      Date Added
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group"
                      >
                        {/* User Info Column with Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shrink-0 transition-colors shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                              {customer.name.charAt(0)}
                            </div>
                            <div className="block">
                              <button
                                onClick={() => setViewingCustomer(customer)}
                                className="text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-pink-500 dark:hover:text-pink-400 text-left cursor-pointer transition-colors"
                              >
                                {customer.name}
                              </button>
                              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                                {customer.address}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                                {customer.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 hidden sm:table-cell font-mono transition-colors">
                          {customer.id}
                        </td>

                        {/* Dynamic Status Badge */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              customer.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                                : "bg-white/10 text-slate-600 border-white/20 dark:text-slate-400"
                            }`}
                          >
                            {customer.status === "Active" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse-glow"></span>
                            )}
                            {customer.status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium hidden md:table-cell transition-colors">
                          {sortOption === "totalTransaction" && (
                            <span className="text-purple-600 dark:text-purple-400 font-bold">₹{getTotalTransaction(customer).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          )}
                          {sortOption === "lastOrderAmount" && (
                            <span className="text-purple-600 dark:text-purple-400 font-bold">₹{getLatestOrderTotal(customer).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          )}
                          {sortOption === "totalOrders" && (
                            <span className="text-purple-600 dark:text-purple-400 font-bold">{getTotalOrders(customer)} Order{getTotalOrders(customer) !== 1 ? 's' : ''}</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 hidden lg:table-cell transition-colors">
                          {customer.date}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="text-purple-600 dark:text-purple-400 hover:text-pink-500 dark:hover:text-pink-400 text-sm font-medium transition-colors px-2 py-1 sm:px-3 sm:py-2 hover:bg-purple-500/10 rounded-xl"
                            title="Edit"
                          >
                            <span className="sm:hidden">✏️</span>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => deleteCustomer(customer)}
                            className="text-purple-600 dark:text-purple-400 hover:text-pink-500 dark:hover:text-pink-400 text-sm font-medium transition-colors px-2 py-1 sm:px-3 sm:py-2 hover:bg-purple-500/10 rounded-xl"
                            title="Delete"
                          >
                            <span className="sm:hidden">🗑️</span>
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* Empty State (If search yields no results) */
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <p className="text-slate-500 text-sm">
                          No customers found matching "{searchTerm}"
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="px-6 py-4 border-t border-slate-200/50 dark:border-white/10 bg-white/5 dark:bg-white/5 flex items-center justify-between transition-colors">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {paginatedCustomers.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  {sortedCustomers.length}
                </span>{" "}
                results
              </p>
              <div className="flex gap-2 sm:gap-4 items-center">
                <button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 sm:px-4 sm:py-2 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  Prev
                </button>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${currentPage === pageNum ? 'bg-purple-500 text-white font-bold shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && <span className="text-slate-500 flex items-end px-1">...</span>}
                </div>
                <span className="sm:hidden text-sm text-slate-500 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 sm:px-4 sm:py-2 text-sm border border-slate-200/50 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;
