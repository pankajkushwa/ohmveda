import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit3, Trash2, Search, Cpu, X, Save, DollarSign, CheckCircle2, AlertTriangle, 
  ExternalLink, FileText, Upload, HelpCircle, Star, Send, MessageSquare, Download, Link
} from 'lucide-react';
import { StoreCategory, StoreItem, TechnicalDocument, StoreQaItem, StoreReviewItem } from '../../types';
import { ImageUploaderManager } from '../../components/ImageUploaderManager';
import { 
  addAdminLog, 
  deleteFirestoreDoc, 
  getStoredStoreQas, 
  answerStoreQuestion, 
  deleteStoreQuestion, 
  getStoredStoreReviews, 
  deleteStoreReview,
  deleteDocumentBlob,
} from '../../services/dataStorage';

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
  const [basePriceInput, setBasePriceInput] = useState<number | ''>(0);
  const [discountPercentInput, setDiscountPercentInput] = useState<number | ''>('');

  // Technical Document Form State inside Modal
  const [docTitleInput, setDocTitleInput] = useState('');
  const [docTypeInput, setDocTypeInput] = useState<'Datasheet' | 'Schematic' | 'Manual' | 'CAD' | 'Zip'>('Datasheet');
  const [docUrlInput, setDocUrlInput] = useState('');
  const [docSizeInput, setDocSizeInput] = useState('');

  // Q&A & Review Management State
  const [managementTab, setManagementTab] = useState<'inventory' | 'qas' | 'reviews'>('inventory');
  const [qas, setQas] = useState<StoreQaItem[]>(() => getStoredStoreQas());
  const [reviews, setReviews] = useState<StoreReviewItem[]>(() => getStoredStoreReviews());
  const [answeringQaId, setAnsweringQaId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    const handleSync = () => {
      setQas(getStoredStoreQas());
      setReviews(getStoredStoreReviews());
    };
    window.addEventListener('ohmveda_store_qas_updated', handleSync);
    window.addEventListener('ohmveda_store_reviews_updated', handleSync);

    return () => {
      window.removeEventListener('ohmveda_store_qas_updated', handleSync);
      window.removeEventListener('ohmveda_store_reviews_updated', handleSync);
    };
  }, []);

  // Filtered Store Components
  const filteredItems = storeItems.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Helper functions for Document Uploads inside Edit Modal
  const handleAddDocumentToItem = () => {
    if (!editingStoreItem || !docTitleInput.trim()) {
      showToast('Please enter a document title.', 'error');
      return;
    }

    const newDoc: TechnicalDocument = {
      id: `doc-${Date.now()}`,
      title: docTitleInput.trim(),
      fileType: docTypeInput,
      url: docUrlInput.trim() || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      fileSize: docSizeInput.trim() || '1.2 MB',
      uploadedAt: new Date().toISOString().split('T')[0],
    };

    const existingDocs = editingStoreItem.documents || [];
    setEditingStoreItem({
      ...editingStoreItem,
      documents: [...existingDocs, newDoc],
    });

    setDocTitleInput('');
    setDocUrlInput('');
    setDocSizeInput('');
    showToast('Technical document added to component.', 'success');
  };

  const handleRemoveDocumentFromItem = (docId: string) => {
    if (!editingStoreItem) return;
    deleteDocumentBlob(docId);
    const existingDocs = editingStoreItem.documents || [];
    setEditingStoreItem({
      ...editingStoreItem,
      documents: existingDocs.filter((d) => d.id !== docId),
    });
    showToast('Document removed from component.', 'info');
  };

  const handleFileUploadBase64 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB for fast loading.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDocUrlInput(reader.result);
        if (!docTitleInput) {
          setDocTitleInput(file.name.replace(/\.[^/.]+$/, ''));
        }
        setDocSizeInput(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
        showToast(`File "${file.name}" attached successfully!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Q&A & Review Handlers
  const handlePublishAnswer = (qaId: string) => {
    if (!answerText.trim()) return;
    answerStoreQuestion(qaId, answerText, 'OhmVeda Technical Team');
    setAnsweringQaId(null);
    setAnswerText('');
    setQas(getStoredStoreQas());
    showToast('Official answer published successfully!', 'success');
  };

  const handleDeleteQa = (qaId: string) => {
    openDeleteConfirm('Delete Question', 'Are you sure you want to delete this question?', () => {
      deleteStoreQuestion(qaId);
      setQas(getStoredStoreQas());
      showToast('Question deleted.', 'info');
    });
  };

  const handleDeleteReviewItem = (reviewId: string) => {
    openDeleteConfirm('Delete Customer Review', 'Are you sure you want to delete this review?', () => {
      deleteStoreReview(reviewId);
      setReviews(getStoredStoreReviews());
      showToast('Review removed and average rating recalculated.', 'info');
    });
  };

  const handleOpenAddStoreItem = () => {
    const defaultCategory = storeCategories.length > 0 ? storeCategories[0].id : '';
    const newItem: StoreItem = {
      id: `store-item-${Date.now()}`,
      name: '',
      category: defaultCategory,
      price: 0,
      originalPrice: undefined,
      discountPercent: undefined,
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
    setBasePriceInput('');
    setDiscountPercentInput('');
    setStoreItemModalOpen(true);
  };

  const handleOpenEditStoreItem = (item: StoreItem) => {
    const itemCopy: StoreItem = JSON.parse(JSON.stringify(item));
    setEditingStoreItem(itemCopy);
    setSpecsInputText(itemCopy.specs ? itemCopy.specs.join('\n') : '');

    const orig = itemCopy.originalPrice && itemCopy.originalPrice > itemCopy.price ? itemCopy.originalPrice : itemCopy.price;
    const disc = itemCopy.discountPercent !== undefined
      ? itemCopy.discountPercent
      : (itemCopy.originalPrice && itemCopy.originalPrice > itemCopy.price
          ? Math.round(((itemCopy.originalPrice - itemCopy.price) / itemCopy.originalPrice) * 100)
          : 0);

    setBasePriceInput(orig || itemCopy.price || '');
    setDiscountPercentInput(disc > 0 ? disc : '');
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

    // Calculate Price & Discount
    const baseVal = typeof basePriceInput === 'number' ? basePriceInput : 0;
    const discVal = typeof discountPercentInput === 'number' ? discountPercentInput : 0;

    const finalSellingPrice = discVal > 0 && discVal < 100
      ? Math.round(baseVal * (1 - discVal / 100))
      : baseVal;

    // Parse specs from multiline text
    const parsedSpecs = specsInputText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const finalItem: StoreItem = {
      ...editingStoreItem,
      price: finalSellingPrice,
      originalPrice: discVal > 0 && baseVal > finalSellingPrice ? baseVal : undefined,
      discountPercent: discVal > 0 ? discVal : undefined,
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
        const itemToDelete = storeItems.find((s) => s.id === id);
        if (itemToDelete && itemToDelete.documents) {
          itemToDelete.documents.forEach((d) => deleteDocumentBlob(d.id));
        }
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

  // Helper to clean category label (removes brackets like "capacitor (capacitor)" -> "capacitor")
  const cleanCategoryLabel = (label: string, fallbackId?: string) => {
    if (!label) return fallbackId || '';
    let cleaned = label.replace(/\s*\([^)]*\)/gi, '').trim();
    return cleaned || label;
  };

  // Helper to find category label
  const getCategoryLabel = (catId: string) => {
    const found = storeCategories.find((c) => c.id === catId);
    return found ? cleanCategoryLabel(found.label, catId) : cleanCategoryLabel(catId);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <span>Electronics Store Manager</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage store inventory, technical documents, customer Q&A, and component reviews ({storeItems.length} store items)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddStoreItem}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Store Component</span>
          </button>
        </div>
      </div>

      {/* Admin Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setManagementTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            managementTab === 'inventory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>Store Inventory ({storeItems.length})</span>
        </button>

        <button
          onClick={() => setManagementTab('qas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            managementTab === 'qas'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>Customer Q&A</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-blue-100 text-blue-800">
            {qas.length}
          </span>
        </button>

        <button
          onClick={() => setManagementTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            managementTab === 'reviews'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Customer Reviews</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-amber-100 text-amber-800">
            {reviews.length}
          </span>
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {managementTab === 'inventory' && (
        <div className="space-y-4">
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
                    {cleanCategoryLabel(c.label, c.id)}
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
                    <th className="py-3 px-4">Documents</th>
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
                        {item.originalPrice && item.originalPrice > item.price ? (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{item.originalPrice.toLocaleString('en-IN')}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold flex items-center gap-1 w-fit">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>{item.documents?.length || 0} Docs</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStockStatus(item.id)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 cursor-pointer ${
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
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs cursor-pointer"
                                title="Decrease Stock (-5)"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleQuickUpdateStock(item.id, item.stock + 5)}
                                className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold text-xs cursor-pointer"
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
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                            title="Edit Item & Documents"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteStoreItem(item.id, item.name)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors cursor-pointer"
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
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No store items matching your filter. Click "Add Store Component" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Q&A MANAGEMENT */}
      {managementTab === 'qas' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>Customer Inquiries & Component Questions ({qas.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Answer customer technical questions about voltage levels, pinouts, or firmware compatibility.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {qas.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl">
                No customer questions submitted yet.
              </div>
            ) : (
              qas.map((qa) => {
                const targetComp = storeItems.find((s) => s.id === qa.itemId);

                return (
                  <div key={qa.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900">{qa.userName}</span>
                        <span className="text-[11px] text-slate-400">({qa.userEmail})</span>
                        <span className="text-[10px] text-slate-400 font-mono">• Asked on {qa.askedAt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {targetComp && (
                          <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold font-mono">
                            For: {targetComp.name}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono ${
                          qa.isAnswered ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {qa.isAnswered ? 'Answered' : 'Awaiting Answer'}
                        </span>
                        <button
                          onClick={() => handleDeleteQa(qa.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">
                      Q: {qa.question}
                    </p>

                    {qa.isAnswered && qa.answer && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <div className="font-bold text-blue-700 text-[10px] uppercase font-mono">
                          Answered by {qa.answeredBy || 'OhmVeda Support'} on {qa.answeredAt}
                        </div>
                        <p>{qa.answer}</p>
                      </div>
                    )}

                    {/* Answer Form */}
                    {answeringQaId === qa.id ? (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <textarea
                          rows={2}
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          placeholder="Type official OhmVeda technical response..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setAnsweringQaId(null);
                              setAnswerText('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handlePublishAnswer(qa.id)}
                            className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish Official Answer</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAnsweringQaId(qa.id);
                          setAnswerText(qa.answer || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>{qa.isAnswered ? 'Edit Published Answer' : 'Reply & Post Answer'}</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER REVIEWS MANAGEMENT */}
      {managementTab === 'reviews' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Published Component Reviews ({reviews.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit and moderate customer feedback, star ratings, and verified purchases.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-2xl">
                No customer reviews submitted yet.
              </div>
            ) : (
              reviews.map((rev) => {
                const targetComp = storeItems.find((s) => s.id === rev.itemId);

                return (
                  <div key={rev.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-slate-900 text-xs">{rev.title}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {targetComp && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold font-mono">
                            {targetComp.name}
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteReviewItem(rev.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700">{rev.comment}</p>

                    <div className="text-[10px] text-slate-400 font-mono">
                      By {rev.userName} ({rev.userEmail}) • Posted on {rev.createdAt}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Edit/Add Store Item Modal */}
      {storeItemModalOpen && editingStoreItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-800 shadow-2xl flex flex-col max-h-[88vh] my-auto overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 shrink-0">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                <span>
                  {storeItems.some((s) => s.id === editingStoreItem.id) ? 'Edit Store Component' : 'Add Store Component'}
                </span>
              </h2>
              <button
                type="button"
                onClick={() => {
                  setStoreItemModalOpen(false);
                  setEditingStoreItem(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body & Form */}
            <form onSubmit={handleSaveStoreItem} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                
                {/* Name & Category Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Component Name *</label>
                    <input
                      type="text"
                      required
                      placeholder=""
                      value={editingStoreItem.name}
                      onChange={(e) => setEditingStoreItem({ ...editingStoreItem, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                    {storeCategories.length > 0 ? (
                      <select
                        value={editingStoreItem.category}
                        onChange={(e) => setEditingStoreItem({ ...editingStoreItem, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      >
                        <option value="">-- Select Category --</option>
                        {storeCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {cleanCategoryLabel(c.label, c.id)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        placeholder=""
                        value={editingStoreItem.category}
                        onChange={(e) => setEditingStoreItem({ ...editingStoreItem, category: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    )}
                  </div>
                </div>

                {/* Price, Discount (%) & Stock Row */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        placeholder=""
                        value={basePriceInput}
                        onChange={(e) => setBasePriceInput(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        min={0}
                        max={99}
                        placeholder=""
                        value={discountPercentInput}
                        onChange={(e) => setDiscountPercentInput(e.target.value === '' ? '' : Math.min(99, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-medium"
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
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                      />
                    </div>
                  </div>

                  {/* Calculated Price Helper */}
                  {(() => {
                    const b = typeof basePriceInput === 'number' ? basePriceInput : 0;
                    const d = typeof discountPercentInput === 'number' ? discountPercentInput : 0;
                    const calc = d > 0 && d < 100 ? Math.round(b * (1 - d / 100)) : b;

                    return (
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                        <span className="font-semibold text-slate-700">Calculated Store Price:</span>
                        {d > 0 ? (
                          <div className="flex items-baseline gap-2 font-mono">
                            <span className="text-sm font-bold text-emerald-600">₹{calc.toLocaleString()}</span>
                            <span className="text-xs text-slate-400 line-through">₹{b.toLocaleString()}</span>
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">{d}% OFF</span>
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-slate-900">
                            ₹{b.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">(No discount applied)</span>
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* SKU & Badge Tag Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code</label>
                    <input
                      type="text"
                      value={editingStoreItem.sku || ''}
                      onChange={(e) => setEditingStoreItem({ ...editingStoreItem, sku: e.target.value })}
                      placeholder=""
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={editingStoreItem.badge || ''}
                      onChange={(e) => setEditingStoreItem({ ...editingStoreItem, badge: e.target.value })}
                      placeholder=""
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary / Description</label>
                  <textarea
                    rows={2}
                    value={editingStoreItem.shortDesc || ''}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, shortDesc: e.target.value })}
                    placeholder=""
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Technical Specifications & Key Features (Enter 1 per line)
                  </label>
                  <textarea
                    rows={4}
                    value={specsInputText}
                    onChange={(e) => setSpecsInputText(e.target.value)}
                    placeholder=""
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Write each specification or feature on a separate line.
                  </p>
                </div>

                {/* Technical Documents Upload / Linker */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Technical Documents ({editingStoreItem.documents?.length || 0})</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Upload or attach datasheets, circuit schematics, pinout guides, and CAD files.
                      </p>
                    </div>
                  </div>

                  {/* Existing Attached Documents List */}
                  {editingStoreItem.documents && editingStoreItem.documents.length > 0 && (
                    <div className="space-y-2">
                      {editingStoreItem.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                              {doc.fileType}
                            </span>
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1">{doc.title}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {doc.fileSize} • Uploaded {doc.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-500 hover:text-blue-600 transition-colors"
                              title="Preview Document"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveDocumentFromItem(doc.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Document Sub-Form */}
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700">Add New Document:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Doc Title"
                        value={docTitleInput}
                        onChange={(e) => setDocTitleInput(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                      <select
                        value={docTypeInput}
                        onChange={(e) => setDocTypeInput(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="Datasheet">Datasheet</option>
                        <option value="Schematic">Schematic</option>
                        <option value="Manual">User Manual</option>
                        <option value="CAD">CAD Model</option>
                        <option value="Zip">Firmware Zip</option>
                      </select>
                      <input
                        type="text"
                        placeholder="File Size"
                        value={docSizeInput}
                        onChange={(e) => setDocSizeInput(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex-1 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-lg px-3 py-1.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-medium transition-colors">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Upload Local PDF / File</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                          onChange={handleFileUploadBase64}
                          className="hidden"
                        />
                      </label>

                      <span className="text-[10px] text-slate-400 font-bold uppercase">OR</span>

                      <div className="flex-1 relative">
                        <Link className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                        <input
                          type="url"
                          placeholder="Paste Direct Document URL"
                          value={docUrlInput}
                          onChange={(e) => setDocUrlInput(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddDocumentToItem}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Attach</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Upload Manager */}
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

              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setStoreItemModalOpen(false);
                    setEditingStoreItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
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
