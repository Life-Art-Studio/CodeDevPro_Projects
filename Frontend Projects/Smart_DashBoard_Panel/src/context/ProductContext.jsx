import React, { createContext, useContext, useState, useEffect } from "react";
import StorageService from "../services/storageService";
import toast from 'react-hot-toast';
import { useAuth } from "./AuthContext";

const ProductContext = createContext(null);

// Default mock catalogue
const defaultProducts = [
  {
    id: "PROD-001",
    name: "Engine Oil 10W-30",
    sku: "LUB-10W30-1L",
    category: "Lubricants",
    uom: "Liter",
    image: "https://images.unsplash.com/photo-1606775618776-6638d7bb957a?q=80&w=200&auto=format&fit=crop",
    mrp: 550,
    retailerDivisor: 1.25,
    dbDivisor: 1.12,
    ssDivisor: 1.05,
    scheme: { buy: 10, free: 1 },
    schemeLabel: "Summer Promo",
    schemeEndDate: "2026-12-31",
    inStock: true,
    createdBy: "USR-ADMIN"
  },
  {
    id: "PROD-002",
    name: "Premium Brake Fluid",
    sku: "BRK-FL-500",
    category: "Fluids",
    uom: "500ml",
    image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=200&auto=format&fit=crop",
    mrp: 280,
    retailerDivisor: 1.18,
    dbDivisor: 1.10,
    ssDivisor: 1.06,
    scheme: { buy: 5, free: 1 },
    schemeLabel: "Monsoon Offer",
    schemeEndDate: "2026-08-15",
    inStock: true,
    createdBy: "USR-ADMIN"
  }
];

export const ProductProvider = ({ children }) => {
  const { currentUser, viewAsUserId } = useAuth();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const allProducts = StorageService.getProducts() ?? defaultProducts;
    if (currentUser?.role === 'ADMIN') {
        if (viewAsUserId) {
            setProducts(allProducts.filter(p => p.createdBy === viewAsUserId));
        } else {
            setProducts(allProducts);
        }
    } else if (currentUser?.role === 'SALES') {
        setProducts(allProducts.filter(p => p.createdBy === currentUser.id));
    } else {
        setProducts([]);
    }
  }, [currentUser, viewAsUserId]);

  const addProduct = (product) => {
    const allProducts = StorageService.getProducts() ?? defaultProducts;
    const nowStr = new Date().toISOString();
    
    // Auto-fill back-compat fields
    const newProduct = {
      ...product,
      uom: product.uom || product.unit || "Piece",
      unit: product.unit || product.uom || "Piece",
      mrp: Number(product.mrp || product.price || 0),
      price: Number(product.price || product.mrp || 0),
      source: product.source || "manual",
      createdAt: product.createdAt || nowStr,
      updatedAt: nowStr,
      createdBy: viewAsUserId || currentUser?.id,
    };
    
    const updatedAll = [newProduct, ...allProducts];
    setProducts([newProduct, ...products]);
    StorageService.saveProducts(updatedAll);
    toast.success("Product added to catalogue.");
  };

  const addMultipleProducts = (newProductsArray) => {
    const allProducts = StorageService.getProducts() ?? defaultProducts;
    const nowStr = new Date().toISOString();
    
    const formattedProducts = newProductsArray.map(product => ({
      ...product,
      uom: product.uom || product.unit || "Piece",
      unit: product.unit || product.uom || "Piece",
      mrp: Number(product.mrp || product.price || 0),
      price: Number(product.price || product.mrp || 0),
      source: product.source || "ai",
      createdAt: product.createdAt || nowStr,
      updatedAt: nowStr,
      createdBy: viewAsUserId || currentUser?.id,
    }));

    // Filter out duplicates based on name to prevent clutter
    const existingNames = new Set(allProducts.map(p => p.name.toLowerCase()));
    const finalToInsert = formattedProducts.filter(p => !existingNames.has(p.name.toLowerCase()));

    if (finalToInsert.length === 0) {
      toast.error("Selected products already exist in catalogue.");
      return;
    }

    const updatedAll = [...finalToInsert, ...allProducts];
    
    // Update local state (taking into account viewAsUserId/current salesperson filter)
    const activeUserId = viewAsUserId || currentUser?.id;
    const filteredToInsert = currentUser?.role === 'ADMIN' && !viewAsUserId 
      ? finalToInsert 
      : finalToInsert.filter(p => p.createdBy === activeUserId);
      
    setProducts(prev => [...filteredToInsert, ...prev]);
    StorageService.saveProducts(updatedAll);
    toast.success(`Added ${finalToInsert.length} products to catalogue.`);
  };

  const replaceAISuggestions = (sectorId, newAIProducts) => {
    const allProducts = StorageService.getProducts() ?? defaultProducts;
    const nowStr = new Date().toISOString();
    
    // Remove only items from this sector that carry 'source === "ai"'
    // Keep 'source === "manual"' and 'source === "ai-edited"' items safe!
    const preservedProducts = allProducts.filter(p => !(p.sector === sectorId && p.source === "ai"));
    
    const formattedNew = newAIProducts.map(p => ({
      ...p,
      uom: p.uom || p.unit || "Piece",
      unit: p.unit || p.uom || "Piece",
      mrp: Number(p.mrp || p.price || 0),
      price: Number(p.price || p.mrp || 0),
      source: "ai",
      createdAt: p.createdAt || nowStr,
      updatedAt: nowStr,
      createdBy: viewAsUserId || currentUser?.id,
    }));

    const updatedAll = [...formattedNew, ...preservedProducts];
    StorageService.saveProducts(updatedAll);

    // Synchronize local view state
    const activeUserId = viewAsUserId || currentUser?.id;
    let filteredLocal = currentUser?.role === 'ADMIN' && !viewAsUserId
      ? updatedAll
      : updatedAll.filter(p => p.createdBy === activeUserId);
      
    setProducts(filteredLocal);
  };

  const updateProduct = (updatedProduct) => {
    const allProducts = StorageService.getProducts() ?? defaultProducts;
    const nowStr = new Date().toISOString();

    // Auto-transition source flag if an AI suggestion was modified
    let finalSource = updatedProduct.source;
    if (updatedProduct.source === "ai") {
      finalSource = "ai-edited";
    }

    const mergedProduct = {
      ...updatedProduct,
      uom: updatedProduct.uom || updatedProduct.unit || "Piece",
      unit: updatedProduct.unit || updatedProduct.uom || "Piece",
      mrp: Number(updatedProduct.mrp || updatedProduct.price || 0),
      price: Number(updatedProduct.price || updatedProduct.mrp || 0),
      source: finalSource,
      updatedAt: nowStr
    };

    const updatedAll = allProducts.map(p => (p.id === mergedProduct.id ? mergedProduct : p));
    StorageService.saveProducts(updatedAll);

    const updatedLocal = products.map(p => (p.id === mergedProduct.id ? mergedProduct : p));
    setProducts(updatedLocal);
    toast.success("Product updated.");
  };

  const deleteProduct = (productId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Are you sure you want to delete this product?</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              const allProducts = StorageService.getProducts() ?? defaultProducts;
              const updatedAll = allProducts.filter(p => p.id !== productId);
              StorageService.saveProducts(updatedAll);
              
              const newProducts = products.filter(p => p.id !== productId);
              setProducts(newProducts);
              toast.success("Product deleted.");
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          >Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, addMultipleProducts, replaceAISuggestions }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);
