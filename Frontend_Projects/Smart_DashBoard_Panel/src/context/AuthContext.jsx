import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/authService";
import StorageService from "../services/storageService";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewAsUserId, setViewAsUserIdState] = useState(() => localStorage.getItem('viewAsUserId') || null);

  const setViewAsUserId = (userId) => {
    if (userId) {
      localStorage.setItem('viewAsUserId', userId);
    } else {
      localStorage.removeItem('viewAsUserId');
    }
    setViewAsUserIdState(userId);
  };

  const [isSidebarOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsOpenProfile] = useState(false);
  const [isSettingsOpen, setIsOpenSettings] = useState(false);
  const [isNotificationsOpen, setIsOpenNotifications] = useState(false);

  const fetchAllUsers = async (activeUser = currentUser) => {
    if (!activeUser) return;
    
    try {
      const { role, org_id, id: userId } = activeUser;
      
      if (!org_id) {
        console.warn('fetchAllUsers: No org_id found on activeUser, skipping fetch');
        setUsers([activeUser]);
        return;
      }
      
      // Fetch all users in the organization to avoid complex PostgREST JSONB array syntax errors
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('org_id', org_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      let filteredData = data || [];
      
      console.log(`[DEBUG] Raw fetched profiles for org_id ${org_id}:`, data);
      
      // Apply visibility rules locally
      if (role === 'SUPER_STOCKIST') {
        // SS sees themselves + direct children + anyone who has them in ancestor_ids
        filteredData = filteredData.filter(u => 
          u.id === userId || 
          u.parent_id === userId || 
          (u.ancestor_ids && u.ancestor_ids.includes(userId))
        );
      } else if (role === 'DISTRIBUTOR') {
        // DB sees themselves + direct children
        filteredData = filteredData.filter(u => u.id === userId || u.parent_id === userId);
      } else if (role === 'SALES') {
        // SALES sees only themselves
        filteredData = filteredData.filter(u => u.id === userId);
      }

      console.log(`[fetchAllUsers] Role=${role}, Fetched: ${filteredData.length} rows`);
      setUsers(filteredData);
    } catch (err) {
      console.error('fetchAllUsers error:', err);
      setUsers(activeUser ? [activeUser] : []);
    }
  };

  // ============================================================
  // MAIN SESSION HANDLER
  // ============================================================
  const handleSession = async (session) => {
    if (!session || !session.user) {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUsers([]);
      setViewAsUserIdState(null);
      localStorage.removeItem('viewAsUserId');
      setIsLoading(false);
      return;
    }

    try {
      // Decode and log the JWT to see what claims we actually have
      try {
        const base64Url = session.access_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const jwt = JSON.parse(jsonPayload);
        console.log('[DEBUG JWT CLAIMS]:', jwt);
        console.log('  -> TOP-LEVEL org_id:', jwt.org_id);
        console.log('  -> APP_METADATA org_id:', jwt.app_metadata?.org_id);
        console.log('  -> TOP-LEVEL app_role:', jwt.app_role);
      } catch(e) {}
      // 1. Check database for existing profile
      const { data: dbProfile, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const googleName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';

      let activeProfile = dbProfile;

      const fullUser = {
        id: session.user.id,
        email: session.user.email,
        ...activeProfile,
      };

      // 3. No profile found -> Auto-create Admin profile (for first-time Google sign-ins)
      if (!activeProfile) {
        console.log("No profile found. Auto-creating Admin profile for:", session.user.email);
        
        // Ensure they have an organization
        let userOrgId = session.user.app_metadata?.org_id;
        
        if (!userOrgId) {
            // Create an organization for them
            const { data: newOrg, error: orgError } = await supabase.from('organizations').insert([{
                name: `${googleName}'s Organization`
            }]).select().single();
            
            if (!orgError && newOrg) {
                userOrgId = newOrg.id;
            }
        }

        const newProfile = {
          id: session.user.id,
          username: session.user.email,
          full_name: googleName,
          email: session.user.email,
          role: 'ADMIN',
          status: 'Active',
          org_id: userOrgId || '00000000-0000-0000-0000-000000000000'
        };

        const { data: insertedProfile, error: insertError } = await supabase.from('profiles').insert([newProfile]).select().single();
        
        if (insertError) {
          console.error("Failed to auto-create profile:", insertError);
          toast.error(`No profile found for ${session.user.email} and auto-creation failed.`);
          await supabase.auth.signOut();
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
        
        activeProfile = insertedProfile;
        toast.success(`Welcome, ${googleName}! Your Admin account has been created.`);
      }

      // 4. Check if account is deactivated
      const statusLower = (activeProfile.status || '').toLowerCase();
      if (activeProfile.role !== 'ADMIN' && (statusLower === 'inactive' || statusLower === 'deleted')) {
        toast.error('Your account has been deactivated. Contact your Admin.');
        await supabase.auth.signOut();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      // Update last login timestamp
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeProfile.id);

      setCurrentUser(activeProfile);
      setIsLoggedIn(true);
      await fetchAllUsers(activeProfile);
      setIsLoading(false);

    } catch (err) {
      console.error('handleSession fatal error:', err);
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      await handleSession(session);
    };
    
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return;
        await handleSession(session);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const handleLogin = async (loginData) => {
    setIsLoading(true);
    const result = await AuthService.login(loginData.username, loginData.password);
    
    // Additional security: ensure Admin accounts don't log in this way
    if (result?.success && result?.user?.role === 'ADMIN') {
      toast.error("Admin accounts must sign in with Google.");
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setCurrentUser(null);
      setIsLoading(false);
      return false;
    }
    
    setIsLoading(false);
    return result?.success;
  };

  const handleLoginWithGoogle = async () => {
    await AuthService.loginWithGoogle();
  };

  const handleSignUp = async (signUpData) => {
    setIsLoading(true);
    const result = await AuthService.signUp(signUpData);
    setIsLoading(false);
    return result?.success;
  };

  const handleLogout = async () => {
    localStorage.removeItem('viewAsUserId');
    StorageService.logout();
    await AuthService.logout();
  };

  const handleDeleteAccount = () => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">🚨 CRITICAL WARNING: Are you sure you want to delete your account? You will lose all access.</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              setIsLoading(true);
              await AuthService.deleteAccount(currentUser?.id);
              setIsOpenSettings(false);
              setIsLoading(false);
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
    toast.error("Dashboard reset is disabled in production.");
  };

  const updateCurrentUser = async (updatedData) => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', currentUser.id)
      .select()
      .maybeSingle();
    
    if (error) {
      console.error("updateCurrentUser error:", error);
      throw error;
    }
    
    if (data) {
      setCurrentUser(data);
    }
  };

  const onOpenSidebarHandler = () => setIsOpen(!isSidebarOpen);
  const onOpenProfileHandler = () => setIsOpenProfile(!isProfileOpen);
  const onOpenSettingsHandler = () => setIsOpenSettings(!isSettingsOpen);
  const onOpenNotificationsHandler = () => setIsOpenNotifications(!isNotificationsOpen);

  const validatedViewAsUserId = (() => {
    if (viewAsUserId && users.length > 0) {
      const isValid = users.some(u => u.id === viewAsUserId);
      if (!isValid) return null;
    }
    return viewAsUserId;
  })();

  useEffect(() => {
    if (viewAsUserId && users.length > 0) {
      const isValid = users.some(u => u.id === viewAsUserId);
      if (!isValid) {
        setViewAsUserIdState(null);
        localStorage.removeItem('viewAsUserId');
      }
    }
  }, [viewAsUserId, users]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        currentUser,
        users,
        fetchAllUsers,
        isLoading,
        viewAsUserId: validatedViewAsUserId,
        setViewAsUserId,
        handleLogin,
        handleLoginWithGoogle,
        handleLogout,
        handleSignUp,
        handleResetData,
        handleDeleteAccount,
        updateCurrentUser,
        
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
