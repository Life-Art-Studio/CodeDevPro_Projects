import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { useAudit } from "./AuditContext";
import toast from "react-hot-toast";

const VisitContext = createContext();

export const useVisitContext = () => useContext(VisitContext);

export const VisitProvider = ({ children }) => {
  const { currentUser, viewAsUserId, users } = useAuth();
  const { logAction } = useAudit();
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisits = async () => {
    if (!currentUser) {
      setVisits([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      let query = supabase.from('visits').select('*').eq('org_id', currentUser.org_id).order('visit_date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data || [];
      // Unified Role-Based Hierarchy Firewall
            if (viewAsUserId) {
                        const allowedIds = users
                            .filter(u => u.id === viewAsUserId || u.parent_id === viewAsUserId || (u.ancestor_ids && u.ancestor_ids.includes(viewAsUserId)))
                            .map(u => u.id);
                        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
                      } else {
                        // WITHOUT View As mode: Admins, SS, DB see data for all users they manage.
                        const allowedIds = users.map(u => u.id);
                        filteredData = filteredData.filter(item => allowedIds.includes(item.owner_id));
                      }

      setVisits(filteredData);
    } catch (err) {
      console.error("Error fetching visits:", err);
      toast.error("Failed to load visits.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [currentUser, viewAsUserId, users]);

  const addVisit = async (visitData) => {
    const newVisit = {
      ...visitData,
      owner_id: viewAsUserId || currentUser?.id,
      customer_id: visitData.customerId,
      beat_id: visitData.beatId,
      visit_date: visitData.visitDate,
      visit_time: visitData.visitTime,
      next_visit_date: visitData.nextVisitDate
    };

    delete newVisit.customerId;
    delete newVisit.beatId;
    delete newVisit.visitDate;
    delete newVisit.visitTime;
    delete newVisit.nextVisitDate;

    try {
      const { data, error } = await supabase.from('visits').insert([newVisit]).select();
      if (error) throw error;
      
      if (data && data.length > 0) {
        setVisits((prev) => [data[0], ...prev]);
        logAction("Add Visit", "Visits", `Scheduled visit to ${data[0].customer_id}`);
      }
      return true;
    } catch (err) {
      console.error("Error adding visit:", err);
      toast.error("Failed to add visit.");
      return false;
    }
  };

  const updateVisit = async (id, updatedData) => {
    const dbUpdate = { ...updatedData };
    if (dbUpdate.customerId) { dbUpdate.customer_id = dbUpdate.customerId; delete dbUpdate.customerId; }
    if (dbUpdate.beatId) { dbUpdate.beat_id = dbUpdate.beatId; delete dbUpdate.beatId; }
    if (dbUpdate.visitDate) { dbUpdate.visit_date = dbUpdate.visitDate; delete dbUpdate.visitDate; }
    if (dbUpdate.visitTime) { dbUpdate.visit_time = dbUpdate.visitTime; delete dbUpdate.visitTime; }
    if (dbUpdate.nextVisitDate) { dbUpdate.next_visit_date = dbUpdate.nextVisitDate; delete dbUpdate.nextVisitDate; }

    try {
      const { error } = await supabase.from('visits').update(dbUpdate).eq('id', id);
      if (error) throw error;

      setVisits((prev) => prev.map((visit) => (visit.id === id ? { ...visit, ...updatedData } : visit)));
      logAction("Update Visit", "Visits", `Updated visit ${id}`);
      return true;
    } catch (err) {
      console.error("Error updating visit:", err);
      toast.error("Failed to update visit.");
      return false;
    }
  };

  const deleteVisit = async (id) => {
    try {
      const { error } = await supabase.from('visits').delete().eq('id', id);
      if (error) throw error;
      
      setVisits((prev) => prev.filter((visit) => visit.id !== id));
      logAction("Delete Visit", "Visits", `Deleted visit ${id}`);
    } catch (err) {
      console.error("Error deleting visit:", err);
      toast.error("Failed to delete visit.");
    }
  };

  return (
    <VisitContext.Provider value={{ visits, isLoading, fetchVisits, addVisit, updateVisit, deleteVisit }}>
      {children}
    </VisitContext.Provider>
  );
};
