import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const IdentityBanner = () => {
  const { currentUser, connectedAdmin } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="w-full bg-[#0f172a] border-b border-white/10 shrink-0 z-50">
      <div className="flex items-center justify-between h-9 md:h-10 px-3 md:px-6">
        
        {/* Left Section: Role & User Info */}
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Role Badge */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 shrink-0">
              <span className="text-[10px]">🛡️</span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase">Admin</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shrink-0">
              <span className="text-[10px]">👤</span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-wider uppercase">{currentUser.role ? currentUser.role.replace('_', ' ') : 'Sales Rep'}</span>
            </div>
          )}

          {/* User Name & Email */}
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs md:text-sm font-medium text-slate-200 truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] md:text-xs text-slate-400 hidden sm:inline-block truncate">
              {currentUser.email}
            </span>
          </div>

          {/* Divider (Hidden on small screens) */}
          <div className="hidden lg:block w-px h-4 bg-slate-700/50"></div>

          {/* Connected Admin / Org ID (Hidden on small screens) */}
          <div className="hidden lg:flex items-center text-[11px] text-slate-400 truncate">
            {isAdmin ? (
              <span>Your Organization ID: <span className="font-mono text-slate-300">{currentUser.id}</span></span>
            ) : connectedAdmin ? (
              <span>
                Connected to Admin: <span className="text-slate-300 font-medium">{connectedAdmin.name}</span> <span className="text-slate-500">({connectedAdmin.email})</span>
              </span>
            ) : (
              <span>Organization Managed</span>
            )}
          </div>
        </div>

        {/* Right Section: Online Status */}
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-[10px] font-medium text-slate-400 hidden sm:inline-block">
            {isOnline ? 'System Online' : 'System Offline'}
          </span>
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            {isOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default IdentityBanner;
