import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from 'react-hot-toast';
import { useAuth } from "./AuthContext";
import { useAudit } from "./AuditContext";

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const { currentUser, viewAsUserId, users } = useAuth();
  const { logAction } = useAudit();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useParentCatalogue, setUseParentCatalogue] = useState(false);

  const fetchProducts = async () => {
    // If not logged in, just clear state
    if (!currentUser) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Strict Tenant Frontend Firewall
      let query = supabase.from('products').select('*').eq('org_id', currentUser.org_id);
      
      if (viewAsUserId) {
        // If an Admin/Manager is impersonating, use the impersonated user's ID
        query = query.eq('owner_id', viewAsUserId);
      } else if (useParentCatalogue && currentUser.parent_id) {
        query = query.eq('owner_id', currentUser.parent_id);
      } else {
        query = query.eq('owner_id', currentUser.id);
      }

      // Execute query
      const { data, error } = await query;
      if (error) throw error;
      
      // We map the snake_case from DB back to camelCase for the frontend if necessary,
      // but let's just keep the object structure to match what the UI expects,
      // or we can expect the UI to use the DB fields. The previous code expected:
      // retailerDivisor, dbDivisor, ssDivisor, schemeEndDate.
      // The SQL provided is:
      // mrp, retailer_divisor, db_divisor, ss_divisor, scheme, scheme_label, scheme_end_date, in_stock
      const formatted = (data || []).map(p => ({
        ...p,
        retailerDivisor: p.retailer_divisor,
        dbDivisor: p.db_divisor,
        ssDivisor: p.ss_divisor,
        schemeLabel: p.scheme_label,
        schemeEndDate: p.scheme_end_date,
        inStock: p.in_stock
      }));

      setProducts(formatted);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentUser, viewAsUserId, users, useParentCatalogue]);

  const mapToDB = (product) => {
    const dbObj = {
      name: product.name,
      sku: product.sku,
      category: product.category,
      uom: product.uom || product.unit || "Piece",
      image: product.image,
      mrp: Number(product.mrp || product.price || 0),
      retailer_divisor: Number(product.retailerDivisor || 1),
      db_divisor: Number(product.dbDivisor || 1),
      ss_divisor: Number(product.ssDivisor || 1),
      scheme: product.scheme || { buy: 0, free: 0 },
      scheme_label: product.schemeLabel || null,
      scheme_end_date: product.schemeEndDate || null,
      in_stock: product.inStock !== false,
      owner_id: product.createdBy,
    };
    if (product.id && !product.id.startsWith("PROD-")) {
      dbObj.id = product.id;
    }
    return dbObj;
  };

  const addProduct = async (product) => {
    const newProduct = {
      ...product,
      createdBy: viewAsUserId || currentUser?.id
    };
    
    try {
      const dbObj = mapToDB(newProduct);
      const { data, error } = await supabase.from('products').insert([dbObj]).select().single();
      if (error) throw error;

      // Reformat to UI
      const uiProduct = {
        ...data,
        retailerDivisor: data.retailer_divisor,
        dbDivisor: data.db_divisor,
        ssDivisor: data.ss_divisor,
        schemeLabel: data.scheme_label,
        schemeEndDate: data.scheme_end_date,
        inStock: data.in_stock,
        createdBy: newProduct.createdBy
      };

      setProducts(prev => [uiProduct, ...prev]);
      logAction("Add Product", "Catalogue", `Added product ${uiProduct.name}`);
      toast.success("Product added to catalogue.");
      return true;
    } catch (err) {
      console.error("Add Product Error:", err);
      toast.error("Failed to add product.");
      return false;
    }
  };

  const addMultipleProducts = async (newProductsArray) => {
    const existingNames = new Set(products.map(p => (p.name || '').toLowerCase()));
    
    const finalToInsert = newProductsArray.filter(p => !existingNames.has((p.name || '').toLowerCase())).map(p => ({
      ...p,
      createdBy: viewAsUserId || currentUser?.id
    }));

    if (finalToInsert.length === 0) {
      toast.error("Selected products already exist in catalogue.");
      return;
    }

    try {
      const dbObjects = finalToInsert.map(mapToDB);
      const { data, error } = await supabase.from('products').insert(dbObjects).select();
      if (error) throw error;

      const uiProducts = (data || []).map(dbObj => ({
        ...dbObj,
        retailerDivisor: dbObj.retailer_divisor,
        dbDivisor: dbObj.db_divisor,
        ssDivisor: dbObj.ss_divisor,
        schemeLabel: dbObj.scheme_label,
        schemeEndDate: dbObj.scheme_end_date,
        inStock: dbObj.in_stock,
        createdBy: viewAsUserId || currentUser?.id
      }));

      setProducts(prev => [...uiProducts, ...prev]);
      logAction("Add Multiple Products", "Catalogue", `Added ${uiProducts.length} products`);
      toast.success(`Added ${uiProducts.length} products to catalogue.`);
    } catch (err) {
      console.error("Add Multiple Products Error:", err);
      toast.error("Failed to add products.");
    }
  };

  const replaceAISuggestions = async (sectorId, newAIProducts) => {
    // This is specific to local state logic in the UI. 
    // In DB, we might want to just insert new ones and maybe delete old AI ones?
    // For simplicity, let's just insert them as standard products.
    await addMultipleProducts(newAIProducts);
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const dbObj = mapToDB(updatedProduct);
      const { error } = await supabase.from('products').update(dbObj).eq('id', updatedProduct.id);
      if (error) throw error;

      const uiProduct = {
        ...dbObj,
        retailerDivisor: dbObj.retailer_divisor,
        dbDivisor: dbObj.db_divisor,
        ssDivisor: dbObj.ss_divisor,
        schemeLabel: dbObj.scheme_label,
        schemeEndDate: dbObj.scheme_end_date,
        inStock: dbObj.in_stock,
        createdBy: updatedProduct.createdBy || updatedProduct.owner_id
      };

      setProducts(prev => prev.map(p => (p.id === uiProduct.id ? { ...p, ...uiProduct } : p)));
      logAction("Update Product", "Catalogue", `Updated product ${uiProduct.name}`);
      toast.success("Product updated.");
      return true;
    } catch (err) {
      console.error("Update Product Error:", err);
      toast.error("Failed to update product.");
      return false;
    }
  };

  const deleteProduct = (productId) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm">Are you sure you want to delete this product?</span>
        <div className="flex gap-2 justify-end mt-2">
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase.from('products').delete().eq('id', productId);
                if (error) throw error;

                setProducts(prev => prev.filter(p => p.id !== productId));
                logAction("Delete Product", "Catalogue", `Deleted product ${productId}`);
                toast.success("Product deleted.");
              } catch (err) {
                console.error("Delete Product Error:", err);
                toast.error("Failed to delete product.");
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
          >Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const deleteMultipleProducts = async (productIds) => {
    try {
      const { error } = await supabase.from('products').delete().in('id', productIds);
      if (error) throw error;
      
      setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
      logAction("Delete Multiple Products", "Catalogue", `Deleted ${productIds.length} products`);
      toast.success(`Deleted ${productIds.length} products.`);
      return true;
    } catch (err) {
      console.error("Delete Multiple Error:", err);
      toast.error("Failed to delete products.");
      return false;
    }
  };

  const updateMultipleProducts = async (updatedProductsList) => {
    try {
      const dbObjects = updatedProductsList.map(mapToDB);
      // Supabase upsert/update array
      const { error } = await supabase.from('products').upsert(dbObjects);
      if (error) throw error;

      // Map back to UI
      const uiProducts = updatedProductsList;
      setProducts(prev => prev.map(p => {
        const found = uiProducts.find(up => up.id === p.id);
        return found ? found : p;
      }));
      logAction("Update Multiple Products", "Catalogue", `Updated ${uiProducts.length} products`);
      return true;
    } catch (err) {
      console.error("Update Multiple Error:", err);
      toast.error("Failed to update products.");
      return false;
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, isLoading, fetchProducts, addProduct, updateProduct, deleteProduct, addMultipleProducts, replaceAISuggestions,
      deleteMultipleProducts, updateMultipleProducts,
      useParentCatalogue, setUseParentCatalogue 
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);
