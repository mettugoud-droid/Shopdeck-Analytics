import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Treemap } from 'recharts';
import DataTable from '../ui/DataTable';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/calculations';
import { TrendingUp, DollarSign, Package, MapPin } from 'lucide-react';

const columns = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'productName', label: 'Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Category' },
  { key: 'revenue', label: 'Revenue', format: 'currency' },
  { key: 'productCost', label: 'Product Cost', format: 'currency' },
  { key: 'packagingCost', label: 'Packaging', format: 'currency' },
  { key: 'shippingCost', label: 'Shipping', format: 'currency' },
  { key: 'platformFees', label: 'Platform Fees', format: 'currency' },
  { key: 'pgFees', label: 'PG Fees', format: 'currency' },
  { key: 'marketingSpend', label: 'Marketing', format: 'currency' },
  { key: 'netProfit', label: 'Net Profit', format: 'currency' },
  { key: 'margin', label: 'Margin %', format: 'percent' },
];

export default function ProfitabilityEngine() {
  const { data } = useDashboard();
  const [view, setView] = useState('order'); // order, sku, category, city, customer
  const profitData = data.profitability || [];

  const metrics = useMemo(() => {
    const totalRevenue = profitData.reduce((s, p) => s + p.revenue, 0);
    const totalProfit = profitData.reduce((s, p) => s + p.netProfit, 0);
    const avgMargin = profitData.length > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;
    const profitable = profitData.filter(p => p.netProfit > 0).length;
    return { totalRevenue, totalProfit, avgMargin, profitable, unprofitable: profitData.length - profitable };
  }, [profitData]);

  // Aggregated views
  const aggregated = useMemo(() => {
    const map = {};
    profitData.forEach(p => {
      const key = view === 'order' ? p.orderId : view === 'sku' ? p.sku : view === 'category' ? p.category : view === 'city' ? p.city : p.customerName;
      if (!map[key]) map[key] = { name: key, revenue: 0, cost: 0, profit: 0, count: 0 };
      map[key].revenue += p.revenue;
      map[key].cost += (p.productCost + p.packagingCost + p.shippingCost + p.platformFees + p.pgFees + p.marketingSpend);
      map[key].profit += p.netProfit;
      map[key].count += 1;
    });
    return Object.values(map).map(m => ({
      ...m, margin: m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : 0,
    })).sort((a, b) => b.profit - a.profit);
  }, [profitData, view]);

  // Profit waterfall data
  const waterfallData = useMemo(() => {
    const totalRevenue = profitData.reduce((s, p) => s + p.revenue, 0);
    const productCost = profitData.reduce((s, p) => s + p.productCost, 0);
    const packaging = profitData.reduce((s, p) => s + p.packagingCost, 0);
    const shipping = profitData.reduce((s, p) => s + p.shippingCost, 0);
    const platform = profitData.reduce((s, p) => s + p.platformFees, 0);
    const pg = profitData.reduce((s, p) => s + p.pgFees, 0);
    const marketing = profitData.reduce((s, p) => s + p.marketingSpend, 0);
    const netProfit = totalRevenue - productCost - packaging - shipping - platform - pg - marketing;
    return [
      { name: 'Revenue', value: totalRevenue, fill: '#10b981' },
      { name: 'Product Cost', value: -productCost, fill: '#ef4444' },
      { name: 'Packaging', value: -packaging, fill: '#f59e0b' },
      { name: 'Shipping', value: -shipping, fill: '#f97316' },
      { name: 'Platform', value: -platform, fill: '#8b5cf6' },
      { name: 'PG Fees', value: -pg, fill: '#6366f1' },
      { name: 'Marketing', value: -marketing, fill: '#ec4899' },
      { name: 'Net Profit', value: netProfit, fill: netProfit > 0 ? '#10b981' : '#ef4444' },
    ];
  }, [profitData]);


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={DollarSign} color="green" />
        <KPICard title="Net Profit" value={formatCurrency(metrics.totalProfit)} icon={TrendingUp} color="purple" />
        <KPICard title="Avg Margin" value={`${metrics.avgMargin}%`} icon={Package} color="blue" />
        <KPICard title="Profitable Orders" value={`${metrics.profitable} / ${profitData.length}`} icon={MapPin} color="orange" />
      </div>

      {/* Profit Waterfall */}
      <SectionCard title="Profit Waterfall">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterfallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(Math.abs(v)/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => [formatCurrency(Math.abs(v))]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {waterfallData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Profitability by:</span>
        {['order', 'sku', 'category', 'city', 'customer'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${view === v ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Profit by dimension chart */}
      <SectionCard title={`Profit by ${view.charAt(0).toUpperCase() + view.slice(1)} (Top 10)`}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregated.slice(0, 10)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={120} />
              <Tooltip formatter={v => [formatCurrency(v)]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="profit" fill="#10b981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="flex justify-end"><ExportButton data={profitData} columns={columns} filename="profitability" /></div>
      <DataTable columns={columns} data={profitData} title="Order-Level Profitability" subtitle={`${profitData.length} orders analyzed`} />
    </div>
  );
}
