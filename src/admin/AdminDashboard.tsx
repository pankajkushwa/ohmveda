import React, { useState } from 'react';
import { 
  JobRole, ProductCategory, StoreCategory, StoreItem, TurnkeyProduct, UserProfile 
} from '../types';
import { 
  DEFAULT_PRODUCT_CATEGORIES, DEFAULT_STORE_CATEGORIES, getStoredJobApplications, isAuthorizedAdminEmail 
} from '../services/dataStorage';

import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastMessage } from './components/Toast';

import { ProductsManager } from './pages/ProductsManager';
import { StoreManager } from './pages/StoreManager';
import { CategoriesManager } from './pages/CategoriesManager';
import { CareersAndApplicantsManager } from './pages/CareersAndApplicantsManager';
import { BrandingManager } from './pages/BrandingManager';
import { AdminAccountsManager } from './pages/AdminAccountsManager';
import { AdminLogsManager } from './pages/AdminLogsManager';

export interface AdminDashboardProps {
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
  productCategories = DEFAULT_PRODUCT_CATEGORIES,
  storeCategories = DEFAULT_STORE_CATEGORIES,
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
  const [mobileOpen, setMobileOpen] = useState(false);

  // Active Management Page Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('products');

  // Check user authorization
  const isAuthorized = userProfile ? isAuthorizedAdminEmail(userProfile.email) : false;

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const openDeleteConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDeleteModal({
      isOpen: true,
      title,
      message,
      onConfirm,
    });
  };

  // Counts for badge chips
  const jobAppsCount = getStoredJobApplications().length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        productsCount={products.length}
        storeCount={storeItems.length}
        jobAppsCount={jobAppsCount}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          userProfile={userProfile}
          isAuthorized={isAuthorized}
          onOpenAuth={onOpenAuth}
          onLogout={onLogout}
          onBackToHome={onBackToHome}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {!userProfile ? (
            <div className="py-16 text-center max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-4">
                🔒
              </div>
              <h2 className="text-base font-bold text-white mb-2">Admin Authentication Required</h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Please log in with an authorized OhmVeda administrator account to access management tools.
              </p>
              <button
                onClick={onOpenAuth}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
              >
                Login as Administrator
              </button>
            </div>
          ) : !isAuthorized ? (
            <div className="py-16 text-center max-w-md mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400 mx-auto mb-4">
                🚫
              </div>
              <h2 className="text-base font-bold text-white mb-2">Unauthorized Access</h2>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                Logged in as <strong className="text-slate-200">{userProfile.email}</strong>.
              </p>
              <p className="text-xs text-slate-500 mb-6">
                This account is not listed in the authorized administrators registry.
              </p>
              <button
                onClick={onLogout}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
              >
                Log Out
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'products' && (
                <ProductsManager
                  products={products}
                  productCategories={productCategories}
                  onUpdateProducts={onUpdateProducts}
                  showToast={showToast}
                  openDeleteConfirm={openDeleteConfirm}
                  onNavigateToProducts={onNavigateToProducts}
                />
              )}

              {activeTab === 'store' && (
                <StoreManager
                  storeItems={storeItems}
                  storeCategories={storeCategories}
                  onUpdateStoreItems={onUpdateStoreItems}
                  showToast={showToast}
                  openDeleteConfirm={openDeleteConfirm}
                  onNavigateToStore={onNavigateToStore}
                />
              )}

              {activeTab === 'categories' && (
                <CategoriesManager
                  productCategories={productCategories}
                  storeCategories={storeCategories}
                  onUpdateProductCategories={onUpdateProductCategories}
                  showToast={showToast}
                  openDeleteConfirm={openDeleteConfirm}
                />
              )}

              {activeTab === 'careers' && (
                <CareersAndApplicantsManager
                  jobRoles={jobRoles}
                  onUpdateJobRoles={onUpdateJobRoles}
                  showToast={showToast}
                  openDeleteConfirm={openDeleteConfirm}
                />
              )}

              {activeTab === 'branding' && (
                <BrandingManager showToast={showToast} />
              )}

              {activeTab === 'access' && (
                <AdminAccountsManager
                  showToast={showToast}
                  openDeleteConfirm={openDeleteConfirm}
                />
              )}

              {activeTab === 'logs' && (
                <AdminLogsManager
                  onUpdateProducts={onUpdateProducts}
                  onUpdateStoreItems={onUpdateStoreItems}
                  onUpdateProductCategories={onUpdateProductCategories}
                  onUpdateStoreCategories={onUpdateStoreCategories}
                  onUpdateJobRoles={onUpdateJobRoles}
                  showToast={showToast}
                  openDeleteConfirm={openDeleteConfirm}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Global Confirmation Modal */}
      {deleteModal && (
        <ConfirmModal
          isOpen={deleteModal.isOpen}
          title={deleteModal.title}
          message={deleteModal.message}
          onConfirm={deleteModal.onConfirm}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
