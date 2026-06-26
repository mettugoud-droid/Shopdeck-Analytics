import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DataTable from '../ui/DataTable';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { MousePointerClick, Target, Users, TrendingUp } from 'lucide-react';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const columns = [
  { key: 'customer', label: 'Customer' },
  { key: 'product', label: 'Product' },
  { key: 'clickDate', label: 'Click Date', format: 'date' },
  { key: 'purchaseDate', label: 'Purchase Date', format: 'date' },
  { key: 'conversionStatus', label: 'Status', render: (v) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v === 'Converted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v}</span>
  )},
  { key: 'daysSinceClick', label: 'Days Since Click' },
  { key: 'intent', label: 'Intent', render: (v) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v === 'High' ? 'bg-rose-100 text-rose-700' : v === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{v}</span>
  )},
];

export default function BuyNowClickReport() {
  const { data, searchQuery } = useDashboard();

  const clicks = useMemo(() => {
    let items = data.buyNowClicks || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(c => c.customer.toLowerCase().includes(q) || c.product.toLowerCase().includes(q));
    }
    return items;
  }, [data.buyNowClicks, searchQuery]);

  const metrics = useMemo(() => {
    const converted = clicks.filter(c => c.conversionStatus === 'Converted').length;
    const highIntent = clicks.filter(c => c.intent === 'High').length;
    const convRate = clicks.length > 0 ? ((converted / clicks.length) * 100).toFixed(1) : 0;
    return { total: clicks.length, converted, highIntent, convRate };
  }, [clicks]);

  const intentData = useMemo(() => {
    const map = {};
    clicks.forEach(c => { map[c.intent] = (map[c.intent] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [clicks]);

  const conversionData = useMemo(() => [
    { name: 'Converted', value: metrics.converted },
    { name: 'Not Converted', value: metrics.total - metrics.converted },
  ], [metrics]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Clicks" value={metrics.total} icon={MousePointerClick} color="blue" />
        <KPICard title="Converted" value={metrics.converted} icon={Target} color="green" />
        <KPICard title="High Intent" value={metrics.highIntent} icon={TrendingUp} color="red" />
        <KPICard title="Conversion Rate" value={`${metrics.convRate}%`} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Conversion Status">
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conversionData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                  <Cell fill="#10b981" /><Cell fill="#ef4444" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Intent Distribution">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end"><ExportButton data={clicks} columns={columns} filename="buy-now-clicks" /></div>
      <DataTable columns={columns} data={clicks} title="Click Details" subtitle={`${clicks.length} clicks tracked`} />
    </div>
  );
}
