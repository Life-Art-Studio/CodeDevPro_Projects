import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ProfilePanel from "../components/Profile";
import SettingsPanel from "../components/Settings";
import Footer from "../components/Footer";
import NotificationsPanel from "../components/NotificationsPanel";
import { useAuth } from "../context/AuthContext";
import StorageService from "../services/storageService";
import ViewModeBanner from "../components/ViewModeBanner";
import BottomNav from "../components/BottomNav";
import MoreMenuSheet from "../components/MoreMenuSheet";

const DashBoardLayout = () => {
  const { currentUser, viewAsUserId, setViewAsUserId } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  const viewAsUser = viewAsUserId ? StorageService.getAllUsers().find(u => u.id === viewAsUserId) : null;

  const menuItems = currentUser?.role === 'ADMIN' ? [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Sales", path: "/dashboard/sales" },
    ...(viewAsUserId ? [
      { name: "Customers", path: "/dashboard/customers" },
      { name: "Beats", path: "/dashboard/beats" },
      { name: "Map View", path: "/dashboard/map" },
      { name: "Supply Chain", path: "/dashboard/supply-chain" },
      { name: "Billing", path: "/dashboard/billing" }
    ] : [
      { name: "Users", path: "/dashboard/users" },
      { name: "Audit Trail", path: "/dashboard/audit-logs" },
      { name: "Supply Chain", path: "/dashboard/supply-chain" },
      { name: "Billing", path: "/dashboard/billing" }
    ])
  ] : [
    { name: "Customers", path: "/dashboard/customers" },
    { name: "Beats", path: "/dashboard/beats" },
    { name: "Map View", path: "/dashboard/map" },
    { name: "Catalogue", path: "/dashboard/catalogue" },
    { name: "Supply Chain", path: "/dashboard/supply-chain" }
  ];

  return (
    // Master Container: Full screen, prevents the whole browser window from scrolling
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden bg-transparent transition-colors duration-500">
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
        <NotificationsPanel />
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
  );
};

export default DashBoardLayout;