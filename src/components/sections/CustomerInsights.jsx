import { Users, UserPlus, Repeat, Crown, AlertCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { useDashboard } from '../../context/DashboardContext';
import { calculateCustomerInsights, formatCurrency } from '../../utils/calculations';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function CustomerInsights() {
  const { data } = useDashboard();
  const insights = calculateCustomerInsights(data.customers);

  const segmentData = [
    { name: 'High Value (₹5K+)', value: insights.segments.high.count, color: '#10b981' },
    { name: 'Medium (₹1K-5K)', value: insights.segments.medium.count, color: '#3b82f6' },
    { name: 'Low (<₹1K)', value: insights.segments.low.count, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Total Customers" value={insights.totalCustomers} icon={Users} color="blue" />
        <KPICard title="New Customers" value={insights.newCustomers} icon={UserPlus} color="green" />
        <KPICard title="Repeat Customers" value={insights.repeatCustomers} icon={Repeat} color="purple" />
        <KPICard title="Repeat Rate" value={`${insights.repeatRate}%`} icon={Crown} color="orange" />
        <KPICard title="Re-engage" value={insights.reEngagementCount} icon={AlertCircle} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Purchase Frequency */}
        <SectionCard title="Purchase Frequency" subtitle="Distribution of orders per customer">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insights.frequencyDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="orders" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} label={{ value: 'Orders', position: 'bottom', fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* LTV Segments */}
        <SectionCard title="Customer LTV Segments">
          <div className="h-56 flex items-center justify-around">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={segmentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {segmentData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {segmentData.map(seg => (
                <div key={seg.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                  <div>
                    <p className="text-xs font-medium text-gray-700">{seg.name}</p>
                    <p className="text-xs text-gray-500">{seg.value} customers</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">Avg LTV</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(insights.avgLTV)}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Top Customers Table */}
      <SectionCard title="Top 10 Customers by Lifetime Value">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">#</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Customer</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">City</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Orders</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Total Spent</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Segment</th>
              </tr>
            </thead>
            <tbody>
              {insights.topCustomers.map((c, idx) => (
                <tr key={c.customerId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 text-gray-400">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </td>
                  <td className="py-2.5 px-3 text-gray-600">{c.city}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{c.totalOrders}</td>
                  <td className="py-2.5 px-3 text-right font-medium">{formatCurrency(c.totalSpent)}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant={c.totalSpent >= 5000 ? 'success' : c.totalSpent >= 1000 ? 'info' : 'warning'}>
                      {c.totalSpent >= 5000 ? 'High' : c.totalSpent >= 1000 ? 'Medium' : 'Low'}
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
