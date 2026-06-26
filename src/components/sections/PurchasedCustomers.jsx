import { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DataTable from '../ui/DataTable';
import FilterBar from '../ui/FilterBar';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/calculations';
import { Users, IndianRupee, UserCheck, Heart } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const SEGMENTS = ['VIP', 'Loyal', 'Repeat', 'New', 'Dormant', 'Lost'];

const columns = [
  { key: 'customerId', label: 'Customer ID' },
  { key: 'name', label: 'Name' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'email', label: 'Email' },
  { key: 'firstOrder', label: 'First Order', format: 'date' },
  { key: 'lastOrder', label: 'Last Order', format: 'date' },
  { key: 'totalOrders', label: 'Orders' },
  { key: 'totalRevenue', label: 'Revenue', format: 'currency' },
  { key: 'lifetimeValue', label: 'LTV', format: 'currency' },
  { key: 'averageOrderValue', label: 'AOV', format: 'currency' },
  { key: 'segment', label: 'Segment', render: (v) => <SegmentBadge segment={v} /> },
];

function SegmentBadge({ segment }) {
  const styles = {
    VIP: 'bg-purple-100 text-purple-700', Loyal: 'bg-emerald-100 text-emerald-700',
    Repeat: 'bg-blue-100 text-blue-700', New: 'bg-teal-100 text-teal-700',
    Dormant: 'bg-amber-100 text-amber-700', Lost: 'bg-rose-100 text-rose-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[segment] || 'bg-gray-100'}`}>{segment}</span>;
}

export default function PurchasedCustomers() {
  const { data, searchQuery } = useDashboard();
  const [filterValues, setFilterValues] = useState({});

  const customers = useMemo(() => {
    let items = data.customers || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.mobile.includes(q));
    }
    if (filterValues.segment && filterValues.segment !== 'all') items = items.filter(c => c.segment === filterValues.segment);
    return items;
  }, [data.customers, searchQuery, filterValues]);

  const metrics = useMemo(() => ({
    total: customers.length,
    totalRevenue: customers.reduce((s, c) => s + c.totalRevenue, 0),
    avgLTV: customers.length > 0 ? Math.round(customers.reduce((s, c) => s + c.lifetimeValue, 0) / customers.length) : 0,
    repeatRate: customers.length > 0 ? ((customers.filter(c => c.totalOrders > 1).length / customers.length) * 100).toFixed(1) : 0,
  }), [customers]);

  // Segment breakdown
  const segmentData = useMemo(() => {
    const map = {};
    customers.forEach(c => { map[c.segment] = (map[c.segment] || 0) + 1; });
    return SEGMENTS.filter(s => map[s]).map(s => ({ name: s, value: map[s] || 0 }));
  }, [customers]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Customers" value={metrics.total} icon={Users} color="blue" />
        <KPICard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={IndianRupee} color="green" />
        <KPICard title="Avg LTV" value={formatCurrency(metrics.avgLTV)} icon={Heart} color="purple" />
        <KPICard title="Repeat Rate" value={`${metrics.repeatRate}%`} icon={UserCheck} color="orange" />
      </div>

      <FilterBar filters={[{ key: 'segment', label: 'AI Segment', options: SEGMENTS }]} values={filterValues} onChange={setFilterValues} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Customer AI Segments">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={segmentData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={2}>
                  {segmentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center">
              {segmentData.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1 text-[10px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {s.name} ({s.value})
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Top Customers by LTV">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...customers].sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={v => [formatCurrency(v), 'LTV']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="lifetimeValue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end"><ExportButton data={customers} columns={columns} filename="customer-report" /></div>
      <DataTable columns={columns} data={customers} title="Customer Details" subtitle={`${customers.length} customers`} />
    </div>
  );
}
