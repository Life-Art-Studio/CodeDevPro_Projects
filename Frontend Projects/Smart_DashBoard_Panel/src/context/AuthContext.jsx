import React, { createContext, useContext, useState } from "react";
import AuthService from "../services/authService";
import StorageService from "../services/storageService";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  
  // 1. Initialize Auth State using the Storage Service!
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return StorageService.getLoginStatus();
  });

  // 2. UI States (No changes needed here)
  const [isSidebarOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsOpenProfile] = useState(false);
  const [isSettingsOpen, setIsOpenSettings] = useState(false);
  const [isNotificationsOpen, setIsOpenNotifications] = useState(false);

  // --- AUTHENTICATION HANDLERS --- //

  const handleLogin = (loginData) => {
    // Let the Service do the heavy lifting!
    const isSuccess = AuthService.login(loginData.email, loginData.password);
    if (isSuccess) {
      setIsLoggedIn(true);
      return true;
    } else {
      setIsLoggedIn(false);
      return false;
    }
  };

  const handleSignUp = (signUpData) => {
    AuthService.signUp(signUpData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
  };

  const handleDeleteAccount = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">🚨 CRITICAL WARNING: Are you sure you want to delete your account? You will lose all access.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              AuthService.deleteAccount(); // Wipe the data
              setIsOpenSettings(false);    // Close the panel
              setIsLoggedIn(false);        // Kick them out
              toast.success("Account deleted.");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          >Delete Account</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const handleResetData = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">⚠️ Are you sure you want to reset all dashboard data? This cannot be undone.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              AuthService.resetDashboardData();
              toast.success("Dashboard data has been reset to zero.");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          >Reset Data</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  // --- UI TOGGLE HANDLERS --- //

  const onOpenSidebarHandler = () => setIsOpen(!isSidebarOpen);
  const onOpenProfileHandler = () => setIsOpenProfile(!isProfileOpen);
  const onOpenSettingsHandler = () => setIsOpenSettings(!isSettingsOpen);
  const onOpenNotificationsHandler = () => setIsOpenNotifications(!isNotificationsOpen);

  return (
    <AuthContext.Provider
      value={{
        // Auth State & Actions
        isLoggedIn,
        handleLogin,
        handleLogout,
        handleSignUp,
        handleResetData,
        handleDeleteAccount,
        
        // UI State & Actions
        isSidebarOpen,
        onOpenSidebarHandler,
        isProfileOpen,
        onOpenProfileHandler,
        isSettingsOpen,
        onOpenSettingsHandler,
        isNotificationsOpen,
        onOpenNotificationsHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);