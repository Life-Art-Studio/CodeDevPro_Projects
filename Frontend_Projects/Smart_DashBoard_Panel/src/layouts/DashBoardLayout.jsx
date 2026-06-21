import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfilePanel from "../components/Profile";
import SettingsPanel from "../components/Settings";
import Footer from "../components/Footer";
import ToastContainer from "../components/ToastContainer";
import { useAuth } from "../context/AuthContext";
import StorageService from "../services/storageService";
import ViewModeBanner from "../components/ViewModeBanner";
import BottomNav from "../components/BottomNav";
import MoreMenuSheet from "../components/MoreMenuSheet";
import IdentityBanner from "../components/IdentityBanner";

const DashBoardLayout = () => {
  const { 
    currentUser, 
    isSidebarOpen, 
    onOpenSidebarHandler, 
    viewAsUserId, 
    setViewAsUserId,
    users 
  } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const viewAsUser = viewAsUserId ? users.find(u => u.id === viewAsUserId) : null;

  const getMenuItems = () => {
    switch (currentUser?.role) {
      case 'ADMIN':
        return [
          { name: "Dashboard", path: "/dashboard" },
          { name: "Sales", path: "/dashboard/sales" },
          { name: "Users", path: "/dashboard/users" },
          { name: "Customers", path: "/dashboard/customers" },
          { name: "Beats", path: "/dashboard/beats" },
          { name: "Map View", path: "/dashboard/map" },
          { name: "Catalogue", path: "/dashboard/catalogue" },
          { name: "Supply Chain", path: "/dashboard/supply-chain" },
          { name: "Audit Trail", path: "/dashboard/audit-logs" },
          { name: "Billing", path: "/dashboard/billing" },
          { name: "Company Settings", path: "/dashboard/settings" }
        ];
      case 'SUPER_STOCKIST':
        return [
          { name: "Dashboard", path: "/dashboard" },
          { name: "Sales", path: "/dashboard/sales" },
          { name: "Users", path: "/dashboard/users" },
          { name: "Customers", path: "/dashboard/customers" },
          { name: "Beats", path: "/dashboard/beats" },
          { name: "Map View", path: "/dashboard/map" },
          { name: "Catalogue", path: "/dashboard/catalogue" },
          { name: "Supply Chain", path: "/dashboard/supply-chain" },
          { name: "Billing", path: "/dashboard/billing" }
        ];
      case 'DISTRIBUTOR':
        return [
          { name: "Sales", path: "/dashboard/sales" },
          { name: "Users", path: "/dashboard/users" },
          { name: "Customers", path: "/dashboard/customers" },
          { name: "Catalogue", path: "/dashboard/catalogue" },
          { name: "Supply Chain", path: "/dashboard/supply-chain" },
          { name: "Billing", path: "/dashboard/billing" }
        ];
      case 'SALES':
        return [
          { name: "Customers", path: "/dashboard/customers" },
          { name: "Beats", path: "/dashboard/beats" },
          { name: "Map View", path: "/dashboard/map" },
          { name: "Catalogue", path: "/dashboard/catalogue" }
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    // Master Container: Full screen, prevents the whole browser window from scrolling
    <div className="h-[100dvh] w-full flex flex-col bg-transparent transition-colors duration-500">
      
      {/* 1. IDENTITY BANNER (Always on top) */}
      <IdentityBanner />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        
        {/* Sidebar Wrapper (Hidden on mobile) */}
        <div className="shrink-0 z-30 hidden md:block">
          <Sidebar menuItems={menuItems} />
        </div>

      <div className="absolute z-60 right-0">
        <ProfilePanel />
      </div>
      <div className="absolute z-60 right-0">
        <SettingsPanel />
      </div>
      <div className="absolute z-60 right-0">
        <ToastContainer />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col w-full min-w-0 bg-transparent relative min-h-0 z-0">
        
        {/* View Mode Banner */}
        {viewAsUserId && viewAsUser && (
          <ViewModeBanner viewAsUser={viewAsUser} />
        )}

        {/* Topbar */}
        {!viewAsUserId && (
          <div className="h-16 shrink-0 z-30">
            <Topbar />
          </div>
        )}

        {/* Content Canvas */}
        <div className="flex-1 w-full relative flex flex-col min-h-0 z-0">
          <main className="flex-1 w-full relative pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0 min-h-0 flex flex-col z-0">
            <Outlet />
          </main>
          {/* Footer */}
          <Footer />
        </div>
      </div>

        <BottomNav onMoreClick={() => setIsMoreMenuOpen(true)} menuItems={menuItems} />
        <MoreMenuSheet isOpen={isMoreMenuOpen} onClose={() => setIsMoreMenuOpen(false)} menuItems={menuItems} />
      </div>
    </div>
  );
};

export default DashBoardLayout;