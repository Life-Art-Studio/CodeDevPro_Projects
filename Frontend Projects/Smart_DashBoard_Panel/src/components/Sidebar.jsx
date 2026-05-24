import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Sales", path: "/dashboard/sales", icon: "💰" },
    { name: "Customers", path: "/dashboard/customers", icon: "👥" },
    { name: "Beats", path: "/dashboard/beats", icon: "🗺️" },
    { name: "Map View", path: "/dashboard/map", icon: "📍" },
  ];

  const { isSidebarOpen, onOpenSidebarHandler } = useAuth();

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

        {/* 🔥 NEW: Mobile Search Bar (Only visible on screens smaller than 'md') */}
        <div className="px-4 pt-6 pb-2 md:hidden">
          <div className="flex items-center w-full bg-slate-100/50 dark:bg-slate-950/50 rounded-xl px-3 py-2.5 border border-slate-200/50 dark:border-white/10 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
            <span className="text-slate-500 mr-2 text-sm">🔍</span>
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent w-full focus:outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-500"
            />
          </div>
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