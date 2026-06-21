import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const BeatContext = createContext();

export const useBeatContext = () => useContext(BeatContext);

export const BeatProvider = ({ children }) => {
  const { currentUser, viewAsUserId, users } = useAuth();
  const [beats, setBeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBeats = async () => {
    if (!currentUser) {
      setBeats([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      let query = supabase.from('beats').select('*').eq('org_id', currentUser.org_id).order('created_at', { ascending: false });

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

      setBeats(filteredData);
    } catch (err) {
      console.error("Error fetching beats:", err);
      toast.error("Failed to load beats.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBeats();
  }, [currentUser, viewAsUserId, users]);

  const addBeat = async (beatData) => {
    const newBeat = {
      ...beatData,
      owner_id: viewAsUserId || currentUser?.id,
      assigned_customers: beatData.assignedCustomers || []
    };
    delete newBeat.assignedCustomers;

    try {
      const { data, error } = await supabase.from('beats').insert([newBeat]).select();
      if (error) throw error;
      
      if (data && data.length > 0) {
        setBeats((prev) => [data[0], ...prev]);
        toast.success("Beat created successfully.");
      }
      return true;
    } catch (err) {
      console.error("Error adding beat:", err);
      toast.error("Failed to add beat.");
      return false;
    }
  };

  const updateBeat = async (id, updatedData) => {
    const dbUpdate = { ...updatedData };
    if (dbUpdate.assignedCustomers) {
      dbUpdate.assigned_customers = dbUpdate.assignedCustomers;
      delete dbUpdate.assignedCustomers;
    }

    try {
      const { error } = await supabase.from('beats').update(dbUpdate).eq('id', id);
      if (error) throw error;

      setBeats((prev) => prev.map((beat) => (beat.id === id ? { ...beat, ...updatedData } : beat)));
      return true;
    } catch (err) {
      console.error("Error updating beat:", err);
      toast.error("Failed to update beat.");
      return false;
    }
  };

  const deleteBeat = async (id) => {
    try {
      const { error } = await supabase.from('beats').delete().eq('id', id);
      if (error) throw error;
      
      setBeats((prev) => prev.filter((beat) => beat.id !== id));
      toast.success("Beat deleted.");
    } catch (err) {
      console.error("Error deleting beat:", err);
      toast.error("Failed to delete beat.");
    }
  };

  const addCustomerToBeat = async (beatId, customerId) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat) return;
    
    const assigned = beat.assigned_customers || beat.assignedCustomers || [];
    if (assigned.includes(customerId)) return;
    
    const updatedAssigned = [...assigned, customerId];
    await updateBeat(beatId, { assigned_customers: updatedAssigned });
  };

  const removeCustomerFromBeat = async (beatId, customerId) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat) return;
    
    const assigned = beat.assigned_customers || beat.assignedCustomers || [];
    const updatedAssigned = assigned.filter(c => c !== customerId);
    
    await updateBeat(beatId, { assigned_customers: updatedAssigned });
  };

  return (
    <BeatContext.Provider value={{ 
      beats, 
      isLoading,
      fetchBeats,
      addBeat, 
      updateBeat, 
      deleteBeat, 
      addCustomerToBeat,
      removeCustomerFromBeat
    }}>
      {children}
    </BeatContext.Provider>
  );
};
