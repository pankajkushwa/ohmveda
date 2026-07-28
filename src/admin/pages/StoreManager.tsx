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
    const newItem: StoreItem = {
      id: `store-item-${Date.now()}`,
      name: 'ESP32-S3 Custom Dev Board with OLED',
      category: 'microcontrollers',
      price: 599,
      originalPrice: 750,
      stock: 50,
      inStock: true,
      rating: 4.8,
      reviewsCount: 12,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      shortDesc: 'Integrated ESP32-S3 Wi-Fi & BLE module with on-board 0.96 inch I2C OLED display.',
      specs: ['ESP32-S3 240MHz Dual-Core', '0.96" OLED 128x64 Display', 'USB-C Type Cable Port', 'Wi-Fi + BLE 5.0'],
      sku: `OV-MCU-${Math.floor(1000 + Math.random() * 9000)}`,
      badge: 'New',
    };
    setEditingStoreItem(newItem);
    setStoreItemModalOpen(true);
  };

  const handleOpenEditStoreItem = (item: StoreItem) => {
    setEditingStoreItem(JSON.parse(JSON.stringify(item)));
    setStoreItemModalOpen(true);
  };

  const handleSaveStoreItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStoreItem) return;

    const exists = storeItems.some((s) => s.id === editingStoreItem.id);
    let updated: StoreItem[];

    if (exists) {
      updated = storeItems.map((s) => (s.id === editingStoreItem.id ? editingStoreItem : s));
      addAdminLog({
        action: 'UPDATE',
        target: 'STORE',
        title: `Updated Store Component: ${editingStoreItem.name}`,
        details: `SKU: ${editingStoreItem.sku} | Price: ₹${editingStoreItem.price} | Stock: ${editingStoreItem.stock}`,
      });
      showToast(`Component "${editingStoreItem.name}" updated.`, 'success');
    } else {
      updated = [editingStoreItem, ...storeItems];
      addAdminLog({
        action: 'ADD',
        target: 'STORE',
        title: `Added Store Component: ${editingStoreItem.name}`,
        details: `SKU: ${editingStoreItem.sku} | Price: ₹${editingStoreItem.price}`,
      });
      showToast(`Component "${editingStoreItem.name}" added.`, 'success');
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

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <span>Electronics Store Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage microcontrollers, sensors, communication modules, and power boards ({storeItems.length} store items)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToStore}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Visit Electronics Store</span>
          </button>
          <button
            onClick={handleOpenAddStoreItem}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store Component</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search store inventory by component name or SKU..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-950 border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-slate-100 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SKU: {item.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize text-slate-300 font-semibold">{item.category}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-emerald-400">₹{item.price.toLocaleString('en-IN')}</div>
                    {item.originalPrice && (
                      <div className="text-[10px] text-slate-500 line-through">
                        ₹{item.originalPrice.toLocaleString('en-IN')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStockStatus(item.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                          item.inStock
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
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
                            className="w-5 h-5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold text-xs"
                            title="Decrease Stock (-5)"
                          >
                            -
                          </button>
                          <button
                            onClick={() => handleQuickUpdateStock(item.id, item.stock + 5)}
                            className="w-5 h-5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold text-xs"
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
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                        title="Edit Item"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteStoreItem(item.id, item.name)}
                        className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 rounded-lg transition-colors"
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
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No store items matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Store Item Modal */}
      {storeItemModalOpen && editingStoreItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 my-8 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>
                  {storeItems.some((s) => s.id === editingStoreItem.id) ? 'Edit Store Component' : 'Add Store Component'}
                </span>
              </h2>
              <button
                onClick={() => {
                  setStoreItemModalOpen(false);
                  setEditingStoreItem(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreItem} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Component Name</label>
                  <input
                    type="text"
                    required
                    value={editingStoreItem.name}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Category</label>
                  <select
                    value={editingStoreItem.category}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {storeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingStoreItem.price}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingStoreItem.originalPrice || ''}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, originalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingStoreItem.stock}
                    onChange={(e) =>
                      setEditingStoreItem({
                        ...editingStoreItem,
                        stock: Number(e.target.value),
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Component Image URL</label>
                <input
                  type="text"
                  value={editingStoreItem.image}
                  onChange={(e) => setEditingStoreItem({ ...editingStoreItem, image: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setStoreItemModalOpen(false);
                    setEditingStoreItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
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
