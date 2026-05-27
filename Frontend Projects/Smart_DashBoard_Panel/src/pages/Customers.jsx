import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import CustomerDetail from "./CustomerDetail";
import AddCustomerModal from "../pages/PopUps/AddCustomerModal";
import useCustomerContext from "../context/CustomerContext";
import useOrderContext from "../context/OrderContext";
import { calculateOrderTotal } from "../utils/financeUtils";
import EditCustomerModal from "../pages/PopUps/EditCustomer";
import { useAuth } from "../context/AuthContext";
import ResponsiveTable from "../components/ui/ResponsiveTable";
import CustomSelect from "../components/ui/CustomSelect";
import { Search, Download, Plus, AlertCircle, X, Edit2, Trash2, Users } from 'lucide-react';

const Customers = () => {
  const { currentUser } = useAuth();
  const { customers, addCustomer, deleteCustomer, updateCustomer } = useCustomerContext();
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
  const [inactiveFilterActive, setInactiveFilterActive] = useState(false);
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
 
  const handleAddCustomer = (newCustomerData) => {
    addCustomer(newCustomerData);
  };
  
  const handleEditCustomer = (customerToEdit) => {
    setSelectedCustomer(customerToEdit);
    setEditModalOpen(true);
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  const displayCustomers = pendingFilterActive
    ? customers.filter((c) => safeOrders.some(o => o.customerId === c.id && (o.status === "Pending" || o.status === "Partially Paid")))
    : inactiveFilterActive 
    ? customers.filter(c => {
        const custOrders = safeOrders.filter(o => o.customerId === c.id);
        if (custOrders.length === 0) return true;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return !custOrders.some(o => new Date(o.date) >= thirtyDaysAgo);
      })
    : customers;

  const filteredCustomers = useMemo(() => {
    return displayCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [displayCustomers, searchTerm]);

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

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      if (sortOption === "totalTransaction") {
        return getTotalTransaction(b) - getTotalTransaction(a);
      } else if (sortOption === "lastOrderAmount") {
        return getLatestOrderTotal(b) - getLatestOrderTotal(a);
      } else if (sortOption === "totalOrders") {
        return getTotalOrders(b) - getTotalOrders(a);
      }
      return 0;
    });
  }, [filteredCustomers, sortOption, customerMetrics]);

  const handleSortTransaction = (e) => {
    setSortOption(e.target.value);
  };

  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = useMemo(() => {
    return sortedCustomers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [sortedCustomers, currentPage]);

  const handleExportCustomersCSV = () => {
    if (customers.length === 0) {
      toast.error("No customers to export.");
      return;
    }
    const headers = ["ID", "Name", "Email", "Phone", "Address", "Status", "Total Spend", "Date Added"];
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

  const renderSortSelect = () => (
    <div onClick={(e) => e.stopPropagation()}>
      <CustomSelect 
        value={sortOption} 
        onChange={setSortOption}
        className="bg-transparent font-bold uppercase outline-none cursor-pointer text-zinc-500 dark:text-zinc-400 flex items-center justify-between min-w-max transition-colors text-[10px] tracking-wider"
        options={[
          { value: 'totalTransaction', label: 'TOTAL TRANSACTION' },
          { value: 'lastOrderAmount', label: 'LAST ORDER AMOUNT' },
          { value: 'totalOrders', label: 'TOTAL ORDERS' }
        ]}
      />
    </div>
  );

  const getSortValueDisplay = (customer) => {
    if (sortOption === "totalTransaction") {
      return <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{getTotalTransaction(customer).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
    } else if (sortOption === "lastOrderAmount") {
      return <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{getLatestOrderTotal(customer).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
    } else if (sortOption === "totalOrders") {
      return <span className="font-bold text-zinc-900 dark:text-zinc-100">{getTotalOrders(customer)} Order{getTotalOrders(customer) !== 1 ? 's' : ''}</span>;
    }
    return null;
  };

  const columns = [
    { key: "customer", label: "Customer" },
    { key: "idStr", label: "Customer ID", hiddenOnMobile: true },
    { key: "status", label: "Status" },
    { key: "sortable", label: renderSortSelect(), hiddenOnMobile: true },
    { key: "date", label: "Date Added", hiddenOnMobile: true },
  ];
  if (currentUser?.role !== 'ADMIN') {
    columns.push({ key: "actions", label: "Actions", align: "right" });
  }

  const rowData = paginatedCustomers.map(customer => {
    return {
      id: customer.id,
      customer: (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingCustomer(customer)}>
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200 dark:border-indigo-500/30">
            {customer.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
              {customer.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {customer.address}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {customer.phone}
            </p>
          </div>
        </div>
      ),
      idStr: <span className="font-mono text-zinc-600 dark:text-zinc-400 text-xs">{customer.id}</span>,
      status: (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
          customer.status === "Active"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
        }`}>
          {customer.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>}
          {customer.status}
        </span>
      ),
      sortable: getSortValueDisplay(customer),
      date: <span className="text-sm text-zinc-500 dark:text-zinc-400">{customer.date}</span>,
      actions: (
        <div className="flex justify-end items-center gap-1 lg:gap-2">
          {currentUser?.role !== 'ADMIN' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handleEditCustomer(customer); }}
                className="p-1 lg:p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-lg transition-colors min-h-[32px] min-w-[32px] lg:min-h-[44px] lg:min-w-[44px] flex items-center justify-center"
                title="Edit"
              >
                <Edit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteCustomer(customer); }}
                className="p-1 lg:p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors min-h-[32px] min-w-[32px] lg:min-h-[44px] lg:min-w-[44px] flex items-center justify-center"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
            </>
          )}
        </div>
      )
    };
  });

  const renderMobileCard = (row, index) => {
    const customer = paginatedCustomers[index];
    return (
      <div key={row.id} className="bg-white dark:bg-[#1a1d27] p-3 lg:p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-2 lg:space-y-3 cursor-pointer" onClick={() => setViewingCustomer(customer)}>
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-2.5 lg:gap-3">
              <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs lg:text-sm shrink-0 border border-indigo-200 dark:border-indigo-500/30">
                {customer.name.charAt(0)}
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm lg:text-base">{customer.name}</span>
                <p className="text-[10px] lg:text-xs text-zinc-500">{customer.phone}</p>
              </div>
           </div>
           <div className="scale-90 origin-top-right lg:scale-100">{row.status}</div>
        </div>
        
        <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-2 lg:p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
           <div>
             <p className="text-[9px] lg:text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5 lg:mb-1">Total Transaction</p>
             <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm lg:text-base tabular-nums leading-none mt-1">
               ₹{getTotalTransaction(customer).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </p>
           </div>
           <div onClick={(e) => e.stopPropagation()}>{row.actions}</div>
        </div>
      </div>
    );
  };

  return (
    <>
      {viewingCustomer ? (
        <CustomerDetail
          customer={viewingCustomer}
          onBack={() => setViewingCustomer(null)}
          defaultOrderId={location.state?.openOrderId}
          defaultOrderFilter={location.state?.filterStatus}
        />
      ) : (
        <div className="flex-1 min-h-0 flex flex-col z-0">
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] font-sans transition-colors animate-in fade-in duration-300">
            <div className="max-w-7xl mx-auto min-h-full flex flex-col gap-4 lg:gap-6 pb-20 sm:pb-6">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Customers</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                Manage your client list and view their status.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                onClick={() => {
                  setInactiveFilterActive(!inactiveFilterActive);
                  setPendingFilterActive(false);
                }}
                className={`w-full sm:w-auto justify-center border font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 min-h-[44px] ${inactiveFilterActive ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30' : 'bg-white dark:bg-[#1a1d27] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
              >
                <AlertCircle className="w-4 h-4" /> <span className="text-sm">Inactive (30d)</span>
              </button>
              <button
                onClick={handleExportCustomersCSV}
                className="w-full sm:w-auto justify-center bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 min-h-[44px]"
              >
                <Download className="w-4 h-4" /> <span className="text-sm">Export</span>
              </button>
              {currentUser?.role !== 'ADMIN' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto justify-center bg-indigo-600 text-white font-medium py-2 px-4 rounded-xl transition-all flex items-center gap-2 hover:bg-indigo-700 shadow-sm min-h-[44px]"
                >
                  <Plus className="w-4 h-4" /> <span className="text-sm">Add Customer</span>
                </button>
              )}
            </div>
          </div>

          {/* Pending Filter Banner */}
          {pendingFilterActive && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl flex justify-between items-center animate-in slide-in-from-top-2">
              <span className="text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Showing customers with pending orders</span>
              <button 
                onClick={() => setPendingFilterActive(false)}
                className="text-amber-600/50 hover:text-amber-600 dark:text-amber-400/50 dark:hover:text-amber-400 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* --- Table Toolbar (Search) --- */}
          <div className="bg-white dark:bg-[#1a1d27] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row justify-between gap-4 transition-colors">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="search"
                name="customer_search"
                autoComplete="off"
                spellCheck="false"
                readOnly
                onFocus={(e) => e.target.removeAttribute('readonly')}
                placeholder="Search by name, address, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-colors min-h-[44px]"
              />
            </div>
          </div>

          {/* --- The Data Table --- */}
          <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
            {paginatedCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <ResponsiveTable 
                  columns={columns}
                  data={rowData}
                  renderMobileCard={renderMobileCard}
                />
              </div>
            ) : (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  No customers found matching "{searchTerm}"
                </p>
              </div>
            )}

            {/* Pagination Footer */}
            {sortedCustomers.length > 0 && (
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#1a1d27] flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing <span className="font-medium text-zinc-900 dark:text-zinc-100">{paginatedCustomers.length}</span> of <span className="font-medium text-zinc-900 dark:text-zinc-100">{sortedCustomers.length}</span> results
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors min-h-[44px] font-medium"
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
                          className={`w-10 h-10 flex items-center justify-center text-sm rounded-lg transition-colors font-medium min-h-[40px] min-w-[40px] ${currentPage === pageNum ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && <span className="text-zinc-400 flex items-end px-1 pb-2">...</span>}
                  </div>
                  <span className="sm:hidden text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors min-h-[44px] font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;
