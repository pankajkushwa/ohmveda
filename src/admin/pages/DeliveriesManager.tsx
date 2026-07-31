import React, { useState, useEffect } from 'react';
import { 
  Truck, Search, Package, MapPin, Calendar, CreditCard, 
  User, CheckCircle2, Clock, ExternalLink, 
  FileText, RefreshCw, Send, Building2, Receipt, Filter,
  ArrowLeft, Printer, Copy, Check, ChevronRight,
  Sparkles, Tag, ShieldCheck, Box, Phone, Mail
} from 'lucide-react';
import { UserOrder } from '../../types';
import { getStoredUserOrders, updateStoredUserOrder } from '../../services/dataStorage';

interface DeliveriesManagerProps {
  showToast: (text: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm?: (title: string, message: string, onConfirm: () => void) => void;
}

export const DeliveriesManager: React.FC<DeliveriesManagerProps> = ({
  showToast,
}) => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  // Edit dispatch form state
  const [editStatus, setEditStatus] = useState<UserOrder['orderStatus']>('Processing');
  const [editPaymentStatus, setEditPaymentStatus] = useState<UserOrder['paymentStatus']>('PAID');
  const [editCourierPartner, setEditCourierPartner] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editTrackingUrl, setEditTrackingUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState('');

  // Copy state indicator
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Load orders from data store
  const loadOrders = () => {
    const fetched = getStoredUserOrders();
    setOrders(fetched);
    // If selected order is active, update its state from fresh storage
    if (selectedOrder) {
      const match = fetched.find((o) => o.id === selectedOrder.id);
      if (match) {
        setSelectedOrder(match);
      }
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // When selected order changes, initialize dispatch edit form
  useEffect(() => {
    if (selectedOrder) {
      setEditStatus(selectedOrder.orderStatus || 'Processing');
      setEditPaymentStatus(selectedOrder.paymentStatus || 'PAID');
      setEditCourierPartner(selectedOrder.courierPartner || 'BlueDart Express');
      setEditTrackingNumber(selectedOrder.trackingNumber || '');
      setEditTrackingUrl(selectedOrder.courierTrackingUrl || '');
      setEditNotes(selectedOrder.adminDispatchNotes || '');
      setEditEstimatedDelivery(selectedOrder.estimatedDelivery || '2-4 Business Days');
    }
  }, [selectedOrder]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrderId(text);
    showToast(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleSaveDispatchForSelected = () => {
    if (!selectedOrder) return;

    const updatedOrder: UserOrder = {
      ...selectedOrder,
      orderStatus: editStatus,
      paymentStatus: editPaymentStatus,
      courierPartner: editCourierPartner.trim() || undefined,
      trackingNumber: editTrackingNumber.trim() || undefined,
      courierTrackingUrl: editTrackingUrl.trim() || undefined,
      adminDispatchNotes: editNotes.trim() || undefined,
      estimatedDelivery: editEstimatedDelivery.trim() || selectedOrder.estimatedDelivery || '2-4 Business Days',
    };

    const updatedList = updateStoredUserOrder(updatedOrder);
    setOrders(updatedList);
    setSelectedOrder(updatedOrder);
    showToast(`Order #${selectedOrder.id} status & refund status updated!`, 'success');
  };

  const handleMarkRefundCompleted = (order: UserOrder) => {
    const updatedOrder: UserOrder = {
      ...order,
      paymentStatus: 'Refund Completed',
      adminDispatchNotes: `Refund completed on ${new Date().toLocaleDateString('en-IN')}. ${order.adminDispatchNotes || ''}`,
    };
    const updatedList = updateStoredUserOrder(updatedOrder);
    setOrders(updatedList);
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(updatedOrder);
      setEditPaymentStatus('Refund Completed');
    }
    showToast(`Refund for Order #${order.id} marked as Completed!`, 'success');
  };

  const handleQuickStatusUpdate = (order: UserOrder, newStatus: UserOrder['orderStatus']) => {
    const updatedOrder: UserOrder = {
      ...order,
      orderStatus: newStatus,
    };
    const updatedList = updateStoredUserOrder(updatedOrder);
    setOrders(updatedList);
    if (selectedOrder && selectedOrder.id === order.id) {
      setSelectedOrder(updatedOrder);
    }
    showToast(`Order #${order.id} status changed to '${newStatus}'`, 'success');
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const itemNames = (order.items || [])
      .map((i) => (i.productName || i.name || '').toLowerCase())
      .join(' ');

    const matchesQuery = 
      order.id.toLowerCase().includes(query) ||
      order.userName.toLowerCase().includes(query) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(query)) ||
      (order.userPhone && order.userPhone.includes(query)) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(query)) ||
      (order.shippingAddress?.companyName && order.shippingAddress.companyName.toLowerCase().includes(query)) ||
      itemNames.includes(query);

    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;

    return matchesQuery && matchesStatus;
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const processingCount = orders.filter((o) => o.orderStatus === 'Processing').length;
  const shippedCount = orders.filter((o) => o.orderStatus === 'Shipped').length;
  const outForDeliveryCount = orders.filter((o) => o.orderStatus === 'Out for Delivery').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'Delivered').length;

  const getStatusBadgeClass = (status: UserOrder['orderStatus']) => {
    switch (status) {
      case 'Processing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Out for Delivery':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Printable Tax Invoice Action
  const handlePrintInvoice = () => {
    window.print();
  };

  // -------------------------------------------------------------
  // DEDICATED FULL PAGE DETAILS VIEW FOR A SELECTED ORDER
  // -------------------------------------------------------------
  if (selectedOrder) {
    const shipping = selectedOrder.shippingAddress;
    const subtotal = selectedOrder.subtotal || selectedOrder.totalAmount * 0.82;
    const gst = selectedOrder.gstAmount || selectedOrder.totalAmount * 0.18;
    const shippingFee = selectedOrder.shippingFee || 0;

    return (
      <div className="space-y-6 pb-12 animate-fadeIn">
        {/* Top Sticky Header Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Orders List</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-blue-600 font-mono tracking-wider">
                  ORDER FULL SPECIFICATION & INVOICE
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                <span>Order #{selectedOrder.id}</span>
                <button
                  onClick={() => handleCopy(selectedOrder.id, 'Order ID')}
                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title="Copy Order ID"
                >
                  {copiedOrderId === selectedOrder.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={handlePrintInvoice}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>Print Tax Invoice</span>
            </button>

            <button
              onClick={loadOrders}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Executive Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Order Placed On</span>
            <p className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Grand Total Paid</span>
            <p className="text-sm font-black text-emerald-600 font-mono mt-1">
              ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Payment Mode & Status</span>
            <p className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1.5 flex-wrap">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>{selectedOrder.paymentMethod}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                selectedOrder.paymentStatus === 'Refund Pending'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : selectedOrder.paymentStatus === 'Refund Completed'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                  : selectedOrder.paymentStatus === 'Cancelled'
                  ? 'bg-rose-100 text-rose-900 border-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {selectedOrder.paymentStatus}
              </span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Est. Delivery</span>
            <p className="text-xs font-black text-slate-900 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{selectedOrder.estimatedDelivery || '3-5 Business Days'}</span>
            </p>
          </div>
        </div>

        {/* Main Content Workspace: Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns (2 cols): Product Line Items & Financial Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PRODUCT LINE ITEMS TABLE (STORE STYLE DETAIL) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-400" />
                  <h3 className="font-extrabold text-sm tracking-tight">
                    Ordered Store Components & Products ({selectedOrder.items.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Verified Inventory Line Items
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedOrder.items.map((item, idx) => {
                  const productName = item.productName || item.name || 'Component';
                  const itemPrice = item.price || 0;
                  const qty = item.quantity || 1;
                  const itemTotal = itemPrice * qty;

                  return (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={productName} 
                            className="w-14 h-14 object-cover rounded-xl border border-slate-200 bg-white shrink-0 shadow-2xs" 
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <Box className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="min-w-0 space-y-1">
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {productName}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-mono">
                            {item.sku && (
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                                SKU: {item.sku}
                              </span>
                            )}
                            {item.productId && (
                              <span className="text-slate-400 text-[10px]">
                                ID: {item.productId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 self-end sm:self-auto text-xs shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">UNIT PRICE</span>
                          <span className="font-mono font-bold text-slate-800">₹{itemPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-center bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-bold font-mono">
                          <span className="text-[10px] font-mono text-slate-400 block">QTY</span>
                          <span className="text-slate-900">{qty}</span>
                        </div>
                        <div className="text-right min-w-[90px]">
                          <span className="text-[10px] font-mono text-slate-400 font-bold block">ITEM TOTAL</span>
                          <span className="font-mono font-black text-slate-900 text-sm">₹{itemTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation Summary */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Components Base Price</span>
                  <span className="font-mono font-bold">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>GST (Estimated 18% Input Tax)</span>
                  <span className="font-mono font-bold">₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Shipping & Secure Courier Logistics</span>
                  <span className="font-mono font-bold">{shippingFee === 0 ? <strong className="text-emerald-600 uppercase font-sans">FREE SHIPPING</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total (Incl. Taxes)</span>
                  <span className="font-mono text-base text-blue-700">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* CUSTOMER & SHIPPING ADDRESS CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase font-mono tracking-wider">
                  Customer & Shipping Destination
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 block">
                    Contact Information
                  </span>
                  <p className="font-black text-sm text-slate-900">{selectedOrder.userName}</p>
                  <p className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedOrder.userEmail || 'N/A'}</span>
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5 font-mono font-bold">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedOrder.userPhone || 'N/A'}</span>
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-black uppercase text-slate-400 block">
                    Delivery Address Details
                  </span>
                  <p className="font-bold text-slate-900">{shipping?.fullName || selectedOrder.userName}</p>
                  {shipping?.companyName && (
                    <p className="text-blue-700 font-bold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>{shipping.companyName}</span>
                    </p>
                  )}
                  <p className="text-slate-700 leading-relaxed">
                    {shipping?.houseBuilding}, {shipping?.streetArea}
                    {shipping?.landmark ? `, Near ${shipping.landmark}` : ''}, {shipping?.city}, {shipping?.state} - <strong className="font-mono text-slate-900 font-black">{shipping?.pincode}</strong>
                  </p>
                  {shipping?.gstin && (
                    <div className="pt-2 border-t border-slate-200/80 font-mono text-blue-800 font-bold flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-600" />
                      <span>GSTIN: {shipping.gstin}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (1 col): Dispatch Control & Courier Tracking Manager */}
          <div className="space-y-6">
            
            {/* DISPATCH CONTROL FORM */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase font-mono tracking-wider">
                    Courier Dispatch Control
                  </h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${getStatusBadgeClass(editStatus)}`}>
                  {editStatus}
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserOrder['orderStatus'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Processing">Processing (In Packing)</option>
                    <option value="Shipped">Shipped (In Transit)</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono">
                      Payment & Refund Status
                    </label>
                    {editPaymentStatus === 'Refund Pending' && (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Refund Pending
                      </span>
                    )}
                  </div>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value as UserOrder['paymentStatus'])}
                    className={`w-full border rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none cursor-pointer ${
                      editPaymentStatus === 'Refund Pending'
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : editPaymentStatus === 'Refund Completed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="COD_CONFIRMED">COD_CONFIRMED</option>
                    <option value="Refund Pending">Refund Pending (7 Working Days)</option>
                    <option value="Refund Completed">Refund Completed (Processed)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  {editPaymentStatus === 'Refund Pending' && (
                    <button
                      type="button"
                      onClick={() => handleMarkRefundCompleted(selectedOrder)}
                      className="mt-2 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Refund as Completed</span>
                    </button>
                  )}

                  {selectedOrder.paymentMethod === 'COD' && (selectedOrder.orderStatus === 'Cancelled' || editStatus === 'Cancelled') && (
                    <div className="mt-2 p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium">
                      <span className="font-bold text-slate-900 block">No refund due to COD order</span>
                      No upfront online payment was collected for this Cash on Delivery order.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    placeholder="BlueDart / DTDC / Delhivery / Fedex"
                    value={editCourierPartner}
                    onChange={(e) => setEditCourierPartner(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Airway Bill / AWB Tracking No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BLUEDART789456123"
                    value={editTrackingNumber}
                    onChange={(e) => setEditTrackingNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Live Tracking Web Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.bluedart.com/tracking..."
                    value={editTrackingUrl}
                    onChange={(e) => setEditTrackingUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Estimated Delivery Date / Timeline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 05 Aug 2026 or 2-4 Business Days"
                    value={editEstimatedDelivery}
                    onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase font-mono mb-1">
                    Warehouse Dispatch Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Packed in anti-static ESD foam. Dispatched via Air Express..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveDispatchForSelected}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Update & Notify Customer</span>
                </button>
              </div>

              {selectedOrder.courierTrackingUrl && (
                <div className="pt-2 border-t border-slate-100">
                  <a
                    href={selectedOrder.courierTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Open Live Courier Tracking</span>
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  </a>
                </div>
              )}
            </div>

            {/* TIMELINE STATUS STAGE INDICATOR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <span className="text-[10px] font-mono font-black uppercase text-slate-400 block">
                Order Fulfillment Stage
              </span>

              <div className="space-y-3 pl-2 border-l-2 border-slate-200 relative">
                {[
                  { title: 'Order Placed & Received', desc: 'Payment verified successfully', done: true },
                  { title: 'Processing & Assembly', desc: 'Warehouse component testing', done: true },
                  { title: 'Shipped / In Transit', desc: selectedOrder.courierPartner ? `Handed over to ${selectedOrder.courierPartner}` : 'Awaiting courier pickup', done: selectedOrder.orderStatus === 'Shipped' || selectedOrder.orderStatus === 'Out for Delivery' || selectedOrder.orderStatus === 'Delivered' },
                  { title: 'Out for Delivery', desc: 'Local hub final mile delivery', done: selectedOrder.orderStatus === 'Out for Delivery' || selectedOrder.orderStatus === 'Delivered' },
                  { title: 'Delivered', desc: 'Customer sign-off completed', done: selectedOrder.orderStatus === 'Delivered' },
                ].map((stg, i) => (
                  <div key={i} className="relative pl-4">
                    <div className={`w-3 h-3 rounded-full absolute -left-[19px] top-0.5 border-2 ${stg.done ? 'bg-emerald-500 border-emerald-200' : 'bg-slate-200 border-white'}`} />
                    <p className={`font-bold ${stg.done ? 'text-slate-900' : 'text-slate-400'}`}>{stg.title}</p>
                    <p className="text-[11px] text-slate-500">{stg.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ORDERS & DELIVERIES DASHBOARD LIST VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Fulfillment Operations Center</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Orders & Deliveries Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer store orders, ordered component lists, AWB tracking numbers, and live dispatch logistics.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Total Received</span>
          <div className="text-2xl font-black mt-1">{totalOrders}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Processing')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Processing' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white border-slate-200 text-slate-800 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Processing</span>
          <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">{processingCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Shipped')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Shipped' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-200 text-slate-800 hover:bg-blue-50/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">In Transit / Shipped</span>
          <div className="text-2xl font-black mt-1 text-blue-600">{shippedCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Out for Delivery')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Out for Delivery' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white border-slate-200 text-slate-800 hover:bg-purple-50/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Out for Delivery</span>
          <div className="text-2xl font-black mt-1 text-purple-600">{outForDeliveryCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('Delivered')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'Delivered' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white border-slate-200 text-slate-800 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Delivered</span>
          <div className="text-2xl font-black mt-1 text-emerald-600">{deliveredCount}</div>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, Product Name, Customer, AWB Tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['ALL', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No orders match your current search query or status filter.'
              : 'No customer store orders have been placed yet. New orders placed by customers will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = order.items || [];

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden transition-all hover:border-blue-300 hover:shadow-md"
              >
                {/* Header Strip */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-blue-100 text-blue-800 font-mono text-xs font-black">
                      #{order.id}
                    </span>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">{order.userName}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{order.userEmail}</span>
                        <span>•</span>
                        <span>{order.userPhone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadgeClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>

                    <span className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold font-mono ${
                      order.paymentStatus === 'Refund Pending'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : order.paymentStatus === 'Refund Completed'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                        : order.orderStatus === 'Cancelled' && order.paymentMethod === 'COD'
                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                        : order.paymentStatus === 'Cancelled'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      ₹{order.totalAmount.toLocaleString('en-IN')} ({order.paymentMethod} • {
                        order.orderStatus === 'Cancelled' && order.paymentMethod === 'COD'
                          ? 'No Refund Due (COD)'
                          : order.paymentStatus
                      })
                    </span>

                    {order.paymentStatus === 'Refund Pending' && (
                      <button
                        onClick={() => handleMarkRefundCompleted(order)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                        title="Click to mark refund as processed and completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Process Refund</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <span>View Full Order Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body - 3 Column Layout */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* COLUMN 1: PROMINENT ORDERED PRODUCTS & NAMES */}
                  <div className="space-y-2 border-r border-slate-100 pr-4 md:col-span-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900 uppercase font-mono text-[10px] tracking-wider text-blue-600 block">
                        Ordered Items ({items.length})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        Store Products
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {items.map((item, idx) => {
                        const name = item.productName || item.name || 'Component';
                        return (
                          <div key={idx} className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                            {item.image ? (
                              <img src={item.image} alt={name} className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                <Box className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-extrabold text-slate-900 text-xs leading-tight line-clamp-2">
                                {name}
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                                <span>Qty: <strong className="text-slate-900">{item.quantity}</strong></span>
                                <span className="font-bold text-slate-700">₹{(item.price || 0).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* COLUMN 2: DELIVERY ADDRESS & GST */}
                  <div className="space-y-2 text-xs text-slate-700 border-r border-slate-100 pr-4">
                    <span className="font-black text-slate-900 uppercase font-mono text-[10px] tracking-wider text-blue-600 block">
                      Delivery Address
                    </span>
                    <p className="font-extrabold text-slate-900">{order.shippingAddress?.fullName || order.userName}</p>
                    {order.shippingAddress?.companyName && (
                      <p className="text-blue-700 font-bold flex items-center gap-1 text-[11px]">
                        <Building2 className="w-3 h-3" />
                        <span>{order.shippingAddress.companyName}</span>
                      </p>
                    )}
                    <p className="text-slate-600 leading-snug">
                      {order.shippingAddress?.houseBuilding}, {order.shippingAddress?.streetArea}
                      {order.shippingAddress?.landmark ? `, Near ${order.shippingAddress.landmark}` : ''}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - <strong className="font-mono text-slate-900">{order.shippingAddress?.pincode}</strong>
                    </p>

                    {order.shippingAddress?.gstin && (
                      <p className="text-[11px] font-mono text-blue-800 font-bold pt-1 flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-blue-600" />
                        <span>GSTIN: {order.shippingAddress.gstin}</span>
                      </p>
                    )}

                    <div className="pt-2 text-[11px] text-slate-500 font-mono">
                      Order Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  {/* COLUMN 3: COURIER TRACKING & DISPATCH ACTIONS */}
                  <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    <span className="font-black text-slate-900 uppercase font-mono text-[10px] tracking-wider text-blue-600 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Status</span>
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Edit Tracking
                      </button>
                    </span>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Courier Partner</span>
                        <p className="font-extrabold text-slate-900">{order.courierPartner || 'Not assigned yet'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">AWB / Airway Bill</span>
                        <p className="font-mono font-bold text-blue-700">{order.trackingNumber || 'Pending AWB'}</p>
                      </div>

                      {/* Quick Status Buttons */}
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block mb-1">
                          Quick Status Switch
                        </span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {['Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((st) => (
                            <button
                              key={st}
                              onClick={() => handleQuickStatusUpdate(order, st as UserOrder['orderStatus'])}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                                order.orderStatus === st
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
