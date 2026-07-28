import React, { useState } from 'react';
import { 
  Plus, Trash2, Layers, Cpu, Box
} from 'lucide-react';
import { ProductCategory, StoreCategory } from '../../types';
import { 
  addAdminLog, deleteFirestoreDoc, saveStoredProductCategories, saveStoredStoreCategories 
} from '../../services/dataStorage';

interface CategoriesManagerProps {
  productCategories: ProductCategory[];
  storeCategories: StoreCategory[];
  onUpdateProductCategories?: (categories: ProductCategory[]) => void;
  onUpdateStoreCategories?: (categories: StoreCategory[]) => void;
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({
  productCategories,
  storeCategories,
  onUpdateProductCategories,
  onUpdateStoreCategories,
  showToast,
  openDeleteConfirm,
}) => {
  // Category Form Inputs
  const [newProdCatLabel, setNewProdCatLabel] = useState<string>('');
  const [newProdCatDesc, setNewProdCatDesc] = useState<string>('');

  const [newStoreCatLabel, setNewStoreCatLabel] = useState<string>('');
  const [newStoreCatIcon, setNewStoreCatIcon] = useState<string>('Cpu');
  const [newStoreCatDesc, setNewStoreCatDesc] = useState<string>('');

  // --- PRODUCT CATEGORY CRUD ---
  const handleAddProductCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProdCatLabel.trim()) return;
    const catId =
      newProdCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') ||
      `prod_cat_${Date.now()}`;

    if (productCategories.some((c) => c.id === catId)) {
      showToast('A product category with this name already exists.', 'error');
      return;
    }

    const newCat: ProductCategory = {
      id: catId,
      label: newProdCatLabel.trim(),
      description: newProdCatDesc.trim() || 'Turnkey hardware catalog category.',
    };

    const updated = [...productCategories, newCat];
    if (onUpdateProductCategories) onUpdateProductCategories(updated);
    saveStoredProductCategories(updated);
    addAdminLog({
      action: 'ADD',
      target: 'CATEGORY',
      title: `Added Hardware Category: ${newCat.label}`,
      details: `ID: ${newCat.id}`,
    });

    setNewProdCatLabel('');
    setNewProdCatDesc('');
    showToast(`Product category "${newCat.label}" created.`, 'success');
  };

  const handleDeleteProductCategory = (id: string, label: string) => {
    openDeleteConfirm(
      'Delete Product Category',
      `Are you sure you want to delete category "${label}"?`,
      () => {
        const updated = productCategories.filter((c) => c.id !== id);
        if (onUpdateProductCategories) onUpdateProductCategories(updated);
        saveStoredProductCategories(updated);
        deleteFirestoreDoc('product_categories', id);
        addAdminLog({
          action: 'DELETE',
          target: 'CATEGORY',
          title: `Deleted Hardware Category: ${label}`,
          details: `ID: ${id}`,
        });
        showToast(`Category "${label}" deleted.`, 'success');
      }
    );
  };

  // --- STORE CATEGORY CRUD ---
  const handleAddStoreCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newStoreCatLabel.trim()) return;
    const catId =
      newStoreCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') ||
      `store_cat_${Date.now()}`;

    if (storeCategories.some((c) => c.id === catId)) {
      showToast('A store component category with this name already exists.', 'error');
      return;
    }

    const newCat: StoreCategory = {
      id: catId,
      label: newStoreCatLabel.trim(),
      icon: newStoreCatIcon || 'Cpu',
      description: newStoreCatDesc.trim() || 'Electronics store component line.',
    };

    const updated = [...storeCategories, newCat];
    if (onUpdateStoreCategories) onUpdateStoreCategories(updated);
    saveStoredStoreCategories(updated);
    addAdminLog({
      action: 'ADD',
      target: 'CATEGORY',
      title: `Added Store Category: ${newCat.label}`,
      details: `ID: ${newCat.id}`,
    });

    setNewStoreCatLabel('');
    setNewStoreCatDesc('');
    showToast(`Store category "${newCat.label}" created.`, 'success');
  };

  const handleDeleteStoreCategory = (id: string, label: string) => {
    openDeleteConfirm(
      'Delete Store Category',
      `Are you sure you want to delete store category "${label}"?`,
      () => {
        const updated = storeCategories.filter((c) => c.id !== id);
        if (onUpdateStoreCategories) onUpdateStoreCategories(updated);
        saveStoredStoreCategories(updated);
        deleteFirestoreDoc('store_categories', id);
        addAdminLog({
          action: 'DELETE',
          target: 'CATEGORY',
          title: `Deleted Store Category: ${label}`,
          details: `ID: ${id}`,
        });
        showToast(`Store category "${label}" deleted.`, 'success');
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <span>Category Taxonomy Manager</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Define catalog product groupings and electronics component store filters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hardware Catalog Categories */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-blue-400" />
              <span>Hardware Product Categories</span>
            </h2>
            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
              {productCategories.length} Categories
            </span>
          </div>

          <form onSubmit={handleAddProductCategory} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-300">Add New Product Category</div>
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Smart Sensor Nodes)"
              value={newProdCatLabel}
              onChange={(e) => setNewProdCatLabel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Short Description (Optional)"
              value={newProdCatDesc}
              onChange={(e) => setNewProdCatDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product Category</span>
            </button>
          </form>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {productCategories.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-200">{c.label}</p>
                  <p className="text-[10px] text-slate-500">{c.description}</p>
                  <p className="text-[9px] text-slate-600 font-mono mt-0.5">ID: {c.id}</p>
                </div>
                <button
                  onClick={() => handleDeleteProductCategory(c.id, c.label)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Electronics Store Component Categories */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Store Component Categories</span>
            </h2>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {storeCategories.length} Categories
            </span>
          </div>

          <form onSubmit={handleAddStoreCategory} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-300">Add New Store Component Category</div>
            <input
              type="text"
              required
              placeholder="Category Name (e.g. Wireless Modules)"
              value={newStoreCatLabel}
              onChange={(e) => setNewStoreCatLabel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="text"
              placeholder="Description (Optional)"
              value={newStoreCatDesc}
              onChange={(e) => setNewStoreCatDesc(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Store Category</span>
            </button>
          </form>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {storeCategories.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3 group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-200">{c.label}</p>
                  <p className="text-[10px] text-slate-500">{c.description}</p>
                  <p className="text-[9px] text-slate-600 font-mono mt-0.5">ID: {c.id}</p>
                </div>
                <button
                  onClick={() => handleDeleteStoreCategory(c.id, c.label)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors opacity-80 group-hover:opacity-100"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
