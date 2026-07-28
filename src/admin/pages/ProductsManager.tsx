import React, { useState } from 'react';
import { 
  Plus, Edit3, Trash2, Search, Box, X, Save, Sparkles, Layers, Radio, ExternalLink
} from 'lucide-react';
import { ProductCategory, TurnkeyProduct } from '../../types';
import { ImageUploaderManager } from '../../components/ImageUploaderManager';
import { addAdminLog, deleteFirestoreDoc } from '../../services/dataStorage';

interface ProductsManagerProps {
  products: TurnkeyProduct[];
  productCategories: ProductCategory[];
  onUpdateProducts: (products: TurnkeyProduct[]) => void;
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onNavigateToProducts: () => void;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  productCategories,
  onUpdateProducts,
  showToast,
  openDeleteConfirm,
  onNavigateToProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TurnkeyProduct | null>(null);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryGroup === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddProduct = () => {
    const newProduct: TurnkeyProduct = {
      id: `ov-product-${Date.now()}`,
      title: 'New Industrial Telemetry Gateway',
      category: 'Industrial Edge Gateway & Cloud Hub',
      categoryGroup: 'gateways',
      sku: `OV-HW-${Math.floor(100 + Math.random() * 900)}`,
      badge: 'New Release',
      iconName: 'Radio',
      shortDesc: 'Turnkey industrial gateway with RS485 Modbus, Wi-Fi, and 4G LTE cellular uplink.',
      fullDesc: 'Custom-engineered turnkey telemetry platform equipped with optical isolation and cloud connectivity.',
      datasheetSize: '2.0 MB PDF',
      specs: [
        '32-bit Dual-Core 240MHz Compute Engine',
        'Galvanically Isolated RS485 Modbus RTU Interface',
        'Wi-Fi 802.11 b/g/n + Cellular 4G LTE Gateway',
        'IP65 Anodized Aluminum Enclosure',
      ],
      blockDiagram: [
        'Field Sensor Inputs',
        'OhmVeda Microcontroller Platform',
        'Secure MQTT Encryption Pipeline',
        'OhmVeda Cloud Web/Mobile Dashboard',
      ],
      techParams: {
        mcu: '32-bit Xtensa LX7 @ 240MHz',
        memory: '8MB PSRAM + 16MB Flash',
        connectivity: 'Wi-Fi 2.4GHz, 4G LTE, RS485 Modbus',
        power: '9V–36V DC Input',
        enclosure: 'Aluminum Alloy DIN Rail Chassis (IP65)',
        software: 'FreeRTOS, MQTT, Local SQLite',
        tempRange: '-40°C to +85°C Industrial',
      },
      applications: [
        'Factory Automation',
        'Remote Solar Power Monitoring',
        'Smart Agriculture Telemetry',
      ],
    };
    setEditingProduct(newProduct);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: TurnkeyProduct) => {
    setEditingProduct(JSON.parse(JSON.stringify(product)));
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const exists = products.some((p) => p.id === editingProduct.id);
    let updated: TurnkeyProduct[];

    if (exists) {
      updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
      addAdminLog({
        action: 'UPDATE',
        target: 'PRODUCT',
        title: `Updated Product: ${editingProduct.title}`,
        details: `SKU: ${editingProduct.sku} | Category: ${editingProduct.category}`,
      });
      showToast(`Product "${editingProduct.title}" saved.`, 'success');
    } else {
      updated = [editingProduct, ...products];
      addAdminLog({
        action: 'ADD',
        target: 'PRODUCT',
        title: `Added New Product: ${editingProduct.title}`,
        details: `SKU: ${editingProduct.sku}`,
      });
      showToast(`Product "${editingProduct.title}" created.`, 'success');
    }

    onUpdateProducts(updated);
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string, title: string) => {
    openDeleteConfirm(
      'Delete Catalog Product',
      `Are you sure you want to delete "${title}"? This action removes it from the catalog across all connected client devices.`,
      () => {
        const updated = products.filter((p) => p.id !== productId);
        onUpdateProducts(updated);
        deleteFirestoreDoc('turnkey_products', productId);
        addAdminLog({
          action: 'DELETE',
          target: 'PRODUCT',
          title: `Deleted Product: ${title}`,
          details: `ID: ${productId}`,
        });
        showToast(`Product "${title}" deleted.`, 'success');
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-400" />
            <span>Turnkey Hardware Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage flagship industrial hardware products, specs, and datasheets ({products.length} products total)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToProducts}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview in Store</span>
          </button>
          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hardware</span>
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
            placeholder="Search by product name, SKU, or specs..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Product Categories</option>
            {productCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SKU: {p.sku}
                </span>
                {p.badge && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {p.badge}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                {p.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {p.shortDesc}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Category:</span>
                  <span className="font-semibold text-slate-300">{p.category}</span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Specs Count:</span>
                  <span className="font-semibold text-slate-300">{p.specs?.length || 0} points</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenEditProduct(p)}
                className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Specs</span>
              </button>
              <button
                onClick={() => handleDeleteProduct(p.id, p.title)}
                className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 rounded-xl transition-colors"
                title="Delete Product"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80">
            <Box className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No hardware products found</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or click "Add New Hardware" to create one.
            </p>
          </div>
        )}
      </div>

      {/* Edit/Add Hardware Product Modal */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 my-8 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-400" />
                <span>{products.some((p) => p.id === editingProduct.id) ? 'Edit Hardware Product' : 'Add New Hardware Product'}</span>
              </h2>
              <button
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Display Category Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Category Group</label>
                  <select
                    value={editingProduct.categoryGroup}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryGroup: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {productCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.shortDesc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDesc: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Product Images Uploader */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Product Media Images</label>
                <ImageUploaderManager
                  images={editingProduct.images || (editingProduct.primaryImage ? [editingProduct.primaryImage] : [])}
                  onChange={(urls) => setEditingProduct({ ...editingProduct, images: urls, primaryImage: urls[0] || '' })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
