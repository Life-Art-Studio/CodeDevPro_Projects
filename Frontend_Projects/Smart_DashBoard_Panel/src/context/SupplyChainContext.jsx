import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";
// Helper to generate a UUID (fallback for environments where crypto.randomUUID is unavailable)
const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: create RFC‑4122 version 4 UUID using getRandomValues
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // set version to 0100
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // set variant to 10xx
  const hex = [...bytes].map(b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const SupplyChainContext = createContext(null);

export const SupplyChainProvider = ({ children }) => {
  const { currentUser, viewAsUserId, users } = useAuth();
  const [superStockists, setSuperStockists] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [inventoryLedger, setInventoryLedger] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSupplyChainData = async () => {
    if (!currentUser?.org_id) {
      setSuperStockists([]);
      setDistributors([]);
      setInventoryLedger([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Strict Tenant Frontend Firewall
      let querySS = supabase.from('super_stockists').select('*').eq('org_id', currentUser.org_id);
      let queryDB = supabase.from('distributors').select('*').eq('org_id', currentUser.org_id);
      let queryIL = supabase.from('inventory_ledger').select('*').eq('org_id', currentUser.org_id);

      // We no longer filter by viewAsUserId at the database level because 
      // supply chain entities (SS, DB) created by Admin would have the Admin's owner_id,
      // making them invisible to the actual SS/DB users. We rely on the org_id firewall 
      // and UI-level filtering where appropriate.

      const [resSS, resDB, resIL] = await Promise.all([querySS, queryDB, queryIL]);

      let ssData = resSS.data || [];
      let dbData = resDB.data || [];
      let ilData = resIL.data || [];

      // Unified Role-Based Hierarchy Firewall
      // Previously we filtered ssData and dbData here for non-admins.
      // However, for B2B Supply Chain, Sales Reps need to see the organization's distributors 
      // in order to place orders and check inventory. 
      // Thus, master data is now globally visible within the org via relaxed RLS.

      setSuperStockists(ssData);
      setDistributors(dbData);
      setInventoryLedger(ilData);
    } catch (err) {
      console.error("Error fetching supply chain:", err);
      toast.error("Failed to load supply chain data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplyChainData();

    if (currentUser?.org_id) {
      const ssSub = supabase.channel('super_stockists_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'super_stockists', filter: `org_id=eq.${currentUser.org_id}` }, () => {
          fetchSupplyChainData();
        }).subscribe();
        
      const dbSub = supabase.channel('distributors_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'distributors', filter: `org_id=eq.${currentUser.org_id}` }, () => {
          fetchSupplyChainData();
        }).subscribe();
        
      const ilSub = supabase.channel('inventory_ledger_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_ledger', filter: `org_id=eq.${currentUser.org_id}` }, () => {
          fetchSupplyChainData();
        }).subscribe();

      return () => {
        supabase.removeChannel(ssSub);
        supabase.removeChannel(dbSub);
        supabase.removeChannel(ilSub);
      };
    }
  }, [currentUser, viewAsUserId, users]);

  const addSuperStockist = async (ssData) => {
    const { email, ...restData } = ssData;
    const newSS = {
      ...restData,
      totalBilled: Number(ssData.totalBilled || 0),
      outstandingBalance: Number(ssData.outstandingBalance || 0),
      status: ssData.status || "Active",
      lat: Number(ssData.lat || 32.73),
      lng: Number(ssData.lng || 74.86),
      owner_id: ssData.owner_id || currentUser?.id,
      org_id: currentUser?.org_id,
    };
      
      try {
        const { data, error } = await supabase.from('super_stockists').insert([newSS]).select();
        if (error) throw error;
        const insertedSS = data[0];
        
        const updated = [insertedSS, ...superStockists];
        setSuperStockists(updated);
  
        const { data: products } = await supabase.from('products').select('sku');
        const newLedgerItems = (products || []).map(p => ({
          superStockistId: insertedSS.id,
          sku: p.sku,
          currentStock: 500,
          reorderLevel: 50,
          lastRestockDate: new Date().toISOString().split("T")[0],
          owner_id: ssData.owner_id || currentUser?.id,
          org_id: currentUser?.org_id,
        }));
      
      const { error: ledgerError } = await supabase.from('inventory_ledger').insert(newLedgerItems);
      if (ledgerError) throw ledgerError;

      const updatedLedger = [...inventoryLedger, ...newLedgerItems];
      setInventoryLedger(updatedLedger);

      toast.success(`Super Stockist "${insertedSS.name || newSS.name}" added successfully.`);
      return insertedSS;
    } catch (e) {
      console.error(e);
      toast.error("Failed to add Super Stockist.");
    }
  };

  const updateSuperStockist = async (id, ssData) => {
    try {
      const { email, ...payload } = ssData;
      const { error } = await supabase.from('super_stockists').update(payload).eq('id', id);
      if (error) throw error;

      const updated = superStockists.map((ss) =>
        ss.id === id
          ? {
              ...ss,
              ...ssData,
              totalBilled: Number(ssData.totalBilled ?? ss.totalBilled),
              outstandingBalance: Number(ssData.outstandingBalance ?? ss.outstandingBalance),
              lat: Number(ssData.lat ?? ss.lat),
              lng: Number(ssData.lng ?? ss.lng)
            }
          : ss
      );
      setSuperStockists(updated);
      toast.success("Super Stockist updated successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update Super Stockist.");
    }
  };

  const deleteSuperStockist = async (id) => {
    try {
      await supabase.from('inventory_ledger').delete().eq('superStockistId', id);
      const { error } = await supabase.from('super_stockists').delete().eq('id', id);
      if (error) throw error;

      setSuperStockists(superStockists.filter((ss) => ss.id !== id));
      setInventoryLedger(inventoryLedger.filter((item) => item.superStockistId !== id));
      toast.success("Super Stockist deleted.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete Super Stockist.");
    }
  };

  const addDistributor = async (dbData) => {
      const { email, ...restData } = dbData;
      const newDB = {
        ...restData,
        assignedBeats: dbData.assignedBeats || [],
        lat: Number(dbData.lat || 34.08),
        lng: Number(dbData.lng || 74.80),
        owner_id: dbData.owner_id || currentUser?.id,
        org_id: currentUser?.org_id,
      };
      
      try {
        const { data, error } = await supabase.from('distributors').insert([newDB]).select();
        if (error) throw error;
        const insertedDB = data[0];
  
        const updated = [insertedDB, ...distributors];
        setDistributors(updated);
        
        const { data: products } = await supabase.from('products').select('sku');
        const newLedgerItems = (products || []).map(p => ({
          distributorId: insertedDB.id,
          sku: p.sku,
          currentStock: 100,
          reorderLevel: 20,
          lastRestockDate: new Date().toISOString().split("T")[0],
          owner_id: dbData.owner_id || currentUser?.id,
          org_id: currentUser?.org_id,
        }));
      
      const { error: ledgerError } = await supabase.from('inventory_ledger').insert(newLedgerItems);
      if (ledgerError) throw ledgerError;

      const updatedLedger = [...inventoryLedger, ...newLedgerItems];
      setInventoryLedger(updatedLedger);

      toast.success(`Distributor "${insertedDB.name || newDB.name}" added successfully.`);
      return insertedDB;
    } catch (e) {
      console.error(e);
      toast.error("Failed to add Distributor.");
    }
  };

  const updateDistributor = async (id, dbData) => {
    try {
      const { email, ...payload } = dbData;
      const { error } = await supabase.from('distributors').update(payload).eq('id', id);
      if (error) throw error;

      const updated = distributors.map((db) =>
        db.id === id ? { ...db, ...dbData, lat: Number(dbData.lat ?? db.lat), lng: Number(dbData.lng ?? db.lng) } : db
      );
      setDistributors(updated);
      toast.success("Distributor updated successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update Distributor.");
    }
  };

  const deleteDistributor = async (id) => {
    try {
      await supabase.from('inventory_ledger').delete().eq('distributorId', id);
      const { error } = await supabase.from('distributors').delete().eq('id', id);
      if (error) throw error;

      setDistributors(distributors.filter((db) => db.id !== id));
      setInventoryLedger(inventoryLedger.filter((item) => item.distributorId !== id));
      toast.success("Distributor deleted.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete Distributor.");
    }
  };

  // --- Inventory Operations ---
  const restockProduct = async (entityId, productSku, quantity) => {
    const isSS = superStockists.some(ss => ss.id === entityId) || entityId.startsWith("SS-");
    let itemFound = false;
    let matchedItem = null;
    
    const updatedLedger = inventoryLedger.map((item) => {
      const match = isSS 
        ? (item.superStockistId === entityId && item.sku === productSku)
        : (item.distributorId === entityId && item.sku === productSku);
      
      if (match) {
        itemFound = true;
        matchedItem = {
          ...item,
          currentStock: item.currentStock + Number(quantity),
          lastRestockDate: new Date().toISOString().split("T")[0]
        };
        return matchedItem;
      }
      return item;
    });

    try {
      if (itemFound) {
        const { error } = await supabase.from('inventory_ledger').update({
          currentStock: matchedItem.currentStock,
          lastRestockDate: matchedItem.lastRestockDate
        }).eq('id', matchedItem.id);
        if (error) throw error;
      } else {
        const newItem = isSS 
            ? { superStockistId: entityId, sku: productSku, currentStock: Number(quantity), reorderLevel: 50, lastRestockDate: new Date().toISOString().split("T")[0], owner_id: currentUser?.id, org_id: currentUser?.org_id }
            : { distributorId: entityId, sku: productSku, currentStock: Number(quantity), reorderLevel: 20, lastRestockDate: new Date().toISOString().split("T")[0], owner_id: currentUser?.id, org_id: currentUser?.org_id };
        const { data, error } = await supabase.from('inventory_ledger').insert([newItem]).select();
        if (error) throw error;
        updatedLedger.push(data[0] || newItem);
      }
      setInventoryLedger(updatedLedger);
      toast.success("Stock level updated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update stock level.");
    }
  };

  const updateInventoryDetails = async (entityId, productSku, details) => {
    const isSS = superStockists.some(ss => ss.id === entityId) || entityId.startsWith("SS-");
    let itemFound = false;
    let matchedItem = null;

    const updatedLedger = inventoryLedger.map((item) => {
      const match = isSS 
        ? (item.superStockistId === entityId && item.sku === productSku)
        : (item.distributorId === entityId && item.sku === productSku);
      
      if (match) {
        itemFound = true;
        matchedItem = {
          ...item,
          currentStock: details.currentStock !== undefined ? Number(details.currentStock) : item.currentStock,
          reorderLevel: details.reorderLevel !== undefined ? Number(details.reorderLevel) : item.reorderLevel,
          lastRestockDate: details.lastRestockDate || item.lastRestockDate
        };
        return matchedItem;
      }
      return item;
    });

    try {
      if (itemFound) {
        const { error } = await supabase.from('inventory_ledger').update({
          currentStock: matchedItem.currentStock,
          reorderLevel: matchedItem.reorderLevel,
          lastRestockDate: matchedItem.lastRestockDate
        }).eq('id', matchedItem.id);
        if (error) throw error;
      } else {
        const newItem = isSS 
            ? {
                superStockistId: entityId,
                sku: productSku,
                currentStock: details.currentStock !== undefined ? Number(details.currentStock) : 0,
                reorderLevel: details.reorderLevel !== undefined ? Number(details.reorderLevel) : 50,
                lastRestockDate: details.lastRestockDate || new Date().toISOString().split("T")[0],
                owner_id: currentUser?.id,
                org_id: currentUser?.org_id,
              }
            : {
                distributorId: entityId,
                sku: productSku,
                currentStock: details.currentStock !== undefined ? Number(details.currentStock) : 0,
                reorderLevel: details.reorderLevel !== undefined ? Number(details.reorderLevel) : 20,
                lastRestockDate: details.lastRestockDate || new Date().toISOString().split("T")[0],
                owner_id: currentUser?.id,
                org_id: currentUser?.org_id,
              };
        const { data, error } = await supabase.from('inventory_ledger').insert([newItem]).select();
        if (error) throw error;
        updatedLedger.push(data[0] || newItem);
      }
      setInventoryLedger(updatedLedger);
      toast.success("Inventory details updated successfully.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update inventory details.");
    }
  };

  return (
    <SupplyChainContext.Provider
      value={{
        superStockists,
        distributors,
        inventoryLedger,
        addSuperStockist,
        updateSuperStockist,
        deleteSuperStockist,
        addDistributor,
        updateDistributor,
        deleteDistributor,
        restockProduct,
        updateInventoryDetails
      }}
    >
      {children}
    </SupplyChainContext.Provider>
  );
};

export const useSupplyChainContext = () => {
  const context = useContext(SupplyChainContext);
  if (!context) {
    throw new Error("useSupplyChainContext must be used within a SupplyChainProvider");
  }
  return context;
};
