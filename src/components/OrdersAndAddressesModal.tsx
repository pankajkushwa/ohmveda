import React, { useState, useEffect } from 'react';
import { 
  X, Package, MapPin, Printer, Plus, Trash2, Edit3, Clock, Truck, 
  ShieldCheck, ArrowRight, ExternalLink, ChevronRight, CheckCircle2,
  Building2, Receipt, User, Search, RefreshCw, FileText, Check, AlertCircle,
  Copy
} from 'lucide-react';
import { UserAddress, UserOrder, UserProfile, SeparateBillingAddress } from '../types';
import { 
  getStoredUserAddresses, 
  getStoredUserOrders, 
  saveStoredUserAddress, 
  deleteStoredUserAddress,
  saveRegisteredUserProfile
} from '../services/dataStorage';

interface OrdersAndAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
  onReorderItems?: (items: { productId: string; quantity: number }[]) => void;
}

export const OrdersAndAddressesModal: React.FC<OrdersAndAddressesModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onProfileUpdated,
  onReorderItems,
}) => {
  // Sidebar Navigation State
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
  const [fullName, setFullName] = useState(userProfile.name || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [companyName, setCompanyName] = useState(userProfile.company || '');
  const [gstin, setGstin] = useState(userProfile.gstin || '');
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
  const [profileName, setProfileName] = useState(userProfile.name || '');
  const [profilePhone, setProfilePhone] = useState(userProfile.phone || '');
  const [profileCompany, setProfileCompany] = useState(userProfile.company || '');
  const [profileGstin, setProfileGstin] = useState(userProfile.gstin || '');

  useEffect(() => {
    if (isOpen && userProfile?.id) {
      const userOrders = getStoredUserOrders(userProfile.id);
      setOrders(userOrders);

      const userAddresses = getStoredUserAddresses(userProfile.id);
      setAddresses(userAddresses);
      setFormError('');
      setProfileSuccessMsg('');
      setShowAddressForm(false);

      setProfileName(userProfile.name || '');
      setProfilePhone(userProfile.phone || '');
      setProfileCompany(userProfile.company || '');
      setProfileGstin(userProfile.gstin || '');
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full shadow-2xl relative my-4 overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[850px]">
        
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR SELECTION PANEL */}
        {/* ========================================================================= */}
        <div className="w-full md:w-64 bg-slate-900 text-white p-4 sm:p-5 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            {/* User Avatar & Header */}
            <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md shrink-0">
                {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{userProfile.name || 'Valued Customer'}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{userProfile.email}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                  VERIFIED ACCOUNT
                </span>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <div className="mt-5 space-y-1.5">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>My Orders</span>
                </div>
                <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Saved Addresses</span>
                </div>
                <span className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                  activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {addresses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('gstin')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'gstin'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-blue-400" />
                  <span>GST & Tax Profile</span>
                </div>
                {userProfile.gstin && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-blue-400" />
                  <span>Account Settings</span>
                </div>
              </button>
            </div>
          </div>

          {/* Sidebar Footer Badge */}
          <div className="pt-4 border-t border-slate-800 mt-4 text-[10px] text-slate-400 space-y-1 font-mono hidden md:block">
            <p className="flex items-center gap-1.5 text-slate-300 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>B2B GST Invoicing Supported</span>
            </p>
            <p className="text-slate-500">Ohm Veda Technologies • Vadodara, India</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT MAIN CONTENT AREA */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden">
          
          {/* Top Bar / Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                {activeTab === 'orders' && (
                  <>
                    <Package className="w-5 h-5 text-blue-600" />
                    <span>My Hardware Orders & Trackers</span>
                  </>
                )}
                {activeTab === 'addresses' && (
                  <>
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span>Manage Delivery & Billing Addresses</span>
                  </>
                )}
                {activeTab === 'gstin' && (
                  <>
                    <Receipt className="w-5 h-5 text-blue-600" />
                    <span>GSTIN Business Tax Details</span>
                  </>
                )}
                {activeTab === 'profile' && (
                  <>
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Account Profile Settings</span>
                  </>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'orders' && 'View your order dispatch history, track courier packages, and download tax invoices.'}
                {activeTab === 'addresses' && 'Add shipping locations and separate B2B billing addresses.'}
                {activeTab === 'gstin' && 'Store your Company GSTIN for auto-generating GST input credit tax invoices.'}
                {activeTab === 'profile' && 'Manage your contact details and registered business profile.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors shadow-xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Scrollable View */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

            {/* TAB 1: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Search Bar */}
                {orders.length > 0 && (
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search orders by Order ID or item title..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                {filteredOrders.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <Package className="w-8 h-8" />
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-800">
                      {orders.length === 0 ? 'No orders placed yet' : 'No matching orders found'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {orders.length === 0 
                        ? 'When you purchase microcontrollers, dev boards, sensors, or prototyping parts, your orders & tax invoices will appear here.'
                        : 'Try adjusting your search keywords.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredOrders.map((order) => {
                      const currentStep = getOrderStatusStep(order.orderStatus);
                      return (
                        <div
                          key={order.id}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4"
                        >
                          {/* Order Header Summary */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs font-mono">
                            <div className="flex items-center gap-2">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">ORDER ID</span>
                                <div className="flex items-center gap-1.5 font-extrabold text-blue-600">
                                  <span>#{order.id}</span>
                                  <button
                                    onClick={() => handleCopyOrderId(order.id)}
                                    title="Copy Order ID"
                                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                  >
                                    {copiedOrderId === order.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">DATE</span>
                              <span className="font-bold text-slate-800">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">PAYMENT</span>
                              <span className="font-bold text-slate-700">
                                {order.paymentMethod} ({order.paymentStatus})
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">TOTAL AMOUNT</span>
                              <span className="font-extrabold text-slate-900 text-sm">₹{order.totalAmount.toLocaleString()}</span>
                            </div>

                            <div>
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>

                          {/* Courier Timeline Step Tracker */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                              <span>Courier Dispatch Progress</span>
                              <span className="text-slate-500 font-mono font-normal">
                                Est. Delivery: {order.estimatedDelivery || '2-4 Business Days'}
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1 text-center pt-1">
                              {[
                                { title: 'Placed', step: 1 },
                                { title: 'Processing', step: 2 },
                                { title: 'Shipped', step: 3 },
                                { title: 'Delivered', step: 4 },
                              ].map((st) => (
                                <div key={st.step} className="space-y-1">
                                  <div className={`h-1.5 rounded-full transition-all ${
                                    currentStep >= st.step ? 'bg-blue-600' : 'bg-slate-200'
                                  }`} />
                                  <span className={`text-[10px] font-bold block ${
                                    currentStep >= st.step ? 'text-blue-700' : 'text-slate-400'
                                  }`}>
                                    {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Purchased Line Items */}
                          <div className="space-y-2.5 pt-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl bg-slate-50/60 border border-slate-100">
                                <div className="flex items-center gap-3 min-w-0">
                                  <img
                                    src={it.image}
                                    alt={it.productName}
                                    className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{it.productName}</p>
                                    <p className="text-[10px] font-mono text-slate-500">
                                      SKU: {it.sku} • Qty: <span className="font-bold text-slate-800">{it.quantity}</span> × ₹{it.price}
                                    </p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-slate-900 shrink-0">
                                  ₹{(it.price * it.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Address Summary (Delivery & Separate Billing if present) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                Shipping Address
                              </span>
                              <p className="font-bold text-slate-900 mt-0.5">{order.shippingAddress?.fullName}</p>
                              {order.shippingAddress?.companyName && (
                                <p className="text-slate-700 font-semibold">{order.shippingAddress.companyName}</p>
                              )}
                              <p className="text-slate-600 text-[11px]">
                                {order.shippingAddress?.houseBuilding}, {order.shippingAddress?.streetArea}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                              </p>
                              <p className="text-slate-500 font-mono text-[10px] mt-1">Ph: {order.shippingAddress?.phone}</p>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                Billing & Tax Details
                              </span>
                              {order.shippingAddress?.isBillingSame === false && order.shippingAddress.billingAddress ? (
                                <>
                                  <p className="font-bold text-slate-900 mt-0.5">{order.shippingAddress.billingAddress.fullName}</p>
                                  {order.shippingAddress.billingAddress.companyName && (
                                    <p className="text-slate-700 font-semibold">{order.shippingAddress.billingAddress.companyName}</p>
                                  )}
                                  {order.shippingAddress.billingAddress.gstin && (
                                    <p className="text-blue-700 font-mono font-bold text-[10px]">
                                      GSTIN: {order.shippingAddress.billingAddress.gstin}
                                    </p>
                                  )}
                                  <p className="text-slate-600 text-[11px]">
                                    {order.shippingAddress.billingAddress.houseBuilding}, {order.shippingAddress.billingAddress.streetArea}, {order.shippingAddress.billingAddress.city} - {order.shippingAddress.billingAddress.pincode}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="font-semibold text-slate-800 mt-0.5">Same as Shipping Address</p>
                                  {order.shippingAddress?.gstin && (
                                    <p className="text-blue-700 font-mono font-bold text-[11px] mt-1">
                                      GSTIN: {order.shippingAddress.gstin}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Footer Action Buttons */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                            <div className="text-[11px] text-slate-500">
                              GST Included: <span className="font-mono font-bold text-slate-800">₹{order.gstAmount.toLocaleString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => window.print()}
                                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span>Print Tax Invoice</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAVED ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                    Your Address Book & B2B Billing Locations
                  </h4>

                  {!showAddressForm && (
                    <button
                      onClick={() => {
                        resetAddressForm();
                        setShowAddressForm(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Address</span>
                    </button>
                  )}
                </div>

                {/* Address Form (Add or Edit) */}
                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <h5 className="text-xs font-extrabold text-slate-900 uppercase font-mono flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{editingAddressId ? 'Edit Address Entry' : 'Add New Address Entry'}</span>
                      </h5>
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

                    {/* SECTION 1: SHIPPING/DELIVERY ADDRESS */}
                    <div className="space-y-3">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider block font-mono">
                        1. Shipping / Delivery Location
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Full Contact Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Phone / Mobile Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="e.g. +91 9876543210"
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
                            placeholder="e.g. Veda Robotics Innovations Pvt Ltd"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">GSTIN Number (Optional - for GST Tax Credit)</label>
                          <input
                            type="text"
                            placeholder="e.g. 24AAAAA0000A1Z5"
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
                            placeholder="e.g. 390001"
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
                            placeholder="e.g. Vadodara"
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
                            placeholder="e.g. Gujarat"
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
                          placeholder="e.g. Plot No 42, Tech Park Tower B"
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
                            placeholder="e.g. GIDC Electronics Estate"
                            value={streetArea}
                            onChange={(e) => setStreetArea(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Near Science City Road"
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
                            <span>Set as default shipping address</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SEPARATE BILLING ADDRESS TOGGLE */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">Billing Address Same as Delivery Address?</p>
                          <p className="text-[11px] text-slate-500">
                            Check this box if your tax invoice billing entity is identical to the shipping location.
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isBillingSame}
                            onChange={(e) => setIsBillingSame(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {/* Separate Billing Address Fields */}
                      {!isBillingSame && (
                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3 animate-in fade-in duration-200">
                          <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider block font-mono flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-blue-600" />
                            <span>2. Separate Billing Entity & Tax Location</span>
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Full Name / Entity *</label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Accounts Dept / Veda Corp"
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
                                placeholder="e.g. +91 9876543210"
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
                                placeholder="e.g. Veda Technologies Headquarters"
                                value={billCompanyName}
                                onChange={(e) => setBillCompanyName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Billing Company GSTIN</label>
                              <input
                                type="text"
                                placeholder="e.g. 24AAAAA0000A1Z5"
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
                                value={billState}
                                onChange={(e) => setBillState(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="text-xs">
                            <label className="block font-bold text-slate-700 mb-1">Billing House / Flat / Building *</label>
                            <input
                              type="text"
                              required
                              value={billHouseBuilding}
                              onChange={(e) => setBillHouseBuilding(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div className="text-xs">
                            <label className="block font-bold text-slate-700 mb-1">Billing Street / Area *</label>
                            <input
                              type="text"
                              required
                              value={billStreetArea}
                              onChange={(e) => setBillStreetArea(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          resetAddressForm();
                        }}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-sm cursor-pointer"
                      >
                        Save Address Record
                      </button>
                    </div>
                  </form>
                )}

                {/* Saved Address Cards List */}
                {addresses.length === 0 && !showAddressForm ? (
                  <div className="py-16 text-center text-slate-500 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-800">No saved addresses found</p>
                    <p className="text-xs max-w-sm mx-auto">
                      Click "Add New Address" to save your factory, office, or home delivery location along with your B2B GSTIN.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          {/* Header badges */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                              {addr.addressType}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  DEFAULT SHIPPING
                                </span>
                              )}
                              {addr.isBillingSame === false && (
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                                  SEPARATE BILLING
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contact & Company */}
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{addr.fullName}</p>
                            {addr.companyName && (
                              <p className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>{addr.companyName}</span>
                              </p>
                            )}
                            {addr.gstin && (
                              <p className="text-[11px] font-mono font-bold text-blue-700 mt-0.5">
                                GSTIN: {addr.gstin}
                              </p>
                            )}
                          </div>

                          {/* Shipping address line */}
                          <div className="text-xs text-slate-600 space-y-0.5">
                            <p className="font-medium">{addr.houseBuilding}, {addr.streetArea}</p>
                            {addr.landmark && <p className="text-[11px] text-slate-500">Landmark: {addr.landmark}</p>}
                            <p className="font-bold text-slate-800">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-slate-500 font-mono text-[11px]">Phone: {addr.phone}</p>
                          </div>

                          {/* Separate Billing Address Preview if present */}
                          {addr.isBillingSame === false && addr.billingAddress && (
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                              <span className="font-extrabold text-blue-700 uppercase tracking-wider block text-[10px] font-mono">
                                Separate Billing Entity:
                              </span>
                              <p className="font-bold text-slate-900">{addr.billingAddress.fullName}</p>
                              {addr.billingAddress.companyName && (
                                <p className="text-slate-700 font-medium">{addr.billingAddress.companyName}</p>
                              )}
                              {addr.billingAddress.gstin && (
                                <p className="font-mono text-blue-700 font-bold">GST: {addr.billingAddress.gstin}</p>
                              )}
                              <p className="text-slate-600">
                                {addr.billingAddress.houseBuilding}, {addr.billingAddress.streetArea}, {addr.billingAddress.city} - {addr.billingAddress.pincode}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3 text-xs font-bold">
                          <button
                            onClick={() => handleEditAddressInit(addr)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Address</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GSTIN & B2B TAX PROFILE */}
            {activeTab === 'gstin' && (
              <form onSubmit={handleSaveProfileAndGst} className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Registered Business GST Profile</h4>
                      <p className="text-xs text-slate-500">
                        Provide your registered company name & GSTIN to automatically receive GST Input Credit Tax Invoices on all orders.
                      </p>
                    </div>
                  </div>

                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company / Entity Registered Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Ohm Veda Robotics & Embedded Solutions Pvt Ltd"
                        value={profileCompany}
                        onChange={(e) => setProfileCompany(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">15-Digit GSTIN Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 24AAAAA0000A1Z5"
                        maxLength={15}
                        value={profileGstin}
                        onChange={(e) => setProfileGstin(e.target.value.toUpperCase())}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-mono text-slate-900 uppercase focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                      Save Business GST Details
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 4: PROFILE SETTINGS */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfileAndGst} className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 font-mono uppercase">Your Contact Information</h4>

                  {profileSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Address (Primary Login)</label>
                      <input
                        type="email"
                        disabled
                        value={userProfile.email}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company / Firm Name</label>
                      <input
                        type="text"
                        value={profileCompany}
                        onChange={(e) => setProfileCompany(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                      Update Account Profile
                    </button>
                  </div>
                </div>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
