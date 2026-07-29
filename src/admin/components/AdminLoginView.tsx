import React, { useState } from 'react';
import { 
  Mail, Lock, User, Building, Phone, Eye, EyeOff, ShieldCheck, 
  LogIn, UserPlus, AlertCircle, ArrowRight, KeyRound, Sparkles
} from 'lucide-react';
import { UserProfile } from '../../types';
import { 
  authenticateUserAsync, registerUserAsync, isAuthorizedAdminEmail 
} from '../../services/dataStorage';
import { OhmVedaLogo } from '../../components/OhmVedaLogo';

interface AdminLoginViewProps {
  userProfile: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  userProfile,
  onLoginSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is logged in but not authorized as admin
  const isLoggedIn = !!userProfile;
  const isAuthorized = isLoggedIn ? isAuthorizedAdminEmail(userProfile.email) : false;

  const handleModeSwitch = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      company: '',
    });
  };

  const handleQuickFillDefaultAdmin = () => {
    setMode('login');
    setFormData({
      name: '',
      email: 'admin@ohmveda.com',
      password: 'admin123',
      phone: '',
      company: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !formData.name.trim()) {
      setError('Please enter your full name for administrator registration.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await registerUserAsync({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim(),
          company: formData.company.trim(),
        });

        setLoading(false);

        if (!res.success || !res.account) {
          setError(res.message || 'Registration failed.');
          return;
        }

        const profile: UserProfile = {
          id: res.account.id,
          name: res.account.name,
          email: res.account.email,
          phone: res.account.phone,
          company: res.account.company,
        };

        if (!isAuthorizedAdminEmail(profile.email)) {
          setError(`Account created for ${profile.email}, but this email is not in the authorized administrators list. Please contact super admin.`);
          onLoginSuccess(profile);
          return;
        }

        onLoginSuccess(profile);
      } else {
        const res = await authenticateUserAsync(
          formData.email.trim().toLowerCase(), 
          formData.password
        );

        setLoading(false);

        if (!res.success || !res.account) {
          setError(res.message || 'Invalid email or password.');
          return;
        }

        const profile: UserProfile = {
          id: res.account.id,
          name: res.account.name,
          email: res.account.email,
          phone: res.account.phone,
          company: res.account.company,
        };

        if (!isAuthorizedAdminEmail(profile.email)) {
          setError(`Logged in as ${profile.email}, but this email is not in the authorized administrators registry.`);
          onLoginSuccess(profile);
          return;
        }

        onLoginSuccess(profile);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Authentication system error. Please check your network connection.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      
      {/* LOGIN CARD WINDOW */}
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* LOGO & TITLE */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <OhmVedaLogo variant="dark" size="md" layout="horizontal" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Management Portal Login</span>
          </div>
        </div>

        {/* IF LOGGED IN BUT NOT AUTHORIZED */}
        {isLoggedIn && !isAuthorized && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Unauthorized Account</span>
            </div>
            <p>
              You are currently signed in as <strong className="text-slate-900">{userProfile.email}</strong>. This account does not have administrator privileges.
            </p>
            <button
              onClick={onLogout}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs shadow-xs"
            >
              Sign Out & Switch Account
            </button>
          </div>
        )}

        {/* LOGIN / SIGNUP TABS */}
        {(!isLoggedIn || isAuthorized) && (
          <>
            <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Admin</span>
              </button>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* FULL NAME (SIGNUP ONLY) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. System Administrator"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@ohmveda.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ADDITIONAL FIELDS FOR SIGNUP */}
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+91..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Organization</label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="OhmVeda"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-2 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Management Portal' : 'Create Admin Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* QUICK FILL ACCELERATOR */}
            {mode === 'login' && (
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <KeyRound className="w-3 h-3 text-blue-600" />
                  <span>Default Admin Credentials</span>
                </span>

                <button
                  type="button"
                  onClick={handleQuickFillDefaultAdmin}
                  className="text-blue-600 hover:text-blue-800 font-bold underline underline-offset-2 cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Quick Fill Admin</span>
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* FOOTER METADATA */}
      <div className="mt-6 text-center text-[11px] text-slate-500 space-y-1">
        <p className="font-semibold text-slate-600">OhmVeda Industrial IoT & Embedded Systems</p>
        <p>Protected Management Console • Restricted Access System</p>
      </div>

    </div>
  );
};
