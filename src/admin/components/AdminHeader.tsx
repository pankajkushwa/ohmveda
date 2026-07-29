import React from 'react';
import { 
  Menu, LogOut, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminHeaderProps {
  userProfile: UserProfile | null;
  isAuthorized: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  onBackToHome?: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  userProfile,
  isAuthorized,
  onLogout,
  setMobileOpen,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="text-xs font-bold text-slate-800 tracking-tight">
          OhmVeda Management Console
        </span>
      </div>

      <div className="flex items-center gap-3">
        {userProfile && (
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-xs">
                {userProfile.email.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
                  <span>{userProfile.email}</span>
                  {isAuthorized ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" title="Authorized Super Admin" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" title="Unauthorized Admin" />
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {isAuthorized ? 'Authorized Administrator' : 'Access Restricted'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

