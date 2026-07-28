import React, { useState } from 'react';
import { 
  Activity, RefreshCw, Clock, AlertTriangle
} from 'lucide-react';
import { 
  AdminLog, getAdminLogs, resetAllDataToDefaultAsync 
} from '../../services/dataStorage';
import { JobRole, ProductCategory, StoreCategory, StoreItem, TurnkeyProduct } from '../../types';

interface AdminLogsManagerProps {
  onUpdateProducts: (products: TurnkeyProduct[]) => void;
  onUpdateStoreItems: (items: StoreItem[]) => void;
  onUpdateProductCategories?: (categories: ProductCategory[]) => void;
  onUpdateStoreCategories?: (categories: StoreCategory[]) => void;
  onUpdateJobRoles?: (roles: JobRole[]) => void;
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const AdminLogsManager: React.FC<AdminLogsManagerProps> = ({
  onUpdateProducts,
  onUpdateStoreItems,
  onUpdateProductCategories,
  onUpdateStoreCategories,
  onUpdateJobRoles,
  showToast,
  openDeleteConfirm,
}) => {
  const [logs, setLogs] = useState<AdminLog[]>(getAdminLogs());

  const refreshLogs = () => {
    setLogs(getAdminLogs());
  };

  const handleResetDefaults = () => {
    openDeleteConfirm(
      'Reset Catalog & Content (Cloud Synced)',
      'Are you sure you want to clear all products, store inventory, categories, and job postings? (Note: Job applications and your custom logo will NOT be deleted). This will clear cloud storage and update all connected devices in real-time.',
      async () => {
        showToast('Resetting catalog & inventory across cloud and all connected devices...', 'info');
        const resetRes = await resetAllDataToDefaultAsync();
        onUpdateProducts(resetRes.products);
        onUpdateStoreItems(resetRes.storeItems);
        if (onUpdateProductCategories) onUpdateProductCategories(resetRes.productCategories);
        if (onUpdateStoreCategories) onUpdateStoreCategories(resetRes.storeCategories);
        if (onUpdateJobRoles) onUpdateJobRoles(resetRes.jobRoles);
        refreshLogs();
        showToast('Catalog reset across cloud & synced to all connected devices. (Logo & Job Applications preserved)', 'success');
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Audit Logs & System Operations</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit trailing for catalog modifications, inventory updates, and factory reset actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshLogs}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Logs</span>
          </button>

          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/20 flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Factory Reset Catalog</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-800">System Activity History</span>
          <span className="text-[10px] text-slate-500 font-semibold">{logs.length} Log Entries Recorded</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      log.action === 'ADD'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : log.action === 'UPDATE'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : log.action === 'DELETE'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {log.action}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{log.title}</span>
                </div>
                {log.details && <p className="text-[11px] text-slate-500 leading-snug">{log.details}</p>}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono shrink-0">
                <Clock className="w-3 h-3" />
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No audit logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
