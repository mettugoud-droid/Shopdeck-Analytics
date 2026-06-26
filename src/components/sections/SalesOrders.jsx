import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { useDashboard } from '../../context/DashboardContext';
import { calculateOrderTrends, calculateTopProducts, calculateCategoryPerformance, filterByDateRange, formatCurrency } from '../../utils/calculations';

export default function SalesOrders() {
  const { data, dateRange } = useDashboard();
  const trends = calculateOrderTrends(data.orders, dateRange, 'daily');
  const topProducts = calculateTopProducts(data.products, 10);
  const categories = calculateCategoryPerformance(data.products);
  const filteredOrders = filterByDateRange(data.orders, dateRange);

  // Payment method breakdown
  const paymentMethods = {};
  filteredOrders.forEach(o => {
    const method = o.paymentMethod || 'Other';
    paymentMethods[method] = (paymentMethods[method] || 0) + 1;
  });
  const paymentData = Object.entries(paymentMethods)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Order & Revenue Trend */}
      <SectionCard title="Orders & Revenue Trend" subtitle="Daily orders and revenue">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} name="Orders" />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue by Category */}
        <SectionCard title="Revenue by Category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Payment Methods */}
        <SectionCard title="Payment Methods">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Top 10 Products Table */}
      <SectionCard title="Top 10 Products by Revenue" subtitle="Best performing products">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">#</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Product</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Category</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Units Sold</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Revenue</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Margin</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-gray-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-900">{product.productName}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="info">{product.category}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{product.unitsSold}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-gray-900">{formatCurrency(product.revenue)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant={parseFloat(product.margin) > 50 ? 'success' : 'warning'}>
                      {product.margin}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
