import React, { useState, useEffect } from 'react';
import { 
  Truck, Search, Package, MapPin, Calendar, CreditCard, 
  User, CheckCircle2, Clock, AlertTriangle, ExternalLink, 
  FileText, RefreshCw, Send, Building2, Receipt, Filter
} from 'lucide-react';
import { UserOrder } from '../../types';
import { getStoredUserOrders, updateStoredUserOrder } from '../../services/dataStorage';

interface DeliveriesManagerProps {
  showToast: (text: string, type?: 'info' | 'error' | 'success') => void;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export const DeliveriesManager: React.FC<DeliveriesManagerProps> = ({
  showToast,
}) => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);

  // Edit dispatch form state for the currently active/expanded order
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<UserOrder['orderStatus']>('Processing');
  const [editCourierPartner, setEditCourierPartner] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editTrackingUrl, setEditTrackingUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Load orders on mount
  const loadOrders = () => {
    const fetched = getStoredUserOrders();
    setOrders(fetched);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStartEdit = (order: UserOrder) => {
    setEditingOrderId(order.id);
    setEditStatus(order.orderStatus || 'Processing');
    setEditCourierPartner(order.courierPartner || 'BlueDart Express');
    setEditTrackingNumber(order.trackingNumber || '');
    setEditTrackingUrl(order.courierTrackingUrl || '');
    setEditNotes(order.adminDispatchNotes || '');
  };

  const handleSaveDispatch = (order: UserOrder) => {
    const updatedOrder: UserOrder = {
      ...order,
      orderStatus: editStatus,
      courierPartner: editCourierPartner.trim() || undefined,
      trackingNumber: editTrackingNumber.trim() || undefined,
      courierTrackingUrl: editTrackingUrl.trim() || undefined,
      adminDispatchNotes: editNotes.trim() || undefined,
    };

    const updatedList = updateStoredUserOrder(updatedOrder);
    setOrders(updatedList);
    setEditingOrderId(null);
    showToast(`Order #${order.id} dispatch tracking updated to '${editStatus}'`, 'success');
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      order.id.toLowerCase().includes(query) ||
      order.userName.toLowerCase().includes(query) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(query)) ||
      (order.userPhone && order.userPhone.includes(query)) ||
      (order.trackingNumber && order.trackingNumber.toLowerCase().includes(query)) ||
      (order.shippingAddress?.companyName && order.shippingAddress.companyName.toLowerCase().includes(query));

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

  return (
    <div className="space-y-6">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Customer Fulfillment Portal</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
            Deliveries & Courier Tracking Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage A to Z customer orders, courier dispatch partners, live AWB tracking numbers, and delivery statuses.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name, AWB Tracking, Company..."
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

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'No orders match your current search query or status filter.'
              : 'No store orders have been placed yet. New orders placed by customers will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isEditingThis = editingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header Row */}
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-blue-100 text-blue-700 font-mono text-xs font-extrabold">
                      #{order.id}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{order.userName}</h3>
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

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold font-mono">
                      ₹{order.totalAmount.toLocaleString('en-IN')} ({order.paymentMethod})
                    </span>

                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Full Invoice Details</span>
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: Customer & Address */}
                  <div className="space-y-2 text-xs text-slate-700 border-r border-slate-100 pr-4">
                    <span className="font-extrabold text-slate-900 uppercase font-mono text-[10px] tracking-wider text-blue-600 block">
                      Delivery Address
                    </span>
                    <p className="font-bold text-slate-900">{order.shippingAddress?.fullName || order.userName}</p>
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
                      Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Column 2: Items Summary */}
                  <div className="space-y-2 border-r border-slate-100 pr-4">
                    <span className="font-extrabold text-slate-900 uppercase font-mono text-[10px] tracking-wider text-blue-600 block">
                      Ordered Products ({order.items.length})
                    </span>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5 text-xs bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-md bg-white shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Dispatch & Courier Control */}
                  <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 uppercase font-mono text-[10px] tracking-wider text-blue-600 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Courier Dispatch Control</span>
                      </span>

                      {!isEditingThis && (
                        <button
                          onClick={() => handleStartEdit(order)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                        >
                          Edit Tracking Info
                        </button>
                      )}
                    </div>

                    {!isEditingThis ? (
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Courier Partner</span>
                          <p className="font-bold text-slate-900">{order.courierPartner || 'Not assigned yet'}</p>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">AWB / Tracking No.</span>
                          <p className="font-mono font-bold text-blue-700">{order.trackingNumber || 'Pending AWB'}</p>
                        </div>

                        {order.courierTrackingUrl && (
                          <a
                            href={order.courierTrackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                          >
                            <span>Live Tracking URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {order.adminDispatchNotes && (
                          <p className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200/80 italic">
                            "{order.adminDispatchNotes}"
                          </p>
                        )}
                      </div>
                    ) : (
                      /* Editing Form for this Order */
                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                            Delivery Status
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as UserOrder['orderStatus'])}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                            Courier Partner Name
                          </label>
                          <input
                            type="text"
                            placeholder="BlueDart / DTDC / Delhivery"
                            value={editCourierPartner}
                            onChange={(e) => setEditCourierPartner(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                            AWB / Airway Bill No.
                          </label>
                          <input
                            type="text"
                            placeholder="BLUEDART789456123"
                            value={editTrackingNumber}
                            onChange={(e) => setEditTrackingNumber(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                            Tracking Web URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://www.bluedart.com/tracking..."
                            value={editTrackingUrl}
                            onChange={(e) => setEditTrackingUrl(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono mb-1">
                            Warehouse Dispatch Notes
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Dispatched via Air Cargo Tower B..."
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingOrderId(null)}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveDispatch(order)}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <Send className="w-3 h-3" />
                            <span>Save Dispatch</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Invoice Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 font-mono tracking-wider">TAX INVOICE & ORDER SUMMARY</span>
                <h2 className="text-lg font-black text-slate-900">Order #{selectedOrder.id}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-extrabold text-slate-400 uppercase text-[10px] font-mono block">CUSTOMER INFORMATION</span>
                <p className="font-bold text-slate-900">{selectedOrder.userName}</p>
                <p className="text-slate-600">{selectedOrder.userEmail}</p>
                <p className="text-slate-600 font-mono">{selectedOrder.userPhone}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-extrabold text-slate-400 uppercase text-[10px] font-mono block">FULFILLMENT SUMMARY</span>
                <p className="font-bold text-slate-900">Status: {selectedOrder.orderStatus}</p>
                <p className="text-slate-600">Payment: {selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})</p>
                <p className="text-slate-600 font-mono">AWB: {selectedOrder.trackingNumber || 'Pending'}</p>
              </div>
            </div>

            {/* Address */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
              <span className="font-extrabold text-slate-400 uppercase text-[10px] font-mono block">SHIPPING & TAX ADDRESS</span>
              <p className="font-bold text-slate-900">{selectedOrder.shippingAddress?.fullName}</p>
              {selectedOrder.shippingAddress?.companyName && (
                <p className="text-blue-700 font-bold">{selectedOrder.shippingAddress.companyName}</p>
              )}
              <p className="text-slate-700">
                {selectedOrder.shippingAddress?.houseBuilding}, {selectedOrder.shippingAddress?.streetArea}
                {selectedOrder.shippingAddress?.landmark ? `, Near ${selectedOrder.shippingAddress.landmark}` : ''}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
              </p>
              {selectedOrder.shippingAddress?.gstin && (
                <p className="font-mono text-blue-800 font-bold pt-1">GSTIN: {selectedOrder.shippingAddress.gstin}</p>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-2">
              <span className="font-extrabold text-slate-900 text-xs uppercase font-mono">Purchased Line Items</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-left">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold text-slate-900">{item.name}</td>
                        <td className="p-2.5 text-center font-mono">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono">₹{item.price.toLocaleString('en-IN')}</td>
                        <td className="p-2.5 text-right font-mono font-bold">₹{(item.quantity * item.price).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500 font-mono">
                Order Timestamp: {selectedOrder.createdAt}
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block">Grand Total Paid</span>
                <span className="text-xl font-black text-slate-900 font-mono">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
