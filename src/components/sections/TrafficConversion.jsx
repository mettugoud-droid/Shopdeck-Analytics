import { Globe, Eye, MousePointerClick, Clock, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import { formatNumber } from '../../utils/calculations';

// Simulated GA data (placeholder for when GA integration is connected)
const mockTrafficData = [
  { date: 'Week 1', sessions: 4500, users: 3200, pageviews: 12000, bounceRate: 45 },
  { date: 'Week 2', sessions: 5200, users: 3800, pageviews: 14500, bounceRate: 42 },
  { date: 'Week 3', sessions: 4800, users: 3500, pageviews: 13200, bounceRate: 44 },
  { date: 'Week 4', sessions: 6100, users: 4500, pageviews: 16800, bounceRate: 38 },
];

const trafficSources = [
  { name: 'Organic Search', value: 35, color: '#10b981' },
  { name: 'Direct', value: 25, color: '#3b82f6' },
  { name: 'Social Media', value: 20, color: '#8b5cf6' },
  { name: 'Paid Ads', value: 12, color: '#f59e0b' },
  { name: 'Referral', value: 8, color: '#06b6d4' },
];

const conversionFunnel = [
  { stage: 'Visitors', value: 20600, pct: 100 },
  { stage: 'Product Views', value: 12360, pct: 60 },
  { stage: 'Add to Cart', value: 4120, pct: 20 },
  { stage: 'Checkout', value: 2060, pct: 10 },
  { stage: 'Purchase', value: 824, pct: 4 },
];

const topPages = [
  { page: '/products/wireless-earbuds', views: 3200, avgTime: '2:45' },
  { page: '/products/smart-watch', views: 2800, avgTime: '3:12' },
  { page: '/collections/electronics', views: 2400, avgTime: '1:58' },
  { page: '/products/yoga-mat', views: 1900, avgTime: '2:30' },
  { page: '/cart', views: 1700, avgTime: '1:15' },
];

export default function TrafficConversion() {
  return (
    <div className="space-y-6">
      {/* GA Connection Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
        <Globe size={20} className="text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-900">Google Analytics Integration</p>
          <p className="text-xs text-blue-700">Showing sample data. Connect GA4 via API or upload CSV export to see real metrics.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Sessions" value={formatNumber(20600)} icon={Globe} color="blue" change="12.5" />
        <KPICard title="Unique Users" value={formatNumber(15000)} icon={Eye} color="green" change="8.3" />
        <KPICard title="Conversion Rate" value="4.0%" icon={MousePointerClick} color="purple" change="0.5" />
        <KPICard title="Avg Session" value="2m 34s" icon={Clock} color="orange" change="-3.2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Trend */}
        <SectionCard title="Weekly Traffic" subtitle="Sessions and users">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrafficData}>
                <defs>
                  <linearGradient id="sessGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="sessions" stroke="#3b82f6" fill="url(#sessGrad)" strokeWidth={2} name="Sessions" />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} dot={false} name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Traffic Sources */}
        <SectionCard title="Traffic Sources" subtitle="Where visitors come from">
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie data={trafficSources} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {trafficSources.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {trafficSources.map(source => (
                <div key={source.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-xs text-gray-600">{source.name}</span>
                  <span className="text-xs font-bold text-gray-900 ml-auto">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <SectionCard title="Conversion Funnel" subtitle="Visitor to purchase journey">
          <div className="space-y-3 py-2">
            {conversionFunnel.map((stage, idx) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-gray-500">{stage.value.toLocaleString()} ({stage.pct}%)</span>
                </div>
                <div className="h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="h-full rounded bg-gradient-to-r from-indigo-500 to-blue-500 transition-all"
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Top Pages */}
        <SectionCard title="Top Pages" subtitle="Most visited pages">
          <div className="space-y-2">
            {topPages.map((page, idx) => (
              <div key={page.page} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-4">{idx + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{page.page}</p>
                    <p className="text-xs text-gray-500">Avg time: {page.avgTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                  {page.views.toLocaleString()}
                  <Eye size={12} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
