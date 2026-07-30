import React, { useState, useEffect } from 'react';
import { 
  Package, MapPin, Printer, Plus, Trash2, Edit3, ShieldCheck, ArrowRight,
  ChevronRight, CheckCircle2, Receipt, User, Search, FileText, Check, AlertCircle,
  Copy, ArrowLeft, Building2, Phone, Sparkles, LogOut, ExternalLink, RefreshCw, Layers
} from 'lucide-react';
import { UserAddress, UserOrder, UserProfile, SeparateBillingAddress, StoreProduct } from '../types';
import { 
  getStoredUserAddresses, 
  getStoredUserOrders, 
  saveStoredUserAddress, 
  deleteStoredUserAddress,
  saveRegisteredUserProfile
} from '../services/dataStorage';

interface AccountPageProps {
  userProfile: UserProfile | null;
  onBackToHome: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
  onAddToCart?: (product: StoreProduct) => void;
  onNavigateToStore?: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  userProfile,
  onBackToHome,
  onOpenAuth,
  onLogout,
  onProfileUpdated,
  onAddToCart,
  onNavigateToStore,
}) => {
  // Sidebar Navigation Selection Menu State
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'gstin' | 'profile'>('orders');

  // Orders State
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Delivery Address Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [pincode, setPincode] = useState('');
  const [houseBuilding, setHouseBuilding] = useState('');
  const [streetArea, setStreetArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Vadodara');
  const [state, setState] = useState('Gujarat');
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Factory / R&D Lab' | 'Other'>('Home');
  const [isDefault, setIsDefault] = useState(false);

  // Separate Billing Address Toggle & Fields
  const [isBillingSame, setIsBillingSame] = useState(true);
  const [billFullName, setBillFullName] = useState('');
  const [billPhone, setBillPhone] = useState('');
  const [billCompanyName, setBillCompanyName] = useState('');
  const [billGstin, setBillGstin] = useState('');
  const [billHouseBuilding, setBillHouseBuilding] = useState('');
  const [billStreetArea, setBillStreetArea] = useState('');
  const [billLandmark, setBillLandmark] = useState('');
  const [billCity, setBillCity] = useState('Vadodara');
  const [billState, setBillState] = useState('Gujarat');
  const [billPincode, setBillPincode] = useState('');

  const [formError, setFormError] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // GST & Profile Settings State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCompany, setProfileCompany] = useState('');
  const [profileGstin, setProfileGstin] = useState('');

  useEffect(() => {
    if (userProfile?.id) {
      const userOrders = getStoredUserOrders(userProfile.id);
      setOrders(userOrders);

      const userAddresses = getStoredUserAddresses(userProfile.id);
      setAddresses(userAddresses);
      setFormError('');
      setProfileSuccessMsg('');

      setProfileName(userProfile.name || '');
      setProfilePhone(userProfile.phone || '');
      setProfileCompany(userProfile.company || '');
      setProfileGstin(userProfile.gstin || '');

      setFullName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      setCompanyName(userProfile.company || '');
      setGstin(userProfile.gstin || '');
    }
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200/80">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">Login Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please log in or create an account to access your hardware orders, delivery locations, and tax invoices.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onOpenAuth}
              className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Sign In / Log In
            </button>
            <button
              onClick={onBackToHome}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setFullName(userProfile.name || '');
    setPhone(userProfile.phone || '');
    setCompanyName(userProfile.company || '');
    setGstin(userProfile.gstin || '');
    setPincode('');
    setHouseBuilding('');
    setStreetArea('');
    setLandmark('');
    setCity('Vadodara');
    setState('Gujarat');
    setAddressType('Home');
    setIsDefault(addresses.length === 0);

    setIsBillingSame(true);
    setBillFullName('');
    setBillPhone('');
    setBillCompanyName('');
    setBillGstin('');
    setBillHouseBuilding('');
    setBillStreetArea('');
    setBillLandmark('');
    setBillCity('Vadodara');
    setBillState('Gujarat');
    setBillPincode('');

    setFormError('');
  };

  const handleEditAddressInit = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setCompanyName(addr.companyName || '');
    setGstin(addr.gstin || '');
    setPincode(addr.pincode);
    setHouseBuilding(addr.houseBuilding);
    setStreetArea(addr.streetArea);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setAddressType(addr.addressType);
    setIsDefault(addr.isDefault || false);

    setIsBillingSame(addr.isBillingSame !== false);
    if (addr.billingAddress) {
      setBillFullName(addr.billingAddress.fullName);
      setBillPhone(addr.billingAddress.phone);
      setBillCompanyName(addr.billingAddress.companyName || '');
      setBillGstin(addr.billingAddress.gstin || '');
      setBillHouseBuilding(addr.billingAddress.houseBuilding);
      setBillStreetArea(addr.billingAddress.streetArea);
      setBillLandmark(addr.billingAddress.landmark || '');
      setBillCity(addr.billingAddress.city);
      setBillState(addr.billingAddress.state);
      setBillPincode(addr.billingAddress.pincode);
    } else {
      setBillFullName('');
      setBillPhone('');
      setBillCompanyName('');
      setBillGstin('');
      setBillHouseBuilding('');
      setBillStreetArea('');
      setBillLandmark('');
      setBillCity('Vadodara');
      setBillState('Gujarat');
      setBillPincode('');
    }

    setFormError('');
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !phone.trim() || !pincode.trim() || !houseBuilding.trim() || !streetArea.trim() || !city.trim() || !state.trim()) {
      setFormError('Please complete all required shipping address fields marked with (*).');
      return;
    }

    let separateBilling: SeparateBillingAddress | undefined = undefined;

    if (!isBillingSame) {
      if (!billFullName.trim() || !billPhone.trim() || !billHouseBuilding.trim() || !billStreetArea.trim() || !billCity.trim() || !billState.trim() || !billPincode.trim()) {
        setFormError('Please complete all required fields for the Separate Billing Address.');
        return;
      }

      separateBilling = {
        fullName: billFullName.trim(),
        phone: billPhone.trim(),
        companyName: billCompanyName.trim() || undefined,
        gstin: billGstin.trim() || undefined,
        houseBuilding: billHouseBuilding.trim(),
        streetArea: billStreetArea.trim(),
        landmark: billLandmark.trim() || undefined,
        city: billCity.trim(),
        state: billState.trim(),
        pincode: billPincode.trim(),
      };
    }

    const newAddr: UserAddress = {
      id: editingAddressId || `addr_${Date.now()}`,
      userId: userProfile.id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      companyName: companyName.trim() || undefined,
      gstin: gstin.trim() || undefined,
      pincode: pincode.trim(),
      houseBuilding: houseBuilding.trim(),
      streetArea: streetArea.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: state.trim(),
      addressType,
      isDefault: isDefault || addresses.length === 0,
      isBillingSame,
      billingAddress: separateBilling,
    };

    const updated = saveStoredUserAddress(newAddr);
    setAddresses(updated);
    setShowAddressForm(false);
    resetAddressForm();
  };

  const handleDeleteAddress = (id: string) => {
    const updated = deleteStoredUserAddress(userProfile.id, id);
    setAddresses(updated);
  };

  const handleSaveProfileAndGst = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      ...userProfile,
      name: profileName.trim(),
      phone: profilePhone.trim(),
      company: profileCompany.trim(),
      gstin: profileGstin.trim(),
    };

    saveRegisteredUserProfile(updatedProfile);
    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }
    setProfileSuccessMsg('Profile & GST business details saved successfully!');
    setTimeout(() => setProfileSuccessMsg(''), 3500);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.items.some((it) => it.productName.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q))
    );
  });

  const getOrderStatusStep = (status: UserOrder['orderStatus']) => {
    switch (status) {
      case 'Processing': return 1;
      case 'Shipped': return 2;
      case 'Out for Delivery': return 3;
      case 'Delivered': return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Breadcrumb Header & Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer border border-slate-200"
              title="Return to Home Page"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <button onClick={onBackToHome} className="hover:text-blue-600 transition-colors">Home</button>
                <span>/</span>
                <span className="text-slate-800 font-bold">My Account & Orders</span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
                <span>Customer Account Console</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                  B2B READY
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToStore && (
              <button
                onClick={onNavigateToStore}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Visit Store</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* MAIN CONTAINER LAYOUT WITH LEFT SIDEBAR SELECTION PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR SELECTION PANEL (4 COLUMNS ON LG) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-6 shrink-0">
            
            {/* User Profile Overview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{userProfile.name || 'Valued Customer'}</p>
                <p className="text-xs text-slate-500 font-mono truncate">{userProfile.email}</p>
                {userProfile.company && (
                  <p className="text-[11px] text-blue-700 font-semibold truncate mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 shrink-0 text-blue-600" />
                    <span>{userProfile.company}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Selection Menu Tabs */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono px-1">
                Account Navigation
              </span>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-3.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'orders' ? 'bg-white/20' : 'bg-slate-100 text-blue-600'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-sm">My Orders</span>
                    <span className={`text-[10px] block ${activeTab === 'orders' ? 'text-blue-100' : 'text-slate-500'}`}>
                      Dispatch history & track package
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full p-3.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'addresses' ? 'bg-white/20' : 'bg-slate-100 text-blue-600'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-sm">Saved Addresses</span>
                    <span className={`text-[10px] block ${activeTab === 'addresses' ? 'text-blue-100' : 'text-slate-500'}`}>
                      Shipping & separate billing locations
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                  activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {addresses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('gstin')}
                className={`w-full p-3.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'gstin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'gstin' ? 'bg-white/20' : 'bg-slate-100 text-blue-600'}`}>
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-sm">GST & Business Details</span>
                    <span className={`text-[10px] block ${activeTab === 'gstin' ? 'text-blue-100' : 'text-slate-500'}`}>
                      Auto-generate tax credit invoices
                    </span>
                  </div>
                </div>
                {userProfile.gstin ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
                ) : (
                  <span className={`text-[10px] font-bold uppercase font-mono ${activeTab === 'gstin' ? 'text-blue-100' : 'text-amber-600'}`}>
                    Add GST
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full p-3.5 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'profile' ? 'bg-white/20' : 'bg-slate-100 text-blue-600'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-black text-sm">Account Settings</span>
                    <span className={`text-[10px] block ${activeTab === 'profile' ? 'text-blue-100' : 'text-slate-500'}`}>
                      Profile information & contact
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === 'profile' ? 'text-white' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Quick B2B Info Box */}
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>B2B Tax Credit Assurance</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Add your company name and GSTIN to receive compliant GST tax credit invoices with every hardware component order.
              </p>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT MAIN CONTENT AREA (8 COLUMNS ON LG) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-sm min-h-[600px] text-slate-900">
            
            {/* VIEW 1: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span>My Orders & Dispatch Trackers</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track courier dispatches, view purchased hardware items, and print GST invoices.
                    </p>
                  </div>

                  {orders.length > 0 && (
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by order ID or item..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Package className="w-10 h-10 text-slate-400" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h3 className="text-base font-extrabold text-slate-800">
                        {orders.length === 0 ? 'No orders placed yet' : 'No matching orders'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {orders.length === 0 
                          ? 'Browse our store for microcontrollers, sensors, development kits, and prototyping modules to place your first order.'
                          : 'Try searching with different keywords.'}
                      </p>
                    </div>
                    {onNavigateToStore && (
                      <button
                        onClick={onNavigateToStore}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>Explore Hardware Store</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredOrders.map((order) => {
                      const currentStep = getOrderStatusStep(order.orderStatus);
                      return (
                        <div
                          key={order.id}
                          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs space-y-4"
                        >
                          {/* Order Summary Bar */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs font-mono">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">ORDER NUMBER</span>
                              <div className="flex items-center gap-1.5 font-black text-blue-600 text-sm">
                                <span>#{order.id}</span>
                                <button
                                  onClick={() => handleCopyOrderId(order.id)}
                                  title="Copy Order ID"
                                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                >
                                  {copiedOrderId === order.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">PLACED ON</span>
                              <span className="font-bold text-slate-800">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">PAYMENT STATUS</span>
                              <span className="font-bold text-slate-700">
                                {order.paymentMethod} • <span className="text-emerald-700">{order.paymentStatus}</span>
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">TOTAL AMOUNT</span>
                              <span className="font-black text-slate-900 text-base">₹{order.totalAmount.toLocaleString()}</span>
                            </div>

                            <div>
                              <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>

                          {/* Courier Dispatch Progress Bar & Tracking Details */}
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Courier Dispatch Tracking</span>
                              </span>
                              <span className="text-slate-500 font-mono text-[11px] font-normal">
                                Est. Delivery: <strong className="text-slate-800">{order.estimatedDelivery || '2-4 Business Days'}</strong>
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                              {[
                                { title: 'Order Placed', step: 1 },
                                { title: 'Processing', step: 2 },
                                { title: 'Shipped', step: 3 },
                                { title: 'Delivered', step: 4 },
                              ].map((st) => (
                                <div key={st.step} className="space-y-1">
                                  <div className={`h-2 rounded-full transition-all ${
                                    currentStep >= st.step ? 'bg-blue-600' : 'bg-slate-200'
                                  }`} />
                                  <span className={`text-[10px] font-extrabold block ${
                                    currentStep >= st.step ? 'text-blue-700' : 'text-slate-400'
                                  }`}>
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Courier AWB & Tracking Link details from Admin */}
                            {(order.courierPartner || order.trackingNumber || order.adminDispatchNotes) && (
                              <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">Courier Partner & AWB Tracking</span>
                                    <p className="font-bold text-slate-900 flex items-center gap-2">
                                      <span>{order.courierPartner || 'Express Air Courier'}</span>
                                      {order.trackingNumber && (
                                        <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                                          AWB: {order.trackingNumber}
                                        </span>
                                      )}
                                    </p>
                                  </div>

                                  {order.courierTrackingUrl && (
                                    <a
                                      href={order.courierTrackingUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                    >
                                      <span>Track Package</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>

                                {order.adminDispatchNotes && (
                                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200/60">
                                    <strong>Warehouse Dispatch Note:</strong> {order.adminDispatchNotes}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Hardware Line Items */}
                          <div className="space-y-2 pt-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 text-xs p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={it.image}
                                    alt={it.productName}
                                    className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{it.productName}</p>
                                    <p className="text-[11px] font-mono text-slate-500">
                                      SKU: {it.sku} • Qty: <strong className="text-slate-800">{it.quantity}</strong> × ₹{it.price}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-slate-900 shrink-0 text-sm">
                                  ₹{(it.price * it.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Delivery Location & Separate Billing Entity Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono">
                                Delivery Address
                              </span>
                              <p className="font-bold text-slate-900">{order.shippingAddress?.fullName}</p>
                              {order.shippingAddress?.companyName && (
                                <p className="text-slate-700 font-semibold text-[11px] flex items-center gap-1">
                                  <Building2 className="w-3 h-3 text-blue-600" />
                                  <span>{order.shippingAddress.companyName}</span>
                                </p>
                              )}
                              <p className="text-slate-600 text-[11px]">
                                {order.shippingAddress?.houseBuilding}, {order.shippingAddress?.streetArea}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                              </p>
                              <p className="text-slate-500 font-mono text-[10px]">Ph: {order.shippingAddress?.phone}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono">
                                Billing Address & GST Details
                              </span>
                              {order.shippingAddress?.isBillingSame === false && order.shippingAddress.billingAddress ? (
                                <>
                                  <p className="font-bold text-slate-900">{order.shippingAddress.billingAddress.fullName}</p>
                                  {order.shippingAddress.billingAddress.companyName && (
                                    <p className="text-slate-700 font-semibold text-[11px] flex items-center gap-1">
                                      <Building2 className="w-3 h-3 text-blue-600" />
                                      <span>{order.shippingAddress.billingAddress.companyName}</span>
                                    </p>
                                  )}
                                  {order.shippingAddress.billingAddress.gstin && (
                                    <p className="text-blue-700 font-mono font-bold text-[11px]">
                                      GSTIN: {order.shippingAddress.billingAddress.gstin}
                                    </p>
                                  )}
                                  <p className="text-slate-600 text-[11px]">
                                    {order.shippingAddress.billingAddress.houseBuilding}, {order.shippingAddress.billingAddress.streetArea}, {order.shippingAddress.billingAddress.city} - {order.shippingAddress.billingAddress.pincode}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="font-bold text-slate-800">Same as Delivery Location</p>
                                  {order.shippingAddress?.gstin && (
                                    <p className="text-blue-700 font-mono font-bold text-[11px] mt-1">
                                      GSTIN: {order.shippingAddress.gstin}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Print Invoice & GST Action Bar */}
                          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                            <div className="text-xs text-slate-500">
                              GST Included (18%): <strong className="font-mono text-slate-900">₹{order.gstAmount.toLocaleString()}</strong>
                            </div>

                            <button
                              onClick={() => window.print()}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold flex items-center gap-1.5 text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-400" />
                              <span>Print Official GST Invoice</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>Saved Shipping & Billing Addresses</span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Manage delivery locations for factories, labs, and office sites along with separate billing tax entities.
                    </p>
                  </div>

                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        resetAddressForm();
                        setShowAddressForm(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Address Form (Add or Edit) */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-5 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <h3 className="text-xs font-black text-slate-900 uppercase font-mono flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{editingAddressId ? 'Edit Saved Address' : 'Add New Saved Address'}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          resetAddressForm();
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    {formError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* SECTION 1: DELIVERY / SHIPPING ADDRESS */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block font-mono">
                        1. Primary Delivery Location
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Full Recipient Contact Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Rahul Sharma"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="+91 9876543210"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Company / Organization Name (Optional)</label>
                          <input
                            type="text"
                            placeholder="Veda Robotics Innovations Pvt Ltd"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">GSTIN Number (Optional - for Tax Credit)</label>
                          <input
                            type="text"
                            placeholder="24AAAAA0000A1Z5"
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 uppercase focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">PIN Code *</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="390001"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">City *</label>
                          <input
                            type="text"
                            required
                            placeholder="Vadodara"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">State *</label>
                          <input
                            type="text"
                            required
                            placeholder="Gujarat"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block font-bold text-slate-700 mb-1">House / Flat / Building Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Plot No 42, Tech Park Tower B"
                          value={houseBuilding}
                          onChange={(e) => setHouseBuilding(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Street / Area / Colony *</label>
                          <input
                            type="text"
                            required
                            placeholder="GIDC Electronics Estate"
                            value={streetArea}
                            onChange={(e) => setStreetArea(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                          <input
                            type="text"
                            placeholder="Near Science City Road"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Address Tag / Type</label>
                          <select
                            value={addressType}
                            onChange={(e) => setAddressType(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                          >
                            <option value="Home">Home Address</option>
                            <option value="Work">Work / Office</option>
                            <option value="Factory / R&D Lab">Factory / R&D Lab</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-bold">
                            <input
                              type="checkbox"
                              checked={isDefault}
                              onChange={(e) => setIsDefault(e.target.checked)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>Set as default shipping location</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SEPARATE BILLING ADDRESS TOGGLE */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Billing Address Same as Delivery Address?</p>
                          <p className="text-[11px] text-slate-500">
                            Uncheck if your tax invoice billing entity address differs from the physical delivery location.
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={isBillingSame}
                            onChange={(e) => setIsBillingSame(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Separate Billing Address Input Panel */}
                      {!isBillingSame && (
                        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3 animate-in fade-in duration-200">
                          <span className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider block font-mono flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-blue-600" />
                            <span>2. Separate B2B Billing Entity Details</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Contact Name *</label>
                              <input
                                type="text"
                                required
                                placeholder="Accounts Dept / Veda Corp"
                                value={billFullName}
                                onChange={(e) => setBillFullName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Phone Number *</label>
                              <input
                                type="tel"
                                required
                                placeholder="+91 9876543210"
                                value={billPhone}
                                onChange={(e) => setBillPhone(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Company Name</label>
                              <input
                                type="text"
                                placeholder="Veda Technologies HQ"
                                value={billCompanyName}
                                onChange={(e) => setBillCompanyName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Company GSTIN</label>
                              <input
                                type="text"
                                placeholder="24AAAAA0000A1Z5"
                                value={billGstin}
                                onChange={(e) => setBillGstin(e.target.value.toUpperCase())}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900 uppercase focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing PIN Code *</label>
                              <input
                                type="text"
                                required
                                maxLength={6}
                                placeholder="390001"
                                value={billPincode}
                                onChange={(e) => setBillPincode(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing City *</label>
                              <input
                                type="text"
                                required
                                placeholder="Vadodara"
                                value={billCity}
                                onChange={(e) => setBillCity(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing State *</label>
                              <input
                                type="text"
                                required
                                placeholder="Gujarat"
                                value={billState}
                                onChange={(e) => setBillState(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Building Name / Premises *</label>
                              <input
                                type="text"
                                required
                                placeholder="HQ Tower Floor 5"
                                value={billHouseBuilding}
                                onChange={(e) => setBillHouseBuilding(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Street / Area *</label>
                              <input
                                type="text"
                                required
                                placeholder="Financial District"
                                value={billStreetArea}
                                onChange={(e) => setBillStreetArea(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          resetAddressForm();
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        {editingAddressId ? 'Save Address Changes' : 'Save Address Entry'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved Address Cards */}
                {addresses.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800">No addresses saved yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add delivery locations for your company office, factory, or R&D lab to speed up hardware purchases.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 relative flex flex-col justify-between ${
                          addr.isDefault 
                            ? 'bg-blue-50/40 border-blue-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Address Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white font-mono">
                                {addr.addressType}
                              </span>

                              {addr.isDefault && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white font-mono flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Default Location</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delivery Location Summary */}
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-slate-900 text-sm">{addr.fullName}</p>
                            {addr.companyName && (
                              <p className="text-blue-700 font-bold text-xs flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>{addr.companyName}</span>
                              </p>
                            )}
                            <p className="text-slate-600 leading-snug">
                              {addr.houseBuilding}, {addr.streetArea}
                              {addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city}, {addr.state} - <strong className="font-mono text-slate-800">{addr.pincode}</strong>
                            </p>
                            <p className="text-slate-500 font-mono text-[11px] pt-1">Phone: {addr.phone}</p>
                          </div>

                          {/* GST & Separate Billing Info Badge */}
                          {(addr.gstin || addr.billingAddress) && (
                            <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1 font-mono">
                              {addr.gstin && (
                                <p className="text-blue-800 font-bold flex items-center gap-1">
                                  <Receipt className="w-3 h-3 text-blue-600" />
                                  <span>GSTIN: {addr.gstin}</span>
                                </p>
                              )}

                              {addr.isBillingSame === false && addr.billingAddress && (
                                <div className="p-2 rounded-lg bg-slate-100/80 text-[10px] text-slate-700 font-sans border border-slate-200">
                                  <strong className="block text-slate-900 uppercase font-mono">Separate Billing Entity Attached:</strong>
                                  <span>{addr.billingAddress.fullName} ({addr.billingAddress.companyName || 'Individual'})</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Prominent Edit and Delete Action Buttons */}
                        <div className="pt-3 border-t border-slate-200/80 flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleEditAddressInit(addr)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200 shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Address</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200 shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: GST & BUSINESS TAX PROFILE */}
            {activeTab === 'gstin' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-600" />
                    <span>Company GSTIN & Tax Invoicing Profile</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Save your GST registered entity info to automatically claim 18% GST Input Tax Credit on every order.
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfileAndGst} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Registered Company / Business Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Veda Embedded Systems Pvt Ltd"
                        value={profileCompany}
                        onChange={(e) => setProfileCompany(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Goods & Services Tax Identification Number (GSTIN) *</label>
                      <input
                        type="text"
                        required
                        placeholder="24AAAAA0000A1Z5"
                        value={profileGstin}
                        onChange={(e) => setProfileGstin(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Authorized Contact Person *</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Business Mobile / Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                    >
                      Save Tax Profile
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* VIEW 4: ACCOUNT SETTINGS */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Account Profile Settings</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    View your login email, contact details, and account credentials.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Registered Email</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{userProfile.email}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Account Name</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{userProfile.name || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Phone Number</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{userProfile.phone || 'N/A'}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-mono uppercase block font-bold">Company Name</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{userProfile.company || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Ohm Veda Customer ID: <strong className="font-mono text-slate-800">{userProfile.id}</strong></span>

                    <button
                      onClick={onLogout}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer"
                    >
                      Log Out Account
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
