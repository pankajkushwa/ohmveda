import React, { useState } from 'react';
import { 
  JobRole, ProductCategory, StoreCategory, StoreItem, TurnkeyProduct, UserProfile 
} from '../types';
import { 
  DEFAULT_PRODUCT_CATEGORIES, DEFAULT_STORE_CATEGORIES, getStoredJobApplications, getStoredUserOrders, getStoredLeadInquiries, isAuthorizedAdminEmail 
} from '../services/dataStorage';

import { AdminSidebar, AdminTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastMessage } from './components/Toast';

import { ProductsManager } from './pages/ProductsManager';
import { StoreManager } from './pages/StoreManager';
import { CategoriesManager } from './pages/CategoriesManager';
import { DeliveriesManager } from './pages/DeliveriesManager';
import { CareersAndApplicantsManager } from './pages/CareersAndApplicantsManager';
import { BrandingManager } from './pages/BrandingManager';
import { AdminAccountsManager } from './pages/AdminAccountsManager';
import { AdminLogsManager } from './pages/AdminLogsManager';
import { DashboardOverview } from './pages/DashboardOverview';
import { InquiriesManager } from './pages/InquiriesManager';
import { AdminLoginView } from './components/AdminLoginView';

export interface AdminDashboardProps {
  products: TurnkeyProduct[];
  storeItems: StoreItem[];
  productCategories?: ProductCategory[];
  storeCategories?: StoreCategory[];
  jobRoles?: JobRole[];
  userProfile: UserProfile | null;
  onOpenAuth: () => void;
  onLoginSuccess?: (profile: UserProfile) => void;
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
  onLoginSuccess = () => {},
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
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

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
  const ordersCount = getStoredUserOrders().length;
  const leadInquiries = getStoredLeadInquiries();
  const inquiriesCount = leadInquiries.filter((i) => i.status === 'NEW').length || leadInquiries.length;

  // IF NOT LOGGED IN OR NOT AUTHORIZED ADMIN: Show standalone AdminLoginView
  if (!userProfile || !isAuthorized) {
    return (
      <AdminLoginView
        userProfile={userProfile}
        onLoginSuccess={onLoginSuccess}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-blue-500 selection:text-white">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        productsCount={products.length}
        storeCount={storeItems.length}
        jobAppsCount={jobAppsCount}
        ordersCount={ordersCount}
        inquiriesCount={inquiriesCount}
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
          {activeTab === 'dashboard' && (
            <DashboardOverview
              products={products}
              storeItems={storeItems}
              jobRoles={jobRoles}
              setActiveTab={setActiveTab}
              showToast={showToast}
            />
          )}

          {activeTab === 'inquiries' && (
            <InquiriesManager
              showToast={showToast}
              openDeleteConfirm={openDeleteConfirm}
            />
          )}

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

          {activeTab === 'deliveries' && (
            <DeliveriesManager
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
