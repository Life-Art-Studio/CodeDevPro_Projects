import React, { useState, useEffect, useMemo } from 'react';
import { useProductContext } from '../context/ProductContext';
import ProductCard from '../components/Catalogue/ProductCard';
import ProductForm from '../components/Catalogue/ProductForm';
import CustomSelect from '../components/ui/CustomSelect';
import { AIService } from '../services/aiService';
import { SECTORS, getFallbackProducts } from '../utils/sectorConfig';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, FileText, Activity, Apple, Cpu, ShoppingBag, Car, 
  DollarSign, GraduationCap, Wrench, Home, Plane, Film, Building, 
  RefreshCw, AlertCircle, Wand2, ArrowLeft, Check, SlidersHorizontal,
  ChevronRight, Sparkles, HelpCircle, Layers, CheckSquare, Square
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dynamic Icon Map for Sector Cards
const getSectorIcon = (iconName, className = "w-6 h-6") => {
  switch (iconName) {
    case 'Apple': return <Apple className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Car': return <Car className={className} />;
    case 'DollarSign': return <DollarSign className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Plane': return <Plane className={className} />;
    case 'Film': return <Film className={className} />;
    case 'Building': return <Building className={className} />;
    default: return <ShoppingBag className={className} />;
  }
};

const Catalogue = () => {
  const { currentUser } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, addMultipleProducts, replaceAISuggestions } = useProductContext();
  
  // Steps: 'sector' | 'suggest' | 'catalogue' | 'form'
  const [step, setStep] = useState(() => (products.length > 0 ? 'catalogue' : 'sector'));
  
  const [selectedSector, setSelectedSector] = useState(SECTORS[0].id);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState(new Set());
  
  // Step 2 subcategory state
  const [activeSubcat, setActiveSubcat] = useState("All");

  // Step 3 unified view states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All"); // 'All' | 'ai' | 'edited' | 'manual'
  const [sortBy, setSortBy] = useState("name-asc"); // 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'date-newest'
  const [editingProduct, setEditingProduct] = useState(null);

  // Profile auto-detection logic
  const handleProfileDetection = () => {
    // Check industry fields
    const userIndustry = currentUser?.industry || currentUser?.businessType || currentUser?.role || "";
    const cleanInd = userIndustry.toLowerCase();
    
    let matchedSector = SECTORS.find(s => 
      cleanInd.includes(s.id.toLowerCase()) || 
      cleanInd.includes(s.label.toLowerCase()) ||
      (s.id === "FMCG" && (cleanInd.includes("food") || cleanInd.includes("grocery") || cleanInd.includes("retail"))) ||
      (s.id === "Automotive" && (cleanInd.includes("car") || cleanInd.includes("garage") || cleanInd.includes("lube") || cleanInd.includes("spare"))) ||
      (s.id === "Healthcare" && (cleanInd.includes("medical") || cleanInd.includes("pharma") || cleanInd.includes("clinic")))
    );

    if (matchedSector) {
      setSelectedSector(matchedSector.id);
      toast.success(`Detected ${matchedSector.label} industry from profile!`, { icon: '🔍' });
    } else {
      setSelectedSector("FMCG");
      toast.error("Could not determine sector from profile. Defaulted to FMCG.", { icon: '⚠️' });
    }
  };

  // AI suggestions generator
  const fetchSuggestions = async (forceRegenerate = false) => {
    const sector = SECTORS.find(s => s.id === selectedSector);
    if (!sector) return;

    setIsFetchingSuggestions(true);
    setSelectedSuggestionIds(new Set());
    
    // Clear cache if force-regenerating
    if (forceRegenerate) {
      localStorage.removeItem(`ai_suggestions_cache_${selectedSector}_openrouter`);
    }

    try {
      const list = await AIService.generateSuggestions(selectedSector, sector.subCategories);
      setSuggestedProducts(list);
      
      // Auto-select all by default
      setSelectedSuggestionIds(new Set(list.map(p => p.id)));
      
      // Default to "All" category tab
      setActiveSubcat("All");
      
      setStep('suggest');
    } catch (err) {
      toast.error(err.message || "Failed to load suggestions.");
      
      // Instantly fallback to static products so the user is never stuck
      toast.loading("Loading static offline catalogue presets...", { duration: 1500 });
      const offlineFallback = getFallbackProducts(selectedSector);
      setSuggestedProducts(offlineFallback);
      setSelectedSuggestionIds(new Set(offlineFallback.map(p => p.id)));
      setActiveSubcat("All");
      setStep('suggest');
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Bulk add selection
  const handleBulkAdd = () => {
    const selectedList = suggestedProducts.filter(p => selectedSuggestionIds.has(p.id));
    if (selectedList.length === 0) {
      toast.error("No items selected.");
      return;
    }
    
    addMultipleProducts(selectedList);
    setStep('catalogue');
  };

  // Toggle single suggestion
  const toggleSuggestionSelection = (id) => {
    setSelectedSuggestionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all toggles
  const handleToggleSelectAll = (filteredSuggestions) => {
    const allSelected = filteredSuggestions.every(p => selectedSuggestionIds.has(p.id));
    setSelectedSuggestionIds(prev => {
      const next = new Set(prev);
      filteredSuggestions.forEach(p => {
        if (allSelected) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      });
      return next;
    });
  };

  // Filtering AI suggestions in Step 2
  const filteredSuggestions = useMemo(() => {
    if (activeSubcat === "All") return suggestedProducts;
    return suggestedProducts.filter(p => p.category === activeSubcat || p.subCategory === activeSubcat);
  }, [suggestedProducts, activeSubcat]);

  // Unified Catalogue filtering (Step 3)
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  
  const finalFilteredCatalogue = useMemo(() => {
    return products.filter(p => {
      // Search matches
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchLower) || 
                            p.id.toLowerCase().includes(searchLower) ||
                            (p.sku && p.sku.toLowerCase().includes(searchLower));
      
      // Category matches
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;

      // Source matches
      let matchesSource = true;
      if (sourceFilter !== "All") {
        if (sourceFilter === "ai") matchesSource = p.source === "ai";
        else if (sourceFilter === "edited") matchesSource = p.source === "ai-edited";
        else if (sourceFilter === "manual") matchesSource = p.source === "manual";
      }

      return matchesSearch && matchesCategory && matchesSource;
    }).sort((a, b) => {
      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      if (sortBy === "price-asc") return (a.mrp || a.price || 0) - (b.mrp || b.price || 0);
      if (sortBy === "price-desc") return (b.mrp || b.price || 0) - (a.mrp || a.price || 0);
      if (sortBy === "date-newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      return 0;
    });
  }, [products, searchQuery, categoryFilter, sourceFilter, sortBy]);

  // Form actions
  const handleEdit = (product) => {
    setEditingProduct(product);
    setStep('form');
  };

  const handleCreateNewManual = () => {
    setEditingProduct(null);
    setStep('form');
  };

  const handleSaveProduct = (productData) => {
    // Check closely-matching duplicate names
    const duplicate = products.find(p => p.name.toLowerCase().trim() === productData.name.toLowerCase().trim() && p.id !== productData.id);
    if (duplicate) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-sm text-zinc-900">⚠️ Duplicate Warning: A product named "{productData.name}" already exists. Save anyway?</span>
          <div className="flex gap-2 justify-end mt-2">
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                saveAction(productData);
              }}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >Save</button>
            <button onClick={() => toast.dismiss(t.id)} className="bg-zinc-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-800 hover:bg-zinc-200 transition-colors">Cancel</button>
          </div>
        </div>
      ), { duration: Infinity });
    } else {
      saveAction(productData);
    }
  };

  const saveAction = (productData) => {
    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    setStep('catalogue');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col z-0 relative w-full bg-zinc-50 dark:bg-[#0f1117] transition-colors duration-300">
      
      {/* ── PRINT COMPATIBLE STYLES ── */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #catalogue-print-area, #catalogue-print-area * { visibility: visible; }
            #catalogue-print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* ── STEP 1: SECTOR SELECTION ── */}
      {step === 'sector' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            
            {/* Onboarding Header */}
            <div className="text-center space-y-3 mt-4">
              <div className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-inner mb-2 animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">AI Catalogue Onboarding</h1>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed">
                Let's customize your product catalog. Select your business sector to generate curated AI suggestions powered by built-in advanced intelligence.
              </p>
            </div>

            {/* Profile detection trigger & Custom override */}
            <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-indigo-500" /> Smart Profile Classification
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Automatically read your profile's industry details to classify your sector.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={handleProfileDetection} className="w-full md:w-auto py-2.5 px-6 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl text-xs font-semibold transition-all min-h-[44px]">
                  💡 Detect Sector from Profile
                </button>
              </div>
            </div>

            {/* Sector Cards Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Choose a Sector</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-500">Selected:</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                    {SECTORS.find(s => s.id === selectedSector)?.label}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {SECTORS.map((sector) => {
                  const isSelected = selectedSector === sector.id;
                  return (
                    <div 
                      key={sector.id}
                      onClick={() => setSelectedSector(sector.id)}
                      className={`cursor-pointer rounded-2xl border p-5 flex flex-col items-center justify-center text-center gap-3 transition-all relative transform hover:-translate-y-1 hover:shadow-md ${
                        isSelected 
                          ? "bg-white dark:bg-[#1a1d27] border-indigo-500 ring-2 ring-indigo-500/20" 
                          : "bg-white dark:bg-[#1a1d27] border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      {/* Vibrant sector color icon container */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform" style={{ backgroundColor: sector.color }}>
                        {getSectorIcon(sector.icon)}
                      </div>
                      
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">
                        {sector.label}
                      </span>
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center p-0.5 shadow-sm animate-in zoom-in-50">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm & Load Suggestions button */}
            <div className="pt-4 flex flex-wrap justify-end gap-3">
              {products.length > 0 && (
                <button onClick={() => setStep('catalogue')} className="py-3 px-6 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all min-h-[48px]">
                  Cancel
                </button>
              )}
              <button 
                onClick={handleCreateNewManual}
                className="py-3 px-6 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl text-sm font-semibold transition-all min-h-[48px] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Product Manually
              </button>
              <button 
                onClick={() => fetchSuggestions(false)} 
                disabled={isFetchingSuggestions}
                className="flex-1 sm:flex-none justify-center py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] transition-all min-h-[48px] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetchingSuggestions ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading Sector...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Catalogue suggestions <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ── STEP 2: AI SUGGESTIONS GRID ── */}
      {step === 'suggest' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto flex flex-col h-full gap-6 animate-in slide-in-from-bottom-6 duration-400">
            
            {/* Header info bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={() => setStep('sector')} className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">AI suggestions for {SECTORS.find(s => s.id === selectedSector)?.label}</h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase border bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                      Model: Gemma-4 (OpenRouter)
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Select the suggestions you want to add to your first-class unified catalogue list.</p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => fetchSuggestions(true)} className="flex-1 md:flex-none py-2 px-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[44px]">
                  <RefreshCw className="w-3.5 h-3.5" /> Force Regenerate
                </button>
                <button onClick={handleCreateNewManual} className="flex-1 md:flex-none py-2 px-3 bg-white dark:bg-[#1a1d27] border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[44px]">
                  <Plus className="w-3.5 h-3.5" /> Add Manually
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0" style={{ WebkitMaskImage: 'linear-gradient(to right, white 95%, transparent)', maskImage: 'linear-gradient(to right, white 95%, transparent)' }}>
              <button 
                onClick={() => setActiveSubcat("All")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap min-h-[38px] ${
                  activeSubcat === "All"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-white dark:bg-[#1a1d27] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                All Suggestions ({suggestedProducts.length})
              </button>
              {SECTORS.find(s => s.id === selectedSector)?.subCategories.map(cat => {
                const count = suggestedProducts.filter(p => p.category === cat || p.subCategory === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveSubcat(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap min-h-[38px] ${
                      activeSubcat === cat
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-white dark:bg-[#1a1d27] border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                )
              })}
            </div>

            {/* Toolbar: Select All checkbox & bulk action */}
            <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-900/60 p-3 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50">
              <button 
                onClick={() => handleToggleSelectAll(filteredSuggestions)}
                className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors min-h-[36px] px-2 rounded-lg hover:bg-white/40 dark:hover:bg-zinc-800/40"
              >
                {filteredSuggestions.every(p => selectedSuggestionIds.has(p.id)) ? (
                  <CheckSquare className="w-4.5 h-4.5 text-indigo-600" />
                ) : (
                  <Square className="w-4.5 h-4.5" />
                )}
                Select All Category ({filteredSuggestions.length})
              </button>

              <span className="text-xs font-medium text-zinc-500">
                {selectedSuggestionIds.size} of {suggestedProducts.length} selected
              </span>
            </div>

            {/* Suggestions cards grid */}
            <div className="flex-1 min-h-0">
              {filteredSuggestions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSuggestions.map(item => {
                    const isSelected = selectedSuggestionIds.has(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => toggleSuggestionSelection(item.id)}
                        className={`rounded-2xl border p-4 bg-white dark:bg-[#1a1d27] flex flex-col gap-3 relative shadow-sm transition-all hover:shadow-md cursor-pointer select-none group ${
                          isSelected 
                            ? "border-indigo-500 ring-1 ring-indigo-500/20" 
                            : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        
                        <div className="flex items-start justify-between gap-3">
                           <div className="min-w-0">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">{item.category}</span>
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-6 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {item.name}
                            </h4>
                          </div>
                          
                          {/* Selection Checkbox */}
                          <div className="shrink-0 mt-0.5">
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-in zoom-in-50" />
                            ) : (
                              <Square className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed flex-1">
                          {item.description}
                        </p>

                        <div className="flex justify-between items-end border-t border-zinc-100 dark:border-zinc-800/50 pt-2.5 mt-1">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-none">Est. Price</span>
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">₹{item.price.toFixed(2)}</span>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded uppercase">
                            /{item.unit}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                  <SlidersHorizontal className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400 font-medium">No items found for category "{activeSubcat}"</p>
                </div>
              )}
            </div>

            {/* Bulk Add button */}
            <div className="pt-4 flex justify-between items-center border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <button onClick={() => setStep('sector')} className="py-2.5 px-5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all min-h-[44px]">
                Back
              </button>
              <button 
                onClick={handleBulkAdd}
                disabled={selectedSuggestionIds.size === 0}
                className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all min-h-[48px] flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Add selected ({selectedSuggestionIds.size}) to catalogue
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── STEP 3: UNIFIED CATALOGUE VIEW ── */}
      {step === 'catalogue' && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto flex flex-col h-full gap-4 lg:gap-6 animate-in fade-in duration-300">
            
            {/* Catalogue Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Product Catalogue</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage, filter, and track AI-sourced or custom-edited inventory products.</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button onClick={() => setStep('sector')} className="flex-1 sm:flex-none justify-center px-4 py-2 border border-indigo-200 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all flex items-center gap-2 min-h-[44px]">
                  <Wand2 className="w-4 h-4" /> AI Suggestions
                </button>
                <button onClick={handlePrint} className="flex-1 sm:flex-none justify-center px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 min-h-[44px]">
                  <FileText className="w-4 h-4" /> Export PDF
                </button>
                <button onClick={handleCreateNewManual} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 min-h-[44px]">
                  <Plus className="w-4 h-4" /> New Product
                </button>
              </div>
            </div>

            {/* Filter toolbar */}
            <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col lg:flex-row justify-between gap-4 no-print">
              
              {/* Search + Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, SKU, or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 min-h-[44px] text-sm"
                  />
                </div>
                <CustomSelect 
                  value={categoryFilter} 
                  onChange={setCategoryFilter}
                  className="px-4 py-2.5 bg-zinc-50 dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 sm:w-48 min-h-[44px] flex items-center justify-between outline-none cursor-pointer text-sm"
                  options={categories.map(c => ({ value: c, label: `Cat: ${c}` }))}
                />
              </div>

              {/* Source Filters + Sorting */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Source toggle pills */}
                <div className="bg-zinc-100 dark:bg-[#0f1117] p-1 rounded-xl flex items-center border border-zinc-200/50 dark:border-zinc-800/50">
                  <button 
                    onClick={() => setSourceFilter("All")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[32px] ${sourceFilter === "All" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setSourceFilter("ai")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[32px] ${sourceFilter === "ai" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    🤖 AI
                  </button>
                  <button 
                    onClick={() => setSourceFilter("edited")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[32px] ${sourceFilter === "edited" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    ✏️ Edited
                  </button>
                  <button 
                    onClick={() => setSourceFilter("manual")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[32px] ${sourceFilter === "manual" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
                  >
                    👤 Custom
                  </button>
                </div>

                {/* Sort selection */}
                <CustomSelect 
                  value={sortBy} 
                  onChange={setSortBy}
                  className="px-4 py-2.5 bg-zinc-50 dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 sm:w-48 min-h-[44px] flex items-center justify-between outline-none cursor-pointer text-sm"
                  options={[
                    { value: 'name-asc', label: 'Sort: Name (A-Z)' },
                    { value: 'name-desc', label: 'Sort: Name (Z-A)' },
                    { value: 'price-asc', label: 'Sort: Price (Low-High)' },
                    { value: 'price-desc', label: 'Sort: Price (High-Low)' },
                    { value: 'date-newest', label: 'Sort: Date Added' }
                  ]}
                />
              </div>

            </div>

            {/* Main grid catalog items */}
            <div id="catalogue-print-area" className="flex-1">
              {finalFilteredCatalogue.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {finalFilteredCatalogue.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onEdit={handleEdit} 
                      onDelete={deleteProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
                  <SlidersHorizontal className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3" />
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-200 text-lg">No products found</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">No items match your active filters. Try searching differently or switch filters.</p>
                </div>
              )}
            </div>

            {/* Persistent floating Manual item button (when items exist) */}
            <button 
              onClick={handleCreateNewManual}
              className="no-print fixed bottom-24 right-6 sm:bottom-8 sm:right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 z-40 flex items-center justify-center min-h-[56px] min-w-[56px] shadow-[0_4px_16px_rgba(79,70,229,0.4)]"
              title="Add Custom Item"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>

          </div>
        </div>
      )}

      {/* ── CATALOG PRODUCT FORM (MANUAL ADD / DETAILS EDIT) ── */}
      {step === 'form' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto h-full">
            <ProductForm 
              initialData={editingProduct} 
              onSave={handleSaveProduct} 
              onCancel={() => setStep('catalogue')}
              onDelete={deleteProduct}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default Catalogue;
