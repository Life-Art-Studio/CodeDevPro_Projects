import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

const AuditContext = createContext();

export const useAudit = () => {
  return useContext(AuditContext);
};

export const AuditProvider = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchLogs = async () => {
    if (!currentUser?.org_id) {
      setAuditLogs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Strict Tenant Frontend Firewall
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('org_id', currentUser.org_id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      
      const mapped = (data || []).map(log => ({
        ...log,
        userId: log.actor_id, userName: log.metadata?.user_name || 'System', timestamp: log.created_at, details: log.metadata?.details, module: log.metadata?.module
      }));
      setAuditLogs(mapped);
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    if (currentUser?.org_id) {
      const subscription = supabase
        .channel('audit_logs_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs', filter: `org_id=eq.${currentUser.org_id}` }, () => {
          fetchLogs(); // Re-fetch on any change for simplicity
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [currentUser]);

  const logAction = async (action, module, details = "") => {
    if (!currentUser?.org_id) return;

    const orgId = currentUser.org_id === "0" ? "00000000-0000-0000-0000-000000000000" : currentUser.org_id;

    const newLog = {
      org_id: orgId,
      actor_id: currentUser.id,
      action: action,
      metadata: { module, details, user_name: currentUser.full_name || currentUser.name, role: currentUser.role }
    };

    try {
      const { error } = await supabase.from('audit_logs').insert([newLog]);
      if (error) throw error;
      // UI will be updated via real-time subscription
    } catch (err) {
      console.error("Failed to insert audit log:", err);
    }
  };

  const clearLogs = async () => {
    if (!currentUser) return;
    try {
      // Handle legacy mock data where org_id was "0"
      const orgId = currentUser.org_id === "0" ? "00000000-0000-0000-0000-000000000000" : currentUser.org_id;
      let query = supabase.from('audit_logs').delete().eq('org_id', orgId);
      const { error } = await query;
      if (error) throw error;
      setAuditLogs([]);
    } catch (err) {
      console.error("Failed to clear audit logs:", err);
    }
  };

  return (
    <AuditContext.Provider value={{ auditLogs, isLoading, logAction, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
};
