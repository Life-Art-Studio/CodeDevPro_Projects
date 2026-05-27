import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";
import { useAuth } from "./AuthContext";

const AuditContext = createContext();

export const useAudit = () => {
  return useContext(AuditContext);
};

export const AuditProvider = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const { currentUser } = useAuth();

  // Load on mount
  useEffect(() => {
    const logs = StorageService.getAuditLogs();
    setAuditLogs(logs);
  }, []);

  const logAction = (action, module, details = "") => {
    if (!currentUser) return; // Silent if no logged in user

    const newLog = {
      id: `LOG-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    StorageService.saveAuditLogs(updatedLogs);
  };

  const clearLogs = () => {
    setAuditLogs([]);
    StorageService.saveAuditLogs([]);
  };

  return (
    <AuditContext.Provider value={{ auditLogs, logAction, clearLogs }}>
      {children}
    </AuditContext.Provider>
  );
};
