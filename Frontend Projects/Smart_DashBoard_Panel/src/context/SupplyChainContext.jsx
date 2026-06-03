import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SupplyChainContext = createContext(null);

const defaultSuperStockists = [
  {
    id: "SS-001",
    name: "J&K Logistics Hub",
    state: "Jammu & Kashmir",
    contactPhone: "9876543210",
    email: "jk.logistics@superstock.com",
    totalBilled: 1250000,
    outstandingBalance: 250000,
    status: "Active",
    lat: 32.7266,
    lng: 74.8570,
    gstNo: "01AABCU1234F1Z1"
  },
  {
    id: "SS-002",
    name: "Himalayan Distributors Group",
    state: "Himachal Pradesh",
    contactPhone: "9876543211",
    email: "him.dist@superstock.com",
    totalBilled: 850000,
    outstandingBalance: 95000,
    status: "Active",
    lat: 31.1048,
    lng: 77.1734,
    gstNo: "02BBDCV5678H2Z2"
  }
];

const defaultDistributors = [
  {
    id: "DB-001",
    name: "Kashmiri Enterprises",
    superStockistId: "SS-001",
    district: "Srinagar",
    contactPhone: "9906123456",
    assignedBeats: ["BEAT-001"],
    lat: 34.0837,
    lng: 74.7973,
    gstNo: "01CCEXW9012J3Z3"
  },
  {
    id: "DB-002",
    name: "Chinar Agencies",
    superStockistId: "SS-001",
    district: "Anantnag",
    contactPhone: "9906789012",
    assignedBeats: ["BEAT-002"],
    lat: 33.7297,
    lng: 75.1498,
    gstNo: "01DDFYX3456K4Z4"
  },
  {
    id: "DB-003",
    name: "Shimla Valley Traders",
    superStockistId: "SS-002",
    district: "Shimla",
    contactPhone: "9816012345",
    assignedBeats: [],
    lat: 31.1048,
    lng: 77.1734,
    gstNo: "02EEGYZ7890L5Z5"
  }
];

const defaultInventoryLedger = [
  // SS-001 (J&K Logistics Hub)
  { superStockistId: "SS-001", sku: "LUB-10W30-1L", currentStock: 1200, reorderLevel: 200, lastRestockDate: "2026-05-20" },
  { superStockistId: "SS-001", sku: "BRK-FL-500", currentStock: 450, reorderLevel: 100, lastRestockDate: "2026-05-18" },
  // SS-002 (Himalayan Distributors Group)
  { superStockistId: "SS-002", sku: "LUB-10W30-1L", currentStock: 900, reorderLevel: 150, lastRestockDate: "2026-05-22" },
  { superStockistId: "SS-002", sku: "BRK-FL-500", currentStock: 180, reorderLevel: 50, lastRestockDate: "2026-05-20" },

  // DB-001 (Srinagar)
  { distributorId: "DB-001", sku: "LUB-10W30-1L", currentStock: 80, reorderLevel: 30, lastRestockDate: "2026-05-20" },
  { distributorId: "DB-001", sku: "BRK-FL-500", currentStock: 12, reorderLevel: 20, lastRestockDate: "2026-05-18" },
  // DB-002 (Anantnag)
  { distributorId: "DB-002", sku: "LUB-10W30-1L", currentStock: 150, reorderLevel: 40, lastRestockDate: "2026-05-25" },
  { distributorId: "DB-002", sku: "BRK-FL-500", currentStock: 45, reorderLevel: 15, lastRestockDate: "2026-05-25" },
  // DB-003 (Shimla)
  { distributorId: "DB-003", sku: "LUB-10W30-1L", currentStock: 40, reorderLevel: 20, lastRestockDate: "2026-05-22" },
  { distributorId: "DB-003", sku: "BRK-FL-500", currentStock: 8, reorderLevel: 10, lastRestockDate: "2026-05-20" }
];

export const SupplyChainProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [superStockists, setSuperStockists] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [inventoryLedger, setInventoryLedger] = useState([]);

  useEffect(() => {
    const ss = StorageService.getSuperStockists() ?? defaultSuperStockists;
    const db = StorageService.getDistributors() ?? defaultDistributors;
    const ledger = StorageService.getInventoryLedger() ?? defaultInventoryLedger;

    setSuperStockists(ss);
    setDistributors(db);
    setInventoryLedger(ledger);

    if (!StorageService.getSuperStockists()) StorageService.saveSuperStockists(ss);
    if (!StorageService.getDistributors()) StorageService.saveDistributors(db);
    if (!StorageService.getInventoryLedger()) StorageService.saveInventoryLedger(ledger);
  }, []);

  const addSuperStockist = (ssData) => {
    const ids = superStockists.map(ss => {
      const match = ss.id.match(/SS-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nextId = maxId + 1;
    const newId = `SS-${String(nextId).padStart(3, '0')}`;

    const newSS = {
      ...ssData,
      id: newId,
      totalBilled: Number(ssData.totalBilled || 0),
      outstandingBalance: Number(ssData.outstandingBalance || 0),
      status: ssData.status || "Active",
      lat: Number(ssData.lat || 32.73),
      lng: Number(ssData.lng || 74.86)
    };
    const updated = [newSS, ...superStockists];
    setSuperStockists(updated);
    StorageService.saveSuperStockists(updated);

    // Seed blank ledger items for existing products for Super Stockist
    const products = StorageService.getProducts() || [];
    const newLedgerItems = products.map(p => ({
      superStockistId: newSS.id,
      sku: p.sku,
      currentStock: 500, // starting stock higher for Super Stockist
      reorderLevel: 50,
      lastRestockDate: new Date().toISOString().split("T")[0]
    }));
    
    const updatedLedger = [...inventoryLedger, ...newLedgerItems];
    setInventoryLedger(updatedLedger);
    StorageService.saveInventoryLedger(updatedLedger);

    toast.success(`Super Stockist "${newSS.name}" added successfully.`);
    return newSS;
  };

  const updateSuperStockist = (id, ssData) => {
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
    StorageService.saveSuperStockists(updated);
    toast.success("Super Stockist updated successfully.");
  };

  const deleteSuperStockist = (id) => {
    const updated = superStockists.filter((ss) => ss.id !== id);
    setSuperStockists(updated);
    StorageService.saveSuperStockists(updated);

    // Clean up ledger entries
    const updatedLedger = inventoryLedger.filter((item) => item.superStockistId !== id);
    setInventoryLedger(updatedLedger);
    StorageService.saveInventoryLedger(updatedLedger);

    toast.success("Super Stockist deleted.");
  };

  const addDistributor = (dbData) => {
    const ids = distributors.map(db => {
      const match = db.id.match(/DB-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxId = ids.length > 0 ? Math.max(...ids) : 0;
    const nextId = maxId + 1;
    const newId = `DB-${String(nextId).padStart(3, '0')}`;

    const newDB = {
      ...dbData,
      id: newId,
      assignedBeats: dbData.assignedBeats || [],
      lat: Number(dbData.lat || 34.08),
      lng: Number(dbData.lng || 74.80)
    };
    const updated = [newDB, ...distributors];
    setDistributors(updated);
    StorageService.saveDistributors(updated);
    
    // Seed blank ledger items for existing products
    const products = StorageService.getProducts() || [];
    const newLedgerItems = products.map(p => ({
      distributorId: newDB.id,
      sku: p.sku,
      currentStock: 100,
      reorderLevel: 20,
      lastRestockDate: new Date().toISOString().split("T")[0]
    }));
    
    const updatedLedger = [...inventoryLedger, ...newLedgerItems];
    setInventoryLedger(updatedLedger);
    StorageService.saveInventoryLedger(updatedLedger);

    toast.success(`Distributor "${newDB.name}" added successfully.`);
    return newDB;
  };

  const updateDistributor = (id, dbData) => {
    const updated = distributors.map((db) =>
      db.id === id ? { ...db, ...dbData, lat: Number(dbData.lat ?? db.lat), lng: Number(dbData.lng ?? db.lng) } : db
    );
    setDistributors(updated);
    StorageService.saveDistributors(updated);
    toast.success("Distributor updated successfully.");
  };

  const deleteDistributor = (id) => {
    const updated = distributors.filter((db) => db.id !== id);
    setDistributors(updated);
    StorageService.saveDistributors(updated);

    // Clean up ledger entries
    const updatedLedger = inventoryLedger.filter((item) => item.distributorId !== id);
    setInventoryLedger(updatedLedger);
    StorageService.saveInventoryLedger(updatedLedger);

    toast.success("Distributor deleted.");
  };

  // --- Inventory Operations ---
  const restockProduct = (entityId, productSku, quantity) => {
    const isSS = entityId.startsWith("SS-");
    let itemFound = false;
    const updatedLedger = inventoryLedger.map((item) => {
      const match = isSS 
        ? (item.superStockistId === entityId && item.sku === productSku)
        : (item.distributorId === entityId && item.sku === productSku);
      
      if (match) {
        itemFound = true;
        return {
          ...item,
          currentStock: Math.max(0, item.currentStock + Number(quantity)),
          lastRestockDate: new Date().toISOString().split("T")[0]
        };
      }
      return item;
    });

    const finalLedger = itemFound 
      ? updatedLedger 
      : [
          ...inventoryLedger, 
          isSS 
            ? { superStockistId: entityId, sku: productSku, currentStock: Number(quantity), reorderLevel: 50, lastRestockDate: new Date().toISOString().split("T")[0] }
            : { distributorId: entityId, sku: productSku, currentStock: Number(quantity), reorderLevel: 20, lastRestockDate: new Date().toISOString().split("T")[0] }
        ];

    setInventoryLedger(finalLedger);
    StorageService.saveInventoryLedger(finalLedger);
    toast.success("Stock level updated successfully!");
  };

  const updateInventoryDetails = (entityId, productSku, details) => {
    const isSS = entityId.startsWith("SS-");
    let itemFound = false;
    const updatedLedger = inventoryLedger.map((item) => {
      const match = isSS 
        ? (item.superStockistId === entityId && item.sku === productSku)
        : (item.distributorId === entityId && item.sku === productSku);
      
      if (match) {
        itemFound = true;
        return {
          ...item,
          currentStock: details.currentStock !== undefined ? Number(details.currentStock) : item.currentStock,
          reorderLevel: details.reorderLevel !== undefined ? Number(details.reorderLevel) : item.reorderLevel,
          lastRestockDate: details.lastRestockDate || item.lastRestockDate
        };
      }
      return item;
    });

    const finalLedger = itemFound 
      ? updatedLedger 
      : [
          ...inventoryLedger,
          isSS 
            ? {
                superStockistId: entityId,
                sku: productSku,
                currentStock: details.currentStock !== undefined ? Number(details.currentStock) : 0,
                reorderLevel: details.reorderLevel !== undefined ? Number(details.reorderLevel) : 50,
                lastRestockDate: details.lastRestockDate || new Date().toISOString().split("T")[0]
              }
            : {
                distributorId: entityId,
                sku: productSku,
                currentStock: details.currentStock !== undefined ? Number(details.currentStock) : 0,
                reorderLevel: details.reorderLevel !== undefined ? Number(details.reorderLevel) : 20,
                lastRestockDate: details.lastRestockDate || new Date().toISOString().split("T")[0]
              }
        ];

    setInventoryLedger(finalLedger);
    StorageService.saveInventoryLedger(finalLedger);
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
