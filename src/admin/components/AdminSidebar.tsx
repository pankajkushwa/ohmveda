import React from 'react';
import { 
  Box, Cpu, Layers, Briefcase, Image, UserCheck, Activity, X, Truck
} from 'lucide-react';

export type AdminTab = 
  | 'products' 
  | 'store' 
  | 'categories' 
  | 'deliveries'
  | 'careers' 
  | 'branding' 
  | 'access' 
  | 'logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  productsCount: number;
  storeCount: number;
  jobAppsCount: number;
  ordersCount?: number;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  productsCount,
  storeCount,
  jobAppsCount,
  ordersCount = 0,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'products', label: 'Products', icon: Box, badge: productsCount },
    { id: 'store', label: 'Store Inventory', icon: Cpu, badge: storeCount },
    { id: 'categories', label: 'Categories Manager', icon: Layers },
    { id: 'deliveries', label: 'Deliveries & Orders', icon: Truck, badge: ordersCount },
    { id: 'careers', label: 'Careers & Applicants', icon: Briefcase, badge: jobAppsCount },
    { id: 'branding', label: 'Brand & Contact Info', icon: Image },
    { id: 'access', label: 'Admin Accounts', icon: UserCheck },
    { id: 'logs', label: 'System Logs & Reset', icon: Activity },
  ];

  const handleSelect = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-700">
      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">Management Portal</span>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">OhmVeda Admin</h2>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 text-[11px] text-slate-500">
        <p className="font-semibold text-slate-700">OhmVeda Industrial IoT</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Management Portal v2.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
