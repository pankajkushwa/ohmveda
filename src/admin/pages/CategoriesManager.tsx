import React, { useState } from 'react';
import { 
  Plus, Trash2, Layers, Cpu, Box, ChevronRight, ChevronDown, FolderTree, Folder, FolderPlus, FileText, CornerDownRight, Tag, Pencil, X, Save, Maximize2, Minimize2, Search
} from 'lucide-react';
import { ProductCategory, StoreCategory } from '../../types';
import { 
  addAdminLog, deleteFirestoreDoc, saveStoredProductCategories, saveStoredStoreCategories 
} from '../../services/dataStorage';
import { buildCategoryTree, CategoryTreeNode } from '../../utils/categoryUtils';

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
  // --- COLLAPSED CATEGORIES & TREE SEARCH STATE ---
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [treeSearchQuery, setTreeSearchQuery] = useState<string>('');

  const toggleCollapse = (id: string) => {
    setCollapsedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const collapseAll = () => {
    const allIds: Record<string, boolean> = {};
    storeCategories.forEach(c => { allIds[c.id] = true; });
    setCollapsedCategories(allIds);
  };
  // --- PRODUCT CATEGORY CRUD STATE ---
  const [newProdCatLabel, setNewProdCatLabel] = useState<string>('');
  const [newProdCatDesc, setNewProdCatDesc] = useState<string>('');

  // --- STORE HIERARCHICAL CATEGORY FORM STATE ---
  const [targetLevel, setTargetLevel] = useState<0 | 1 | 2>(0); // 0 = Category, 1 = Subcategory, 2 = Sub-subcategory
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [newStoreCatLabel, setNewStoreCatLabel] = useState<string>('');
  const [newStoreCatDesc, setNewStoreCatDesc] = useState<string>('');

  // --- EDIT CATEGORY MODAL STATE ---
  const [editingCat, setEditingCat] = useState<StoreCategory | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');
  const [editDesc, setEditDesc] = useState<string>('');
  const [editLevel, setEditLevel] = useState<0 | 1 | 2>(0);
  const [editParentId, setEditParentId] = useState<string>('');

  const cleanCategoryLabel = (label: string, fallbackId?: string) => {
    if (!label) return fallbackId || '';
    let cleaned = label.replace(/\s*\([^)]*\)/gi, '').trim();
    return cleaned || label;
  };

  // Helper arrays for level 0 and level 1 categories
  const level0Categories = storeCategories.filter(
    (c) => !c.parentId || c.level === 0 || c.level === undefined
  );

  const level1Categories = storeCategories.filter(
    (c) => c.level === 1 || (c.parentId && level0Categories.some((l0) => l0.id === c.parentId))
  );

  // --- PRODUCT CATEGORY HANDLERS ---
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
      description: newProdCatDesc.trim() || 'Products catalog category.',
    };

    const updated = [...productCategories, newCat];
    if (onUpdateProductCategories) onUpdateProductCategories(updated);
    saveStoredProductCategories(updated);
    addAdminLog({
      action: 'ADD',
      target: 'CATEGORY',
      title: `Added Product Category: ${newCat.label}`,
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
          title: `Deleted Product Category: ${label}`,
          details: `ID: ${id}`,
        });
        showToast(`Category "${label}" deleted.`, 'success');
      }
    );
  };

  // --- STORE CATEGORY HANDLERS (3-TIER) ---
  const handleAddStoreCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newStoreCatLabel.trim()) {
      showToast('Please enter a category name.', 'error');
      return;
    }

    if (targetLevel === 1 && !selectedParentId) {
      showToast('Please select a parent Main Category for this Subcategory.', 'error');
      return;
    }

    if (targetLevel === 2 && !selectedParentId) {
      showToast('Please select a parent Subcategory for this Sub-subcategory.', 'error');
      return;
    }

    const prefix = targetLevel === 0 ? 'cat_' : targetLevel === 1 ? 'subcat_' : 'subsubcat_';
    const slug = newStoreCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const catId = `${prefix}${slug}` || `store_cat_${Date.now()}`;

    if (storeCategories.some((c) => c.id === catId)) {
      showToast('A category with this name already exists at this level.', 'error');
      return;
    }

    const newCat: StoreCategory = {
      id: catId,
      label: newStoreCatLabel.trim(),
      description: newStoreCatDesc.trim() || undefined,
      parentId: targetLevel === 0 ? null : selectedParentId,
      level: targetLevel,
    };

    const updated = [...storeCategories, newCat];
    if (onUpdateStoreCategories) onUpdateStoreCategories(updated);
    saveStoredStoreCategories(updated);

    addAdminLog({
      action: 'ADD',
      target: 'CATEGORY',
      title: `Added Store Category (Level ${targetLevel}): ${newCat.label}`,
      details: `ID: ${newCat.id} | Parent: ${newCat.parentId || 'Root'}`,
    });

    setNewStoreCatLabel('');
    setNewStoreCatDesc('');
    showToast(
      `Store ${targetLevel === 0 ? 'Category' : targetLevel === 1 ? 'Subcategory' : 'Sub-subcategory'} "${newCat.label}" created successfully!`,
      'success'
    );
  };

  // --- EDIT CATEGORY HANDLERS ---
  const handleOpenEditCategory = (cat: StoreCategory) => {
    setEditingCat(cat);
    setEditLabel(cleanCategoryLabel(cat.label));
    setEditDesc(cat.description || '');
    const currentLevel = cat.level ?? (cat.parentId ? (level1Categories.some((l1) => l1.id === cat.parentId) ? 2 : 1) : 0);
    setEditLevel(currentLevel);
    setEditParentId(cat.parentId || '');
  };

  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;

    if (!editLabel.trim()) {
      showToast('Please enter a category name.', 'error');
      return;
    }

    if (editLevel === 1 && !editParentId) {
      showToast('Please select a parent Main Category for this Subcategory.', 'error');
      return;
    }

    if (editLevel === 2 && !editParentId) {
      showToast('Please select a parent Subcategory for this Sub-subcategory.', 'error');
      return;
    }

    if (editLevel > 0 && editParentId === editingCat.id) {
      showToast('A category cannot be assigned to itself as parent.', 'error');
      return;
    }

    const updatedCat: StoreCategory = {
      ...editingCat,
      label: editLabel.trim(),
      description: editDesc.trim() || undefined,
      level: editLevel,
      parentId: editLevel === 0 ? null : editParentId,
    };

    const updatedCategories = storeCategories.map((c) => (c.id === editingCat.id ? updatedCat : c));

    if (onUpdateStoreCategories) onUpdateStoreCategories(updatedCategories);
    saveStoredStoreCategories(updatedCategories);

    addAdminLog({
      action: 'UPDATE',
      target: 'CATEGORY',
      title: `Updated Category: ${updatedCat.label}`,
      details: `ID: ${updatedCat.id} | Level: ${updatedCat.level} | Parent: ${updatedCat.parentId || 'None'}`,
    });

    setEditingCat(null);
    showToast(`Category "${updatedCat.label}" updated successfully!`, 'success');
  };

  const handleQuickAddSubcategory = (parentId: string, parentLevel: 0 | 1) => {
    if (parentLevel === 0) {
      setTargetLevel(1);
      setSelectedParentId(parentId);
    } else {
      setTargetLevel(2);
      setSelectedParentId(parentId);
    }
    // Scroll to form smooth
    const formElem = document.getElementById('store-category-form');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeleteStoreCategory = (id: string, label: string) => {
    // Check if this category has child categories
    const childCategories = storeCategories.filter((c) => c.parentId === id);
    let confirmMsg = `Are you sure you want to delete "${label}"?`;
    if (childCategories.length > 0) {
      confirmMsg = `Category "${label}" has ${childCategories.length} child subcategories. Deleting this category will also delete all of its subcategories! Proceed?`;
    }

    openDeleteConfirm(
      'Delete Category',
      confirmMsg,
      () => {
        // Collect all descendant category IDs recursively
        const idsToDelete = [id];
        const collectChildren = (parentCatId: string) => {
          const children = storeCategories.filter((c) => c.parentId === parentCatId);
          children.forEach((ch) => {
            idsToDelete.push(ch.id);
            collectChildren(ch.id);
          });
        };
        collectChildren(id);

        const updated = storeCategories.filter((c) => !idsToDelete.includes(c.id));
        if (onUpdateStoreCategories) onUpdateStoreCategories(updated);
        saveStoredStoreCategories(updated);

        // Delete from firestore
        idsToDelete.forEach((catId) => {
          deleteFirestoreDoc('store_categories', catId);
        });

        addAdminLog({
          action: 'DELETE',
          target: 'CATEGORY',
          title: `Deleted Store Category & Subcategories: ${label}`,
          details: `Deleted IDs: ${idsToDelete.join(', ')}`,
        });

        showToast(`Category "${label}" deleted.`, 'success');
      }
    );
  };

  const categoryTree = buildCategoryTree(storeCategories);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-600" />
            <span>Multi-Level Category Hierarchy Manager</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create 3-tier store category taxonomy (Category → Subcategory → Sub-subcategory)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {storeCategories.length} Total Categories
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PRODUCT CATEGORIES (Turnkey Products) & HIERARCHY FORM */}
        <div className="lg:col-span-5 space-y-6">
          {/* STORE CATEGORY CREATOR (3-TIER FORM) */}
          <div id="store-category-form" className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-600" />
                <span>Create Store Category</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Choose category level to create Main Categories, Subcategories, or Sub-subcategories.
              </p>
            </div>

            <form onSubmit={handleAddStoreCategory} className="space-y-3.5">
              {/* Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category Tier Level *
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetLevel(0);
                      setSelectedParentId('');
                    }}
                    className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      targetLevel === 0
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>Category</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetLevel(1);
                      if (level0Categories.length > 0 && !selectedParentId) {
                        setSelectedParentId(level0Categories[0].id);
                      }
                    }}
                    className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      targetLevel === 1
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Subcategory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetLevel(2);
                      if (level1Categories.length > 0 && !selectedParentId) {
                        setSelectedParentId(level1Categories[0].id);
                      }
                    }}
                    className={`py-1.5 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      targetLevel === 2
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Sub-sub</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Parent Selector */}
              {targetLevel === 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Parent Category (Level 0) *
                  </label>
                  {level0Categories.length > 0 ? (
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      {level0Categories.map((mainCat) => (
                        <option key={mainCat.id} value={mainCat.id}>
                          📁 {mainCat.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                      ⚠️ Please create a Main Category first before creating subcategories.
                    </p>
                  )}
                </div>
              )}

              {targetLevel === 2 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Parent Subcategory (Level 1) *
                  </label>
                  {level1Categories.length > 0 ? (
                    <select
                      value={selectedParentId}
                      onChange={(e) => setSelectedParentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      {level1Categories.map((subCat) => {
                        const parentCat = storeCategories.find((c) => c.id === subCat.parentId);
                        return (
                          <option key={subCat.id} value={subCat.id}>
                            📂 {parentCat ? `${parentCat.label} > ` : ''}{subCat.label}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-medium">
                      ⚠️ Please create a Subcategory (Level 1) first before creating sub-subcategories.
                    </p>
                  )}
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {targetLevel === 0 ? 'Category Name' : targetLevel === 1 ? 'Subcategory Name' : 'Sub-subcategory Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    targetLevel === 0
                      ? 'e.g. Electronics Components'
                      : targetLevel === 1
                      ? 'e.g. Microcontrollers'
                      : 'e.g. ESP32 Boards'
                  }
                  value={newStoreCatLabel}
                  onChange={(e) => setNewStoreCatLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Short description for store navigation"
                  value={newStoreCatDesc}
                  onChange={(e) => setNewStoreCatDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Create {targetLevel === 0 ? 'Main Category' : targetLevel === 1 ? 'Subcategory' : 'Sub-subcategory'}
                </span>
              </button>
            </form>
          </div>

          {/* TURNKEY PRODUCT CATEGORIES */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                <span>Turnkey Product Categories</span>
              </h2>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                {productCategories.length} Categories
              </span>
            </div>

            <form onSubmit={handleAddProductCategory} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-800">Add Turnkey Product Category</div>
              <input
                type="text"
                required
                placeholder="Category Name"
                value={newProdCatLabel}
                onChange={(e) => setNewProdCatLabel(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Short Description (Optional)"
                value={newProdCatDesc}
                onChange={(e) => setNewProdCatDesc(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Turnkey Category</span>
              </button>
            </form>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {productCategories.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No turnkey product categories created yet.</p>
              ) : (
                productCategories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{cleanCategoryLabel(c.label)}</p>
                      <p className="text-[10px] text-slate-500">{c.description}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProductCategory(c.id, c.label)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: VISUAL HIERARCHY TREE VIEW */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                <span>Store Category Taxonomy Tree</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hierarchical view of Main Categories, Subcategories, and Sub-subcategories
              </p>
            </div>

            {categoryTree.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Expand/Maximize all category branches"
                >
                  <Maximize2 className="w-3 h-3 text-emerald-600" />
                  <span>Maximize All</span>
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Minimize all category branches"
                >
                  <Minimize2 className="w-3 h-3 text-slate-500" />
                  <span>Minimize All</span>
                </button>
              </div>
            )}
          </div>

          {/* TREE SEARCH & QUICK FILTER BAR */}
          {categoryTree.length > 0 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search category tree by name..."
                value={treeSearchQuery}
                onChange={(e) => setTreeSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              {treeSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTreeSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {categoryTree.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-3">
              <FolderTree className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Store Categories Created</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your store currently has no categories. Use the form on the left to create your first top-level Main Category (e.g. Electronics Components).
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-2">
              {categoryTree
                .filter((mainCat) => {
                  if (!treeSearchQuery.trim()) return true;
                  const q = treeSearchQuery.toLowerCase();
                  if (mainCat.label.toLowerCase().includes(q) || mainCat.id.toLowerCase().includes(q)) return true;
                  return mainCat.subcategories.some((s) => 
                    s.label.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) ||
                    s.subcategories.some((ss) => ss.label.toLowerCase().includes(q) || ss.id.toLowerCase().includes(q))
                  );
                })
                .map((mainCat) => {
                  const isMainCollapsed = treeSearchQuery.trim() ? false : collapsedCategories[mainCat.id];
                  const subCount = mainCat.subcategories.length;

                  return (
                    <div
                      key={mainCat.id}
                      className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 space-y-3 shadow-2xs transition-all"
                    >
                      {/* LEVEL 0: MAIN CATEGORY HEADER */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleCollapse(mainCat.id)}
                            className={`p-1 rounded-lg border transition-all cursor-pointer ${
                              isMainCollapsed 
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' 
                                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}
                            title={isMainCollapsed ? "Expand / Maximize Category" : "Minimize Category"}
                          >
                            {isMainCollapsed ? <ChevronRight className="w-4 h-4 font-bold" /> : <ChevronDown className="w-4 h-4 font-bold" />}
                          </button>

                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                            <Folder className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-extrabold text-slate-900 truncate">{mainCat.label}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                                Category (Level 0)
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                {subCount} {subCount === 1 ? 'Subcategory' : 'Subcategories'}
                              </span>
                            </div>
                            {mainCat.description && !isMainCollapsed && (
                              <p className="text-[10px] text-slate-500 mt-0.5 truncate">{mainCat.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleQuickAddSubcategory(mainCat.id, 0)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="Add Subcategory under this Category"
                          >
                            <Plus className="w-3 h-3" />
                            <span className="hidden sm:inline">Add Subcategory</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditCategory(mainCat)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit / Change Category"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteStoreCategory(mainCat.id, mainCat.label)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Main Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* LEVEL 1: SUBCATEGORIES (Only shown if not collapsed) */}
                      {!isMainCollapsed && (
                        <>
                          {mainCat.subcategories.length === 0 ? (
                            <div className="ml-6 p-2.5 bg-white/60 rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400 italic flex items-center justify-between">
                              <span>No subcategories under "{mainCat.label}".</span>
                              <button
                                onClick={() => handleQuickAddSubcategory(mainCat.id, 0)}
                                className="text-emerald-600 hover:underline font-bold text-[10px] cursor-pointer"
                              >
                                + Add Subcategory
                              </button>
                            </div>
                          ) : (
                            <div className="ml-3 sm:ml-4 pl-2 sm:pl-3 border-l-2 border-emerald-300/60 space-y-2.5">
                              {mainCat.subcategories.map((subCat) => {
                                const isSubCollapsed = treeSearchQuery.trim() ? false : collapsedCategories[subCat.id];
                                const subSubCount = subCat.subcategories.length;

                                return (
                                  <div
                                    key={subCat.id}
                                    className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <button
                                          type="button"
                                          onClick={() => toggleCollapse(subCat.id)}
                                          className={`p-0.5 rounded transition-all cursor-pointer ${
                                            isSubCollapsed 
                                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                                              : 'text-slate-500 hover:text-slate-900'
                                          }`}
                                          title={isSubCollapsed ? "Expand Subcategory" : "Minimize Subcategory"}
                                        >
                                          {isSubCollapsed ? <ChevronRight className="w-3.5 h-3.5 font-bold" /> : <ChevronDown className="w-3.5 h-3.5 font-bold" />}
                                        </button>

                                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-slate-800 truncate">{subCat.label}</span>
                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                              Subcategory (Level 1)
                                            </span>
                                            {subSubCount > 0 && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 shrink-0">
                                                {subSubCount} items
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          onClick={() => handleOpenEditCategory(subCat)}
                                          className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"
                                          title="Edit Subcategory"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteStoreCategory(subCat.id, subCat.label)}
                                          className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                          title="Delete Subcategory"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {!isSubCollapsed && subCat.subcategories.length > 0 && (
                                      <div className="ml-4 pl-3 border-l-2 border-slate-200 space-y-1.5 pt-1">
                                        {subCat.subcategories.map((subSub) => (
                                          <div key={subSub.id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-xs border border-slate-100">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                              <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                              <span className="font-medium text-slate-700 truncate">{subSub.label}</span>
                                              <span className="text-[9px] text-slate-400 shrink-0">(Level 2)</span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              <button onClick={() => handleOpenEditCategory(subSub)} className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer" title="Edit Sub-subcategory">
                                                <Pencil className="w-3 h-3" />
                                              </button>
                                              <button onClick={() => handleDeleteStoreCategory(subSub.id, subSub.label)} className="p-1 text-slate-400 hover:text-red-600 cursor-pointer" title="Delete Sub-subcategory">
                                                <Trash2 className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* EDIT CATEGORY MODAL */}
      {editingCat && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit / Change Category</h3>
                  <p className="text-[11px] text-slate-500 font-mono">ID: {editingCat.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCategory} className="space-y-4">
              {/* Category Level Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Category Tier Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditLevel(0);
                      setEditParentId('');
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      editLevel === 0
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Category (Level 0)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditLevel(1);
                      if (level0Categories.length > 0 && !level0Categories.some((l0) => l0.id === editParentId)) {
                        setEditParentId(level0Categories[0].id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      editLevel === 1
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Subcategory (Level 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditLevel(2);
                      if (level1Categories.length > 0 && !level1Categories.some((l1) => l1.id === editParentId)) {
                        setEditParentId(level1Categories[0].id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      editLevel === 2
                        ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sub-sub (Level 2)
                  </button>
                </div>
              </div>

              {/* Parent Category Selector when Level 1 or Level 2 */}
              {editLevel === 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent Main Category (Level 0) *
                  </label>
                  <select
                    value={editParentId}
                    onChange={(e) => setEditParentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="">-- Select Parent Main Category --</option>
                    {level0Categories
                      .filter((c) => c.id !== editingCat.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          📁 {m.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {editLevel === 2 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent Subcategory (Level 1) *
                  </label>
                  <select
                    value={editParentId}
                    onChange={(e) => setEditParentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-semibold"
                  >
                    <option value="">-- Select Parent Subcategory --</option>
                    {level1Categories
                      .filter((c) => c.id !== editingCat.id)
                      .map((subCat) => {
                        const parentCat = storeCategories.find((c) => c.id === subCat.parentId);
                        return (
                          <option key={subCat.id} value={subCat.id}>
                            📂 {parentCat ? `${parentCat.label} > ` : ''}{subCat.label}
                          </option>
                        );
                      })}
                  </select>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  placeholder="Category Name"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="Short description"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
