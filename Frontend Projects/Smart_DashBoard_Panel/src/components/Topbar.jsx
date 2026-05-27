import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useCustomerContext from "../context/CustomerContext";
import useOrderContext from "../context/OrderContext";
import { useNavigate } from "react-router-dom";
import StorageService from '../services/storageService';
import { useVisitContext } from "../context/VisitContext";
import { useBeatContext } from "../context/BeatContext";
import { getOrderOutstanding } from "../utils/financeUtils";

const Topbar = () => { // Make sure to accept the prop!
  const { handleLogout,onOpenSidebarHandler,onOpenProfileHandler,onOpenSettingsHandler, onOpenNotificationsHandler} = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { customers } = useCustomerContext();
  const { orders } = useOrderContext();
  const { visits } = useVisitContext();
  const { beats } = useBeatContext();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Safely get user data
  const userData = StorageService.getCurrentUser() ?? { name: "User", email: "" };
  // Get the first initial for the avatar
  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : "U";

  const profileHandler = ()=>{
    
    setIsDropdownOpen(false)
    onOpenProfileHandler()
    
  }

    const settingsHandler = () =>{
    
    setIsDropdownOpen(false)
    onOpenSettingsHandler()
    
  }

  // Filter logic for search
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

  // --- Compute Notifications Count ---
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  let notifCount = 0;

  orders.forEach(order => {
    if (order.status === 'Pending' || order.status === 'Partially Paid') {
      const diffDays = Math.floor((today - new Date(order.date)) / (1000 * 60 * 60 * 24));
      if (diffDays > 7 && getOrderOutstanding(order) > 0) notifCount++;
    }
  });

  visits.forEach(visit => {
    if (visit.status === 'Scheduled' && visit.visitDate === todayStr) notifCount++;
    if (visit.status === 'Missed') {
      const diffDays = Math.floor((today - new Date(visit.visitDate)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) notifCount++;
    }
  });

  customers.forEach(customer => {
    const isAssigned = beats.some(b => b.assignedCustomers?.includes(customer.id));
    if (!isAssigned) notifCount++;
    if (!customer.lat || !customer.lng) notifCount++;
    const outstanding = orders.filter(o => o.customerId === customer.id).reduce((sum, o) => sum + getOrderOutstanding(o), 0);
    if (outstanding > 50000) notifCount++;
  });

  const handleResultClick = (type, item) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (type === 'customer') {
      navigate('/dashboard/customers', { state: { openCustomerId: item.id } });
    } else if (type === 'order') {
      navigate('/dashboard/customers', { state: { openCustomerId: item.customerId, openOrderId: item.id } });
    }
  };

  return (
    <div className="h-14 md:h-16 w-full bg-white dark:bg-[#0a0c14] backdrop-blur-2xl flex items-center justify-between px-4 md:px-6 border-b border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10 transition-colors duration-500">
      
      {/* LEFT SIDE: Hamburger, Logo, Search */}
      <div className="flex items-center gap-4 flex-1">
        


        {/* Brand Logo (Visible on all screens) */}
        <div className="flex items-center shrink-0">
          <h1 className="text-zinc-800 dark:text-zinc-100 text-xl font-extrabold tracking-tight transition-colors duration-500">
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">SaaS</span>
          </h1>
        </div>

        {/* Search Input (Hidden on mobile) */}
        <div className="hidden sm:flex relative w-full max-w-md ml-4" ref={searchRef}>
          <div className="flex items-center w-full bg-white dark:bg-white hover:bg-white dark:hover:bg-white rounded-full px-4 py-2 transition-all duration-300 border border-zinc-200 dark:border-zinc-800 focus-within:border-purple-500 focus-within:bg-white dark:focus-within:bg-[#0a0c14]/80 focus-within:ring-2 focus-within:ring-purple-500/20 dark:focus-within:ring-purple-500/30 focus-within:shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <span className="text-zinc-400 mr-2 text-sm">🔍</span>
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
              className="bg-transparent w-full focus:outline-none text-sm text-zinc-700 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }} 
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ml-2"
              >✕</button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1d27] shadow-xl rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up-fade border border-white/20">
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                
                {filteredCustomers.length > 0 && (
                  <div className="p-2">
                    <h3 className="px-3 py-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customers</h3>
                    {filteredCustomers.map(customer => (
                      <div 
                        key={customer.id} 
                        onClick={() => handleResultClick('customer', customer)}
                        className="px-3 py-2 hover:bg-purple-50 dark:hover:bg-white rounded-xl cursor-pointer transition-colors"
                      >
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{customer.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{customer.email || 'No email'} • {customer.phone || 'No phone'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {filteredOrders.length > 0 && (
                  <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="px-3 py-1 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Orders</h3>
                    {filteredOrders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => handleResultClick('order', order)}
                        className="px-3 py-2 hover:bg-purple-50 dark:hover:bg-white rounded-xl cursor-pointer transition-colors"
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
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{order.date}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!hasSearchResults && (
                  <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                    No results found for "{searchQuery}"
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className="relative text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white"
        >
          {isDarkMode ? "🌙" : "☀️"}
        </button>

        {/* Notifications Bell */}
        <button 
          onClick={onOpenNotificationsHandler}
          className="relative text-zinc-500 hover:text-purple-600 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white"
        >
          🔔
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-[#0a0c14]">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>


        <div className="h-6 w-px bg-zinc-200/50 dark:bg-white hidden sm:block"></div>

        {/* User Profile Trigger Area */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-white p-1 sm:p-2 rounded-full transition-colors select-none"
          >
            <div className="flex flex-col text-right hidden md:block">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 block">{userData.name}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block truncate w-32">{userData.email}</span>
            </div>
            
            {/* Avatar Circle */}
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold shadow-[0_0_10px_rgba(236,72,153,0.3)] border border-white/20">
              {userInitial}
            </div>
            
            {/* Tiny arrow */}
            <span className={`text-[10px] text-zinc-400 transition-transform duration-300 hidden sm:block ${isDropdownOpen ? "rotate-180" : ""}`}>
              ▼
            </span>
          </div>

          {/* Dropdown Card */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1d27] shadow-xl rounded-2xl shadow-2xl py-2 z-50 animate-slide-up-fade">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 md:hidden bg-white dark:bg-[#0a0c14]">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{userData.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{userData.email}</p>
              </div>

              <div className="p-2 space-y-1">
                <button 
                  onClick={profileHandler}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="text-lg opacity-70" >👤</span> My Profile
                </button>
                <button 
                  onClick={settingsHandler}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-white rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="text-lg opacity-70">⚙️</span> Settings
                </button>
              </div>
              
              <hr className="my-1 border-zinc-200 dark:border-zinc-800 mx-2" />

              <div className="p-2">
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-xl transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">🚪</span> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;