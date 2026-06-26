import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DataTable from '../ui/DataTable';
import FilterBar from '../ui/FilterBar';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/calculations';
import { Package, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

const columns = [
  { key: 'sku', label: 'SKU' },
  { key: 'productName', label: 'Product Name' },
  { key: 'category', label: 'Category' },
  { key: 'brand', label: 'Brand' },
  { key: 'orders', label: 'Orders' },
  { key: 'revenue', label: 'Revenue', format: 'currency' },
  { key: 'unitsSold', label: 'Units Sold' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'returned', label: 'Returned' },
  { key: 'rto', label: 'RTO' },
  { key: 'refundAmount', label: 'Refund', format: 'currency' },
  { key: 'grossMargin', label: 'Gross Margin %', format: 'percent' },
  { key: 'netMargin', label: 'Net Margin %', format: 'percent' },
];

export default function ProductPerformanceReport() {
  const { data, searchQuery } = useDashboard();
  const [filterValues, setFilterValues] = useState({});

  const products = useMemo(() => {
    let items = data.products || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p => p.sku.toLowerCase().includes(q) || p.productName.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (filterValues.category && filterValues.category !== 'all') items = items.filter(p => p.category === filterValues.category);
    return items;
  }, [data.products, searchQuery, filterValues]);

  const metrics = useMemo(() => {
    const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
    const totalUnits = products.reduce((s, p) => s + p.unitsSold, 0);
    const sorted = [...products].sort((a, b) => b.revenue - a.revenue);
    return { totalRevenue, totalUnits, topSeller: sorted[0]?.productName || 'N/A', lowestSeller: sorted[sorted.length - 1]?.productName || 'N/A' };
  }, [products]);

  // Top & bottom for chart
  const topProducts = useMemo(() => [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 8), [products]);
  const marginData = useMemo(() => [...products].sort((a, b) => parseFloat(b.grossMargin) - parseFloat(a.grossMargin)).slice(0, 8), [products]);

  const categories = [...new Set((data.products || []).map(p => p.category))].sort();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={IndianRupee} color="green" />
        <KPICard title="Units Sold" value={metrics.totalUnits} icon={Package} color="blue" />
        <KPICard title="Top Seller" value={metrics.topSeller} icon={TrendingUp} color="purple" compact />
        <KPICard title="Lowest Seller" value={metrics.lowestSeller} icon={TrendingDown} color="red" compact />
      </div>

      <FilterBar filters={[{ key: 'category', label: 'Category', options: categories }]} values={filterValues} onChange={setFilterValues} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Top Products by Revenue">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="productName" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Highest Margin Products">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="productName" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="grossMargin" fill="#6366f1" radius={[0, 4, 4, 0]} name="Gross Margin %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end"><ExportButton data={products} columns={columns} filename="product-performance" /></div>
      <DataTable columns={columns} data={products} title="Product Performance" subtitle={`${products.length} products`} />
    </div>
  );
}
