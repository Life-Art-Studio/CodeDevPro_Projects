import React, { useState } from "react";
import { useSupplyChainContext } from "../context/SupplyChainContext";
import { useBeatContext } from "../context/BeatContext";
import { useProductContext } from "../context/ProductContext";
import { useAuth } from "../context/AuthContext";
import BottomSheet from "../components/ui/BottomSheet";
import FormField from "../components/ui/FormField";
import StatusBadge from "../components/ui/StatusBadge";
import CustomSelect from "../components/ui/CustomSelect";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign, 
  AlertTriangle, 
  Warehouse, 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  ListPlus, 
  RefreshCw,
  Search,
  Check,
  Download
} from "lucide-react";
import toast from "react-hot-toast";
import { generateWarehouseStockPDF, generateWarehouseStockExcel } from "../utils/generatePdf";

export default function SupplyChain() {
  const {
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
    updateInventoryDetails,
    isLoading
  } = useSupplyChainContext();

  const { beats } = useBeatContext();
  const { products } = useProductContext();
  const { currentUser, users, viewAsUserId } = useAuth();
  
  const effectiveUserId = viewAsUserId || currentUser?.id;
  const effectiveUser = users?.find(u => u.id === effectiveUserId) || currentUser;

  const [activeTab, setActiveTab] = useState((currentUser?.role === 'ADMIN' || currentUser?.role === 'DISTRIBUTOR') ? "ss" : "dist"); // 'ss' or 'dist'
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & BottomSheet states
  const [isSSModalOpen, setIsSSModalOpen] = useState(false);
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null); // { type: 'ss' | 'dist', data: object }
  const [activeDistributorForInventory, setActiveDistributorForInventory] = useState(null);
  const [activeDistributorForBeats, setActiveDistributorForBeats] = useState(null);
  const [tempSelectedBeats, setTempSelectedBeats] = useState([]);

  // Manual Beat ID Input (for fallback/manual addition)
  const [manualBeatsInput, setManualBeatsInput] = useState("");

  // Add Product to Warehouse form inside BottomSheet
  const [newWarehouseProduct, setNewWarehouseProduct] = useState({
    sku: "",
    currentStock: 100,
    reorderLevel: 20
  });
  
  // Custom Restock input state inside BottomSheet
  const [restockQuantities, setRestockQuantities] = useState({}); // sku -> quantity

  // Super Stockist Form state
  const [ssForm, setSSForm] = useState({
    name: "",
    state: "",
    contactPhone: "",
    email: "",
    totalBilled: "",
    outstandingBalance: "",
    status: "Active",
    lat: "",
    lng: "",
    gstNo: "",
    owner_id: ""
  });

  // Distributor Form state
  const [distForm, setDistForm] = useState({
    name: "",
    superStockistId: "",
    district: "",
    contactPhone: "",
    assignedBeats: [],
    status: "Active",
    lat: "",
    lng: "",
    gstNo: "",
    owner_id: ""
  });

  // Calculations for Super Stockists
  const totalBilledSS = superStockists.reduce((sum, ss) => sum + (ss.totalBilled || 0), 0);
  const totalOutstandingSS = superStockists.reduce((sum, ss) => sum + (ss.outstandingBalance || 0), 0);

  // Calculations for Distributors
  const getDistributorStockSum = (entityId) => {
    if (!entityId) return 0;
    const isSS = entityId.startsWith("SS-");
    return inventoryLedger
      .filter((item) => isSS ? item.superStockistId === entityId : item.distributorId === entityId)
      .reduce((sum, item) => sum + (item.currentStock || 0), 0);
  };

  const getLowStockAlertCount = (entityId) => {
    if (!entityId) return 0;
    const isSS = entityId.startsWith("SS-");
    return inventoryLedger
      .filter((item) => 
        (isSS ? item.superStockistId === entityId : item.distributorId === entityId) && 
        item.currentStock <= item.reorderLevel
      )
      .length;
  };

  const totalLowStockAlerts = 
    distributors.reduce((sum, db) => sum + getLowStockAlertCount(db.id), 0) +
    superStockists.reduce((sum, ss) => sum + getLowStockAlertCount(ss.id), 0);

  const getDistributorOwningBeat = (beatId) => {
    return distributors.find(db => db.assignedBeats?.includes(beatId));
  };

  // Filter lists based on search AND hierarchy visibility
  const filteredSS = superStockists.filter((ss) => {
    // Hierarchy Check
    if (effectiveUser?.role === 'SUPER_STOCKIST') {
      if (ss.owner_id !== effectiveUserId) return false;
    } else if (effectiveUser?.role === 'DISTRIBUTOR') {
      // DB only sees their parent SS
      if (ss.owner_id !== effectiveUser?.parent_id) return false;
    } else if (effectiveUser?.role !== 'ADMIN') {
      return false; // Only Admin, SS, DB should see SS table rows
    }
    // Search Check
    return (ss.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ss.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ss.id || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredDistributors = distributors.filter((db) => {
    // Hierarchy Check
    if (effectiveUser?.role === 'DISTRIBUTOR') {
      if (db.owner_id !== effectiveUserId) return false;
    } else if (effectiveUser?.role === 'SUPER_STOCKIST') {
      // SS should only see distributors that belong to their SS nodes
      const isOwnedByMe = db.owner_id === effectiveUserId;
      const belongsToMySS = superStockists.some(ss => ss.owner_id === effectiveUserId && ss.id === db.superStockistId);
      if (!isOwnedByMe && !belongsToMySS) return false;
    }
    
    // Search Check
    const parentSS = superStockists.find(ss => ss.id === db.superStockistId)?.name || "";
    return (db.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (db.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      parentSS.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (db.id || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSSSubmit = (e) => {
    e.preventDefault();
    if (!ssForm.name || !ssForm.state || !ssForm.contactPhone || !ssForm.gstNo) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (editingEntity && editingEntity.type === "ss") {
      updateSuperStockist(editingEntity.data.id, ssForm);
    } else {
      addSuperStockist(ssForm);
    }

    // Reset & Close
    setSSForm({
      name: "",
      state: "",
      contactPhone: "",
      email: "",
      totalBilled: "",
      outstandingBalance: "",
      status: "Active",
      lat: "",
      lng: "",
      gstNo: "",
      owner_id: ""
    });
    setEditingEntity(null);
    setIsSSModalOpen(false);
  };

  const handleDistSubmit = (e) => {
    e.preventDefault();
    if (!distForm.name || !distForm.superStockistId || !distForm.district || !distForm.contactPhone || !distForm.gstNo) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      ...distForm
    };

    if (editingEntity && editingEntity.type === "dist") {
      updateDistributor(editingEntity.data.id, payload);
    } else {
      addDistributor(payload);
    }

    // Reset & Close
    setDistForm({
      name: "",
      superStockistId: "",
      district: "",
      contactPhone: "",
      assignedBeats: [],
      status: "Active",
      lat: "",
      lng: "",
      gstNo: "",
      owner_id: ""
    });
    setManualBeatsInput("");
    setEditingEntity(null);
    setIsDistModalOpen(false);
  };

  // Trigger SS Edit
  const startSSEdit = (ss) => {
    setEditingEntity({ type: "ss", data: ss });
    setSSForm({
      name: ss.name,
      state: ss.state,
      contactPhone: ss.contactPhone,
      email: ss.email || "",
      totalBilled: ss.totalBilled,
      outstandingBalance: ss.outstandingBalance,
      status: ss.status || "Active",
      lat: ss.lat || "",
      lng: ss.lng || "",
      gstNo: ss.gstNo || "",
      owner_id: ss.owner_id || ""
    });
    setIsSSModalOpen(true);
  };

  // Trigger Distributor Edit
  const startDistEdit = (dist) => {
    setEditingEntity({ type: "dist", data: dist });
    setDistForm({
      name: dist.name,
      superStockistId: dist.superStockistId,
      district: dist.district,
      contactPhone: dist.contactPhone,
      assignedBeats: dist.assignedBeats || [],
      status: dist.status || "Active",
      lat: dist.lat || "",
      lng: dist.lng || "",
      gstNo: dist.gstNo || "",
      owner_id: dist.owner_id || ""
    });
    setManualBeatsInput(dist.assignedBeats ? dist.assignedBeats.join(", ") : "");
    setIsDistModalOpen(true);
  };

  const startAssignBeats = (db) => {
    setActiveDistributorForBeats(db);
    setTempSelectedBeats(db.assignedBeats || []);
  };

  // Combine products list for robust warehouse display
  const getDistributorLedgerItems = (entityId) => {
    if (!entityId) return [];
    const isSS = entityId.startsWith("SS-");
    const distLedger = inventoryLedger.filter((item) => isSS ? item.superStockistId === entityId : item.distributorId === entityId);
    const items = [];

    // 1. Traverse catalogue products
    products.forEach((prod) => {
      const entry = distLedger.find((item) => item.sku === prod.sku);
      items.push({
        sku: prod.sku,
        name: prod.name,
        category: prod.category || "General",
        image: prod.image,
        currentStock: entry ? entry.currentStock : 0,
        reorderLevel: entry ? entry.reorderLevel : (isSS ? 50 : 20),
        lastRestockDate: entry ? entry.lastRestockDate : "Never",
        isSeeded: !!entry
      });
    });

    // 2. Travese entries in ledger that are not in catalog (backwards compatibility)
    distLedger.forEach((entry) => {
      const exists = items.some((item) => item.sku === entry.sku);
      if (!exists) {
        items.push({
          sku: entry.sku,
          name: entry.sku,
          category: "General",
          image: null,
          currentStock: entry.currentStock,
          reorderLevel: entry.reorderLevel,
          lastRestockDate: entry.lastRestockDate,
          isSeeded: true
        });
      }
    });

    return items;
  };

  // Quick Restock execution
  const handleQuickRestock = (distId, sku) => {
    const qty = Number(restockQuantities[sku]);
    if (!qty || qty <= 0) {
      toast.error("Please enter a valid restock quantity.");
      return;
    }
    restockProduct(distId, sku, qty);
    setRestockQuantities(prev => ({ ...prev, [sku]: "" }));
  };

  // Inline value change for inventory ledger
  const handleInlineLedgerEdit = (distId, sku, field, value) => {
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    updateInventoryDetails(distId, sku, { [field]: numValue });
    toast.success("Inventory updated inline.", { id: `inline-${sku}-${field}`, duration: 1500 });
  };

  // Add new stock item to ledger
  const handleAddNewLedgerItem = (e, distId) => {
    e.preventDefault();
    if (!newWarehouseProduct.sku) {
      toast.error("Please select a product SKU.");
      return;
    }

    updateInventoryDetails(distId, newWarehouseProduct.sku, {
      currentStock: Number(newWarehouseProduct.currentStock),
      reorderLevel: Number(newWarehouseProduct.reorderLevel)
    });

    toast.success("Product stock added to warehouse ledger.");
    setNewWarehouseProduct({
      sku: "",
      currentStock: 100,
      reorderLevel: 20
    });
  };

  const handleExportAllInventoryCSV = () => {
    if (inventoryLedger.length === 0) {
      toast.error("No inventory data to export.");
      return;
    }

    const headers = [
      "Entity Type",
      "Warehouse Name",
      "Region/District",
      "Product Name",
      "SKU",
      "Category",
      "Current Stock",
      "Reorder Threshold",
      "Inventory Status",
      "Last Restock Date"
    ];

    const rows = [];

    inventoryLedger.forEach(item => {
      const product = products.find(p => p.sku === item.sku);
      const prodName = product ? product.name : item.sku;
      const prodCat = product ? (product.category || "General") : "General";
      const isLowStock = item.currentStock <= item.reorderLevel ? "Low Stock" : "Healthy";

      if (item.superStockistId) {
        const ss = superStockists.find(s => s.id === item.superStockistId);
        if (ss) {
          rows.push([
            "Super Stockist",
            `"${ss.name}"`,
            `"${ss.state}"`,
            `"${prodName}"`,
            item.sku,
            prodCat,
            item.currentStock,
            item.reorderLevel,
            isLowStock,
            item.lastRestockDate || "Never"
          ]);
        }
      } else if (item.distributorId) {
        const db = distributors.find(d => d.id === item.distributorId);
        if (db) {
          rows.push([
            "Distributor",
            `"${db.name}"`,
            `"${db.district}"`,
            `"${prodName}"`,
            item.sku,
            prodCat,
            item.currentStock,
            item.reorderLevel,
            isLowStock,
            item.lastRestockDate || "Never"
          ]);
        }
      }
    });

    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Network_Inventory_Report_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    toast.success("Network inventory status report downloaded.");
  };

  const handleExportSingleInventoryCSV = (entity) => {
    const ledgerItems = getDistributorLedgerItems(entity.id);
    if (ledgerItems.length === 0) {
      toast.error("No stock entries to export.");
      return;
    }

    const isSS = entity.id.startsWith("SS-");
    const partyType = isSS ? "Super Stockist" : "Distributor";
    const totalStockSum = ledgerItems.reduce((sum, item) => sum + (item.currentStock || 0), 0);
    const lowStockCount = ledgerItems.filter(item => item.currentStock <= item.reorderLevel).length;

    const dateString = new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const separator = "==========================================================================";
    const miniSeparator = "--------------------------------------------------------------------------";

    // Structured decorated metadata rows at the top of CSV
    const metaRows = [
      [separator],
      ["                     STOCK STATUS LEDGER REPORT"],
      [separator],
      [`Generated on: ${dateString} • CodeDevPro Smart Panel`],
      [],
      [`PARTY DETAILS (${partyType.toUpperCase()})`],
      [miniSeparator],
      ["Party Name:       ", `"${entity.name}"`],
      ["Address/Area:     ", `"${entity.district || entity.state || "Not Specified"}"`],
      ["Phone No:         ", `"${entity.contactPhone || "Not Specified"}"`],
      ["GST Number:       ", `"${entity.gstNo || "N/A"}"`],
      [miniSeparator],
      [],
      ["STOCK LEDGER SUMMARY"],
      [miniSeparator],
      ["Total Stock Units:", `${totalStockSum} Units`],
      ["Low Stock Alerts: ", `${lowStockCount} Items`],
      ["Warehouse Status: ", `${lowStockCount > 0 ? "CRITICAL ALERT" : "HEALTHY"}`],
      [separator],
      [],
      ["S.No", "Product Name", "SKU", "Category", "Current Stock", "Reorder Level", "Stock Status"]
    ];

    const dataRows = ledgerItems.map((item, index) => {
      const isLowStock = item.currentStock <= item.reorderLevel ? "Low Stock" : "Healthy";
      return [
        (index + 1).toString(),
        `"${item.name}"`,
        item.sku,
        item.category,
        item.currentStock,
        item.reorderLevel,
        isLowStock
      ];
    });

    const csvContent = "\uFEFF" + [...metaRows, ...dataRows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Stock_Ledger_${(entity.name || 'Entity').replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
    link.click();
    toast.success(`Stock ledger for "${entity.name}" downloaded.`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">Loading supply chain data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col p-4 sm:p-6 lg:p-8 bg-zinc-50 dark:bg-[#0f1117] font-sans transition-colors overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 pb-20 sm:pb-6">
        
        {/* Page Title & Add Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              <Warehouse className="w-8 h-8 text-indigo-500" /> Supply Chain Network
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              Manage your network of Super Stockists, local Distributors, and physical warehouse inventory.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportAllInventoryCSV}
              className="w-full sm:w-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm min-h-[44px]"
              title="Download Stock Status (All Super Stockists and Distributors)"
            >
              <Download className="w-5 h-5 text-indigo-500" /> Export All Stock
            </button>
            {activeTab === "ss" ? (
              <button
                onClick={() => {
                  setEditingEntity(null);
                  setSSForm({
                    name: "",
                    state: "",
                    contactPhone: "",
                    email: "",
                    totalBilled: "",
                    outstandingBalance: "",
                    status: "Active",
                    lat: "",
                    lng: "",
                    gstNo: "",
                    owner_id: ""
                  });
                  setIsSSModalOpen(true);
                }}
                className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md min-h-[44px]"
              >
                <Plus className="w-5 h-5" /> Add Super Stockist
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingEntity(null);
                  setDistForm({
                    name: "",
                    superStockistId: superStockists[0]?.id || "",
                    district: "",
                    contactPhone: "",
                    assignedBeats: [],
                    status: "Active",
                    lat: "",
                    lng: "",
                    gstNo: "",
                    owner_id: ""
                  });
                  setManualBeatsInput("");
                  setIsDistModalOpen(true);
                }}
                className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-md min-h-[44px]"
              >
                <Plus className="w-5 h-5" /> Add Distributor
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Metric Cards Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          {activeTab === "ss" ? (
            <>
              <div className="bg-[#1a1d27]/90 dark:bg-[#1a1d27]/90 backdrop-blur border border-zinc-800 p-5 rounded-2xl shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Super Stockists</p>
                  <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-100 mt-1">{superStockists.length}</p>
                </div>
              </div>
              <div className="bg-[#1a1d27]/90 dark:bg-[#1a1d27]/90 backdrop-blur border border-zinc-800 p-5 rounded-2xl shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Billed Volume</p>
                  <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-100 mt-1">₹{totalBilledSS.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="bg-[#1a1d27]/90 dark:bg-[#1a1d27]/90 backdrop-blur border border-zinc-800 p-5 rounded-2xl shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">₹{totalOutstandingSS.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#1a1d27]/90 dark:bg-[#1a1d27]/90 backdrop-blur border border-zinc-800 p-5 rounded-2xl shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Warehouse className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Distributors</p>
                  <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-100 mt-1">{distributors.length}</p>
                </div>
              </div>
              <div className="bg-[#1a1d27]/90 dark:bg-[#1a1d27]/90 backdrop-blur border border-zinc-800 p-5 rounded-2xl shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Low Stock SKUs</p>
                  <p className="text-2xl font-bold text-red-500 mt-1">{totalLowStockAlerts}</p>
                </div>
              </div>
              <div className="bg-[#1a1d27]/90 dark:bg-[#1a1d27]/90 backdrop-blur border border-zinc-800 p-5 rounded-2xl shadow-md flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <ListPlus className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Average Beats Mapped</p>
                  <p className="text-2xl font-bold text-zinc-950 dark:text-zinc-100 mt-1">
                    {(distributors.reduce((sum, d) => sum + (d.assignedBeats?.length || 0), 0) / Math.max(1, distributors.length)).toFixed(1)}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tab Controls & Toolbar Search */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm shrink-0">
          
          {/* Custom Sleek Tabs */}
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-full sm:w-auto">
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'DISTRIBUTOR') && (
              <button
                onClick={() => { setActiveTab("ss"); setSearchTerm(""); }}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all min-h-[36px] ${
                  activeTab === "ss"
                    ? "bg-white dark:bg-[#1a1d27] text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                Super Stockists
              </button>
            )}
            {currentUser?.role !== 'DISTRIBUTOR' && (
              <button
                onClick={() => { setActiveTab("dist"); setSearchTerm(""); }}
                className={`flex-1 sm:flex-none px-6 py-2 text-sm font-semibold rounded-lg transition-all min-h-[36px] ${
                  activeTab === "dist"
                    ? "bg-white dark:bg-[#1a1d27] text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                Distributors
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={activeTab === "ss" ? "Search by name, state, or ID..." : "Search by name, area, parent SS..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-zinc-900 dark:text-zinc-100 min-h-[44px]"
            />
          </div>
        </div>

        {/* --- TABLES --- */}
        <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex-1 min-h-[300px]">
          {activeTab === "ss" ? (
            /* Super Stockist Data Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <th className="px-6 py-4">Super Stockist</th>
                    <th className="px-6 py-4">State/Region</th>
                    <th className="px-6 py-4 text-center">Distributors</th>
                    <th className="px-6 py-4 text-right">Billed Vol</th>
                    <th className="px-6 py-4 text-right">Outstanding</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredSS.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-zinc-500">No Super Stockists found.</td>
                    </tr>
                  ) : (
                    filteredSS.map((ss) => {
                      const childCount = distributors.filter((d) => d.superStockistId === ss.id).length;
                      const lowStockAlerts = getLowStockAlertCount(ss.id);

                      return (
                        <tr key={ss.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
                                {(ss.name || 'S').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-950 dark:text-zinc-100">{ss.name}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{ss.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                            {ss.state}
                          </td>
                          <td className="px-6 py-4 text-center text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            <span className="bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-100 dark:border-purple-500/20">
                              {childCount} Mapped
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-zinc-950 dark:text-zinc-100">
                            ₹{ss.totalBilled?.toLocaleString("en-IN") || 0}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-bold text-amber-600 dark:text-amber-400">
                            ₹{ss.outstandingBalance?.toLocaleString("en-IN") || 0}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={ss.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setActiveDistributorForInventory(ss)}
                                className="relative px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-500/20 transition-all flex items-center gap-1 min-h-[36px] mr-2"
                              >
                                <Package className="w-3.5 h-3.5" /> View Stock
                                {lowStockAlerts > 0 && (
                                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
                                    {lowStockAlerts}
                                  </span>
                                )}
                              </button>
                              {currentUser?.role === 'ADMIN' && (
                                <>
                                  <button
                                    onClick={() => startSSEdit(ss)}
                                    className="p-2 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteSuperStockist(ss.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Distributor Data Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    <th className="px-6 py-4">Distributor</th>
                    <th className="px-6 py-4">Parent Super Stockist</th>
                    <th className="px-6 py-4">District/Area</th>
                    <th className="px-6 py-4">Mapped Beats</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredDistributors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-500">No Distributors found.</td>
                    </tr>
                  ) : (
                    (() => {
                      const groupedDBs = filteredDistributors.reduce((acc, db) => {
                        const parentSSName = superStockists.find(ss => ss.id === db.superStockistId)?.name || "Unknown Super Stockist";
                        if (!acc[parentSSName]) acc[parentSSName] = [];
                        acc[parentSSName].push(db);
                        return acc;
                      }, {});

                      return Object.entries(groupedDBs).map(([ssName, dbs]) => (
                        <React.Fragment key={ssName}>
                          <tr className="bg-indigo-50/50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
                            <td colSpan="6" className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">{ssName}</span>
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-800/50 px-2 py-0.5 rounded-full">{dbs.length} Distributors</span>
                              </div>
                            </td>
                          </tr>
                          {dbs.map((db) => {
                            const lowStockAlerts = getLowStockAlertCount(db.id);

                            return (
                              <tr key={db.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                      {(db.name || 'D').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-bold text-zinc-950 dark:text-zinc-100">{db.name}</p>
                                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{db.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                  {ssName}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                  {db.district}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                                    {db.assignedBeats && db.assignedBeats.length > 0 ? (
                                      db.assignedBeats.map(beatId => {
                                        const b = beats.find(x => x.id === beatId);
                                        return (
                                          <span key={beatId} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs font-bold border border-indigo-100 dark:border-indigo-500/20">
                                            {b ? b.name : beatId}
                                          </span>
                                        );
                                      })
                                    ) : (
                                      <span className="text-xs text-zinc-400 italic">None</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <StatusBadge status={db.status || "Active"} />
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => setActiveDistributorForInventory(db)}
                                      className="relative px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-500/20 transition-all flex items-center gap-1 min-h-[36px] mr-2"
                                    >
                                      <Package className="w-3.5 h-3.5" /> View Stock
                                      {lowStockAlerts > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm animate-pulse">
                                          {lowStockAlerts}
                                        </span>
                                      )}
                                    </button>
                                    {currentUser?.role !== 'ADMIN' && (currentUser?.role === 'ADMIN' || db.owner_id === currentUser?.id) && (
                                      <button
                                        onClick={() => startAssignBeats(db)}
                                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-500/20 transition-all flex items-center gap-1 min-h-[36px] mr-2"
                                      >
                                        <MapPin className="w-3.5 h-3.5" /> Assign Beats
                                      </button>
                                    )}
                                    {(currentUser?.role === 'ADMIN' || db.owner_id === currentUser?.id) && (
                                      <>
                                        <button
                                          onClick={() => startDistEdit(db)}
                                          className="p-2 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                          title="Edit"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => deleteDistributor(db.id)}
                                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                          title="Delete"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ));
                    })()
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* --- ADD / EDIT SUPER STOCKIST MODAL --- */}
      {isSSModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[calc(100dvh-2rem)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="shrink-0 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 transition-colors">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {editingEntity ? "Edit Super Stockist" : "Add Super Stockist"}
              </h3>
              <button
                onClick={() => setIsSSModalOpen(false)}
                className="text-zinc-400 hover:text-pink-500 p-2 rounded-full transition-colors min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleSSSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {!editingEntity && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Link to Existing User (Optional)</label>
                    <CustomSelect
                      value={ssForm.owner_id || "none"}
                      onChange={(userId) => {
                        if (userId === "none") {
                          setSSForm(prev => ({ ...prev, owner_id: "" }));
                        } else {
                          const user = users?.find(u => u.id === userId);
                          if (user) {
                            setSSForm(prev => ({
                              ...prev,
                              owner_id: user.id,
                              name: user.full_name || prev.name,
                              contactPhone: user.phone || prev.contactPhone,
                              email: user.email || prev.email,
                            }));
                          }
                        }
                      }}
                      className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl p-2.5 flex items-center justify-between outline-none cursor-pointer text-sm"
                      options={[
                        { value: "none", label: "-- Do not link user --" },
                        ...(users?.filter(u => u.role === 'SUPER_STOCKIST').map(u => ({ value: u.id, label: u.full_name || u.email })) || [])
                      ]}
                    />
                  </div>
                )}
                <FormField
                  label="Super Stockist Name *"
                  name="name"
                  required
                  placeholder="e.g. J&K Logistics Hub"
                  value={ssForm.name}
                  onChange={(e) => setSSForm({ ...ssForm, name: e.target.value })}
                />
                <FormField
                  label="State/Region *"
                  name="state"
                  required
                  placeholder="e.g. Jammu & Kashmir"
                  value={ssForm.state}
                  onChange={(e) => setSSForm({ ...ssForm, state: e.target.value })}
                />
                <FormField
                  label="Contact Phone *"
                  name="contactPhone"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={ssForm.contactPhone}
                  onChange={(e) => setSSForm({ ...ssForm, contactPhone: e.target.value })}
                />
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="e.g. jk@logistics.com"
                  value={ssForm.email}
                  onChange={(e) => setSSForm({ ...ssForm, email: e.target.value })}
                />
                <FormField
                  label="GST Number *"
                  name="gstNo"
                  required
                  placeholder="e.g. 01AABCU1234F1Z1"
                  value={ssForm.gstNo}
                  onChange={(e) => setSSForm({ ...ssForm, gstNo: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Billed Amt (₹)"
                    name="totalBilled"
                    type="number"
                    placeholder="Total billed volume"
                    value={ssForm.totalBilled}
                    onChange={(e) => setSSForm({ ...ssForm, totalBilled: e.target.value })}
                  />
                  <FormField
                    label="Outstanding (₹)"
                    name="outstandingBalance"
                    type="number"
                    placeholder="Pending payment balance"
                    value={ssForm.outstandingBalance}
                    onChange={(e) => setSSForm({ ...ssForm, outstandingBalance: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <FormField
                    label="Latitude Coordinates"
                    name="lat"
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 32.7266"
                    value={ssForm.lat}
                    onChange={(e) => setSSForm({ ...ssForm, lat: e.target.value })}
                  />
                  <FormField
                    label="Longitude Coordinates"
                    name="lng"
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 74.8570"
                    value={ssForm.lng}
                    onChange={(e) => setSSForm({ ...ssForm, lng: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Status</label>
                  <CustomSelect
                    value={ssForm.status}
                    onChange={(val) => setSSForm({ ...ssForm, status: val })}
                    className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl p-2.5 flex items-center justify-between outline-none cursor-pointer text-sm"
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Inactive", label: "Inactive" }
                    ]}
                  />
                </div>
              </div>
              <div className="shrink-0 px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSSModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 min-h-[44px]"
                >
                  {editingEntity ? "Update Stockist" : "Save Stockist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT DISTRIBUTOR MODAL --- */}
      {isDistModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[calc(100dvh-2rem)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="shrink-0 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 transition-colors">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {editingEntity ? "Edit Distributor" : "Add Distributor"}
              </h3>
              <button
                onClick={() => setIsDistModalOpen(false)}
                className="text-zinc-400 hover:text-pink-500 p-2 rounded-full transition-colors min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleDistSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {!editingEntity && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Link to Existing User (Optional)</label>
                    <CustomSelect
                      value={distForm.owner_id || "none"}
                      onChange={(userId) => {
                        if (userId === "none") {
                          setDistForm(prev => ({ ...prev, owner_id: "" }));
                        } else {
                          const user = users?.find(u => u.id === userId);
                          if (user) {
                            setDistForm(prev => ({
                              ...prev,
                              owner_id: user.id,
                              name: user.full_name || prev.name,
                              contactPhone: user.phone || prev.contactPhone,
                              email: user.email || prev.email,
                            }));
                          }
                        }
                      }}
                      className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl p-2.5 flex items-center justify-between outline-none cursor-pointer text-sm"
                      options={[
                        { value: "none", label: "-- Do not link user --" },
                        ...(users?.filter(u => u.role === 'DISTRIBUTOR').map(u => ({ value: u.id, label: u.full_name || u.email })) || [])
                      ]}
                    />
                  </div>
                )}
                <FormField
                  label="Distributor Name *"
                  name="name"
                  required
                  placeholder="e.g. Kashmiri Enterprises"
                  value={distForm.name}
                  onChange={(e) => setDistForm({ ...distForm, name: e.target.value })}
                />
                
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Parent Super Stockist *</label>
                  <CustomSelect
                    value={distForm.superStockistId}
                    onChange={(val) => setDistForm({ ...distForm, superStockistId: val })}
                    className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl p-2.5 flex items-center justify-between outline-none cursor-pointer text-sm"
                    options={superStockists
                      .filter(ss => effectiveUser?.role === 'ADMIN' || ss.owner_id === effectiveUser?.parent_id || ss.owner_id === effectiveUserId)
                      .map((ss) => ({ value: ss.id, label: ss.name }))
                    }
                  />
                </div>

                <FormField
                  label="District/Area *"
                  name="district"
                  required
                  placeholder="e.g. Srinagar"
                  value={distForm.district}
                  onChange={(e) => setDistForm({ ...distForm, district: e.target.value })}
                />
                
                <FormField
                  label="Contact Phone *"
                  name="contactPhone"
                  required
                  placeholder="e.g. +91 99061 23456"
                  value={distForm.contactPhone}
                  onChange={(e) => setDistForm({ ...distForm, contactPhone: e.target.value })}
                />
                <FormField
                  label="GST Number *"
                  name="gstNo"
                  required
                  placeholder="e.g. 01CCEXW9012J3Z3"
                  value={distForm.gstNo}
                  onChange={(e) => setDistForm({ ...distForm, gstNo: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <FormField
                    label="Latitude Coordinates"
                    name="lat"
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 34.0837"
                    value={distForm.lat}
                    onChange={(e) => setDistForm({ ...distForm, lat: e.target.value })}
                  />
                  <FormField
                    label="Longitude Coordinates"
                    name="lng"
                    type="number"
                    step="0.000001"
                    placeholder="e.g. 74.7973"
                    value={distForm.lng}
                    onChange={(e) => setDistForm({ ...distForm, lng: e.target.value })}
                  />
                </div>

                {currentUser?.role !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 font-semibold">Assign Beats</label>
                    {beats.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No beats available. Create beats in the Beats page first.</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 max-h-[160px] overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 custom-scrollbar">
                        {beats.map((beat) => {
                          const isChecked = distForm.assignedBeats?.includes(beat.id);
                          const owningDb = getDistributorOwningBeat(beat.id);
                          const isAssignedToOther = owningDb && owningDb.id !== (editingEntity?.type === "dist" ? editingEntity.data.id : null);
                          return (
                            <label key={beat.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                              isAssignedToOther 
                                ? "opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/40" 
                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer select-none"
                            }`}>
                              <input
                                type="checkbox"
                                checked={isChecked || false}
                                disabled={isAssignedToOther}
                                onChange={(e) => {
                                  const newBeats = e.target.checked
                                    ? [...(distForm.assignedBeats || []), beat.id]
                                    : (distForm.assignedBeats || []).filter(id => id !== beat.id);
                                  setDistForm({ ...distForm, assignedBeats: newBeats });
                                }}
                                className={`rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4 ${isAssignedToOther ? "cursor-not-allowed" : ""}`}
                              />
                              <div className="text-left">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                  {beat.name} {isAssignedToOther && <span className="text-[10px] text-red-500 font-semibold ml-1">({owningDb.name})</span>}
                                </p>
                                <p className="text-[10px] text-zinc-400 font-mono">{beat.id}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Status</label>
                  <CustomSelect
                    value={distForm.status}
                    onChange={(val) => setDistForm({ ...distForm, status: val })}
                    className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl p-2.5 flex items-center justify-between outline-none cursor-pointer text-sm"
                    options={[
                      { value: "Active", label: "Active" },
                      { value: "Inactive", label: "Inactive" }
                    ]}
                  />
                </div>
              </div>
              <div className="shrink-0 px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDistModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 min-h-[44px]"
                >
                  {editingEntity ? "Update Distributor" : "Save Distributor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QUICK BEAT ASSIGNMENT MODAL --- */}
      {activeDistributorForBeats && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#0a0c14]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[calc(100dvh-2rem)] shadow-2xl rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="shrink-0 px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 transition-colors">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Assign Beats
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Manage beat mapping for <span className="font-semibold text-zinc-800 dark:text-zinc-200">{activeDistributorForBeats.name}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveDistributorForBeats(null)}
                className="text-zinc-400 hover:text-pink-500 p-2 rounded-full transition-colors min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              {beats.length === 0 ? (
                <p className="text-sm text-zinc-500 italic text-center py-8">No beats available. Create beats in the Beats page first.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 bg-zinc-50 dark:bg-zinc-900 custom-scrollbar">
                  {beats.map((beat) => {
                    const isChecked = tempSelectedBeats.includes(beat.id);
                    const owningDb = getDistributorOwningBeat(beat.id);
                    const isAssignedToOther = owningDb && owningDb.id !== activeDistributorForBeats.id;
                    return (
                      <label key={beat.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors border border-transparent ${
                        isAssignedToOther
                          ? "opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/40"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer select-none hover:border-zinc-200 dark:hover:border-zinc-700"
                      }`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isAssignedToOther}
                          onChange={(e) => {
                            const newBeats = e.target.checked
                              ? [...tempSelectedBeats, beat.id]
                              : tempSelectedBeats.filter(id => id !== beat.id);
                            setTempSelectedBeats(newBeats);
                          }}
                          className={`rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-5 w-5 ${isAssignedToOther ? "cursor-not-allowed" : ""}`}
                        />
                        <div className="text-left">
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                            {beat.name} {isAssignedToOther && <span className="text-xs text-red-500 font-semibold ml-1">({owningDb.name})</span>}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{beat.id}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="shrink-0 px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveDistributorForBeats(null)}
                className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateDistributor(activeDistributorForBeats.id, {
                    ...activeDistributorForBeats,
                    assignedBeats: tempSelectedBeats
                  });
                  setActiveDistributorForBeats(null);
                }}
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 min-h-[44px]"
              >
                Save Beat Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DISTRIBUTOR INVENTORY SLIDING BOTTOM SHEET --- */}
      <BottomSheet
        isOpen={activeDistributorForInventory !== null}
        onClose={() => setActiveDistributorForInventory(null)}
        title={activeDistributorForInventory ? `Stock Ledger: ${activeDistributorForInventory.name}` : "Warehouse Stock Details"}
        height="85vh"
      >
        {activeDistributorForInventory && (
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Header Metrics */}
            <div className="bg-zinc-50 dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                  {activeDistributorForInventory.id.startsWith("SS-") ? "Super Stockist Warehouse" : "Distributor Warehouse"}
                </p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{activeDistributorForInventory.name}</p>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  {activeDistributorForInventory.id.startsWith("SS-")
                    ? `${activeDistributorForInventory.state} Region • ${activeDistributorForInventory.contactPhone}`
                    : `${activeDistributorForInventory.district} Area • ${activeDistributorForInventory.contactPhone}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Stock</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {getDistributorStockSum(activeDistributorForInventory.id)} Units
                </p>
              </div>
            </div>

            {/* Seed / Add New Product Stock Section */}
            <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl">
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" /> Add Product Stock to Warehouse
              </h4>
              <form onSubmit={(e) => handleAddNewLedgerItem(e, activeDistributorForInventory.id)} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Select Catalog Product</label>
                  <CustomSelect
                    value={newWarehouseProduct.sku}
                    onChange={(val) => setNewWarehouseProduct({ ...newWarehouseProduct, sku: val })}
                    className="w-full border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl p-2 flex items-center justify-between outline-none cursor-pointer text-sm"
                    options={[
                      { value: "", label: "-- Select SKU --" },
                      ...products.map(p => ({ value: p.sku, label: `${p.name} (${p.sku})` }))
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Starting Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newWarehouseProduct.currentStock}
                    onChange={(e) => setNewWarehouseProduct({ ...newWarehouseProduct, currentStock: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[40px]"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 min-h-[40px] shadow"
                  >
                    Add Stock Entry
                  </button>
                </div>
              </form>
            </div>

            {/* Warehouse Stock Ledger Table */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Warehouse Products Listing (Direct Inline Editing!)</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const ledgerItems = getDistributorLedgerItems(activeDistributorForInventory.id);
                      generateWarehouseStockPDF(activeDistributorForInventory, ledgerItems);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold border border-rose-100 dark:border-rose-500/20 transition-all flex items-center gap-1.5 min-h-[32px]"
                    title="Download beautifully styled PDF stock status report"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-500" /> Download PDF
                  </button>
                  <button
                    onClick={() => {
                      const ledgerItems = getDistributorLedgerItems(activeDistributorForInventory.id);
                      generateWarehouseStockExcel(activeDistributorForInventory, ledgerItems);
                    }}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-500/20 transition-all flex items-center gap-1.5 min-h-[32px]"
                    title="Download beautifully styled and formatted Excel ledger sheet"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" /> Download Excel
                  </button>
                  <button
                    onClick={() => handleExportSingleInventoryCSV(activeDistributorForInventory)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-500/20 transition-all flex items-center gap-1.5 min-h-[32px]"
                    title="Download raw CSV report of this warehouse stock ledger"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" /> Export CSV
                  </button>
                </div>
              </div>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-x-auto bg-white dark:bg-[#1a1d27] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <th className="px-4 py-3">Product Name & SKU</th>
                      <th className="px-4 py-3 w-40">Current Stock</th>
                      <th className="px-4 py-3 w-40">Reorder Threshold</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {(() => {
                      const ledgerItems = getDistributorLedgerItems(activeDistributorForInventory.id);
                      if (ledgerItems.length === 0) {
                        return (
                          <tr>
                            <td colSpan="5" className="text-center py-12 text-zinc-500 text-sm font-semibold">No stock entries mapped. Use the form above to add products.</td>
                          </tr>
                        );
                      }
                      
                      return ledgerItems.map((item) => {
                        const isLowStock = item.currentStock <= item.reorderLevel;

                        return (
                          <tr key={item.sku} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0">P</div>
                                )}
                                <div>
                                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{item.name}</p>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold uppercase">{item.sku} • {item.category}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.currentStock}
                                  onChange={(e) => handleInlineLedgerEdit(activeDistributorForInventory.id, item.sku, "currentStock", e.target.value)}
                                  className="w-24 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-center font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums min-h-[36px]"
                                />
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Units</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={item.reorderLevel}
                                  onChange={(e) => handleInlineLedgerEdit(activeDistributorForInventory.id, item.sku, "reorderLevel", e.target.value)}
                                  className="w-24 px-2 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums min-h-[36px]"
                                />
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Units</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isLowStock ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 ring-1 ring-red-600/20">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-600/20">
                                  Healthy
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="inline-flex items-center gap-1.5 max-w-[150px]">
                                <input
                                  type="number"
                                  placeholder="+ Qty"
                                  value={restockQuantities[item.sku] || ""}
                                  onChange={(e) => setRestockQuantities({ ...restockQuantities, [item.sku]: e.target.value })}
                                  className="w-16 px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-center focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[32px]"
                                />
                                <button
                                  onClick={() => handleQuickRestock(activeDistributorForInventory.id, item.sku)}
                                  className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center min-h-[32px] min-w-[32px]"
                                  title="Add stock immediately"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setActiveDistributorForInventory(null)}
                className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white font-bold rounded-xl text-sm hover:bg-zinc-800 dark:hover:bg-zinc-700 min-h-[44px]"
              >
                Close Stock Ledger
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
