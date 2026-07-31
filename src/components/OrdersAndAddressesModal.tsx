import React, { useState, useEffect } from 'react';
import { 
  X, Package, MapPin, Printer, Plus, Trash2, Edit3, Clock, Truck, 
  ShieldCheck, ArrowRight, ExternalLink, ChevronRight, CheckCircle2,
  Building2, Receipt, User, Search, RefreshCw, FileText, Check, AlertCircle,
  Copy, ArrowLeft, Box, Ban
} from 'lucide-react';
import { UserAddress, UserOrder, UserProfile, SeparateBillingAddress } from '../types';
import { 
  getStoredUserAddresses, 
  getStoredUserOrders, 
  updateStoredUserOrder,
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

  // Orders State & Selected Order Detailed View
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  // Cancellation Modal State
  const [orderToCancel, setOrderToCancel] = useState<UserOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');

  const canCancelOrder = (status: string) => {
    return status === 'Order Placed' || status === 'Processing';
  };

  const handleConfirmCancelOrder = () => {
    if (!orderToCancel) return;

    const isOnlinePayment = orderToCancel.paymentMethod !== 'COD';
    const newPaymentStatus = isOnlinePayment ? 'Refund Pending' : 'Cancelled';

    const updatedOrder: UserOrder = {
      ...orderToCancel,
      orderStatus: 'Cancelled',
      paymentStatus: newPaymentStatus,
      adminDispatchNotes: `Cancelled by customer on ${new Date().toLocaleDateString('en-IN')}. Reason: ${cancelReason}. ${isOnlinePayment ? 'Refund Pending (7 Working Days)' : ''}`,
    };

    const updatedList = updateStoredUserOrder(updatedOrder);
    if (userProfile?.id) {
      setOrders(updatedList.filter((o) => o.userId === userProfile.id));
    } else {
      setOrders(updatedList);
    }

    if (selectedOrder && selectedOrder.id === orderToCancel.id) {
      setSelectedOrder(updatedOrder);
    }

    setOrderToCancel(null);
  };

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
              selectedOrder ? (
                /* DEDICATED FULL ORDER & INVOICE SPECIFICATION VIEW */
                <div className="space-y-5 animate-fadeIn">
                  {/* Top Header / Navigation Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                      <span>Back to Orders List</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        selectedOrder.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {selectedOrder.orderStatus}
                      </span>
                      {canCancelOrder(selectedOrder.orderStatus) && (
                        <button
                          type="button"
                          onClick={() => {
                            setOrderToCancel(selectedOrder);
                            setCancelReason('Ordered by mistake');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5 text-red-600" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                      <button
                        onClick={() => window.print()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Order ID Banner */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">ORDER ID</span>
                      <h3 className="text-lg font-black font-mono text-white flex items-center gap-2">
                        <span>#{selectedOrder.id}</span>
                        <button
                          onClick={() => handleCopyOrderId(selectedOrder.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedOrderId === selectedOrder.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">DATE PLACED</span>
                      <p className="text-xs font-bold text-slate-200">
                        {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* 4 Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Amount Paid</span>
                      <p className="text-base font-black text-slate-900">₹{selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Payment Status</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedOrder.paymentMethod}</p>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded inline-block mt-0.5 ${
                        selectedOrder.paymentStatus === 'Refund Pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : selectedOrder.paymentStatus === 'Refund Completed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : selectedOrder.paymentStatus === 'Cancelled'
                          ? 'bg-red-100 text-red-900 border border-red-300'
                          : 'text-emerald-700 bg-emerald-50'
                      }`}>{selectedOrder.paymentStatus}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Est. Delivery</span>
                      <p className="text-xs font-bold text-blue-700 mt-0.5">{selectedOrder.estimatedDelivery || '2-4 Days'}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">GST Credit</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">₹{selectedOrder.gstAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedOrder.paymentStatus === 'Refund Pending' && (
                    <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-950 text-xs shadow-2xs">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="font-black text-amber-950">Refund Pending — Processing within 7 Working Days</h4>
                        <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed">
                          Your order cancellation was received. As this order was paid online via <strong>{selectedOrder.paymentMethod}</strong>, your refund of <strong>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</strong> will be credited directly to your original payment account within <strong>7 working days</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedOrder.paymentStatus === 'Refund Completed' && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-3 text-emerald-950 text-xs shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-black text-emerald-950">Refund Processed & Completed</h4>
                        <p className="text-[11px] text-emerald-900 mt-0.5 leading-relaxed">
                          Your refund of <strong>₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</strong> has been successfully credited back to your original <strong>{selectedOrder.paymentMethod}</strong> payment account.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Courier & Delivery Status Tracking Section */}
                  <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-blue-200/80">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-600" />
                        <span className="font-extrabold text-blue-950 uppercase tracking-wide">Live Delivery & Dispatch Status</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
                          selectedOrder.orderStatus === 'Cancelled' ? 'bg-red-600' : 'bg-blue-600'
                        }`}>
                          {selectedOrder.orderStatus}
                        </span>
                        {selectedOrder.courierTrackingUrl && (
                          <a
                            href={selectedOrder.courierTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Live Track</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Visual 4-Step Delivery Progress Stepper */}
                    <div className="bg-white p-3 rounded-lg border border-blue-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-800">
                        <span>Delivery Stage</span>
                        <span className="text-slate-500 font-mono font-normal">
                          Est. Delivery: <strong className="text-blue-700">{selectedOrder.estimatedDelivery || '2-4 Business Days'}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center pt-1">
                        {[
                          { title: 'Order Placed', step: 1 },
                          { title: 'Processing', step: 2 },
                          { title: 'Shipped', step: 3 },
                          { title: 'Delivered', step: 4 },
                        ].map((st) => {
                          const currentStep = getOrderStatusStep(selectedOrder.orderStatus);
                          const isDone = currentStep >= st.step;
                          return (
                            <div key={st.step} className="space-y-1">
                              <div className={`h-2 rounded-full transition-all ${
                                isDone ? 'bg-blue-600' : 'bg-slate-200'
                              }`} />
                              <span className={`text-[10px] font-extrabold block ${
                                isDone ? 'text-blue-700' : 'text-slate-400'
                              }`}>
                                {st.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">Courier Partner</span>
                        <p className="font-bold text-slate-900">{selectedOrder.courierPartner || 'Express Air Courier'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase block font-bold">AWB Tracking Number</span>
                        <p className="font-mono font-bold text-blue-700">
                          {selectedOrder.trackingNumber || 'Pending Courier Scan'}
                        </p>
                      </div>
                    </div>

                    {selectedOrder.adminDispatchNotes && (
                      <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-lg border border-blue-200">
                        <strong>Dispatch Note:</strong> {selectedOrder.adminDispatchNotes}
                      </p>
                    )}
                  </div>

                  {/* Itemized Products */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase font-mono">
                      <Box className="w-3.5 h-3.5 text-blue-600" />
                      <span>Purchased Items ({selectedOrder.items.length})</span>
                    </h4>

                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="divide-y divide-slate-100">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                                <p className="text-[10px] font-mono text-slate-500">
                                  SKU: {item.sku} • Qty: <strong className="text-slate-800">{item.quantity}</strong> × ₹{item.price}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900 shrink-0">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-slate-50 p-3 border-t border-slate-200 space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal</span>
                          <span>₹{(selectedOrder.totalAmount - selectedOrder.gstAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>GST (18%)</span>
                          <span className="text-blue-700 font-bold">₹{selectedOrder.gstAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
                          <span>Total Amount</span>
                          <span className="text-blue-600">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Shipping Address</span>
                      <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.fullName}</p>
                      {selectedOrder.shippingAddress?.companyName && (
                        <p className="text-slate-700 font-semibold">{selectedOrder.shippingAddress.companyName}</p>
                      )}
                      <p className="text-slate-600 text-[11px]">
                        {selectedOrder.shippingAddress?.houseBuilding}, {selectedOrder.shippingAddress?.streetArea}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Billing Address & GST</span>
                      {selectedOrder.shippingAddress?.isBillingSame === false && selectedOrder.shippingAddress.billingAddress ? (
                        <>
                          <p className="font-bold text-slate-900">{selectedOrder.shippingAddress.billingAddress.fullName}</p>
                          {selectedOrder.shippingAddress.billingAddress.companyName && (
                            <p className="text-slate-700 font-semibold">{selectedOrder.shippingAddress.billingAddress.companyName}</p>
                          )}
                          {selectedOrder.shippingAddress.billingAddress.gstin && (
                            <p className="text-blue-700 font-mono font-bold text-[10px]">
                              GSTIN: {selectedOrder.shippingAddress.billingAddress.gstin}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-slate-800">Same as Shipping Address</p>
                          {selectedOrder.shippingAddress?.gstin && (
                            <p className="text-blue-700 font-mono font-bold text-[11px]">
                              GSTIN: {selectedOrder.shippingAddress.gstin}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ORDERS LIST VIEW */
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
                    <div className="space-y-4">
                      {filteredOrders.map((order) => {
                        const currentStep = getOrderStatusStep(order.orderStatus);
                        return (
                          <div
                            key={order.id}
                            className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 transition-all shadow-xs space-y-4 cursor-pointer"
                            onClick={() => setSelectedOrder(order)}
                          >
                            {/* Order Header Summary */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs font-mono">
                              <div className="flex items-center gap-2">
                                <div>
                                  <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">ORDER ID</span>
                                  <div className="flex items-center gap-1.5 font-extrabold text-blue-600">
                                    <span>#{order.id}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyOrderId(order.id);
                                      }}
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
                                <span className={`font-bold ${
                                  order.paymentStatus === 'Cancelled' || order.paymentStatus === 'Refund Pending' ? 'text-red-700' : 'text-slate-700'
                                }`}>
                                  {order.paymentMethod} ({order.paymentStatus})
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">TOTAL AMOUNT</span>
                                <span className="font-extrabold text-slate-900 text-sm">₹{order.totalAmount.toLocaleString()}</span>
                              </div>

                              <div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                                  order.orderStatus === 'Cancelled'
                                    ? 'bg-red-50 text-red-800 border-red-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                }`}>
                                  {order.orderStatus}
                                </span>
                              </div>
                            </div>

                            {/* Purchased Line Items */}
                            <div className="space-y-2 pt-1">
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

                            {/* Footer Action Buttons */}
                            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                              <div className="text-[11px] text-slate-500">
                                GST Included: <span className="font-mono font-bold text-slate-800">₹{order.gstAmount.toLocaleString()}</span>
                              </div>

                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {canCancelOrder(order.orderStatus) && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOrderToCancel(order);
                                      setCancelReason('Ordered by mistake');
                                    }}
                                    className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
                                  >
                                    <Ban className="w-3.5 h-3.5 text-red-600" />
                                    <span>Cancel Order</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1.5 text-xs hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                                >
                                  <span>View Order Specification & Invoice</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
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
                            placeholder="Rahul Sharma"
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
                          <label className="block font-bold text-slate-700 mb-1">GSTIN Number (Optional - for GST Tax Credit)</label>
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
                                placeholder="Veda Technologies Headquarters"
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

      {/* Cancellation Confirmation Modal Overlay */}
      {orderToCancel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-2xl bg-red-50 border border-red-200 shrink-0">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Cancel Order #{orderToCancel.id}?</h3>
                <p className="text-xs text-slate-500 font-mono font-bold">Total Amount: ₹{orderToCancel.totalAmount.toLocaleString()}</p>
              </div>
            </div>

            {orderToCancel.paymentMethod !== 'COD' ? (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 leading-relaxed space-y-1">
                <p className="font-black text-amber-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Online Payment Refund Notice</span>
                </p>
                <p className="text-[11px] text-amber-900">
                  As this order was paid via <strong>{orderToCancel.paymentMethod}</strong>, your full refund of <strong>₹{orderToCancel.totalAmount.toLocaleString('en-IN')}</strong> will be done within <strong>7 working days</strong>. The status will update to <strong>Refund Pending</strong> upon cancellation.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to cancel this Cash on Delivery order? Once cancelled, dispatch will be halted.
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block font-mono">Cancellation Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-red-500"
              >
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Found lower price elsewhere">Found lower price elsewhere</option>
                <option value="Incorrect shipping address selected">Incorrect shipping address selected</option>
                <option value="Change of project requirement">Change of project requirement</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelOrder}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
