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

  const cleanCategoryLabel = (label: string, fallbackId?: string) => {
    if (!label) return fallbackId || '';
    let cleaned = label.replace(/\s*\([^)]*\)/gi, '').trim();
    return cleaned || label;
  };

  // Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TurnkeyProduct | null>(null);

  // Form Multiline State Helpers
  const [specsInputText, setSpecsInputText] = useState('');
  const [appsInputText, setAppsInputText] = useState('');

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
    const defaultCatGroup = productCategories.length > 0 ? productCategories[0].id : 'gateways';
    const defaultCatLabel = productCategories.length > 0 ? productCategories[0].label : 'Industrial Edge Gateway';
    const newProduct: TurnkeyProduct = {
      id: `ov-product-${Date.now()}`,
      title: '',
      category: defaultCatLabel,
      categoryGroup: defaultCatGroup,
      sku: `OV-HW-${Math.floor(100 + Math.random() * 900)}`,
      badge: 'New Release',
      iconName: 'Radio',
      shortDesc: '',
      fullDesc: '',
      datasheetSize: '1.5 MB PDF',
      specs: [],
      blockDiagram: [],
      techParams: {
        mcu: '',
        memory: '',
        connectivity: '',
        power: '',
        enclosure: '',
        software: '',
        tempRange: '',
      },
      applications: [],
    };
    setEditingProduct(newProduct);
    setSpecsInputText('');
    setAppsInputText('');
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (product: TurnkeyProduct) => {
    const productCopy: TurnkeyProduct = JSON.parse(JSON.stringify(product));
    setEditingProduct(productCopy);
    setSpecsInputText(productCopy.specs ? productCopy.specs.join('\n') : '');
    setAppsInputText(productCopy.applications ? productCopy.applications.join('\n') : '');
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.title.trim()) {
      showToast('Product title is required.', 'error');
      return;
    }

    const parsedSpecs = specsInputText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const parsedApps = appsInputText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const finalProduct: TurnkeyProduct = {
      ...editingProduct,
      specs: parsedSpecs,
      applications: parsedApps,
    };

    const exists = products.some((p) => p.id === finalProduct.id);
    let updated: TurnkeyProduct[];

    if (exists) {
      updated = products.map((p) => (p.id === finalProduct.id ? finalProduct : p));
      addAdminLog({
        action: 'UPDATE',
        target: 'PRODUCT',
        title: `Updated Product: ${finalProduct.title}`,
        details: `SKU: ${finalProduct.sku} | Category: ${finalProduct.category}`,
      });
      showToast(`Product "${finalProduct.title}" updated successfully.`, 'success');
    } else {
      updated = [finalProduct, ...products];
      addAdminLog({
        action: 'ADD',
        target: 'PRODUCT',
        title: `Added Product: ${finalProduct.title}`,
        details: `SKU: ${finalProduct.sku} | Category: ${finalProduct.category}`,
      });
      showToast(`Product "${finalProduct.title}" added.`, 'success');
    }

    onUpdateProducts(updated);
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string, title: string) => {
    openDeleteConfirm(
      'Delete Product',
      `Are you sure you want to delete product "${title}"? This will remove it from the catalog.`,
      () => {
        const updated = products.filter((p) => p.id !== id);
        onUpdateProducts(updated);
        deleteFirestoreDoc('products', id);
        addAdminLog({
          action: 'DELETE',
          target: 'PRODUCT',
          title: `Deleted Product: ${title}`,
          details: `ID: ${id}`,
        });
        showToast(`Product "${title}" deleted.`, 'success');
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-600" />
            <span>Products</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage flagship hardware platforms, telemetry gateways, and controllers ({products.length} products)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddProduct}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products by title, category, or SKU..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-xs"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
          >
            <option value="all">All Category Groups</option>
            {productCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Platform</th>
                <th className="py-3 px-4">Category Group</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Badge</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 line-clamp-1">{product.title}</p>
                        <p className="text-[10px] text-slate-500">{product.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                      {product.categoryGroup}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{product.sku}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {product.badge || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(product)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.title)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No products matching your search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 my-8 text-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                <span>
                  {products.some((p) => p.id === editingProduct.id) ? 'Edit Product' : 'Add Product'}
                </span>
              </h2>
              <button
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder=""
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder=""
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Display Category Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Group</label>
                  <select
                    value={editingProduct.categoryGroup}
                    onChange={(e) => {
                      const selectedGroup = e.target.value;
                      const found = productCategories.find((c) => c.id === selectedGroup);
                      setEditingProduct({
                        ...editingProduct,
                        categoryGroup: selectedGroup,
                        category: found ? found.label : editingProduct.category,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {productCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {cleanCategoryLabel(c.label, c.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={editingProduct.badge || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    placeholder=""
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.shortDesc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDesc: e.target.value })}
                  placeholder=""
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.fullDesc || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fullDesc: e.target.value })}
                  placeholder=""
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Features & Key Specifications (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={specsInputText}
                  onChange={(e) => setSpecsInputText(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Applications (1 per line)
                </label>
                <textarea
                  rows={2}
                  value={appsInputText}
                  onChange={(e) => setAppsInputText(e.target.value)}
                  placeholder=""
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* Product Images Uploader */}
              <div>
                <ImageUploaderManager
                  images={editingProduct.images || (editingProduct.image ? [editingProduct.image] : [])}
                  image={editingProduct.image}
                  onChange={(urls, primary) =>
                    setEditingProduct({
                      ...editingProduct,
                      images: urls,
                      image: primary || editingProduct.image || '',
                    })
                  }
                  accentColor="blue"
                  label="Product Media & Images"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 flex items-center gap-1.5"
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
