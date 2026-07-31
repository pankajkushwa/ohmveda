import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, ShoppingBag, Truck, XCircle, Briefcase, Box, 
  Cpu, DollarSign, Calendar, Filter, ArrowUpRight, CheckCircle2, 
  AlertTriangle, ArrowRight, UserCheck, Clock, Layers, RefreshCw, BarChart2, Eye
} from 'lucide-react';
import { JobRole, StoreItem, TurnkeyProduct, UserOrder, JobApplication } from '../../types';
import { getStoredJobApplications, getStoredUserOrders } from '../../services/dataStorage';
import { AdminTab } from '../components/AdminSidebar';

interface DashboardOverviewProps {
  products: TurnkeyProduct[];
  storeItems: StoreItem[];
  jobRoles?: JobRole[];
  setActiveTab: (tab: AdminTab) => void;
  showToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  products,
  storeItems,
  jobRoles = [],
  setActiveTab,
  showToast,
}) => {
  // Real-time Data Fetches
  const orders: UserOrder[] = useMemo(() => getStoredJobApplications ? getStoredUserOrders() : [], []);
  const jobApps: JobApplication[] = useMemo(() => getStoredJobApplications(), []);

  // Filter States for Sales Graph & Analytics
  const currentYear = new Date().getFullYear();
  const [viewGranularity, setViewGranularity] = useState<'day' | 'month'>('day');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed (0=Jan)
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Available Years extracted from Orders
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [orders, currentYear]);

  // Overall Quick Stats
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter((o) => o.orderStatus === 'Cancelled');
    const activeDeliveries = orders.filter((o) => o.orderStatus === 'Processing' || o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery');
    const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');

    // Total gross & net sales
    const grossRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const netRevenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const cancelledRevenue = cancelledOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const onlineRefundOrders = cancelledOrders.filter((o) => o.paymentMethod !== 'COD');
    const onlineRefundRevenue = onlineRefundOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const codCancelledCount = cancelledOrders.filter((o) => o.paymentMethod === 'COD').length;

    // Job Applicants Metrics
    const totalApplicants = jobApps.length;
    const pendingApplicants = jobApps.filter((a) => a.status === 'New' || a.status === 'Under Review' || a.status === 'Pending').length;
    const shortlistedApplicants = jobApps.filter((a) => a.status === 'Shortlisted' || a.status === 'Interview').length;
    const hiredApplicants = jobApps.filter((a) => a.status === 'Hired' || a.status === 'Selected').length;

    // Inventory Alerts & Value
    const totalInventoryValue = storeItems.reduce((acc, item) => acc + ((item.price || 0) * (item.stock || 0)), 0);
    const lowStockItems = storeItems.filter((i) => i.stock <= 5);
    const outOfStockItems = storeItems.filter((i) => !i.inStock || i.stock === 0);

    return {
      totalOrders,
      cancelledCount: cancelledOrders.length,
      activeDeliveriesCount: activeDeliveries.length,
      deliveredCount: deliveredOrders.length,
      grossRevenue,
      netRevenue,
      cancelledRevenue,
      onlineRefundRevenue,
      codCancelledCount,
      totalApplicants,
      pendingApplicants,
      shortlistedApplicants,
      hiredApplicants,
      totalInventoryValue,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      totalProducts: products.length,
      totalStoreItems: storeItems.length,
    };
  }, [orders, jobApps, storeItems, products]);

  // Months labels
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Compute Time-Based Aggregated Data for Graph
  const chartData = useMemo(() => {
    if (viewGranularity === 'month') {
      // Group by Month for Selected Year
      return monthNames.map((monthLabel, monthIdx) => {
        const monthOrders = orders.filter((o) => {
          const d = new Date(o.createdAt);
          return !isNaN(d.getTime()) && d.getFullYear() === selectedYear && d.getMonth() === monthIdx;
        });

        const validOrders = monthOrders.filter((o) => o.orderStatus !== 'Cancelled');
        const cancelled = monthOrders.filter((o) => o.orderStatus === 'Cancelled');
        const revenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        return {
          label: monthLabel,
          subLabel: `${selectedYear}`,
          totalOrdersCount: monthOrders.length,
          validOrdersCount: validOrders.length,
          cancelledCount: cancelled.length,
          revenue: revenue,
        };
      });
    } else {
      // Group by Day for Selected Month & Year
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const daysArr = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayOrders = orders.filter((o) => {
          const d = new Date(o.createdAt);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === selectedYear &&
            d.getMonth() === selectedMonth &&
            d.getDate() === day
          );
        });

        const validOrders = dayOrders.filter((o) => o.orderStatus !== 'Cancelled');
        const cancelled = dayOrders.filter((o) => o.orderStatus === 'Cancelled');
        const revenue = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        daysArr.push({
          label: `${day}`,
          subLabel: `${monthNames[selectedMonth]} ${day}`,
          totalOrdersCount: dayOrders.length,
          validOrdersCount: validOrders.length,
          cancelledCount: cancelled.length,
          revenue: revenue,
        });
      }
      return daysArr;
    }
  }, [orders, viewGranularity, selectedYear, selectedMonth]);

  // Max Values for Graph Scaling
  const maxVal = useMemo(() => {
    if (chartMetric === 'revenue') {
      const maxRev = Math.max(...chartData.map((d) => d.revenue), 1000);
      return maxRev;
    } else {
      const maxOrd = Math.max(...chartData.map((d) => d.totalOrdersCount), 5);
      return maxOrd;
    }
  }, [chartData, chartMetric]);

  // Chart totals
  const periodTotalRevenue = useMemo(() => chartData.reduce((a, b) => a + b.revenue, 0), [chartData]);
  const periodTotalOrders = useMemo(() => chartData.reduce((a, b) => a + b.validOrdersCount, 0), [chartData]);
  const periodCancelledOrders = useMemo(() => chartData.reduce((a, b) => a + b.cancelledCount, 0), [chartData]);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
              <BarChart2 className="w-4 h-4" />
              <span>OhmVeda Analytics & Executive Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">System Performance & Insights</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring of orders, deliveries, revenue breakdown, inventory status, and recruitment pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setActiveTab('deliveries')}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Manage Deliveries ({stats.activeDeliveriesCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('careers')}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span>Job Applications ({stats.pendingApplicants})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Total Net Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">Net Sales Revenue</span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹{stats.netRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">Gross ₹{stats.grossRevenue.toLocaleString('en-IN')}</span>
            </p>
          </div>
        </div>

        {/* Total Store Inventory Value (INR) */}
        <div 
          onClick={() => setActiveTab('store')}
          className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group hover:border-purple-300"
          title="Click to view & manage store inventory"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">Store Inventory Value</span>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-purple-950 tracking-tight">₹{stats.totalInventoryValue.toLocaleString('en-IN')}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-600">
              <span className="text-purple-700 font-extrabold">{stats.totalStoreItems} Hardware SKUs</span>
              {stats.lowStockCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-600 font-bold">{stats.lowStockCount} Low</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Total Orders & Status */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">Total Orders Placed</span>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalOrders}</h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 font-medium">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> {stats.deliveredCount} Delivered
              </span>
              <span>•</span>
              <span className="text-blue-600 font-bold">{stats.activeDeliveriesCount} Active</span>
            </div>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">Cancelled Orders</span>
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-100">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.cancelledCount}</h3>
            <p className="text-xs text-red-600 mt-1 font-bold">
              {stats.cancelledCount === 0 ? (
                'No Cancelled Orders'
              ) : stats.onlineRefundRevenue > 0 ? (
                `₹${stats.onlineRefundRevenue.toLocaleString('en-IN')} Online Refund` + (stats.codCancelledCount > 0 ? ` (${stats.codCancelledCount} COD - No refund)` : '')
              ) : (
                'No refund due to COD order'
              )}
            </p>
          </div>
        </div>

        {/* Job Applicants Metrics */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">Recruitment Pipeline</span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stats.totalApplicants} <span className="text-xs font-normal text-slate-400">Total</span></h3>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-600">
              <span className="text-amber-600 font-bold">{stats.pendingApplicants} Pending</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{stats.shortlistedApplicants} Shortlisted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2>Sales & Order Analytics Chart</h2>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Select date granularity, month, and year to view sales trends and volume breakdown.
            </p>
          </div>

          {/* Interactive Filters Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-2 rounded-2xl border border-slate-200/80">
            {/* View Granularity Switcher */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewGranularity('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewGranularity === 'day'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day Wise
              </button>
              <button
                type="button"
                onClick={() => setViewGranularity('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewGranularity === 'month'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month Wise
              </button>
            </div>

            {/* Metric Mode Toggle */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setChartMetric('revenue')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === 'revenue'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('orders')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMetric === 'orders'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Order Volume
              </button>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selector (Shown when Day Wise is selected) */}
            {viewGranularity === 'day' && (
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent focus:outline-none cursor-pointer"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Graph Key Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Period Sales</span>
            <p className="text-base font-extrabold text-slate-900 mt-0.5">₹{periodTotalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Completed Orders</span>
            <p className="text-base font-extrabold text-emerald-600 mt-0.5">{periodTotalOrders} Units</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Cancelled Orders</span>
            <p className="text-base font-extrabold text-red-600 mt-0.5">{periodCancelledOrders} Units</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Avg Order Value</span>
            <p className="text-base font-extrabold text-blue-600 mt-0.5">
              ₹{periodTotalOrders > 0 ? Math.round(periodTotalRevenue / periodTotalOrders).toLocaleString('en-IN') : '0'}
            </p>
          </div>
        </div>

        {/* Visual Dynamic SVG Bar & Trend Chart */}
        <div className="relative pt-6 pb-2">
          {/* Hovered Tooltip Floating Card */}
          {hoveredBarIndex !== null && chartData[hoveredBarIndex] && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-2xl shadow-xl z-20 flex items-center gap-4 border border-slate-700 animate-fadeIn pointer-events-none">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">{chartData[hoveredBarIndex].subLabel}</span>
                <span className="font-extrabold text-sm">{chartData[hoveredBarIndex].label}</span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">REVENUE</span>
                <span className="font-bold text-emerald-400">₹{chartData[hoveredBarIndex].revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-6 w-px bg-slate-700" />
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">ORDERS</span>
                <span className="font-bold text-blue-400">
                  {chartData[hoveredBarIndex].validOrdersCount} Placed {chartData[hoveredBarIndex].cancelledCount > 0 && `(${chartData[hoveredBarIndex].cancelledCount} Cancelled)`}
                </span>
              </div>
            </div>
          )}

          {/* Bar Charts Canvas Wrapper */}
          <div className="h-64 w-full flex items-end gap-1.5 sm:gap-2 px-2 pt-8 pb-4 border-b border-slate-200 overflow-x-auto">
            {chartData.map((item, idx) => {
              const val = chartMetric === 'revenue' ? item.revenue : item.totalOrdersCount;
              const heightPercent = maxVal > 0 ? Math.max((val / maxVal) * 100, 4) : 4;
              const isHovered = hoveredBarIndex === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  className="flex-1 min-w-[20px] max-w-[48px] flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Bar Value Indicator */}
                  <div className="text-[10px] font-mono font-bold text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {chartMetric === 'revenue' ? `₹${item.revenue > 1000 ? Math.round(item.revenue / 1000) + 'k' : item.revenue}` : item.validOrdersCount}
                  </div>

                  {/* Dual Stacked Bar (Valid Sales vs Cancelled) */}
                  <div className="w-full relative rounded-t-xl bg-slate-100 overflow-hidden flex flex-col justify-end transition-all" style={{ height: `${heightPercent}%` }}>
                    {/* Active/Completed Revenue Bar */}
                    <div
                      className={`w-full transition-all duration-300 rounded-t-xl ${
                        isHovered
                          ? 'bg-blue-600 shadow-md scale-105'
                          : item.revenue > 0
                          ? 'bg-gradient-to-t from-blue-700 to-blue-500'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: '100%' }}
                    />
                  </div>

                  {/* X-Axis Label */}
                  <span className={`text-[10px] font-extrabold mt-2 font-mono transition-colors ${
                    isHovered ? 'text-blue-600 scale-110' : 'text-slate-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2 px-2 text-[11px] font-mono font-bold text-slate-400">
            <span>{viewGranularity === 'day' ? `1 ${monthNames[selectedMonth]} ${selectedYear}` : `Jan ${selectedYear}`}</span>
            <span>{viewGranularity === 'day' ? `${chartData.length} ${monthNames[selectedMonth]} ${selectedYear}` : `Dec ${selectedYear}`}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recruitment Overview + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Applications & Recruitment Overview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Job Applicants Breakdown
              </h3>
              <p className="text-xs text-slate-500">Overview of candidate applications by role</p>
            </div>
            <button
              onClick={() => setActiveTab('careers')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All ({jobApps.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {jobApps.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-medium">No job applications submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
              {jobRoles.map((role) => {
                const appsForRole = jobApps.filter((a) => a.jobId === role.id || a.jobTitle === role.title);
                const count = appsForRole.length;
                const shortlisted = appsForRole.filter((a) => a.status === 'Shortlisted' || a.status === 'Interview').length;

                return (
                  <div key={role.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between transition-colors">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{role.title}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{role.department} • {role.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black">
                        {count} Applications
                      </span>
                      {shortlisted > 0 && (
                        <span className="px-2 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {shortlisted} Shortlisted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hardware Inventory & Store Stock Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                Store & Stock Inventory Alerts
              </h3>
              <p className="text-xs text-slate-500">Monitored hardware items & stock levels</p>
            </div>
            <button
              onClick={() => setActiveTab('store')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Manage Store ({storeItems.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-1">
            {storeItems.slice(0, 6).map((item) => (
              <div key={item.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">SKU: {item.sku} • ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div>
                  {item.stock <= 5 ? (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Low ({item.stock})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                      In Stock ({item.stock})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Preview Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              Recent Orders Quick Log
            </h3>
            <p className="text-xs text-slate-500">Latest customer orders and dispatch status</p>
          </div>
          <button
            onClick={() => setActiveTab('deliveries')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Open Deliveries Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 font-medium">No orders placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-mono font-bold text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {orders.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-extrabold text-slate-900">#{order.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{order.userName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{order.userEmail}</div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-slate-900">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                      {order.paymentMethod} • <span className={order.orderStatus === 'Cancelled' ? 'text-red-600 font-bold' : 'text-emerald-600'}>{order.paymentStatus}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        order.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : order.orderStatus === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveTab('deliveries')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
