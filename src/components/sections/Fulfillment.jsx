import { Truck, Clock, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { useDashboard } from '../../context/DashboardContext';
import { calculateFulfillmentMetrics, formatCurrency } from '../../utils/calculations';

export default function Fulfillment() {
  const { data, dateRange } = useDashboard();
  const metrics = calculateFulfillmentMetrics(data.dispatched, data.orders, dateRange);

  // Region breakdown
  const regionMap = {};
  data.dispatched.forEach(d => {
    const state = d.state || 'Unknown';
    if (!regionMap[state]) regionMap[state] = { state, orders: 0, totalDays: 0, delivered: 0 };
    regionMap[state].orders += 1;
    if (d.deliveryDate && d.dispatchDate) {
      const days = Math.max(0, (d.deliveryDate - d.dispatchDate) / (1000 * 60 * 60 * 24));
      regionMap[state].totalDays += days;
      regionMap[state].delivered += 1;
    }
  });
  const regionData = Object.values(regionMap)
    .map(r => ({ ...r, avgDays: r.delivered > 0 ? (r.totalDays / r.delivered).toFixed(1) : 0 }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Dispatch Rate"
          value={`${metrics.dispatchRate}%`}
          icon={Truck}
          color="blue"
        />
        <KPICard
          title="On-Time Delivery"
          value={`${metrics.onTimeRate}%`}
          icon={CheckCircle}
          color="green"
        />
        <KPICard
          title="Avg Delivery Time"
          value={`${metrics.avgDeliveryTime} days`}
          icon={Clock}
          color="purple"
        />
        <KPICard
          title="Shipping Cost"
          value={formatCurrency(metrics.totalShippingCost)}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Carrier Performance */}
        <SectionCard title="Carrier Performance" subtitle="Comparison of logistics partners">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Carrier</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Orders</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Avg Days</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Delivery %</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-500">Cost</th>
                </tr>
              </thead>
              <tbody>
                {metrics.carriers.map((carrier) => (
                  <tr key={carrier.name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{carrier.name}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">{carrier.orders}</td>
                    <td className="py-2.5 px-3 text-right text-gray-700">{carrier.avgDays}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Badge variant={parseFloat(carrier.deliveryRate) > 80 ? 'success' : 'warning'}>
                        {carrier.deliveryRate}%
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700">{formatCurrency(carrier.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Delivery by Region */}
        <SectionCard title="Avg Delivery Time by Region" subtitle="In days">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit=" days" />
                <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} formatter={(v) => [`${v} days`, 'Avg Delivery']} />
                <Bar dataKey="avgDays" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Pending Dispatch & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Dispatch Summary" className="lg:col-span-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600" />
                <span className="text-sm text-emerald-700">Dispatched</span>
              </div>
              <span className="text-sm font-bold text-emerald-700">{metrics.totalDispatched}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                <span className="text-sm text-amber-700">Pending Dispatch</span>
              </div>
              <span className="text-sm font-bold text-amber-700">{metrics.pendingDispatch}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-blue-600" />
                <span className="text-sm text-blue-700">In Transit</span>
              </div>
              <span className="text-sm font-bold text-blue-700">
                {data.dispatched.filter(d => d.status === 'in_transit').length}
              </span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Shipping Cost Distribution" subtitle="Cost per carrier" className="lg:col-span-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.carriers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Cost']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="cost" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
