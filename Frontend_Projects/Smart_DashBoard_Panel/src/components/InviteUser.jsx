import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CustomSelect from './ui/CustomSelect';
import toast from 'react-hot-toast';
import { CheckCircle2, X, UserPlus, AlertCircle } from 'lucide-react';

export default function InviteUser({ onClose, onSuccess }) {
  const { currentUser } = useAuth();
  
  const [role, setRole] = useState('SALES');
  
  // Input State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // Username Validation State
  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle, loading, available, taken, invalid
  
  // Linking State
  const [linkType, setLinkType] = useState('DIRECT'); // 'DIRECT' or 'ASSIGN'
  const [targetRole, setTargetRole] = useState('SUPER_STOCKIST'); // Only used when Admin assigns SALES
  const [parentId, setParentId] = useState(null);
  const [parentOptions, setParentOptions] = useState([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Compute allowed roles based on caller
  const allowedRoles = [];
  if (currentUser?.role === 'ADMIN') {
    allowedRoles.push({ value: 'SUPER_STOCKIST', label: 'Super Stockist' });
    allowedRoles.push({ value: 'DISTRIBUTOR', label: 'Distributor' });
    allowedRoles.push({ value: 'SALES', label: 'Sales Rep' });
  } else if (currentUser?.role === 'SUPER_STOCKIST') {
    allowedRoles.push({ value: 'DISTRIBUTOR', label: 'Distributor' });
    allowedRoles.push({ value: 'SALES', label: 'Sales Rep' });
  } else if (currentUser?.role === 'DISTRIBUTOR') {
    allowedRoles.push({ value: 'SALES', label: 'Sales Rep' });
  }

  useEffect(() => {
    if (allowedRoles.length > 0 && !allowedRoles.find(r => r.value === role)) {
      setRole(allowedRoles[0].value);
    }
  }, [currentUser]);

  useEffect(() => {
    // Default to 'ASSIGN' if an Admin is creating a role that normally has a manager
    if (currentUser?.role === 'ADMIN' && (role === 'DISTRIBUTOR' || role === 'SALES')) {
      setLinkType('ASSIGN');
    } else if (currentUser?.role === 'SUPER_STOCKIST' && role === 'SALES') {
      setLinkType('ASSIGN');
    } else {
      setLinkType('DIRECT');
    }
    setParentId(null);
    setIsSuccess(false);
  }, [role, currentUser]);

  // Fetch available parents
  useEffect(() => {
    async function fetchParents() {
      if (linkType !== 'ASSIGN') {
        setParentOptions([]);
        setParentId(null);
        return;
      }

      let query = supabase.from('profiles').select('id, full_name, role');

      if (currentUser?.role === 'ADMIN') {
        if (role === 'DISTRIBUTOR') query = query.eq('role', 'SUPER_STOCKIST');
        if (role === 'SALES') query = query.eq('role', targetRole);
      } else if (currentUser?.role === 'SUPER_STOCKIST') {
        if (role === 'SALES') query = query.eq('role', 'DISTRIBUTOR').contains('ancestor_ids', [currentUser.id]);
      }

      const { data, error } = await query;
      if (data) {
        setParentOptions(data);
        if (data.length > 0 && !parentId) {
          setParentId(data[0].id);
        } else if (data.length === 0) {
          setParentId(null);
        }
      }
    }
    fetchParents();
  }, [linkType, targetRole, role, currentUser]);

  // Username validation debounce
  useEffect(() => {
    const checkUsername = async () => {
      const cleanUsername = username.trim().toLowerCase();
      if (!cleanUsername) {
        setUsernameStatus('idle');
        return;
      }
      
      const regex = /^[a-z0-9_]{4,30}$/;
      if (!regex.test(cleanUsername)) {
        setUsernameStatus('invalid');
        return;
      }

      setUsernameStatus('loading');
      
      try {
        const { data } = await supabase.rpc('get_auth_email_for_username', { p_username: cleanUsername });
        if (data) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err) {
        console.error("Username check error", err);
        setUsernameStatus('idle');
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (linkType === 'ASSIGN' && !parentId) {
      toast.error(`Please select a ${targetRole.replace('_', ' ')} to link to.`);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (usernameStatus === 'taken') {
      toast.error("Username is already taken.");
      return;
    }
    
    if (usernameStatus === 'invalid') {
      toast.error("Invalid username format.");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = { 
        role,
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        parent_id: linkType === 'ASSIGN' ? parentId : undefined
      };

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-team-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to process request');

      setIsSuccess(true);
      toast.success(`${role.replace('_', ' ')} successfully created!`);
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1d27] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-[#1a1d27]">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-500" />
            Create {role.replace('_', ' ')}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {isSuccess ? (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-emerald-800 dark:text-emerald-400 font-medium">{role.replace('_', ' ')} Created!</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Username: <strong>{username}</strong></p>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">They can log in instantly with their credentials.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors min-h-[44px]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Assign Role</label>
                <CustomSelect 
                  value={role} 
                  onChange={setRole}
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                  options={allowedRoles}
                  minWidth="100%"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Username</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. john_sales"
                    className={`w-full pl-4 pr-10 py-2.5 bg-white dark:bg-[#0f1117] border text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      usernameStatus === 'invalid' || usernameStatus === 'taken' 
                        ? 'border-red-500 focus:ring-red-500' 
                        : usernameStatus === 'available' 
                        ? 'border-emerald-500 focus:ring-emerald-500' 
                        : 'border-zinc-200 dark:border-zinc-700'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    {usernameStatus === 'loading' && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                    {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {usernameStatus === 'taken' && <X className="w-5 h-5 text-red-500" />}
                    {usernameStatus === 'invalid' && <AlertCircle className="w-5 h-5 text-red-500" title="4-30 lowercase letters/numbers/underscores" />}
                  </div>
                </div>
                {usernameStatus === 'invalid' && <p className="text-xs text-red-500 mt-1">4-30 chars, lowercase letters, numbers, and underscores only.</p>}
                {usernameStatus === 'taken' && <p className="text-xs text-red-500 mt-1">Username is already taken.</p>}
                {usernameStatus === 'available' && <p className="text-xs text-emerald-500 mt-1">Username is available!</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Password</label>
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Confirm</label>
                  <input 
                    type="password" 
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Phone (Optional)</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
              </div>

              {/* Dynamic Linking Logic */}
              {(currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_STOCKIST') && role !== 'SUPER_STOCKIST' && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Hierarchy Link</label>
                    <CustomSelect 
                      value={linkType} 
                      onChange={setLinkType}
                      className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                      options={[
                        { value: 'DIRECT', label: `Link directly to ${currentUser.role === 'ADMIN' ? 'Admin (Me)' : 'Me'}` },
                        { value: 'ASSIGN', label: 'Assign to a subordinate' }
                      ]}
                      minWidth="100%"
                    />
                  </div>

                  {linkType === 'ASSIGN' && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200 fade-in">
                      {currentUser?.role === 'ADMIN' && role === 'SALES' && (
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Target Level</label>
                          <div className="flex bg-zinc-200/50 dark:bg-zinc-900 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() => { setTargetRole('SUPER_STOCKIST'); setParentId(null); }}
                              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${targetRole === 'SUPER_STOCKIST' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                            >
                              Super Stockist
                            </button>
                            <button
                              type="button"
                              onClick={() => { setTargetRole('DISTRIBUTOR'); setParentId(null); }}
                              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${targetRole === 'DISTRIBUTOR' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                            >
                              Distributor
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Select {currentUser?.role === 'SUPER_STOCKIST' ? 'Distributor' : targetRole.replace('_', ' ')}
                        </label>
                        {parentOptions.length > 0 ? (
                          <CustomSelect 
                            value={parentId} 
                            onChange={setParentId}
                            className="w-full px-4 py-2.5 bg-white dark:bg-[#0f1117] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
                            options={parentOptions.map(p => ({ value: p.id, label: p.full_name }))}
                            minWidth="100%"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-400 text-sm">
                            No {targetRole.replace('_', ' ').toLowerCase()}s found. Please create one first.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px]">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || (linkType === 'ASSIGN' && !parentId) || usernameStatus !== 'available' || password !== confirmPassword} 
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : `Create User`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
