import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthService = {
  login: async (emailOrUsername, password) => {
    try {
      const finalEmail = emailOrUsername.includes('@') 
        ? emailOrUsername 
        : `${emailOrUsername}@internal.smartdashboard.local`;
        
      const { data, error } = await supabase.auth.signInWithPassword({
        email: finalEmail,
        password,
      });

      if (error) {
        toast.error("Invalid email or password.");
        return { success: false, error };
      }

      // Ensure the user's status is Active
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profileError || !userProfile) {
        toast.error("User profile not found.");
        await supabase.auth.signOut();
        return { success: false };
      }

      if (userProfile.status === 'inactive' || userProfile.status === 'deleted') {
        toast.error("Account deactivated. Please contact an admin.");
        await supabase.auth.signOut();
        return { success: false };
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.user.id);

      return { success: true, user: userProfile };
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("An unexpected error occurred.");
      return { success: false };
    }
  },

  loginWithGoogle: async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      toast.error("An unexpected error occurred.");
    }
  },

  signUp: async (userData) => {
    try {
      // Note: Supabase auth.signUp creates the user in auth.users.
      // The trigger we set up will automatically insert into public.users.
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            role: userData.role || 'SALES',
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return { success: false, error };
      }

      return { success: true, user: data.user };
    } catch (err) {
      console.error("SignUp Error:", err);
      toast.error("An unexpected error occurred.");
      return { success: false };
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    }
  },

  deleteAccount: async (userId) => {
    if (!userId) return;
    try {
      // Since users_id_fkey was dropped, we can safely delete from public.profiles
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'deleted' })
        .eq('id', userId);

      if (error) throw error;
      
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Delete Account Error:", err);
      toast.error("Failed to delete account. Please contact support.");
    }
  },

  resetDashboardData: async (userId) => {
    if (!userId) return;
    try {
      // To reset data safely for a user.
      await supabase.from('orders').delete().eq('owner_id', userId);
      await supabase.from('beats').delete().eq('owner_id', userId);
      toast.success("Dashboard data has been reset to zero.");
    } catch (error) {
      console.error("Reset Data Error:", error);
      toast.error("Failed to reset data.");
    }
  }
};

export default AuthService;
