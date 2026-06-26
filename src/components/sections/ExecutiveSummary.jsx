import { IndianRupee, ShoppingCart, TrendingUp, Users, Wallet, Package } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import { useDashboard } from '../../context/DashboardContext';
import { calculateKPIs, calculateOrderTrends, calculateStatusBreakdown, formatCurrency, formatNumber } from '../../utils/calculations';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ExecutiveSummary() {
  const { data, dateRange } = useDashboard();
  const kpis = calculateKPIs(data.orders, dateRange);
  const trends = calculateOrderTrends(data.orders, dateRange, 'daily');
  const statusBreakdown = calculateStatusBreakdown(data.orders, dateRange);

  // Cashflow summary
  const totalCashIn = data.cashflow.filter(c => c.amount > 0).reduce((s, c) => s + c.amount, 0);
  const totalCashOut = data.cashflow.filter(c => c.amount < 0).reduce((s, c) => s + Math.abs(c.amount), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(kpis.totalRevenue.value)}
          change={kpis.totalRevenue.change}
          icon={IndianRupee}
          color="green"
        />
        <KPICard
          title="Total Orders"
          value={formatNumber(kpis.orderCount.value)}
          change={kpis.orderCount.change}
          icon={ShoppingCart}
          color="blue"
        />
        <KPICard
          title="Avg Order Value"
          value={formatCurrency(kpis.aov.value)}
          change={kpis.aov.change}
          icon={TrendingUp}
          color="purple"
        />
        <KPICard
          title="Customers"
          value={formatNumber(kpis.customers.value)}
          change={kpis.customers.change}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <SectionCard title="Revenue Trend" subtitle="Daily revenue over period" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Order Status Pie */}
        <SectionCard title="Order Status" subtitle="Distribution by status">
          <div className="h-64 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center">
              {statusBreakdown.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-600">{item.name} ({item.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Bottom Row - Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Cash Flow">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Inflow</span>
              <span className="text-sm font-semibold text-emerald-600">{formatCurrency(totalCashIn)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Outflow</span>
              <span className="text-sm font-semibold text-rose-600">{formatCurrency(totalCashOut)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Net</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(totalCashIn - totalCashOut)}</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Top Categories">
          <div className="space-y-2">
            {data.products
              .reduce((acc, p) => {
                const cat = acc.find(c => c.name === p.category);
                if (cat) { cat.value += p.revenue; }
                else { acc.push({ name: p.category, value: p.revenue }); }
                return acc;
              }, [])
              .sort((a, b) => b.value - a.value)
              .slice(0, 4)
              .map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-sm text-gray-600">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(cat.value)}</span>
                </div>
              ))
            }
          </div>
        </SectionCard>

        <SectionCard title="Quick Alerts">
          <div className="space-y-2">
            {data.orders.filter(o => o.status === 'processing').length > 20 && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                <Package size={14} className="text-amber-600" />
                <span className="text-xs text-amber-700">{data.orders.filter(o => o.status === 'processing').length} orders pending processing</span>
              </div>
            )}
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
              <Wallet size={14} className="text-blue-600" />
              <span className="text-xs text-blue-700">Cash flow healthy: Net positive</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <TrendingUp size={14} className="text-emerald-600" />
              <span className="text-xs text-emerald-700">Revenue trending {parseFloat(kpis.totalRevenue.change) > 0 ? 'up' : 'down'}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
