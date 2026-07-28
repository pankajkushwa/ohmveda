import React, { useState } from 'react';
import { 
  Plus, Edit3, Trash2, Search, Cpu, X, Save, DollarSign, CheckCircle2, AlertTriangle, ExternalLink
} from 'lucide-react';
import { StoreCategory, StoreItem } from '../../types';
import { ImageUploaderManager } from '../../components/ImageUploaderManager';
import { addAdminLog, deleteFirestoreDoc } from '../../services/dataStorage';

interface StoreManagerProps {
  storeItems: StoreItem[];
  storeCategories: StoreCategory[];
  onUpdateStoreItems: (items: StoreItem[]) => void;
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onNavigateToStore: () => void;
}

export const StoreManager: React.FC<StoreManagerProps> = ({
  storeItems,
  storeCategories,
  onUpdateStoreItems,
  showToast,
  openDeleteConfirm,
  onNavigateToStore,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [storeItemModalOpen, setStoreItemModalOpen] = useState(false);
  const [editingStoreItem, setEditingStoreItem] = useState<StoreItem | null>(null);
  const [specsInputText, setSpecsInputText] = useState('');

  // Filtered Store Components
  const filteredItems = storeItems.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddStoreItem = () => {
    const defaultCategory = storeCategories.length > 0 ? storeCategories[0].id : '';
    const newItem: StoreItem = {
      id: `store-item-${Date.now()}`,
      name: '',
      category: defaultCategory,
      price: 0,
      originalPrice: 0,
      stock: 10,
      inStock: true,
      rating: 5.0,
      reviewsCount: 0,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      shortDesc: '',
      specs: [],
      sku: `OV-CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      badge: 'In Stock',
    };
    setEditingStoreItem(newItem);
    setSpecsInputText('');
    setStoreItemModalOpen(true);
  };

  const handleOpenEditStoreItem = (item: StoreItem) => {
    const itemCopy: StoreItem = JSON.parse(JSON.stringify(item));
    setEditingStoreItem(itemCopy);
    setSpecsInputText(itemCopy.specs ? itemCopy.specs.join('\n') : '');
    setStoreItemModalOpen(true);
  };

  const handleSaveStoreItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoreItem) return;

    if (!editingStoreItem.name.trim()) {
      showToast('Component name is required.', 'error');
      return;
    }

    if (!editingStoreItem.category) {
      showToast('Please select a component category.', 'error');
      return;
    }

    // Parse specs from multiline text
    const parsedSpecs = specsInputText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const finalItem: StoreItem = {
      ...editingStoreItem,
      specs: parsedSpecs,
    };

    const exists = storeItems.some((s) => s.id === finalItem.id);
    let updated: StoreItem[];

    if (exists) {
      updated = storeItems.map((s) => (s.id === finalItem.id ? finalItem : s));
      addAdminLog({
        action: 'UPDATE',
        target: 'STORE',
        title: `Updated Store Component: ${finalItem.name}`,
        details: `Category: ${finalItem.category} | SKU: ${finalItem.sku} | Price: ₹${finalItem.price}`,
      });
      showToast(`Component "${finalItem.name}" updated successfully.`, 'success');
    } else {
      updated = [finalItem, ...storeItems];
      addAdminLog({
        action: 'ADD',
        target: 'STORE',
        title: `Added Store Component: ${finalItem.name}`,
        details: `Category: ${finalItem.category} | SKU: ${finalItem.sku} | Price: ₹${finalItem.price}`,
      });
      showToast(`Component "${finalItem.name}" added to inventory.`, 'success');
    }

    onUpdateStoreItems(updated);
    setStoreItemModalOpen(false);
    setEditingStoreItem(null);
  };

  const handleDeleteStoreItem = (id: string, name: string) => {
    openDeleteConfirm(
      'Delete Store Component',
      `Are you sure you want to delete component "${name}" from the store inventory?`,
      () => {
        const updated = storeItems.filter((s) => s.id !== id);
        onUpdateStoreItems(updated);
        deleteFirestoreDoc('store_items', id);
        addAdminLog({
          action: 'DELETE',
          target: 'STORE',
          title: `Deleted Store Item: ${name}`,
          details: `ID: ${id}`,
        });
        showToast(`Component "${name}" removed.`, 'success');
      }
    );
  };

  const handleToggleStockStatus = (id: string) => {
    const updated = storeItems.map((s) =>
      s.id === id ? { ...s, inStock: !s.inStock, stock: !s.inStock ? 25 : 0 } : s
    );
    onUpdateStoreItems(updated);
  };

  const handleQuickUpdateStock = (id: string, newStock: number) => {
    const updated = storeItems.map((s) =>
      s.id === id ? { ...s, stock: Math.max(0, newStock), inStock: newStock > 0 } : s
    );
    onUpdateStoreItems(updated);
  };

  // Helper to find category label
  const getCategoryLabel = (catId: string) => {
    const found = storeCategories.find((c) => c.id === catId);
    return found ? found.label : catId;
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <span>Electronics Store Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage microcontrollers, resistors, sensors, communication modules, and power components ({storeItems.length} store items)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToStore}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Visit Electronics Store</span>
          </button>
          <button
            onClick={handleOpenAddStoreItem}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store Component</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search store inventory by component name or SKU..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
          >
            <option value="all">All Component Categories</option>
            {storeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Component Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px]">
                      {getCategoryLabel(item.category)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-emerald-600">₹{item.price.toLocaleString('en-IN')}</div>
                    {item.originalPrice ? (
                      <div className="text-[10px] text-slate-400 line-through">
                        ₹{item.originalPrice.toLocaleString('en-IN')}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStockStatus(item.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          item.inStock
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {item.inStock ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>In Stock ({item.stock})</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>

                      {item.inStock && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQuickUpdateStock(item.id, item.stock - 5)}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs"
                            title="Decrease Stock (-5)"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleQuickUpdateStock(item.id, item.stock + 5)}
                            className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs"
                            title="Increase Stock (+5)"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditStoreItem(item)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteStoreItem(item.id, item.name)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No store items matching your filter. Click "Add Store Component" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Store Item Modal */}
      {storeItemModalOpen && editingStoreItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 my-8 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>
                  {storeItems.some((s) => s.id === editingStoreItem.id) ? 'Edit Store Component' : 'Add Store Component'}
                </span>
              </h2>
              <button
                onClick={() => {
                  setStoreItemModalOpen(false);
                  setEditingStoreItem(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Component Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10k Ohm Metal Film Resistor 1/4W"
                    value={editingStoreItem.name}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={editingStoreItem.category}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    {storeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingStoreItem.price}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={editingStoreItem.originalPrice || ''}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, originalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min={0}
                    value={editingStoreItem.stock}
                    onChange={(e) =>
                      setEditingStoreItem({
                        ...editingStoreItem,
                        stock: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editingStoreItem.sku || ''}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, sku: e.target.value })}
                    placeholder="e.g. OV-RES-10K"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingStoreItem.badge || ''}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, badge: e.target.value })}
                    placeholder="e.g. High Precision, In Stock, Bestseller"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary / Description</label>
                <textarea
                  rows={2}
                  value={editingStoreItem.shortDesc || ''}
                  onChange={(e) => setEditingStoreItem({ ...editingStoreItem, shortDesc: e.target.value })}
                  placeholder="Brief description of the component..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Technical Specifications & Key Features (Enter 1 per line)
                </label>
                <textarea
                  rows={4}
                  value={specsInputText}
                  onChange={(e) => setSpecsInputText(e.target.value)}
                  placeholder="Resistance: 10k Ohm ±1%&#10;Power Rating: 0.25W (1/4 Watt)&#10;Package: Through Hole THT&#10;Max Operating Voltage: 250V"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Write each specification or feature on a separate line.
                </p>
              </div>

              <div>
                <ImageUploaderManager
                  images={editingStoreItem.images || (editingStoreItem.image ? [editingStoreItem.image] : [])}
                  image={editingStoreItem.image}
                  onChange={(urls, primary) =>
                    setEditingStoreItem({
                      ...editingStoreItem,
                      images: urls,
                      image: primary || editingStoreItem.image || '',
                    })
                  }
                  accentColor="emerald"
                  label="Component Media & Images"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setStoreItemModalOpen(false);
                    setEditingStoreItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Component</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
