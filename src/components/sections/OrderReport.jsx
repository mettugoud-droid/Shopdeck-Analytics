import { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import DataTable from '../ui/DataTable';
import FilterBar from '../ui/FilterBar';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { filterByDateRange, formatCurrency } from '../../utils/calculations';
import { ShoppingCart, IndianRupee, TrendingUp, Package } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const columns = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'orderNumber', label: 'Order Number' },
  { key: 'date', label: 'Order Date', format: 'date' },
  { key: 'orderTime', label: 'Time' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  { key: 'customerName', label: 'Customer' },
  { key: 'city', label: 'City' },
  { key: 'productName', label: 'Product' },
  { key: 'sku', label: 'SKU' },
  { key: 'quantity', label: 'Qty' },
  { key: 'grossAmount', label: 'Gross', format: 'currency' },
  { key: 'discount', label: 'Discount', format: 'currency' },
  { key: 'netAmount', label: 'Net Amount', format: 'currency' },
  { key: 'paymentMethod', label: 'Payment' },
  { key: 'courier', label: 'Courier' },
  { key: 'deliveryStatus', label: 'Delivery' },
];

function StatusBadge({ status }) {
  const styles = {
    delivered: 'bg-emerald-100 text-emerald-700',
    dispatched: 'bg-blue-100 text-blue-700',
    processing: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-gray-100 text-gray-600',
    returned: 'bg-rose-100 text-rose-700',
    rto: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}


export default function OrderReport() {
  const { data, dateRange, searchQuery } = useDashboard();
  const [filterValues, setFilterValues] = useState({});

  const orders = useMemo(() => {
    let filtered = filterByDateRange(data.orders || [], dateRange);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderId.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) || o.sku.toLowerCase().includes(q) ||
        o.awbNumber.toLowerCase().includes(q) || o.city.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) || o.customerEmail.toLowerCase().includes(q)
      );
    }
    if (filterValues.status && filterValues.status !== 'all') filtered = filtered.filter(o => o.status === filterValues.status);
    if (filterValues.city && filterValues.city !== 'all') filtered = filtered.filter(o => o.city === filterValues.city);
    if (filterValues.paymentMethod && filterValues.paymentMethod !== 'all') filtered = filtered.filter(o => o.paymentMethod === filterValues.paymentMethod);
    if (filterValues.courier && filterValues.courier !== 'all') filtered = filtered.filter(o => o.courier === filterValues.courier);
    if (filterValues.category && filterValues.category !== 'all') filtered = filtered.filter(o => o.productCategory === filterValues.category);
    return filtered;
  }, [data.orders, dateRange, searchQuery, filterValues]);

  const kpis = useMemo(() => ({
    totalOrders: orders.length,
    totalRevenue: orders.reduce((s, o) => s + o.grossAmount, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((s, o) => s + o.netAmount, 0) / orders.length : 0,
    deliveredRate: orders.length > 0 ? ((orders.filter(o => o.status === 'delivered').length / orders.length) * 100).toFixed(1) : 0,
  }), [orders]);

  // Status breakdown for pie
  const statusData = useMemo(() => {
    const map = {};
    orders.forEach(o => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Daily trend
  const dailyTrend = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const d = o.date instanceof Date ? o.date : new Date(o.date);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleDateString('en-IN');
      if (!map[key]) map[key] = { date: key, orders: 0, revenue: 0 };
      map[key].orders += 1;
      map[key].revenue += o.grossAmount;
    });
    return Object.values(map).slice(-14);
  }, [orders]);

  const cities = [...new Set((data.orders || []).map(o => o.city))].sort();
  const statuses = [...new Set((data.orders || []).map(o => o.status))].sort();
  const payments = [...new Set((data.orders || []).map(o => o.paymentMethod))].sort();
  const couriers = [...new Set((data.orders || []).map(o => o.courier))].sort();
  const categories = [...new Set((data.orders || []).map(o => o.productCategory))].sort();


  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Orders" value={kpis.totalOrders} icon={ShoppingCart} color="blue" />
        <KPICard title="Revenue" value={formatCurrency(kpis.totalRevenue)} icon={IndianRupee} color="green" />
        <KPICard title="Avg Order Value" value={formatCurrency(kpis.avgOrderValue)} icon={TrendingUp} color="purple" />
        <KPICard title="Delivery Rate" value={`${kpis.deliveredRate}%`} icon={Package} color="teal" />
      </div>

      {/* Filters */}
      <FilterBar
        filters={[
          { key: 'status', label: 'Status', options: statuses },
          { key: 'city', label: 'City', options: cities },
          { key: 'paymentMethod', label: 'Payment', options: payments },
          { key: 'courier', label: 'Courier', options: couriers },
          { key: 'category', label: 'Category', options: categories },
        ]}
        values={filterValues}
        onChange={setFilterValues}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Orders & Revenue Trend" className="lg:col-span-2">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Order Status">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {statusData.map((item, i) => (
                <span key={item.name} className="flex items-center gap-1 text-[10px] text-gray-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {item.name} ({item.value})
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Data Table */}
      <div className="flex justify-end mb-2">
        <ExportButton data={orders} columns={columns} filename="order-report" />
      </div>
      <DataTable columns={columns} data={orders} title="All Orders" subtitle={`${orders.length} orders found`} />
    </div>
  );
}
