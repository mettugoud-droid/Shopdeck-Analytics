import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import DataTable from '../ui/DataTable';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/calculations';
import { Package, IndianRupee, ShoppingCart, TrendingUp } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const columns = [
  { key: 'category', label: 'Category' },
  { key: 'revenue', label: 'Revenue', format: 'currency' },
  { key: 'orders', label: 'Orders' },
  { key: 'units', label: 'Units' },
  { key: 'profit', label: 'Profit', format: 'currency' },
];

export default function ProductTypeReport() {
  const { data } = useDashboard();
  const types = data.productTypes || [];

  const metrics = useMemo(() => ({
    totalRevenue: types.reduce((s, t) => s + t.revenue, 0),
    totalOrders: types.reduce((s, t) => s + t.orders, 0),
    totalUnits: types.reduce((s, t) => s + t.units, 0),
    totalProfit: types.reduce((s, t) => s + t.profit, 0),
  }), [types]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={IndianRupee} color="green" />
        <KPICard title="Total Orders" value={metrics.totalOrders} icon={ShoppingCart} color="blue" />
        <KPICard title="Total Units" value={metrics.totalUnits} icon={Package} color="purple" />
        <KPICard title="Total Profit" value={formatCurrency(metrics.totalProfit)} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Revenue Share by Category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={types} cx="50%" cy="50%" outerRadius={90} dataKey="revenue" label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                  {types.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Category Profitability">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={types}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => [formatCurrency(v)]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end"><ExportButton data={types} columns={columns} filename="product-type-report" /></div>
      <DataTable columns={columns} data={types} title="Category Performance" subtitle={`${types.length} categories`} />
    </div>
  );
}
