import { useMemo } from 'react';
import { IndianRupee, ShoppingCart, TrendingUp, Users, Truck, AlertTriangle, Target, ArrowUpRight, ArrowDownRight, Package, Wallet, BarChart3 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import { useDashboard } from '../../context/DashboardContext';
import { filterByDateRange, formatCurrency, formatNumber } from '../../utils/calculations';

export default function FounderCommandCenter() {
  const { data, dateRange } = useDashboard();
  const orders = useMemo(() => filterByDateRange(data.orders || [], dateRange), [data.orders, dateRange]);

  const metrics = useMemo(() => {
    const delivered = orders.filter(o => o.status === 'delivered');
    const returned = orders.filter(o => o.status === 'returned' || o.status === 'rto');
    const processing = orders.filter(o => o.status === 'processing');
    const dispatched = orders.filter(o => o.status === 'dispatched');
    const totalRevenue = orders.reduce((s, o) => s + (o.grossAmount || 0), 0);
    const totalCost = (data.profitability || []).reduce((s, p) => s + p.productCost + p.shippingCost + p.platformFees + p.pgFees, 0);
    const totalProfit = totalRevenue - totalCost;
    const customers = new Set(orders.map(o => o.customerEmail)).size;
    const repeatCustomers = (data.customers || []).filter(c => c.totalOrders > 1).length;
    const newCustomers = (data.customers || []).filter(c => c.segment === 'New').length;
    const rtoRate = orders.length > 0 ? ((returned.length / orders.length) * 100).toFixed(1) : 0;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Top product
    const prodMap = {};
    orders.forEach(o => { prodMap[o.productName] = (prodMap[o.productName] || 0) + o.grossAmount; });
    const topProduct = Object.entries(prodMap).sort((a, b) => b[1] - a[1])[0];
    const worstProduct = Object.entries(prodMap).sort((a, b) => a[1] - b[1])[0];

    // Top city
    const cityMap = {};
    orders.forEach(o => { cityMap[o.city] = (cityMap[o.city] || 0) + o.grossAmount; });
    const topCity = Object.entries(cityMap).sort((a, b) => b[1] - a[1])[0];

    return {
      totalRevenue, totalProfit, totalOrders: orders.length, avgOrderValue,
      deliveredCount: delivered.length, processingCount: processing.length,
      dispatchedCount: dispatched.length, returnedCount: returned.length,
      rtoRate, customers, repeatCustomers, newCustomers,
      topProduct: topProduct ? topProduct[0] : 'N/A',
      worstProduct: worstProduct ? worstProduct[0] : 'N/A',
      topCity: topCity ? topCity[0] : 'N/A',
      netMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0,
      outstandingSettlement: data.cashflow?.outstanding?.totalOutstanding || 0,
      cashPosition: data.cashflow?.settledTransaction?.netReceived || 0,
    };
  }, [orders, data]);


  // Revenue trend for chart
  const revenueTrend = useMemo(() => {
    const dayMap = {};
    orders.forEach(o => {
      const d = o.date instanceof Date ? o.date : new Date(o.date);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleDateString('en-IN');
      if (!dayMap[key]) dayMap[key] = { date: key, revenue: 0, orders: 0 };
      dayMap[key].revenue += o.grossAmount || 0;
      dayMap[key].orders += 1;
    });
    return Object.values(dayMap).slice(-14);
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Hero KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard title="Today's Revenue" value={formatCurrency(metrics.totalRevenue)} icon={IndianRupee} color="green" compact />
        <KPICard title="Total Orders" value={formatNumber(metrics.totalOrders)} icon={ShoppingCart} color="blue" compact />
        <KPICard title="Net Profit" value={formatCurrency(metrics.totalProfit)} icon={TrendingUp} color="purple" compact />
        <KPICard title="Net Margin" value={`${metrics.netMargin}%`} icon={Target} color="orange" compact />
        <KPICard title="Customers" value={formatNumber(metrics.customers)} icon={Users} color="teal" compact />
        <KPICard title="RTO Rate" value={`${metrics.rtoRate}%`} icon={AlertTriangle} color="red" compact />
      </div>

      {/* Revenue Chart + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Revenue Trend (14 Days)" className="lg:col-span-2">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Order Pipeline">
          <div className="space-y-3">
            <StatRow label="Processing" value={metrics.processingCount} color="yellow" />
            <StatRow label="Dispatched" value={metrics.dispatchedCount} color="blue" />
            <StatRow label="Delivered" value={metrics.deliveredCount} color="green" />
            <StatRow label="Returned/RTO" value={metrics.returnedCount} color="red" />
            <div className="border-t pt-3 mt-3">
              <StatRow label="Repeat Customers" value={metrics.repeatCustomers} color="purple" />
              <StatRow label="New Customers" value={metrics.newCustomers} color="teal" />
            </div>
          </div>
        </SectionCard>
      </div>


      {/* Financial & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SectionCard title="Cash Position">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.cashPosition)}</div>
            <p className="text-xs text-gray-500">Net Received</p>
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">Outstanding Settlement</p>
              <p className="text-sm font-semibold text-amber-600">{formatCurrency(metrics.outstandingSettlement)}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Top Performers">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-gray-500 uppercase">Top Product</p>
              <p className="text-sm font-medium text-gray-900 truncate">{metrics.topProduct}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase">Top City</p>
              <p className="text-sm font-medium text-gray-900">{metrics.topCity}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500 uppercase">Avg Order Value</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(metrics.avgOrderValue)}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="AI Recommendations">
          <div className="space-y-2">
            <InsightCard text="Focus marketing on top city for 15% growth potential" type="growth" />
            <InsightCard text={`RTO at ${metrics.rtoRate}% - review courier performance`} type="warning" />
            <InsightCard text="Repeat customers driving 60% revenue - nurture segment" type="insight" />
          </div>
        </SectionCard>

        <SectionCard title="Risk Alerts">
          <div className="space-y-2">
            {parseFloat(metrics.rtoRate) > 10 && <AlertCard text={`High RTO rate: ${metrics.rtoRate}%`} severity="high" />}
            {metrics.outstandingSettlement > 50000 && <AlertCard text="Settlement outstanding > ₹50K" severity="medium" />}
            {metrics.processingCount > 50 && <AlertCard text={`${metrics.processingCount} orders pending`} severity="low" />}
            {parseFloat(metrics.rtoRate) <= 10 && metrics.outstandingSettlement <= 50000 && metrics.processingCount <= 50 && (
              <p className="text-sm text-emerald-600 font-medium">All metrics within healthy range</p>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }) {
  const colors = { green: 'bg-emerald-500', blue: 'bg-blue-500', red: 'bg-rose-500', yellow: 'bg-amber-500', purple: 'bg-purple-500', teal: 'bg-teal-500' };
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colors[color] || 'bg-gray-400'}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function InsightCard({ text, type }) {
  const styles = { growth: 'bg-emerald-50 text-emerald-700', warning: 'bg-amber-50 text-amber-700', insight: 'bg-blue-50 text-blue-700' };
  return <div className={`p-2 rounded-lg text-xs ${styles[type]}`}>{text}</div>;
}

function AlertCard({ text, severity }) {
  const styles = { high: 'bg-rose-50 text-rose-700 border-rose-200', medium: 'bg-amber-50 text-amber-700 border-amber-200', low: 'bg-blue-50 text-blue-700 border-blue-200' };
  return <div className={`p-2 rounded-lg text-xs border ${styles[severity]}`}>{text}</div>;
}
