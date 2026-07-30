import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, ArrowRight, CheckCircle2, Truck, ShieldCheck, MapPin, 
  CreditCard, Plus, Check, AlertCircle, Building, Phone, User, FileText, 
  QrCode, ArrowLeft, Download, Printer, Tag
} from 'lucide-react';
import { CartItem, UserAddress, UserOrder, UserProfile } from '../types';
import { 
  getStoredUserAddresses, 
  saveStoredUserAddress, 
  deleteStoredUserAddress, 
  saveStoredUserOrder 
} from '../services/dataStorage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  userProfile: UserProfile;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (orderedCart: CartItem[], order: UserOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  userProfile,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}) => {
  // Step 1: Review Items | Step 2: Address Selection | Step 3: Payment | Step 4: Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Address State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Address Form Fields
  const [addressFormData, setAddressFormData] = useState({
    fullName: userProfile.name || '',
    phone: userProfile.phone || '',
    companyName: userProfile.company || '',
    gstin: userProfile.gstin || '',
    pincode: '',
    houseBuilding: '',
    streetArea: '',
    landmark: '',
    city: 'Vadodara',
    state: 'Gujarat',
    addressType: 'Home' as 'Home' | 'Work' | 'Factory / R&D Lab' | 'Other',
    isDefault: true,
    isBillingSame: true,
    billFullName: '',
    billPhone: '',
    billCompanyName: '',
    billGstin: '',
    billHouseBuilding: '',
    billStreetArea: '',
    billLandmark: '',
    billCity: 'Vadodara',
    billState: 'Gujarat',
    billPincode: '',
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'COD' | 'GST_PO'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(userProfile.name || '');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [gstNumber, setGstNumber] = useState('');

  // Processing & Placed Order
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<UserOrder | null>(null);
  const [validationError, setValidationError] = useState('');

  // Auto-detect City and State from PIN Code helper
  const handlePincodeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setAddressFormData((prev) => ({ ...prev, pincode: clean }));
    
    // Quick pincode lookup heuristic for Gujarat/India
    if (clean.length === 6) {
      if (clean.startsWith('390')) {
        setAddressFormData((prev) => ({ ...prev, city: 'Vadodara', state: 'Gujarat' }));
      } else if (clean.startsWith('380')) {
        setAddressFormData((prev) => ({ ...prev, city: 'Ahmedabad', state: 'Gujarat' }));
      } else if (clean.startsWith('395')) {
        setAddressFormData((prev) => ({ ...prev, city: 'Surat', state: 'Gujarat' }));
      } else if (clean.startsWith('360')) {
        setAddressFormData((prev) => ({ ...prev, city: 'Rajkot', state: 'Gujarat' }));
      } else if (clean.startsWith('400')) {
        setAddressFormData((prev) => ({ ...prev, city: 'Mumbai', state: 'Maharashtra' }));
      } else if (clean.startsWith('560')) {
        setAddressFormData((prev) => ({ ...prev, city: 'Bengaluru', state: 'Karnataka' }));
      } else if (clean.startsWith('110')) {
        setAddressFormData((prev) => ({ ...prev, city: 'New Delhi', state: 'Delhi' }));
      }
    }
  };

  // Load user addresses on open
  useEffect(() => {
    if (isOpen && userProfile?.id) {
      const loaded = getStoredUserAddresses(userProfile.id);
      setAddresses(loaded);
      
      if (loaded.length > 0) {
        const defaultAddr = loaded.find((a) => a.isDefault) || loaded[0];
        setSelectedAddressId(defaultAddr.id);
        setShowAddressForm(false);
      } else {
        setShowAddressForm(true);
      }

      setAddressFormData({
        fullName: userProfile.name || '',
        phone: userProfile.phone || '',
        pincode: '',
        houseBuilding: '',
        streetArea: '',
        landmark: '',
        city: 'Vadodara',
        state: 'Gujarat',
        addressType: 'Home',
        isDefault: loaded.length === 0,
      });

      setStep(1);
      setValidationError('');
      setPlacedOrder(null);
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  // Cart financial calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 1500 || subtotal === 0 ? 0 : 99;
  const gstAmount = Math.round(subtotal * 0.18); // 18% GST (inclusive representation)
  const grandTotal = subtotal + shippingFee;

  // Save new or edited address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!addressFormData.fullName || !addressFormData.phone || !addressFormData.pincode || !addressFormData.houseBuilding || !addressFormData.streetArea || !addressFormData.city) {
      setValidationError('Please complete all required address fields.');
      return;
    }

    if (addressFormData.pincode.length !== 6) {
      setValidationError('Please enter a valid 6-digit PIN code.');
      return;
    }

    let separateBilling = undefined;
    if (!addressFormData.isBillingSame) {
      if (!addressFormData.billFullName || !addressFormData.billPhone || !addressFormData.billHouseBuilding || !addressFormData.billStreetArea || !addressFormData.billCity || !addressFormData.billPincode) {
        setValidationError('Please complete all required fields for the Separate Billing Address.');
        return;
      }
      separateBilling = {
        fullName: addressFormData.billFullName.trim(),
        phone: addressFormData.billPhone.trim(),
        companyName: addressFormData.billCompanyName.trim() || undefined,
        gstin: addressFormData.billGstin.trim() || undefined,
        houseBuilding: addressFormData.billHouseBuilding.trim(),
        streetArea: addressFormData.billStreetArea.trim(),
        landmark: addressFormData.billLandmark.trim() || undefined,
        city: addressFormData.billCity.trim(),
        state: addressFormData.billState.trim(),
        pincode: addressFormData.billPincode.trim(),
      };
    }

    const newAddr: UserAddress = {
      id: editingAddressId || `addr_${Date.now()}`,
      userId: userProfile.id,
      fullName: addressFormData.fullName.trim(),
      phone: addressFormData.phone.trim(),
      companyName: addressFormData.companyName.trim() || undefined,
      gstin: addressFormData.gstin.trim() || undefined,
      pincode: addressFormData.pincode.trim(),
      houseBuilding: addressFormData.houseBuilding.trim(),
      streetArea: addressFormData.streetArea.trim(),
      landmark: addressFormData.landmark.trim() || undefined,
      city: addressFormData.city.trim(),
      state: addressFormData.state.trim(),
      addressType: addressFormData.addressType,
      isDefault: addressFormData.isDefault || addresses.length === 0,
      isBillingSame: addressFormData.isBillingSame,
      billingAddress: separateBilling,
    };

    const updatedList = saveStoredUserAddress(newAddr);
    setAddresses(updatedList);
    setSelectedAddressId(newAddr.id);
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  const handleEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddressFormData({
      fullName: addr.fullName,
      phone: addr.phone,
      companyName: addr.companyName || '',
      gstin: addr.gstin || '',
      pincode: addr.pincode,
      houseBuilding: addr.houseBuilding,
      streetArea: addr.streetArea,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      addressType: addr.addressType,
      isDefault: addr.isDefault || false,
      isBillingSame: addr.isBillingSame !== false,
      billFullName: addr.billingAddress?.fullName || '',
      billPhone: addr.billingAddress?.phone || '',
      billCompanyName: addr.billingAddress?.companyName || '',
      billGstin: addr.billingAddress?.gstin || '',
      billHouseBuilding: addr.billingAddress?.houseBuilding || '',
      billStreetArea: addr.billingAddress?.streetArea || '',
      billLandmark: addr.billingAddress?.landmark || '',
      billCity: addr.billingAddress?.city || 'Vadodara',
      billState: addr.billingAddress?.state || 'Gujarat',
      billPincode: addr.billingAddress?.pincode || '',
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (addrId: string) => {
    const updated = deleteStoredUserAddress(userProfile.id, addrId);
    setAddresses(updated);
    if (selectedAddressId === addrId) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
    }
    if (updated.length === 0) {
      setShowAddressForm(true);
    }
  };

  // Step Navigations
  const handleProceedToAddress = () => {
    if (cart.length === 0) {
      setValidationError('Your component basket is empty.');
      return;
    }
    setValidationError('');
    setStep(2);
  };

  const handleProceedToPayment = () => {
    setValidationError('');
    if (showAddressForm) {
      setValidationError('Please save your delivery address first to continue.');
      return;
    }
    if (!selectedAddressId) {
      setValidationError('Please select or add a delivery address.');
      return;
    }
    setStep(3);
  };

  // Place Final Order
  const handlePlaceOrder = () => {
    setValidationError('');

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddr) {
      setValidationError('Delivery address not selected. Please go back to Step 2.');
      setStep(2);
      return;
    }

    if (paymentMethod === 'UPI' && !upiId.trim()) {
      setUpiId(`${userProfile.email.split('@')[0]}@upi`);
    }

    setIsProcessing(true);

    // Simulate 1.2s gateway processing
    setTimeout(() => {
      const orderId = `OV-ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const estDeliveryDate = new Date();
      estDeliveryDate.setDate(estDeliveryDate.getDate() + 3);

      const newOrder: UserOrder = {
        id: orderId,
        userId: userProfile.id,
        userEmail: userProfile.email,
        userName: selectedAddr.fullName,
        userPhone: selectedAddr.phone,
        items: cart.map((c) => ({
          productId: c.product.id,
          productName: c.product.name,
          sku: c.product.sku,
          image: c.product.image,
          price: c.product.price,
          quantity: c.quantity,
        })),
        subtotal,
        shippingFee,
        gstAmount,
        totalAmount: grandTotal,
        shippingAddress: selectedAddr,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'COD_CONFIRMED' : 'PAID',
        orderStatus: 'Processing',
        trackingNumber: `DTDC-OV${Math.floor(1000000 + Math.random() * 9000000)}`,
        createdAt: new Date().toISOString(),
        estimatedDelivery: estDeliveryDate.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };

      // Save order to store and trigger callbacks
      saveStoredUserOrder(newOrder);
      setPlacedOrder(newOrder);
      setIsProcessing(false);
      onOrderPlaced(cart, newOrder);
      setStep(4);
    }, 1200);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Step Indicator */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-mono">
                  Order Checkout
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                  {userProfile.name} ({userProfile.email})
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {step === 1 && '1. Component Basket Review'}
                {step === 2 && '2. Delivery Address Selection'}
                {step === 3 && '3. Payment & Order Confirmation'}
                {step === 4 && 'Order Placed Successfully!'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            title="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Stepper Bar */}
        {step < 4 && (
          <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-600 shrink-0">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-blue-600 font-extrabold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                1
              </span>
              <span>Cart Items</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-slate-300">
              <div className={`h-full bg-blue-600 transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-blue-600 font-extrabold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                2
              </span>
              <span>Delivery Address</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-slate-300">
              <div className={`h-full bg-blue-600 transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-blue-600 font-extrabold' : ''}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>
                3
              </span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ================= STEP 1: CART REVIEW ================= */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Selected Components ({cart.reduce((a, c) => a + c.quantity, 0)} items)</span>
                <span className="text-slate-500 font-normal">All hardware tested & quality verified</span>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">Your basket is empty</p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
                  >
                    Browse Electronics Store
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5 relative"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                        <p className="text-[10px] font-mono text-slate-500">
                          SKU: {item.product.sku} | In Stock ({item.product.stock} units)
                        </p>
                        <div className="text-xs font-extrabold text-blue-600">
                          ₹{item.product.price.toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-slate-500">each</span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shrink-0">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-slate-900 px-2 font-mono">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right font-mono text-xs font-extrabold text-slate-900 w-20 shrink-0">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Breakdown Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Component Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>GST (18% Goods & Services Tax)</span>
                  <span className="font-mono font-bold text-slate-800">₹{gstAmount.toLocaleString()} (Included)</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Standard Express Shipping</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[10px] text-slate-500 font-normal">
                    Add ₹{(1500 - subtotal).toLocaleString()} more for FREE Express Shipping!
                  </p>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Payable Amount</span>
                  <span className="text-blue-600 font-mono text-base">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: ADDRESS SELECTION / ENTRY ================= */}
          {step === 2 && (
            <div className="space-y-4">
              {!showAddressForm ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                      Saved Delivery Addresses ({addresses.length})
                    </h4>
                    <button
                      onClick={() => {
                        setEditingAddressId(null);
                        setAddressFormData({
                          fullName: userProfile.name || '',
                          phone: userProfile.phone || '',
                          pincode: '',
                          houseBuilding: '',
                          streetArea: '',
                          landmark: '',
                          city: 'Vadodara',
                          state: 'Gujarat',
                          addressType: 'Home',
                          isDefault: false,
                        });
                        setShowAddressForm(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {addresses.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
                      <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">No saved address found</p>
                      <p className="text-[11px] text-slate-500">Please add a shipping address to proceed with checkout.</p>
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm"
                      >
                        Add Shipping Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative flex items-start gap-3.5 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="selected_address"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 accent-blue-600"
                            />

                            <div className="flex-1 space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900">{addr.fullName}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                                  {addr.addressType}
                                </span>
                                {addr.isDefault && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700">
                                    DEFAULT
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-700 font-medium leading-relaxed">
                                {addr.houseBuilding}, {addr.streetArea}
                                {addr.landmark ? `, Near ${addr.landmark}` : ''}
                              </p>

                              <p className="text-slate-900 font-bold">
                                {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                              </p>

                              <p className="text-[11px] text-slate-500 font-mono">
                                Mobile: <span className="font-semibold text-slate-800">{addr.phone}</span>
                              </p>
                            </div>

                            <div className="flex flex-col gap-1.5 shrink-0 text-[11px]">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAddress(addr);
                                }}
                                className="text-blue-600 hover:underline font-bold"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(addr.id);
                                }}
                                className="text-rose-600 hover:underline font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Address Form */
                <form onSubmit={handleSaveAddress} className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
                    </h4>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddressId(null);
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={addressFormData.fullName}
                        onChange={(e) => setAddressFormData({ ...addressFormData, fullName: e.target.value })}
                        placeholder="Rahul Sharma"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={addressFormData.phone}
                        onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Company / Organization Name (Optional)</label>
                      <input
                        type="text"
                        value={addressFormData.companyName}
                        onChange={(e) => setAddressFormData({ ...addressFormData, companyName: e.target.value })}
                        placeholder="Veda Robotics Pvt Ltd"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">GSTIN Number (Optional - for Tax Credit)</label>
                      <input
                        type="text"
                        value={addressFormData.gstin}
                        onChange={(e) => setAddressFormData({ ...addressFormData, gstin: e.target.value.toUpperCase() })}
                        placeholder="24AAAAA0000A1Z5"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 font-mono uppercase focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">PIN Code (6 digits) *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={addressFormData.pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="390001"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">City / Town *</label>
                      <input
                        type="text"
                        required
                        value={addressFormData.city}
                        onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                        placeholder="Vadodara"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={addressFormData.state}
                        onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                        placeholder="Gujarat"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Flat, House No., Building, Company / Office *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressFormData.houseBuilding}
                      onChange={(e) => setAddressFormData({ ...addressFormData, houseBuilding: e.target.value })}
                      placeholder="Flat 402, Block B, Silver Crest Heights"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Area, Street, Sector, Village *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressFormData.streetArea}
                      onChange={(e) => setAddressFormData({ ...addressFormData, streetArea: e.target.value })}
                      placeholder="Near Electronics Zone, Alkapuri"
                      className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Landmark (Optional)</label>
                      <input
                        type="text"
                        value={addressFormData.landmark}
                        onChange={(e) => setAddressFormData({ ...addressFormData, landmark: e.target.value })}
                        placeholder="Behind Water Tank"
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Address Type</label>
                      <div className="flex gap-2">
                        {(['Home', 'Work', 'Factory / R&D Lab', 'Other'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAddressFormData({ ...addressFormData, addressType: type })}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                              addressFormData.addressType === type
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={addressFormData.isDefault}
                        onChange={(e) => setAddressFormData({ ...addressFormData, isDefault: e.target.checked })}
                        className="accent-blue-600 rounded"
                      />
                      <span>Set as my default shipping address</span>
                    </label>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                    >
                      Save & Deliver Here
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= STEP 3: PAYMENT METHOD & REVIEW ================= */}
          {step === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Payment Method Selection */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider font-mono">
                  Select Payment Option
                </h4>

                <div className="space-y-2.5">
                  {/* UPI Option */}
                  <div
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'UPI' ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'UPI'}
                          onChange={() => setPaymentMethod('UPI')}
                          className="accent-blue-600"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                            <span>UPI / Instant QR Payment</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                              RECOMMENDED
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM, Cred</p>
                        </div>
                      </div>
                      <QrCode className="w-5 h-5 text-blue-600 shrink-0" />
                    </div>

                    {paymentMethod === 'UPI' && (
                      <div className="mt-3 pt-3 border-t border-blue-100 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-700">Enter VPA / UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobileNumber@ybl / name@okaxis"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'CARD' ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={paymentMethod === 'CARD'}
                          onChange={() => setPaymentMethod('CARD')}
                          className="accent-blue-600"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">Credit / Debit Card</p>
                          <p className="text-[11px] text-slate-500">Visa, MasterCard, RuPay, Maestro</p>
                        </div>
                      </div>
                      <CreditCard className="w-5 h-5 text-slate-600 shrink-0" />
                    </div>

                    {paymentMethod === 'CARD' && (
                      <div className="mt-3 pt-3 border-t border-blue-100 space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700">Card Number</label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="4532 •••• •••• 8812"
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="08/28"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700">CVV / CVC</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value)}
                              placeholder="•••"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Net Banking */}
                  <div
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'NET_BANKING' ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'NET_BANKING'}
                        onChange={() => setPaymentMethod('NET_BANKING')}
                        className="accent-blue-600"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Net Banking</p>
                        <p className="text-[11px] text-slate-500">HDFC, ICICI, SBI, Axis, Kotak Bank</p>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'COD' ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="accent-blue-600"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-slate-500">Pay cash/UPI directly to courier upon delivery</p>
                      </div>
                    </div>
                  </div>

                  {/* B2B GST Invoice PO */}
                  <div
                    onClick={() => setPaymentMethod('GST_PO')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'GST_PO' ? 'border-blue-600 bg-blue-50/40' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'GST_PO'}
                        onChange={() => setPaymentMethod('GST_PO')}
                        className="accent-blue-600"
                      />
                      <div>
                        <p className="text-xs font-extrabold text-slate-900">B2B Corporate Purchase Order (GST Tax Credit)</p>
                        <p className="text-[11px] text-slate-500">Receive tax invoice for input credit claim</p>
                      </div>
                    </div>

                    {paymentMethod === 'GST_PO' && (
                      <div className="mt-3 pt-3 border-t border-blue-100 space-y-2">
                        <label className="block text-[10px] font-bold text-slate-700">Company GSTIN (Optional)</label>
                        <input
                          type="text"
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                          placeholder="24AAAAA0000A1Z5"
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono uppercase"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary & Selected Shipping Address */}
              <div className="lg:col-span-5 space-y-4">
                {/* Delivery Address Summary Card */}
                {(() => {
                  const activeAddr = addresses.find((a) => a.id === selectedAddressId);
                  return (
                    activeAddr && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 uppercase font-mono">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>Shipping To</span>
                          </span>
                          <button
                            onClick={() => setStep(2)}
                            className="text-blue-600 hover:underline capitalize"
                          >
                            Change
                          </button>
                        </div>
                        <p className="font-bold text-slate-900">{activeAddr.fullName}</p>
                        <p className="text-slate-600 text-[11px]">
                          {activeAddr.houseBuilding}, {activeAddr.streetArea}, {activeAddr.city} - {activeAddr.pincode}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500">Ph: {activeAddr.phone}</p>
                      </div>
                    )
                  );
                })()}

                {/* Amount Summary */}
                <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 shadow-lg">
                  <h5 className="text-xs font-extrabold text-slate-300 uppercase font-mono">Order Final Summary</h5>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span>Items ({cart.length})</span>
                      <span className="font-mono font-bold text-white">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18% Tax)</span>
                      <span className="font-mono font-bold text-slate-300">₹{gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-extrabold text-white">
                      <span>Grand Total</span>
                      <span className="text-blue-400 font-mono">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing Payment & Order...</span>
                      </span>
                    ) : (
                      <>
                        <span>{paymentMethod === 'COD' ? 'Confirm Order (Cash on Delivery)' : `Pay & Place Order ₹${grandTotal.toLocaleString()}`}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-Bit SSL Encrypted Payment Protocol</span>
                </div>
              </div>

            </div>
          )}

          {/* ================= STEP 4: ORDER CONFIRMATION & RECEIPT ================= */}
          {step === 4 && placedOrder && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold font-mono text-emerald-700 uppercase bg-emerald-100 px-2.5 py-1 rounded-full">
                  Order Verified & Confirmed
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">Thank You For Your Order!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your order <span className="font-mono font-bold text-blue-600">#{placedOrder.id}</span> has been received and sent for dispatch at our Vadodara warehouse.
                </p>
              </div>

              {/* Order Info Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left text-xs space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-slate-200 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block">ORDER ID</span>
                    <span className="font-extrabold text-slate-900">{placedOrder.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ESTIMATED DELIVERY</span>
                    <span className="font-extrabold text-emerald-600">{placedOrder.estimatedDelivery}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">PAYMENT STATUS</span>
                    <span className="font-bold text-slate-800">{placedOrder.paymentStatus} ({placedOrder.paymentMethod})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">COURIER TRACKING</span>
                    <span className="font-bold text-blue-600">{placedOrder.trackingNumber}</span>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 mb-2">Itemized Components</h5>
                  <div className="space-y-2">
                    {placedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <img src={it.image} alt={it.productName} className="w-8 h-8 rounded object-cover border" />
                          <div>
                            <p className="font-bold text-slate-900">{it.productName}</p>
                            <p className="text-[10px] font-mono text-slate-500">Qty: {it.quantity} × ₹{it.price}</p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">₹{(it.price * it.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-extrabold text-slate-900">
                  <span>Total Amount Paid</span>
                  <span className="text-blue-600 font-mono text-base">₹{placedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Receipt Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>Print GST Tax Invoice</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls (Steps 1 to 3) */}
        {step < 4 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep((step - 1) as any)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <button
                onClick={handleProceedToAddress}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-extrabold text-white shadow-md flex items-center gap-2"
              >
                <span>Select Shipping Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleProceedToPayment}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-extrabold text-white shadow-md flex items-center gap-2"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
