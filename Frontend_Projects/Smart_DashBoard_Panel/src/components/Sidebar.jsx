import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import useGlobalSearch from "../hooks/useGlobalSearch";
import { useCompanyBranding } from "../hooks/useCompanyBranding";
import { LayoutDashboard, Users, Map, Package, BarChart, FileText, Wallet, PackageSearch, X, Search, Truck, Settings } from "lucide-react";

const Sidebar = ({ menuItems }) => {
  const { isSidebarOpen, onOpenSidebarHandler } = useAuth();
  const { companyName, logoUrl } = useCompanyBranding();
  
  // --- Search Logic ---
  const { searchQuery, setSearchQuery, filteredCustomers: allFilteredCustomers, filteredOrders: allFilteredOrders } = useGlobalSearch();
  const navigate = useNavigate();

  const filteredCustomers = allFilteredCustomers.slice(0, 5);
  const filteredOrders = allFilteredOrders.slice(0, 5);
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


  const hasSearchResults = filteredCustomers.length > 0 || filteredOrders.length > 0;

  const handleResultClick = (type, item) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    onOpenSidebarHandler(); 
    if (type === 'customer') {
      navigate('/dashboard/customers', { state: { openCustomerId: item.id } });
    } else if (type === 'order') {
      navigate('/dashboard/customers', { state: { openCustomerId: item.customerId, openOrderId: item.id } });
    }
  };

  const getIcon = (name) => {
    switch(name) {
      case 'Dashboard': return <LayoutDashboard className="w-5 h-5" />;
      case 'Sales': return <BarChart className="w-5 h-5" />;
      case 'Customers': return <Users className="w-5 h-5" />;
      case 'Beats': return <Map className="w-5 h-5" />;
      case 'Map View': return <PackageSearch className="w-5 h-5" />;
      case 'Catalogue': return <Package className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'Audit Trail': return <FileText className="w-5 h-5" />;
      case 'Supply Chain': return <Truck className="w-5 h-5" />;
      case 'Billing': return <Wallet className="w-5 h-5" />;
      case 'Company Settings': return <Settings className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onOpenSidebarHandler} 
        ></div>
      )}

      {/* The Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white dark:bg-[#1a1d27] border-r border-zinc-200 dark:border-zinc-800 shadow-[0_4px_12px_rgba(0,0,0,0.08)] md:shadow-none h-full`}
      >
        {/* Mobile Header inside Sidebar for closing */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0 md:hidden">
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
            Menu
          </span>
          <button
            onClick={onOpenSidebarHandler}
            className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors p-2 -mr-2 min-h-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branding Desktop */}
        <div className="h-16 hidden md:flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
           <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 overflow-hidden">
             {logoUrl ? (
               <img src={logoUrl} alt={companyName} className="w-8 h-8 object-contain shrink-0 rounded-md bg-white p-0.5" />
             ) : (
               <Package className="w-6 h-6 shrink-0" />
             )}
             <span className="text-xl font-bold font-serif text-zinc-900 dark:text-white truncate" title={companyName}>{companyName}</span>
           </div>
        </div>

        {/* 🔥 Mobile Search Bar (Only visible on screens smaller than 'md') */}
        <div className="px-4 pt-6 pb-2 md:hidden relative" ref={searchRef}>
          <div className="flex items-center w-full bg-zinc-50 dark:bg-zinc-900 rounded-lg px-3 min-h-[44px] border border-zinc-200 dark:border-zinc-800 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 transition-all">
            <Search className="w-4 h-4 text-zinc-500 mr-2" />
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
              className="bg-transparent w-full focus:outline-none text-base md:text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 h-full py-2"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setIsSearchOpen(false);
                }} 
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 ml-2 min-h-[44px] px-2"
              ><X className="w-4 h-4" /></button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-zinc-900 rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] overflow-hidden z-50 animate-slide-up-fade border border-zinc-200 dark:border-zinc-800">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                
                {filteredCustomers.length > 0 && (
                  <div className="p-2">
                     <h3 className="px-3 py-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customers</h3>
                    {filteredCustomers.map(customer => (
                      <div 
                        key={customer.id} 
                        onClick={() => handleResultClick('customer', customer)}
                        className="px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                      >
                         <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{customer.name}</p>
                         <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{customer.phone || 'No phone'}</p>
                      </div>
                    ))}
                  </div>
                )}

                {filteredOrders.length > 0 && (
                  <div className="p-2 border-t border-zinc-200 dark:border-zinc-800">
                    <h3 className="px-3 py-1 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Orders</h3>
                    {filteredOrders.map(order => (
                      <div 
                        key={order.id} 
                        onClick={() => handleResultClick('order', order)}
                        className="px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                      >
                         <div className="flex justify-between items-center">
                           <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{order.id}</p>
                           <span className="text-[10px] px-2 py-0.5 rounded border bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300">{order.status}</span>
                         </div>
                         <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{order.date}</p>
                      </div>
                    ))}
                  </div>
                )}

                {!hasSearchResults && (
                  <div className="p-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                    No results for "{searchQuery}"
                  </div>
                )}
                
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links Area */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems?.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              onClick={onOpenSidebarHandler}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium min-h-[44px] ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`
              }
            >
              {getIcon(item.name)}
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Area */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <p className="px-4 py-2 text-xs text-zinc-500 font-medium tracking-wider text-center">
            SYSTEM v2.0
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;