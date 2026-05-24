import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import useCustomerContext from "../context/CustomerContext";
import useOrderContext from "../context/OrderContext";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Sales", path: "/dashboard/sales", icon: "💰" },
    { name: "Customers", path: "/dashboard/customers", icon: "👥" },
    { name: "Beats", path: "/dashboard/beats", icon: "🗺️" },
    { name: "Map View", path: "/dashboard/map", icon: "📍" },
    { name: "Catalogue", path: "/dashboard/catalogue", icon: "📦" },
  ];

  const { isSidebarOpen, onOpenSidebarHandler } = useAuth();
  
  // --- Search Logic ---
  const { customers } = useCustomerContext();
  const { orders } = useOrderContext();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCustomers = searchQuery.trim() === "" ? [] : customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const filteredOrders = searchQuery.trim() === "" ? [] : orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.status.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const hasSearchResults = filteredCustomers.length > 0 || filteredOrders.length > 0;

  const handleResultClick = (type, item) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    onOpenSidebarHandler(); // Close the sidebar on mobile!
    if (type === 'customer') {
      navigate('/dashboard/customers', { state: { openCustomerId: item.id } });
    } else if (type === 'order') {
      navigate('/dashboard/customers', { state: { openCustomerId: item.customerId, openOrderId: item.id } });
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-40 md:hidden transition-opacity"
          onClick={onOpenSidebarHandler} 
        ></div>
      )}

      {/* The Sidebar Container - FLOATING AND GLASSMORPHIC */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 md:w-[240px] flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:m-4 md:h-[calc(100vh-2rem)] glass-panel md:rounded-3xl border-slate-200/50 dark:border-white/10`}
      >
        {/* Mobile Header inside Sidebar for closing */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-white/10 shrink-0 md:hidden">
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Menu
          </span>
          <button
            onClick={onOpenSidebarHandler}
            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-2 -mr-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* 🔥 Mobile Search Bar (Only visible on screens smaller than 'md') */}
        <div className="px-4 pt-6 pb-2 md:hidden relative" ref={searchRef}>
          <div className="flex items-center w-full bg-slate-100/50 dark:bg-slate-950/50 rounded-xl px-3 py-2.5 border border-slate-200/50 dark:border-white/10 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
            <span className="text-slate-500 mr-2 text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Search customers, orders..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim() !== "") setIsSearchOpen(true);
              }}
              className="bg-transparent w-full focus:outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-2"
              >✕</button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-4 right-4 mt-2 glass-modal rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up-fade border border-white/20">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                
                {filteredCustomers.length > 0 && (
                  <div className="p-2">
                    <h3 className="px-3 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customers</h3>
                    {filteredCustomers.map(customer => (
                      <div 
                        key={customer.id} 
                        onClick={() => handleResultClick('customer', customer)}
                        className="px-3 py-2 hover:bg-purple-50 dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                      >
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{customer.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{customer.phone || 'No phone'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {filteredOrders.length > 0 && (
                  <div className="p-2 border-t border-slate-200/50 dark:border-white/10">
                    <h3 className="px-3 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Orders</h3>
                    {filteredOrders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => handleResultClick('order', order)}
                        className="px-3 py-2 hover:bg-purple-50 dark:hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">{order.id}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            order.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-600 border-red-500/30 dark:text-red-400' :
                            order.status === 'Partially Paid' ? 'bg-teal-500/10 text-teal-600 border-teal-500/30 dark:text-teal-400' :
                            'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400'
                          }`}>{order.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{order.date}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!hasSearchResults && (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No results for "{searchQuery}"
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links Area */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={onOpenSidebarHandler}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium group relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600/90 to-pink-500/90 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] border border-white/20"
                    : "hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-300/50 dark:hover:border-slate-700/50 hover:shadow-sm"
                }`
              }
            >
              <span className={`text-xl transition-transform duration-200 group-hover:scale-110`}>
                {item.icon}
              </span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Area */}
        <div className="p-4 border-t border-slate-200/50 dark:border-white/10 shrink-0">
          <p className="px-4 py-2 text-xs text-slate-500 font-medium tracking-wider text-center">
            SYSTEM v2.0
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;