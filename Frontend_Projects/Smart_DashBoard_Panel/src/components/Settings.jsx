import { useAuth } from "../context/AuthContext";

const SettingsPanel = () => {
  const { isSettingsOpen, onOpenSettingsHandler,handleResetData,handleDeleteAccount} = useAuth();


 

  return (
    <>
      {/* 1. The Glass Backdrop */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 bg-[#0a0c14]/80 backdrop-blur-md z-[60] transition-opacity duration-300"
          onClick={onOpenSettingsHandler}
        ></div>
      )}

      <div
        className={`fixed inset-y-0 right-0 z-[70] w-full sm:w-[400px] bg-white dark:bg-[#1a1d27] shadow-sm border-y-0 border-r-0 border-l border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-[#1a1d27] backdrop-blur-md transition-colors">
          <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2 transition-colors tracking-tight">
            <span className="text-xl">⚙️</span> System Settings
          </h2>
          <button
            onClick={onOpenSettingsHandler}
            className="text-zinc-400 hover:text-pink-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide relative z-0">

          <div className="space-y-6 relative z-10">
            
            {/* Danger Zone Header */}
            <div>
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-2 transition-colors">
                <span>⚠️</span> Danger Zone
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
                These actions are permanent and cannot be undone. Proceed with extreme caution.
              </p>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800 transition-colors" />

            {/* Reset Data Option (Orange Warning) */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-orange-500/20 shadow-sm backdrop-blur-sm transition-colors">
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1 transition-colors">Reset Dashboard Data</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed transition-colors">
                This will clear all your sales, customers, and chart data, returning the dashboard to a blank state. Your account will remain active.
              </p>
              <button
                onClick={handleResetData}
                className="w-full bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-semibold py-2.5 rounded-xl transition-all border border-orange-500/20 hover:border-orange-500/40 text-sm flex items-center justify-center gap-2 shadow-sm transform hover:scale-[1.02]"
              >
                <span>🔄</span> Reset All Data
              </button>
            </div>

            {/* Delete User Option (Red Danger) */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-red-500/20 shadow-sm backdrop-blur-sm transition-colors">
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1 transition-colors">Delete Account</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed transition-colors">
                Permanently delete your account and all associated data. You will be logged out immediately.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] text-white font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-sm transform hover:scale-[1.02]"
              >
                <span>🗑️</span> Delete User Account
              </button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default SettingsPanel;