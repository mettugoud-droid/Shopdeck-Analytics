import { Package, TrendingUp, RotateCcw, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis, Legend } from 'recharts';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { useDashboard } from '../../context/DashboardContext';
import { calculateCategoryPerformance, formatCurrency } from '../../utils/calculations';

export default function ProductPerformance() {
  const { data } = useDashboard();
  const categories = calculateCategoryPerformance(data.products);

  // All products sorted by revenue
  const sortedProducts = [...data.products].sort((a, b) => b.revenue - a.revenue);

  // Slow movers (bottom by units sold)
  const slowMovers = [...data.products].sort((a, b) => a.unitsSold - b.unitsSold).slice(0, 5);

  // Scatter: Revenue vs Units
  const scatterData = data.products.map(p => ({
    x: p.unitsSold,
    y: p.revenue,
    z: parseFloat(p.avgRating) * 100,
    name: p.productName,
  }));

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <SectionCard title="Revenue by Category" subtitle="Category-level performance comparison">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? formatCurrency(v) : v, n === 'revenue' ? 'Revenue' : 'Units']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              <Bar dataKey="units" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue vs Units Scatter */}
        <SectionCard title="Revenue vs Units Sold" subtitle="Bubble size = rating">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" dataKey="x" name="Units" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="number" dataKey="y" name="Revenue" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <ZAxis type="number" dataKey="z" range={[40, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, name) => [name === 'Revenue' ? formatCurrency(v) : v, name]} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Scatter data={scatterData} fill="#8b5cf6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Slow Movers */}
        <SectionCard title="Slow-Moving Products" subtitle="Products with lowest sales volume">
          <div className="space-y-3">
            {slowMovers.map((product, idx) => (
              <div key={product.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-mono">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{product.productName}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.unitsSold} units</p>
                  <p className="text-xs text-gray-500">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Full Product Table */}
      <SectionCard title="All Products" subtitle="Complete product-level metrics">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Product</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Category</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Price</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Units</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Revenue</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Returns</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Rating</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product) => (
                <tr key={product.productId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{product.productName}</td>
                  <td className="py-2.5 px-3"><Badge variant="info">{product.category}</Badge></td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{formatCurrency(product.sellingPrice)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{product.unitsSold}</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(product.revenue)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant={product.returns > 10 ? 'danger' : 'neutral'}>{product.returns}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="flex items-center justify-end gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="text-gray-700">{product.avgRating}</span>
                    </span>
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
