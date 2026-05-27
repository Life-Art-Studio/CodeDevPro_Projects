import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import StorageService from "../services/storageService";
const ProfilePanel = () => {
  const { isProfileOpen, onOpenProfileHandler, handleLogout } = useAuth();

  // Safely grab user data for the display
  const userData = StorageService.getCurrentUser() ?? { name: "Admin User", email: "admin@test.com" };
  const userInitial = userData.name ? userData.name.charAt(0).toUpperCase() : "U";

  const [updateName, setUpdateName] = useState(userData.name || "");
  const [updateEmail, setUpdateEmail] = useState(userData.email || "");
  const [updatePassword, setUpdatePassword] = useState("");

  const save = () => {
    if (!updateName || !updateEmail) {
      alert("Name and Email are required");
      return;
    }
    
    // Check if email is being changed and if it already exists
    if (updateEmail !== userData.email) {
      const existing = StorageService.getUserByEmail(updateEmail);
      if (existing) {
        alert("Email already in use by another account.");
        return;
      }
    }

    const updatedData = { name: updateName, email: updateEmail };
    if (updatePassword.trim() !== "") {
      updatedData.password = updatePassword;
    }
    
    StorageService.updateCurrentUser(updatedData);
    alert("Profile updated successfully!");
    onOpenProfileHandler();
  }

  return (
    <>
      {/* 1. The Glass Backdrop Overlay */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 bg-[#0a0c14]/80 backdrop-blur-md z-50 transition-opacity duration-300"
          onClick={onOpenProfileHandler}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 right-0 z-70 w-full sm:w-96 bg-white dark:bg-[#1a1d27] shadow-sm border-y-0 border-r-0 border-l border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isProfileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        
        {/* Panel Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1d27] shrink-0 backdrop-blur-md transition-colors">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 transition-colors tracking-tight">My Profile</h2>
          <button
            onClick={onOpenProfileHandler}
            className="text-zinc-400 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Panel Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative z-0">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center mb-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -z-10"></div>
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center text-4xl font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] border-2 border-white/20 mb-4 transition-transform hover:scale-105 duration-300">
              {userInitial}
            </div>
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 transition-colors tracking-tight">{userData.name}</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm transition-colors">{userData.email}</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              Active Member
            </span>
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800 mb-6 transition-colors" />

          {/* Form Settings (Visual only for now) */}
          <div className="space-y-4 relative z-10">
            <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2 transition-colors">Personal Information</h4>
            
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">👤</span>
                <input type="text" value={updateName} onChange={(e)=>setUpdateName(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">✉️</span>
                <input type="email" value={updateEmail} onChange={(e) => setUpdateEmail(e.target.value)} className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 transition-colors">New Password (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">🔒</span>
                <input type="password" value={updatePassword} onChange={(e) => setUpdatePassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all shadow-inner focus:shadow-[0_0_15px_rgba(168,85,247,0.2)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#1a1d27] shrink-0 backdrop-blur-md transition-colors relative z-10">
          <button onClick={save} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] text-white font-semibold py-2.5 rounded-xl transition-all transform hover:scale-[1.02] shadow-sm mb-3">
            Save Changes
          </button>
          
          <button 
            onClick={() => {
              onOpenProfileHandler(); // Close the panel
              handleLogout();         // Log them out
            }}
            className="w-full bg-white dark:bg-zinc-900 hover:bg-red-500/10 text-red-600 dark:text-red-400 font-semibold py-2.5 rounded-xl transition-all border border-red-500/20 hover:border-red-500/50 shadow-sm flex justify-center items-center gap-2 transform hover:scale-[1.02]"
          >
            <span className="text-lg">🚪</span> Sign Out
          </button>
        </div>

      </div>
    </>
  );
};

export default ProfilePanel;