import React, { useState } from 'react';
import { useProductContext } from '../context/ProductContext';
import ProductCard from '../components/Catalogue/ProductCard';
import ProductForm from '../components/Catalogue/ProductForm';
import CustomSelect from '../components/ui/CustomSelect';
import { Plus, Search, FileText } from 'lucide-react';

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
    <div className="flex-1 min-h-0 flex flex-col z-0">
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8 animate-in slide-in-from-right-8 duration-300 transition-colors w-full relative">
      
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">Product Catalogue</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage pricing, chained margins, and schemes.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={handleExportPDF} className="flex-1 sm:flex-none justify-center px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-sm font-semibold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 min-h-[44px]">
                <FileText className="w-4 h-4" /> Export PDF
              </button>
              <button onClick={handleCreateNew} className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2 min-h-[44px]">
                <Plus className="w-4 h-4" /> New Product
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6 no-print">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search products, SKUs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 min-h-[44px]"
              />
            </div>
            <CustomSelect 
              value={categoryFilter} 
              onChange={setCategoryFilter}
              className="px-4 py-2.5 bg-white dark:bg-[#1a1d27] border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-zinc-100 sm:w-48 min-h-[44px] flex items-center justify-between outline-none cursor-pointer"
              options={categories.map(c => ({ value: c, label: c }))}
            />
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
               <div className="text-center py-20 text-zinc-500 dark:text-zinc-400 font-medium">
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
    </div>
  );
};

export default Catalogue;
