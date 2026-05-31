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
  const [currentUser, setCurrentUser] = useState(() => {
    return StorageService.getCurrentUser();
  });
  
  // 1.5 View As User State (For Admins)
  const [viewAsUserId, setViewAsUserIdState] = useState(() => localStorage.getItem('viewAsUserId') || null);

  const setViewAsUserId = (userId) => {
    if (userId) {
      localStorage.setItem('viewAsUserId', userId);
    } else {
      localStorage.removeItem('viewAsUserId');
    }
    setViewAsUserIdState(userId);
  };

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
      setCurrentUser(StorageService.getCurrentUser());
      return true;
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      return false;
    }
  };

  const handleSignUp = (signUpData) => {
    const isSuccess = AuthService.signUp(signUpData);
    if (isSuccess) {
      setIsLoggedIn(true);
      setCurrentUser(StorageService.getCurrentUser());
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
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
              setCurrentUser(null);
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

  const updateCurrentUser = (updatedData) => {
    const updated = StorageService.updateCurrentUser(updatedData);
    if (updated) {
      setCurrentUser(updated);
    }
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
        currentUser,
        viewAsUserId,
        setViewAsUserId,
        handleLogin,
        handleLogout,
        handleSignUp,
        handleResetData,
        handleDeleteAccount,
        updateCurrentUser,
        
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