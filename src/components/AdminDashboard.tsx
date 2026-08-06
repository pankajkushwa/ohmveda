import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Plus, Trash2, Edit3, Save, X, RefreshCw, 
  Search, Layers, ShoppingBag, Radio, Activity, DollarSign, User, LogOut, 
  UserCheck, ArrowLeft, Menu, ChevronRight, Clock, AlertTriangle, 
  CheckCircle2, Box, Package, Cpu, Sparkles, Briefcase, FileText, Users, MapPin, Award, Check, Eye, ExternalLink, Download,
  Image, Upload
} from 'lucide-react';
import { JobApplication, JobRole, ProductCategory, StoreCategory, StoreItem, TurnkeyProduct, UserProfile } from '../types';
import { ImageCarousel } from './ImageCarousel';
import { ImageUploaderManager } from './ImageUploaderManager';
import { OhmVedaLogo } from './OhmVedaLogo';
import { INITIAL_TURNKEY_PRODUCTS } from '../data/turnkeyProducts';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { 
  addAdminLog, AdminLog, DEFAULT_PRODUCT_CATEGORIES, DEFAULT_STORE_CATEGORIES, deleteFirestoreDoc, getAdminLogs, 
  getStoredAuthorizedAdminEmails, getStoredCustomLogo, getStoredJobApplications, getStoredJobRoles, isAuthorizedAdminEmail, 
  resetAllDataToDefault, resetAllDataToDefaultAsync, saveStoredAuthorizedAdminEmails, saveStoredCustomLogo, saveStoredJobApplications, saveStoredJobRoles 
} from '../services/dataStorage';

interface AdminDashboardProps {
  products: TurnkeyProduct[];
  storeItems: StoreItem[];
  productCategories?: ProductCategory[];
  storeCategories?: StoreCategory[];
  jobRoles?: JobRole[];
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onUpdateProducts: (products: TurnkeyProduct[]) => void;
  onUpdateStoreItems: (items: StoreItem[]) => void;
  onUpdateProductCategories?: (categories: ProductCategory[]) => void;
  onUpdateStoreCategories?: (categories: StoreCategory[]) => void;
  onUpdateJobRoles?: (roles: JobRole[]) => void;
  onBackToHome: () => void;
  onNavigateToProducts: () => void;
  onNavigateToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  storeItems,
  productCategories,
  storeCategories,
  jobRoles,
  userProfile,
  onOpenAuth,
  onLogout,
  onUpdateProducts,
  onUpdateStoreItems,
  onUpdateProductCategories,
  onUpdateStoreCategories,
  onUpdateJobRoles,
  onBackToHome,
  onNavigateToProducts,
  onNavigateToStore,
}) => {
  // Mobile Sidebar Toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Authorized Admin Email Management
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(getStoredAuthorizedAdminEmails());
  const [newAdminEmailInput, setNewAdminEmailInput] = useState<string>('');

  const isLoggedIn = Boolean(userProfile);
  const isAuthorized = userProfile ? isAuthorizedAdminEmail(userProfile.email) : false;

  // Active Tab: 'products' | 'store' | 'categories' | 'careers' | 'applications' | 'access' | 'logs' | 'branding'
  const [activeTab, setActiveTab] = useState<'products' | 'store' | 'categories' | 'careers' | 'applications' | 'access' | 'logs' | 'branding'>('products');

  // Custom Logo / Branding State
  const [currentSavedLogo, setCurrentSavedLogo] = useState<string | null>(getStoredCustomLogo());
  const [logoInputUrl, setLogoInputUrl] = useState<string>(getStoredCustomLogo() || '');
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(getStoredCustomLogo());
  const [isUploadingLogo, setIsUploadingLogo] = useState<boolean>(false);

  // Careers & Applications state
  const [jobRolesList, setJobRolesList] = useState<JobRole[]>(jobRoles || getStoredJobRoles());
  const [jobAppsList, setJobAppsList] = useState<JobApplication[]>(getStoredJobApplications());

  // Job Role Modal State
  const [jobModalOpen, setJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobRole | null>(null);

  // Application Detail Modal State
  const [selectedAppDetail, setSelectedAppDetail] = useState<JobApplication | null>(null);

  // Categories Datasets
  const activeProdCats = productCategories || DEFAULT_PRODUCT_CATEGORIES;
  const activeStoreCats = storeCategories || DEFAULT_STORE_CATEGORIES;

  // Category Form Inputs
  const [newProdCatLabel, setNewProdCatLabel] = useState<string>('');
  const [newProdCatDesc, setNewProdCatDesc] = useState<string>('');

  const [newStoreCatLabel, setNewStoreCatLabel] = useState<string>('');
  const [newStoreCatIcon, setNewStoreCatIcon] = useState<string>('Cpu');
  const [newStoreCatDesc, setNewStoreCatDesc] = useState<string>('');

  // Inline Quick Add Category state for Modals
  const [quickProdCatOpen, setQuickProdCatOpen] = useState(false);
  const [quickProdCatName, setQuickProdCatName] = useState('');

  const [quickStoreCatOpen, setQuickStoreCatOpen] = useState(false);
  const [quickStoreCatName, setQuickStoreCatName] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<TurnkeyProduct | null>(null);

  const [storeItemModalOpen, setStoreItemModalOpen] = useState<boolean>(false);
  const [editingStoreItem, setEditingStoreItem] = useState<StoreItem | null>(null);

  // Audit Logs State
  const [logs, setLogs] = useState<AdminLog[]>(getAdminLogs());

  // Confirmation Modal State (replaces window.confirm for iframe compatibility)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Toast Notification State (replaces alert)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((current) => (current?.text === text ? null : current));
    }, 4000);
  };

  const refreshLogs = () => {
    setLogs(getAdminLogs());
  };

  // --- TURNKEY PRODUCTS CRUD ---
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
    refreshLogs();
  };

  const handleDeleteProduct = (productId: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      onConfirm: () => {
        const updated = products.filter((p) => p.id !== productId);
        onUpdateProducts(updated);
        deleteFirestoreDoc('turnkey_products', productId);
        addAdminLog({
          action: 'DELETE',
          target: 'PRODUCT',
          title: `Deleted Product: ${title}`,
          details: `ID: ${productId}`,
        });
        refreshLogs();
        showToast(`Product "${title}" deleted.`, 'success');
      },
    });
  };

  // --- STORE ITEMS CRUD ---
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
        title: `Updated Store Item: ${editingStoreItem.name}`,
        details: `SKU: ${editingStoreItem.sku} | Price: ₹${editingStoreItem.price} | Stock: ${editingStoreItem.stock}`,
      });
      showToast(`Store component "${editingStoreItem.name}" updated.`, 'success');
    } else {
      updated = [editingStoreItem, ...storeItems];
      addAdminLog({
        action: 'ADD',
        target: 'STORE',
        title: `Added Store Item: ${editingStoreItem.name}`,
        details: `SKU: ${editingStoreItem.sku} | Price: ₹${editingStoreItem.price}`,
      });
      showToast(`Store component "${editingStoreItem.name}" added.`, 'success');
    }

    onUpdateStoreItems(updated);
    setStoreItemModalOpen(false);
    setEditingStoreItem(null);
    refreshLogs();
  };

  const handleDeleteStoreItem = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Store Component',
      message: `Are you sure you want to delete component "${name}"?`,
      onConfirm: () => {
        const updated = storeItems.filter((s) => s.id !== id);
        onUpdateStoreItems(updated);
        deleteFirestoreDoc('store_items', id);
        addAdminLog({
          action: 'DELETE',
          target: 'STORE',
          title: `Deleted Store Item: ${name}`,
          details: `ID: ${id}`,
        });
        refreshLogs();
        showToast(`Component "${name}" deleted.`, 'success');
      },
    });
  };

  const handleToggleStockStatus = (id: string) => {
    const updated = storeItems.map((s) =>
      s.id === id ? { ...s, inStock: !s.inStock, stock: !s.inStock ? 25 : 0 } : s
    );
    onUpdateStoreItems(updated);
    refreshLogs();
  };

  // --- JOB ROLES & CAREERS CRUD ---
  const handleOpenAddJobRole = () => {
    const newJob: JobRole = {
      id: `job-role-${Date.now()}`,
      title: 'Embedded Firmware Developer',
      department: 'Software',
      location: 'Ahmedabad, India (Hybrid)',
      workType: 'Full-Time',
      openingsCount: 1,
      experience: '2-5 Years',
      salaryRange: '₹6,00,000 - ₹12,00,000 PA',
      description: 'Design and deploy real-time C/C++ firmware for industrial edge gateways and MCU boards.',
      responsibilities: [
        'Develop C/C++ firmware for ESP32 and STM32 microcontrollers.',
        'Implement FreeRTOS tasks, MQTT clients, and Modbus RTU communication stacks.'
      ],
      requirements: [
        'Degree in Electronics, Computer Science, or Electrical Engineering.',
        '2+ years experience in microcontroller firmware development.'
      ],
      keySkills: ['C/C++', 'ESP32', 'FreeRTOS', 'MQTT', 'Modbus'],
      isActive: true,
      postedDate: new Date().toISOString().split('T')[0],
    };
    setEditingJob(newJob);
    setJobModalOpen(true);
  };

  const handleOpenEditJobRole = (job: JobRole) => {
    setEditingJob(JSON.parse(JSON.stringify(job)));
    setJobModalOpen(true);
  };

  const handleSaveJobRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    const exists = jobRolesList.some((j) => j.id === editingJob.id);
    let updated: JobRole[];

    if (exists) {
      updated = jobRolesList.map((j) => (j.id === editingJob.id ? editingJob : j));
      addAdminLog({
        action: 'UPDATE',
        target: 'STORE',
        title: `Updated Job Role: ${editingJob.title}`,
        details: `Dept: ${editingJob.department} | Openings: ${editingJob.openingsCount}`,
      });
      showToast(`Job opening "${editingJob.title}" saved.`, 'success');
    } else {
      updated = [editingJob, ...jobRolesList];
      addAdminLog({
        action: 'ADD',
        target: 'STORE',
        title: `Added Job Opening: ${editingJob.title}`,
        details: `Dept: ${editingJob.department} | Openings: ${editingJob.openingsCount}`,
      });
      showToast(`New job position "${editingJob.title}" created.`, 'success');
    }

    setJobRolesList(updated);
    saveStoredJobRoles(updated);
    if (onUpdateJobRoles) onUpdateJobRoles(updated);

    setJobModalOpen(false);
    setEditingJob(null);
    refreshLogs();
  };

  const handleDeleteJobRole = (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      title: 'Delete Job Position',
      message: `Are you sure you want to delete job opening "${title}"?`,
      onConfirm: () => {
        const updated = jobRolesList.filter((j) => j.id !== id);
        setJobRolesList(updated);
        saveStoredJobRoles(updated);
        if (onUpdateJobRoles) onUpdateJobRoles(updated);
        addAdminLog({
          action: 'DELETE',
          target: 'STORE',
          title: `Deleted Job Position: ${title}`,
          details: `ID: ${id}`,
        });
        refreshLogs();
        showToast(`Job position "${title}" deleted.`, 'success');
      },
    });
  };

  const handleUpdateAppStatus = (appId: string, status: JobApplication['status']) => {
    const updated = jobAppsList.map((a) => (a.id === appId ? { ...a, status } : a));
    setJobAppsList(updated);
    saveStoredJobApplications(updated);
    showToast(`Application status updated to "${status}".`, 'info');
  };

  const handleQuickUpdateStock = (id: string, newStock: number) => {
    const updated = storeItems.map((s) =>
      s.id === id ? { ...s, stock: Math.max(0, newStock), inStock: newStock > 0 } : s
    );
    onUpdateStoreItems(updated);
  };

  // --- CATEGORY MANAGEMENT CRUD ---
  const handleAddProductCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newProdCatLabel.trim()) return;
    const catId = newProdCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `prod_cat_${Date.now()}`;
    if (activeProdCats.some((c) => c.id === catId)) {
      showToast('A product category with this name already exists.', 'error');
      return;
    }
    const newCat: ProductCategory = {
      id: catId,
      label: newProdCatLabel.trim(),
      description: newProdCatDesc.trim() || 'Custom turnkey product category',
    };
    const updated = [...activeProdCats, newCat];
    if (onUpdateProductCategories) {
      onUpdateProductCategories(updated);
    }
    addAdminLog({
      action: 'ADD',
      target: 'CATEGORY',
      title: `Added Product Category: ${newCat.label}`,
      details: `ID: ${newCat.id}`,
    });
    setNewProdCatLabel('');
    setNewProdCatDesc('');
    refreshLogs();
    showToast(`Product category "${newCat.label}" created.`, 'success');
  };

  const handleDeleteProductCategory = (catId: string, label: string) => {
    const productsCount = products.filter((p) => p.categoryGroup === catId).length;
    let confirmMsg = `Are you sure you want to delete product category "${label}"?`;
    if (productsCount > 0) {
      confirmMsg += ` Note: ${productsCount} product(s) currently belong to this category.`;
    }
    setDeleteModal({
      isOpen: true,
      title: 'Delete Product Category',
      message: confirmMsg,
      onConfirm: () => {
        const updated = activeProdCats.filter((c) => c.id !== catId);
        if (onUpdateProductCategories) {
          onUpdateProductCategories(updated);
        }
        addAdminLog({
          action: 'DELETE',
          target: 'CATEGORY',
          title: `Deleted Product Category: ${label}`,
          details: `ID: ${catId}`,
        });
        refreshLogs();
        showToast(`Category "${label}" deleted.`, 'success');
      },
    });
  };

  const handleAddStoreCategory = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newStoreCatLabel.trim()) return;
    const catId = newStoreCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `store_cat_${Date.now()}`;
    if (activeStoreCats.some((c) => c.id === catId)) {
      showToast('A store category with this name already exists.', 'error');
      return;
    }
    const newCat: StoreCategory = {
      id: catId,
      label: newStoreCatLabel.trim(),
      icon: newStoreCatIcon,
      description: newStoreCatDesc.trim() || 'Custom electronics store category',
    };
    const updated = [...activeStoreCats, newCat];
    if (onUpdateStoreCategories) {
      onUpdateStoreCategories(updated);
    }
    addAdminLog({
      action: 'ADD',
      target: 'CATEGORY',
      title: `Added Store Category: ${newCat.label}`,
      details: `ID: ${newCat.id}`,
    });
    setNewStoreCatLabel('');
    setNewStoreCatDesc('');
    refreshLogs();
    showToast(`Shop category "${newCat.label}" created.`, 'success');
  };

  const handleDeleteStoreCategory = (catId: string, label: string) => {
    const storeCount = storeItems.filter((s) => s.category === catId).length;
    let confirmMsg = `Are you sure you want to delete shop category "${label}"?`;
    if (storeCount > 0) {
      confirmMsg += ` Note: ${storeCount} store item(s) currently belong to this category.`;
    }
    setDeleteModal({
      isOpen: true,
      title: 'Delete Shop Category',
      message: confirmMsg,
      onConfirm: () => {
        const updated = activeStoreCats.filter((c) => c.id !== catId);
        if (onUpdateStoreCategories) {
          onUpdateStoreCategories(updated);
        }
        addAdminLog({
          action: 'DELETE',
          target: 'CATEGORY',
          title: `Deleted Store Category: ${label}`,
          details: `ID: ${catId}`,
        });
        refreshLogs();
        showToast(`Shop category "${label}" deleted.`, 'success');
      },
    });
  };

  // Authorized Admin Email Management
  const handleAddAuthorizedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmailInput.trim()) return;
    const cleanEmail = newAdminEmailInput.trim().toLowerCase();
    if (authorizedEmails.includes(cleanEmail)) {
      showToast(`The email "${cleanEmail}" is already authorized.`, 'error');
      return;
    }
    const updated = [...authorizedEmails, cleanEmail];
    setAuthorizedEmails(updated);
    saveStoredAuthorizedAdminEmails(updated);
    addAdminLog({
      action: 'ADD',
      target: 'CATEGORY',
      title: `Authorized New Admin Email: ${cleanEmail}`,
      details: `Added by active admin (${userProfile?.email || 'System'})`,
    });
    setNewAdminEmailInput('');
    refreshLogs();
    showToast(`Authorized "${cleanEmail}" for admin access.`, 'success');
  };

  const handleRemoveAuthorizedEmail = (emailToRemove: string) => {
    const cleanRemove = emailToRemove.trim().toLowerCase();
    if (authorizedEmails.length <= 1) {
      showToast('Cannot remove the last remaining administrator email.', 'error');
      return;
    }
    const isSelf = userProfile && userProfile.email.toLowerCase() === cleanRemove;
    const confirmMsg = isSelf
      ? 'Warning: Removing your own active email address will immediately revoke your admin access! Do you want to proceed?'
      : `Are you sure you want to revoke admin access for "${cleanRemove}"?`;

    setDeleteModal({
      isOpen: true,
      title: 'Revoke Admin Access',
      message: confirmMsg,
      onConfirm: () => {
        const updated = authorizedEmails.filter((e) => e.toLowerCase() !== cleanRemove);
        setAuthorizedEmails(updated);
        saveStoredAuthorizedAdminEmails(updated);
        addAdminLog({
          action: 'DELETE',
          target: 'CATEGORY',
          title: `Revoked Admin Email: ${cleanRemove}`,
          details: `Revoked by ${userProfile?.email || 'System'}`,
        });
        refreshLogs();
        showToast(`Revoked admin access for "${cleanRemove}".`, 'info');
      },
    });
  };

  const handleResetDefaults = () => {
    setDeleteModal({
      isOpen: true,
      title: 'Reset Catalog & Content (Cloud Synced)',
      message: 'Are you sure you want to clear all products, store inventory, categories, and job postings? (Note: Job applications and your custom logo will NOT be deleted). This will clear cloud storage and update all connected devices in real-time.',
      onConfirm: async () => {
        showToast('Resetting catalog & inventory across cloud and all connected devices...', 'info');
        const resetRes = await resetAllDataToDefaultAsync();
        onUpdateProducts(resetRes.products);
        onUpdateStoreItems(resetRes.storeItems);
        if (onUpdateProductCategories && resetRes.productCategories) onUpdateProductCategories(resetRes.productCategories);
        if (onUpdateStoreCategories && resetRes.storeCategories) onUpdateStoreCategories(resetRes.storeCategories);
        if (onUpdateJobRoles && resetRes.jobRoles) {
          setJobRolesList(resetRes.jobRoles);
          onUpdateJobRoles(resetRes.jobRoles);
        }
        refreshLogs();
        showToast('Catalog reset across cloud & synced to all connected devices. (Logo & Job Applications preserved)', 'success');
      },
    });
  };

  // Filtered Products List
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || p.categoryGroup === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filtered Store Items
  const filteredStoreItems = storeItems.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || s.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculated Stats
  const totalStoreValue = storeItems.reduce((acc, item) => acc + item.price * item.stock, 0);
  const outOfStockCount = storeItems.filter((item) => !item.inStock || item.stock === 0).length;

  // ACCESS GUARD 1: User is Not Logged In
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Admin Authentication Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Admin Console is restricted strictly to authorized administrator accounts. Please log in with an authorized email address.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-left">
            <span className="text-[10px] font-bold text-amber-700 font-mono uppercase tracking-wider block">
              Pre-Authorized Admin Addresses:
            </span>
            <ul className="text-xs font-mono text-slate-700 space-y-1">
              {authorizedEmails.map((e) => (
                <li key={e} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-semibold">{e}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={onOpenAuth}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Log In with Authorized Account</span>
            </button>

            <button
              onClick={onBackToHome}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Main Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACCESS GUARD 2: User is Logged In BUT Email is NOT Authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Access Denied: Unauthorized Account</h2>
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-amber-700 font-mono text-xs font-bold">
              {userProfile?.email}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2">
              Your account email address is not listed as an authorized administrator. Only designated admin emails can modify store products, hardware datasheets, and catalog categories.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-left">
            <span className="text-[10px] font-bold text-slate-600 font-mono uppercase tracking-wider block">
              Authorized Admin Accounts List:
            </span>
            <ul className="text-xs font-mono text-slate-700 space-y-1">
              {authorizedEmails.map((e) => (
                <li key={e} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                onLogout();
                onOpenAuth();
              }}
              className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out & Switch Account</span>
            </button>

            <button
              onClick={onBackToHome}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Main Portal</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'products', label: 'Products', icon: Radio, count: products.length, color: 'text-blue-600' },
    { id: 'store', label: 'Electronics Store', icon: ShoppingBag, count: storeItems.length, color: 'text-indigo-600' },
    { id: 'categories', label: 'Categories', icon: Layers, count: activeProdCats.length + activeStoreCats.length, color: 'text-purple-600' },
    { id: 'careers', label: 'Careers & Positions', icon: Briefcase, count: jobRolesList.length, color: 'text-teal-600' },
    { id: 'applications', label: 'Job Applications', icon: FileText, count: jobAppsList.length, color: 'text-emerald-600' },
    { id: 'branding', label: 'Logo & Branding', icon: Image, count: currentSavedLogo ? 'Custom' : 'Vector', color: 'text-rose-600' },
    { id: 'access', label: 'Admin Accounts', icon: UserCheck, count: authorizedEmails.length, color: 'text-amber-600' },
    { id: 'logs', label: 'Audit Logs', icon: Clock, count: logs.length, color: 'text-slate-600' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      
      {/* MOBILE TOP NAV HEADER */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            OV
          </div>
          <span className="font-extrabold text-sm text-slate-900">Admin Console</span>
        </div>
        
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* LEFT SIDEBAR NAVIGATION PANEL */}
      <aside 
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                OV
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight">OhmVeda</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                  {userProfile?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Selection */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-2">
              Management Menu
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedCategoryFilter('all');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block mb-1">
              Store & Live View
            </span>
            <button
              onClick={onNavigateToProducts}
              className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-between cursor-pointer"
            >
              <span>View Live Hardware</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={onNavigateToStore}
              className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-between cursor-pointer"
            >
              <span>View Electronics Store</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
          <button
            onClick={handleResetDefaults}
            className="w-full py-2 px-3 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reset system catalog to baseline defaults"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Factory Data</span>
          </button>

          <button
            onClick={onBackToHome}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Admin Portal</span>
          </button>
        </div>

      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Top Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono font-bold uppercase">
                {activeTab === 'products' && 'Products'}
                {activeTab === 'store' && 'Electronics Store Inventory'}
                {activeTab === 'categories' && 'Category Taxonomy'}
                {activeTab === 'careers' && 'Career Job Positions'}
                {activeTab === 'applications' && 'Candidate Resumes & Applications'}
                {activeTab === 'branding' && 'Site Logo & Visual Identity'}
                {activeTab === 'access' && 'Admin Permissions'}
                {activeTab === 'logs' && 'System Audit Trail'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">OhmVeda Technologies</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {activeTab === 'products' && 'Products'}
              {activeTab === 'store' && 'Electronics Store Inventory'}
              {activeTab === 'categories' && 'Product & Shop Categories'}
              {activeTab === 'careers' && 'Career Openings & Placements'}
              {activeTab === 'applications' && 'Job Applications & Candidate Resumes'}
              {activeTab === 'branding' && 'Website Logo & Branding Configuration'}
              {activeTab === 'access' && 'Administrator Accounts'}
              {activeTab === 'logs' && 'System Audit Logs'}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}

            {activeTab === 'store' && (
              <button
                onClick={handleOpenAddStoreItem}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Store Component</span>
              </button>
            )}

            {activeTab === 'careers' && (
              <button
                onClick={handleOpenAddJobRole}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Job Position</span>
              </button>
            )}

            {(activeTab === 'products' || activeTab === 'store') && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clean KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold font-mono uppercase">
              <span>Products</span>
              <Radio className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{products.length}</div>
            <p className="text-[10px] text-slate-500">Live product offerings</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold font-mono uppercase">
              <span>Store Components</span>
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{storeItems.length}</div>
            <p className="text-[10px] text-slate-500">Available electronics items</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold font-mono uppercase">
              <span>Inventory Value</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">
              ₹{totalStoreValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">Calculated store stock value</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold font-mono uppercase">
              <span>Stock Alerts</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600">{outOfStockCount}</div>
            <p className="text-[10px] text-amber-700 font-medium">Out of stock items</p>
          </div>
        </div>

        {/* --- TAB 1: TURNKEY HARDWARE PRODUCTS MANAGER --- */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 max-w-3xl w-full">
                    {/* Product Image Preview Carousel */}
                    <div className="w-full sm:w-36 h-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900">
                      <ImageCarousel
                        images={product.images}
                        image={product.image}
                        alt={product.title}
                        className="w-full h-full"
                        objectFit="cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] font-bold">
                          SKU: {product.sku}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold font-mono">
                          Group: {product.categoryGroup}
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          {product.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">{product.title}</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                          {product.shortDesc}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
                        <span>MCU: <strong className="text-slate-800">{product.techParams.mcu}</strong></span>
                        <span>Power: <strong className="text-slate-800">{product.techParams.power}</strong></span>
                        <span>Specs: <strong className="text-slate-800">{product.specs.length} items</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEditProduct(product)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product.id, product.title)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 space-y-3">
                  <Radio className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No products found.</p>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    You can add new products manually using the button above, or click below to load initial sample dataset.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleOpenAddProduct}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB 2: STORE ELECTRONICS COMPONENTS MANAGER --- */}
        {activeTab === 'store' && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Item Details</th>
                    <th className="px-4 py-3">SKU & Category</th>
                    <th className="px-4 py-3 text-right">Price (₹)</th>
                    <th className="px-4 py-3 text-center">Stock Count</th>
                    <th className="px-4 py-3 text-center">In-Stock</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStoreItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-2xs">
                            <ImageCarousel
                              images={item.images}
                              image={item.image}
                              alt={item.name}
                              className="w-full h-full"
                              objectFit="cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs leading-snug">{item.name}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.shortDesc}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono">
                        <div className="text-slate-800 font-bold">{item.sku}</div>
                        <div className="text-[10px] text-indigo-600 capitalize">{item.category}</div>
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 text-sm">
                        ₹{item.price}
                        {item.originalPrice && (
                          <div className="text-[10px] text-slate-400 line-through">₹{item.originalPrice}</div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1">
                          <button
                            onClick={() => handleQuickUpdateStock(item.id, item.stock - 5)}
                            className="w-5 h-5 rounded bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-mono font-bold text-slate-900 text-xs">{item.stock}</span>
                          <button
                            onClick={() => handleQuickUpdateStock(item.id, item.stock + 5)}
                            className="w-5 h-5 rounded bg-white text-slate-700 font-bold hover:bg-slate-200 flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleStockStatus(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase transition-colors cursor-pointer ${
                            item.inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {item.inStock ? 'Available' : 'Out of Stock'}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditStoreItem(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStoreItem(item.id, item.name)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredStoreItems.length === 0 && (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No electronics store components found.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You can add new components manually using the button above.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleOpenAddStoreItem}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Component</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: CATEGORY MANAGEMENT --- */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. TURNKEY PRODUCT CATEGORIES MANAGER */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Ready-to-Deploy Product Categories</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-bold">
                  {activeProdCats.length} Categories
                </span>
              </div>

              {/* Form to Add New Product Category */}
              <form onSubmit={handleAddProductCategory} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <span className="block font-bold text-blue-700 font-mono text-[10px] uppercase">
                  + Add New Ready-to-Deploy Category
                </span>
                <div>
                  <label className="block text-slate-600 font-mono text-[10px] uppercase mb-1">Category Name / Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Robotics & Motion Control"
                    value={newProdCatLabel}
                    onChange={(e) => setNewProdCatLabel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-mono text-[10px] uppercase mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Autonomous rovers and heavy motor controllers"
                    value={newProdCatDesc}
                    onChange={(e) => setNewProdCatDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </form>

              {/* List of Product Categories */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activeProdCats.map((cat) => {
                  const count = products.filter((p) => p.categoryGroup === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{cat.label}</span>
                          <span className="px-2 py-0.5 rounded bg-white text-slate-500 font-mono text-[10px] border border-slate-200">
                            id: {cat.id}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500">{cat.description}</p>
                        )}
                        <div className="text-[10px] text-blue-600 font-mono font-bold">
                          {count} assigned product(s)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteProductCategory(cat.id, cat.label)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0 cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. SHOP / STORE CATEGORIES MANAGER */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">Electronics Store Categories</h3>
                </div>
                <span className="px-2.5 py-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold">
                  {activeStoreCats.length} Categories
                </span>
              </div>

              {/* Form to Add New Store Category */}
              <form onSubmit={handleAddStoreCategory} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <span className="block font-bold text-indigo-700 font-mono text-[10px] uppercase">
                  + Add New Shop Category
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-600 font-mono text-[10px] uppercase mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Power Supply & Batteries"
                      value={newStoreCatLabel}
                      onChange={(e) => setNewStoreCatLabel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-mono text-[10px] uppercase mb-1">Icon</label>
                    <select
                      value={newStoreCatIcon}
                      onChange={(e) => setNewStoreCatIcon(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="Cpu">Cpu</option>
                      <option value="Zap">Zap (Power)</option>
                      <option value="Wifi">Wifi (Radio)</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Layers">Layers</option>
                      <option value="Activity">Activity</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-600 font-mono text-[10px] uppercase mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rechargeable lithium polymer batteries & BMS"
                    value={newStoreCatDesc}
                    onChange={(e) => setNewStoreCatDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Shop Category</span>
                </button>
              </form>

              {/* List of Store Categories */}
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activeStoreCats.map((cat) => {
                  const count = storeItems.filter((s) => s.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{cat.label}</span>
                          <span className="px-2 py-0.5 rounded bg-white text-slate-500 font-mono text-[10px] border border-slate-200">
                            id: {cat.id}
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500">{cat.description}</p>
                        )}
                        <div className="text-[10px] text-indigo-600 font-mono font-bold">
                          {count} shop component(s)
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteStoreCategory(cat.id, cat.label)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0 cursor-pointer"
                        title="Delete Shop Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: CAREERS & JOB POSITIONS MANAGEMENT --- */}
        {activeTab === 'careers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  <span>Job Role Placements ({jobRolesList.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage active placements, job descriptions, and number of available seats shown on the public Career portal.
                </p>
              </div>

              <button
                onClick={handleOpenAddJobRole}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Post New Job Opening</span>
              </button>
            </div>

            {jobRolesList.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900">No Job Openings Currently</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Create your first placement role to start accepting candidate applications.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddJobRole}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                >
                  + Add First Position
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobRolesList.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                          {job.department}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          job.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {job.isActive ? '● Active Opening' : '○ Closed / Inactive'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-bold">
                          {job.openingsCount} {job.openingsCount === 1 ? 'Seat Available' : 'Places Available'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-extrabold text-slate-900">{job.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{job.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {job.experience} Exp
                        </span>
                        <span className="flex items-center gap-1 font-mono font-bold text-slate-700">
                          {job.salaryRange}
                        </span>
                      </div>

                      {job.keySkills && job.keySkills.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {job.keySkills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          const updated = jobRolesList.map((j) => (j.id === job.id ? { ...j, isActive: !j.isActive } : j));
                          setJobRolesList(updated);
                          saveStoredJobRoles(updated);
                          if (onUpdateJobRoles) onUpdateJobRoles(updated);
                          showToast(`Job "${job.title}" marked as ${!job.isActive ? 'Active' : 'Inactive'}.`, 'info');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          job.isActive
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {job.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleOpenEditJobRole(job)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="Edit Job JD & Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteJobRole(job.id, job.title)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Delete Job Opening"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB: JOB APPLICATIONS / CANDIDATES --- */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>Candidate Resumes & Applications ({jobAppsList.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review applicant profiles, uploaded CV/resumes, experience details, and candidate statuses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Total Candidates:</span>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                  {jobAppsList.length} Applied
                </span>
              </div>
            </div>

            {jobAppsList.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">No Job Applications Received Yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When users apply for open roles on the Career portal, their resume details and contact information will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Candidate Name</th>
                        <th className="p-4">Applied Role</th>
                        <th className="p-4">Contact Info</th>
                        <th className="p-4">Experience</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobAppsList.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{app.applicantName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Applied: {app.appliedAt}</div>
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-blue-600">{app.jobTitle}</span>
                          </td>

                          <td className="p-4 space-y-0.5">
                            <div className="font-mono text-slate-800">{app.email}</div>
                            <div className="font-mono text-slate-500">{app.phone}</div>
                          </td>

                          <td className="p-4 font-medium text-slate-700">
                            {app.experienceYears || 'N/A'}
                          </td>

                          <td className="p-4">
                            <select
                              value={app.status || 'Pending'}
                              onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as any)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                                app.status === 'Shortlisted'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : app.status === 'Rejected'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : app.status === 'Reviewed'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Reviewed">Reviewed</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedAppDetail(app)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </button>

                              {app.resumeFileName && app.resumeDataUrl && (
                                <a
                                  href={app.resumeDataUrl}
                                  download={app.resumeFileName}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1"
                                  title={`Download ${app.resumeFileName}`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Resume</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: ADMIN ACCESS CONTROL --- */}
        {activeTab === 'access' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form to Authorize New Admin Email */}
            <div className="lg:col-span-1 p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Authorize Admin Email</h3>
              </div>

              <form onSubmit={handleAddAuthorizedEmail} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-mono text-[10px] uppercase mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. manager@ohmveda.com"
                    value={newAdminEmailInput}
                    onChange={(e) => setNewAdminEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Users logging in with this email address will gain full administrative capabilities to edit products, prices, stock, and categories.
                </p>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Authorize Email</span>
                </button>
              </form>
            </div>

            {/* List of Current Authorized Admin Accounts */}
            <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base">Authorized Administrators</h3>
                <span className="px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
                  {authorizedEmails.length} Accounts
                </span>
              </div>

              <div className="space-y-3">
                {authorizedEmails.map((email) => {
                  const isSelf = userProfile?.email.toLowerCase() === email.toLowerCase();
                  return (
                    <div
                      key={email}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-slate-900">{email}</span>
                            {isSelf && (
                              <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                                You (Active)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">Full Administrative Access</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAuthorizedEmail(email)}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0 cursor-pointer"
                        title="Revoke Admin Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 5: SYSTEM AUDIT LOGS --- */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">System Activity Trail</h3>
              <button
                onClick={refreshLogs}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          log.action === 'ADD'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : log.action === 'DELETE'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-900">{log.title}</span>
                    </div>
                    <p className="text-slate-600 font-mono text-[11px]">{log.details}</p>
                  </div>

                  <div className="text-slate-400 font-mono text-[10px] shrink-0">
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB: BRANDING & LOGO MANAGEMENT --- */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Site Customization
                  </span>
                  <span className="text-slate-300 text-xs">•</span>
                  <span className="text-slate-500 text-xs font-mono">Real-time Sync</span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Brand Logo Configuration
                </h2>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Upload or change the primary brand logo for OhmVeda. Custom logos immediately update across the navigation bar, footer, and mobile views.
                </p>
              </div>

              {currentSavedLogo ? (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-emerald-900 block">Custom Logo Published</span>
                    <span className="text-[10px] text-emerald-700 font-mono">Active Site-wide</span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Vector Emblem Preset</span>
                    <span className="text-[10px] text-slate-500 font-mono">Default SVG Logo</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: Upload & Configuration Form */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Upload Logo Image</h3>
                        <p className="text-[11px] text-slate-500">Supports PNG, SVG, JPG, WebP (Transparent PNG recommended)</p>
                      </div>
                    </div>
                  </div>

                  {/* Drag & Drop File Upload Picker */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Upload File from Device
                    </label>
                    <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            showToast('File size exceeds 5MB. Please choose a smaller image file.', 'error');
                            return;
                          }
                          setIsUploadingLogo(true);
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              setLogoPreviewUrl(result);
                              setLogoInputUrl(result);
                              showToast('Image file loaded into preview. Click "Save & Publish Logo".', 'info');
                            }
                            setIsUploadingLogo(false);
                          };
                          reader.onerror = () => {
                            showToast('Failed to read image file.', 'error');
                            setIsUploadingLogo(false);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-2 pointer-events-none">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-blue-600 mx-auto flex items-center justify-center shadow-2xs group-hover:scale-110 transition-transform">
                          <Image className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors block">
                            Click or drop your logo image here
                          </span>
                          <span className="text-[10px] text-slate-400">High-resolution horizontal logo image</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Image URL Input */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Or Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logoInputUrl}
                        onChange={(e) => {
                          setLogoInputUrl(e.target.value);
                          setLogoPreviewUrl(e.target.value.trim() || null);
                        }}
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (logoInputUrl.trim()) {
                            setLogoPreviewUrl(logoInputUrl.trim());
                            showToast('URL preview loaded.', 'info');
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors shrink-0 cursor-pointer"
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteModal({
                          isOpen: true,
                          title: 'Reset to Default Logo',
                          message: 'Are you sure you want to remove the custom logo and revert to the default vector emblem?',
                          onConfirm: () => {
                            saveStoredCustomLogo(null);
                            setCurrentSavedLogo(null);
                            setLogoPreviewUrl(null);
                            setLogoInputUrl('');
                            addAdminLog({
                              action: 'DELETE',
                              target: 'CATEGORY',
                              title: 'Reset Custom Logo to Default Vector Emblem',
                              details: `Reset by admin (${userProfile?.email || 'System'})`,
                            });
                            refreshLogs();
                            showToast('Logo restored to default vector emblem.', 'info');
                          },
                        });
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reset to Default</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => {
                        if (!logoPreviewUrl) {
                          showToast('Please upload or enter a logo URL first.', 'error');
                          return;
                        }
                        saveStoredCustomLogo(logoPreviewUrl);
                        setCurrentSavedLogo(logoPreviewUrl);
                        addAdminLog({
                          action: 'UPDATE',
                          target: 'CATEGORY',
                          title: 'Updated Website Logo',
                          details: `Updated custom logo by admin (${userProfile?.email || 'System'})`,
                        });
                        refreshLogs();
                        showToast('Custom logo saved and published live across the site!', 'success');
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save & Publish Logo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Live Previews */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-2xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h3 className="font-extrabold text-slate-900 text-base">Live Site Previews</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Real-time Preview
                    </span>
                  </div>

                  {/* Header Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-mono">Navigation Top Bar Preview</span>
                      <span className="text-[10px] text-slate-400">Header View</span>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
                      <OhmVedaLogo
                        variant="light"
                        size="lg"
                        layout="horizontal"
                        showSubtitle={false}
                        customLogoUrl={logoPreviewUrl}
                      />
                      <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-slate-600">
                        <span>Home</span>
                        <span>Products</span>
                        <span>Store</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 font-mono">Footer Bottom Bar Preview</span>
                      <span className="text-[10px] text-slate-400">Footer View</span>
                    </div>
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
                      <OhmVedaLogo
                        variant="light"
                        size="xl"
                        layout="horizontal"
                        showSubtitle={false}
                        customLogoUrl={logoPreviewUrl}
                      />
                      <span className="text-[11px] font-mono text-slate-400">
                        © {new Date().getFullYear()} OhmVeda
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- EDIT / ADD TURNKEY PRODUCT MODAL --- */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-900 shadow-2xl">
            
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">
                  {editingProduct.id ? 'Edit Product' : 'Create Product'}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {editingProduct.title || 'Product Details'}
                </h3>
              </div>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.title}
                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider font-mono text-[10px]">
                      Category Group
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuickProdCatOpen(!quickProdCatOpen)}
                      className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Quick Add
                    </button>
                  </div>

                  {quickProdCatOpen && (
                    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-blue-800 uppercase font-mono">Create New Category</span>
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={quickProdCatName}
                        onChange={(e) => setQuickProdCatName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickProdCatOpen(false)}
                          className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!quickProdCatName.trim()) return;
                            const newId = quickProdCatName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                            const newCat = { id: newId, label: quickProdCatName.trim() };
                            if (onUpdateProductCategories) onUpdateProductCategories([...activeProdCats, newCat]);
                            setEditingProduct({ ...editingProduct, categoryGroup: newId });
                            setQuickProdCatName('');
                            setQuickProdCatOpen(false);
                          }}
                          className="px-3 py-1 rounded bg-blue-600 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={editingProduct.categoryGroup}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryGroup: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                  >
                    {activeProdCats.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={editingProduct.badge}
                    onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Product Media & Image Uploader */}
              <div>
                <ImageUploaderManager
                  images={editingProduct.images}
                  image={editingProduct.image}
                  label="Product Images & Media Gallery"
                  accentColor="blue"
                  onChange={(updatedImages, primaryImage) => {
                    setEditingProduct({
                      ...editingProduct,
                      images: updatedImages,
                      image: primaryImage,
                    });
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Short Summary
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingProduct.shortDesc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDesc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Full Datasheet Overview
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingProduct.fullDesc}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fullDesc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Specs List */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Specifications Highlights (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.specs.join(', ')}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      specs: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              {/* Technical Parameters */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-blue-700 uppercase tracking-wider font-mono text-[10px]">
                  Technical Parameters Table
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Microcontroller / Core</label>
                    <input
                      type="text"
                      value={editingProduct.techParams.mcu}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techParams: { ...editingProduct.techParams, mcu: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Connectivity & Radios</label>
                    <input
                      type="text"
                      value={editingProduct.techParams.connectivity}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techParams: { ...editingProduct.techParams, connectivity: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Power Supply Input</label>
                    <input
                      type="text"
                      value={editingProduct.techParams.power}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techParams: { ...editingProduct.techParams, power: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-mono">Enclosure & Form Factor</label>
                    <input
                      type="text"
                      value={editingProduct.techParams.enclosure}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          techParams: { ...editingProduct.techParams, enclosure: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- EDIT / ADD STORE COMPONENT MODAL --- */}
      {storeItemModalOpen && editingStoreItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-900 shadow-2xl">
            
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase">
                  {editingStoreItem.id ? 'Edit Store Component' : 'Add Store Component'}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {editingStoreItem.name || 'Store Item'}
                </h3>
              </div>
              <button
                onClick={() => setStoreItemModalOpen(false)}
                className="p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStoreItem} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Component Name
                </label>
                <input
                  type="text"
                  required
                  value={editingStoreItem.name}
                  onChange={(e) => setEditingStoreItem({ ...editingStoreItem, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStoreItem.sku}
                    onChange={(e) => setEditingStoreItem({ ...editingStoreItem, sku: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider font-mono text-[10px]">
                      Category
                    </label>
                    <button
                      type="button"
                      onClick={() => setQuickStoreCatOpen(!quickStoreCatOpen)}
                      className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Quick Add
                    </button>
                  </div>

                  {quickStoreCatOpen && (
                    <div className="mb-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-indigo-800 uppercase font-mono">Create New Shop Category</span>
                      <input
                        type="text"
                        placeholder="Category Name"
                        value={quickStoreCatName}
                        onChange={(e) => setQuickStoreCatName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setQuickStoreCatOpen(false)}
                          className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-[10px] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!quickStoreCatName.trim()) return;
                            const newId = quickStoreCatName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                            const newCat = { id: newId, label: quickStoreCatName.trim(), icon: 'Cpu' };
                            if (onUpdateStoreCategories) onUpdateStoreCategories([...activeStoreCats, newCat]);
                            setEditingStoreItem({ ...editingStoreItem, category: newId });
                            setQuickStoreCatName('');
                            setQuickStoreCatOpen(false);
                          }}
                          className="px-3 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  <select
                    value={editingStoreItem.category}
                    onChange={(e) =>
                      setEditingStoreItem({
                        ...editingStoreItem,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs"
                  >
                    {activeStoreCats.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingStoreItem.price}
                    onChange={(e) =>
                      setEditingStoreItem({ ...editingStoreItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editingStoreItem.stock}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value) || 0;
                      setEditingStoreItem({
                        ...editingStoreItem,
                        stock: qty,
                        inStock: qty > 0,
                      });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Store Component Media & Image Uploader */}
              <div>
                <ImageUploaderManager
                  images={editingStoreItem.images}
                  image={editingStoreItem.image}
                  label="Store Component Images & Media Gallery"
                  accentColor="indigo"
                  onChange={(updatedImages, primaryImage) => {
                    setEditingStoreItem({
                      ...editingStoreItem,
                      images: updatedImages,
                      image: primaryImage,
                    });
                  }}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingStoreItem.shortDesc}
                  onChange={(e) => setEditingStoreItem({ ...editingStoreItem, shortDesc: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Key Specifications (Comma separated)
                </label>
                <input
                  type="text"
                  value={editingStoreItem.specs.join(', ')}
                  onChange={(e) =>
                    setEditingStoreItem({
                      ...editingStoreItem,
                      specs: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStoreItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Store Item</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- EDIT / ADD JOB OPENING MODAL --- */}
      {jobModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-slate-900 shadow-2xl">
            
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-700 uppercase">
                  {jobRolesList.some((j) => j.id === editingJob.id) ? 'Edit Job Opening' : 'Post New Job Opening'}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {editingJob.title || 'New Job Position'}
                </h3>
              </div>
              <button
                onClick={() => setJobModalOpen(false)}
                className="p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJobRole} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Job Position Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="e.g. Embedded Software Engineer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Department
                  </label>
                  <select
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    <option value="Software">Software Engineering</option>
                    <option value="Hardware">Hardware Engineering</option>
                    <option value="Sales">Sales & Marketing</option>
                    <option value="Purchase">Purchase & Procurement</option>
                    <option value="Operations">Operations & QA</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="e.g. Ahmedabad (Hybrid)"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Places Available (Seats)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={editingJob.openingsCount}
                    onChange={(e) => setEditingJob({ ...editingJob, openingsCount: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Work Type
                  </label>
                  <select
                    value={editingJob.workType || 'Full-Time'}
                    onChange={(e) => setEditingJob({ ...editingJob, workType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-medium"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Experience Required
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="e.g. 2-5 Years"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                    Salary Range
                  </label>
                  <input
                    type="text"
                    required
                    value={editingJob.salaryRange}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
                    placeholder="e.g. ₹6,00,000 - ₹12,00,000 PA"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Job Summary Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingJob.description}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Responsibilities (One per line)
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(editingJob.responsibilities) ? editingJob.responsibilities.join('\n') : editingJob.responsibilities}
                  onChange={(e) => setEditingJob({ ...editingJob, responsibilities: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-mono text-xs"
                  placeholder="Design firmware for ESP32/STM32 MCU&#10;Implement FreeRTOS communication tasks"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Requirements & Qualifications (One per line)
                </label>
                <textarea
                  rows={3}
                  value={Array.isArray(editingJob.requirements) ? editingJob.requirements.join('\n') : editingJob.requirements}
                  onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value.split('\n').filter(Boolean) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600 font-mono text-xs"
                  placeholder="B.E./B.Tech in Electronics Engineering&#10;Proficient in C/C++ programming"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono text-[10px]">
                  Key Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingJob.keySkills) ? editingJob.keySkills.join(', ') : editingJob.keySkills}
                  onChange={(e) => setEditingJob({ ...editingJob, keySkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-teal-600"
                  placeholder="C/C++, ESP32, FreeRTOS, MQTT, Modbus"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingJob.isActive}
                    onChange={(e) => setEditingJob({ ...editingJob, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
                <span className="text-xs font-bold text-slate-800">
                  {editingJob.isActive ? 'Active Position (Visible on Career Page)' : 'Inactive / Closed Position'}
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Position</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- CANDIDATE DETAIL MODAL --- */}
      {selectedAppDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full overflow-hidden flex flex-col text-slate-900 shadow-2xl">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                  Candidate Application
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedAppDetail.applicantName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppDetail(null)}
                className="p-2 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-blue-700 uppercase font-mono font-bold block">Applied Position</span>
                  <span className="text-sm font-extrabold text-blue-900">{selectedAppDetail.jobTitle}</span>
                </div>
                <span className="text-[10px] text-blue-600 font-mono font-medium">{selectedAppDetail.appliedAt}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Email Address</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{selectedAppDetail.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Phone Number</span>
                  <span className="font-mono text-xs font-bold text-slate-800">{selectedAppDetail.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Experience</span>
                  <span className="text-xs font-bold text-slate-800">{selectedAppDetail.experienceYears || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Current Status</span>
                  <span className="text-xs font-bold text-emerald-700">{selectedAppDetail.status || 'Pending'}</span>
                </div>
              </div>

              {selectedAppDetail.coverLetter && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Candidate Cover Note</span>
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedAppDetail.coverLetter}
                  </div>
                </div>
              )}

              {selectedAppDetail.resumeFileName && selectedAppDetail.resumeDataUrl ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-900 block">{selectedAppDetail.resumeFileName}</span>
                      <span className="text-[10px] text-emerald-700 font-mono">CV/Resume File Attached</span>
                    </div>
                  </div>

                  <a
                    href={selectedAppDetail.resumeDataUrl}
                    download={selectedAppDetail.resumeFileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CV</span>
                  </a>
                </div>
              ) : (
                <div className="p-3 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs">
                  No CV/Resume file attached with this application.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => setSelectedAppDetail(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL (Replaces window.confirm) */}
      <AnimatePresence>
        {deleteModal && deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-100 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{deleteModal.title}</h3>
                  <span className="text-[10px] text-rose-600 font-mono font-bold uppercase">Confirm Permanent Action</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {deleteModal.message}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteModal.onConfirm();
                    setDeleteModal(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION (Replaces window.alert) */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`px-4 py-3 rounded-xl shadow-xl font-bold text-xs flex items-center gap-2.5 border ${
                toastMessage.type === 'error'
                  ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
                  : toastMessage.type === 'success'
                  ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
                  : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
              }`}
            >
              {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toastMessage.type === 'info' && <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{toastMessage.text}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
