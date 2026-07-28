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
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-600" />
          <span>Authorized Admin Accounts</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage authorized administrator emails with full management permissions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Email Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Authorize New Admin Email</span>
          </h2>

          <form onSubmit={handleAddAuthorizedEmail} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">User Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@ohmveda.in"
                  value={newAdminEmailInput}
                  onChange={(e) => setNewAdminEmailInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Grant Administrator Access</span>
            </button>
          </form>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Authorized users logged in via Google/Firebase with these matching email addresses will have full administrative privileges to edit catalog hardware and electronics store inventory.
            </span>
          </div>
        </div>

        {/* Authorized List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Active Super Administrators</span>
            </h2>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              {authorizedEmails.length} Accounts
            </span>
          </div>

          <div className="space-y-2">
            {authorizedEmails.map((email) => (
              <div
                key={email}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs shrink-0 uppercase">
                    {email.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 truncate">{email}</span>
                </div>

                <button
                  onClick={() => handleRemoveAuthorizedEmail(email)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
