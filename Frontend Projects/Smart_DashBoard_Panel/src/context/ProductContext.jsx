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
    const newProduct = {
      ...product,
      createdBy: viewAsUserId || currentUser?.id,
    };
    const updatedAll = [newProduct, ...allProducts];
    setProducts([newProduct, ...products]);
    StorageService.saveProducts(updatedAll);
    toast.success("Product added to catalogue.");
  };

  const updateProduct = (updatedProduct) => {
    const allProducts = StorageService.getProducts() ?? defaultProducts;
    const updatedAll = allProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    StorageService.saveProducts(updatedAll);

    const updatedLocal = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
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
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);
