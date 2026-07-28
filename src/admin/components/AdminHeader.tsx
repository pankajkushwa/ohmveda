import React from 'react';
import { 
  Menu, ArrowLeft, LogOut, User, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../../types';

interface AdminHeaderProps {
  userProfile: UserProfile | null;
  isAuthorized: boolean;
  onOpenAuth: () => void;
  onLogout: () => void;
  onBackToHome: () => void;
  setMobileOpen: (open: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  userProfile,
  isAuthorized,
  onOpenAuth,
  onLogout,
  onBackToHome,
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

        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Exit Admin to Website</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        {userProfile ? (
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
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Login as Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
