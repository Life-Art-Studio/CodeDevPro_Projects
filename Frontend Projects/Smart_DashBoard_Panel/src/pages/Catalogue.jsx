import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import ProductCard from '../components/Catalogue/ProductCard';
import ProductForm from '../components/Catalogue/ProductForm';

const Catalogue = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductContext();
  const [viewState, setViewState] = useState('list'); // 'list' | 'form'
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNew = () => {
    setEditingProduct(null);
    setViewState('form');
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setViewState('form');
  };

  const handleSave = (productData) => {
    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    setViewState('list');
  };

  const handleExportPDF = () => {
    // A simple hack to hide everything except the grid for printing
    window.print();
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 animate-in slide-in-from-right-8 duration-500 transition-colors w-full relative">
      
      {/* Hide controls when printing */}
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

      {viewState === 'list' ? (
        <div className="max-w-7xl mx-auto flex flex-col h-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 no-print">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Product Catalogue</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage pricing, chained margins, and schemes.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExportPDF} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2">
                📄 Export PDF
              </button>
              <button onClick={handleCreateNew} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-purple-500/25 transition-all">
                + New Product
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 no-print">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search products, SKUs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white"
              />
            </div>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all dark:text-white sm:w-48"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div id="catalogue-print-area" className="flex-1">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onEdit={handleEdit} 
                    onDelete={deleteProduct}
                  />
                ))}
             </div>
             {filteredProducts.length === 0 && (
               <div className="text-center py-20 text-slate-500">
                 No products found.
               </div>
             )}
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto h-full">
          <ProductForm 
            initialData={editingProduct} 
            onSave={handleSave} 
            onCancel={() => setViewState('list')}
            onDelete={deleteProduct}
          />
        </div>
      )}
    </div>
  );
};

export default Catalogue;
