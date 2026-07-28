import React, { useState } from 'react';
import { 
  UserCheck, Plus, Trash2, ShieldCheck, Mail, AlertTriangle
} from 'lucide-react';
import { 
  addAdminLog, getStoredAuthorizedAdminEmails, saveStoredAuthorizedAdminEmails 
} from '../../services/dataStorage';

interface AdminAccountsManagerProps {
  showToast: (msg: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const AdminAccountsManager: React.FC<AdminAccountsManagerProps> = ({
  showToast,
  openDeleteConfirm,
}) => {
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(getStoredAuthorizedAdminEmails());
  const [newAdminEmailInput, setNewAdminEmailInput] = useState<string>('');

  const handleAddAuthorizedEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newAdminEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (authorizedEmails.includes(cleanEmail)) {
      showToast('This email is already in the authorized admin list.', 'info');
      return;
    }

    const updated = [...authorizedEmails, cleanEmail];
    setAuthorizedEmails(updated);
    saveStoredAuthorizedAdminEmails(updated);
    addAdminLog({
      action: 'UPDATE',
      target: 'ACCESS',
      title: `Granted Admin Access: ${cleanEmail}`,
      details: 'Added email to authorized administrators list.',
    });

    setNewAdminEmailInput('');
    showToast(`Admin access granted to "${cleanEmail}".`, 'success');
  };

  const handleRemoveAuthorizedEmail = (emailToRemove: string) => {
    if (authorizedEmails.length <= 1) {
      showToast('Cannot remove the last administrator email.', 'error');
      return;
    }

    openDeleteConfirm(
      'Revoke Admin Access',
      `Are you sure you want to revoke admin privileges from "${emailToRemove}"?`,
      () => {
        const updated = authorizedEmails.filter((e) => e !== emailToRemove);
        setAuthorizedEmails(updated);
        saveStoredAuthorizedAdminEmails(updated);
        addAdminLog({
          action: 'UPDATE',
          target: 'ACCESS',
          title: `Revoked Admin Access: ${emailToRemove}`,
          details: 'Removed email from authorized administrators list.',
        });
        showToast(`Revoked admin access for "${emailToRemove}".`, 'info');
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <span>Authorized Admin Accounts</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage authorized administrator emails with full permissions to edit products, store inventory, and system logs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Email Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Authorize New Admin Email</span>
          </h2>

          <form onSubmit={handleAddAuthorizedEmail} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">User Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={newAdminEmailInput}
                  onChange={(e) => setNewAdminEmailInput(e.target.value)}
                  placeholder="admin@ohmveda.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Grant Admin Privileges</span>
            </button>
          </form>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-300 mb-1">Cloud Sync Authorization:</p>
            When a user logs in with an email listed in this authorized registry, they automatically gain administrative editing controls.
          </div>
        </div>

        {/* Existing Accounts List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authorized Admin Emails</span>
            </h2>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {authorizedEmails.length} Authorized
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {authorizedEmails.map((email) => (
              <div
                key={email}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {email.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-200 truncate">{email}</span>
                </div>

                <button
                  onClick={() => handleRemoveAuthorizedEmail(email)}
                  disabled={authorizedEmails.length <= 1}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Revoke Admin Access"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
