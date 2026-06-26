import { MessageSquare, Send, Eye, MousePointerClick, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Funnel } from 'recharts';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import Badge from '../ui/Badge';
import { useDashboard } from '../../context/DashboardContext';
import { calculateWhatsAppMetrics, formatCurrency } from '../../utils/calculations';

export default function Marketing() {
  const { data } = useDashboard();
  const metrics = calculateWhatsAppMetrics(data.whatsapp);

  // Funnel data
  const funnelData = [
    { name: 'Sent', value: metrics.totalSent, fill: '#6366f1' },
    { name: 'Delivered', value: metrics.totalDelivered, fill: '#3b82f6' },
    { name: 'Read', value: metrics.totalRead, fill: '#0ea5e9' },
    { name: 'Clicked', value: metrics.totalClicked, fill: '#10b981' },
    { name: 'Converted', value: metrics.totalConversions, fill: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Messages Sent" value={metrics.totalSent.toLocaleString()} icon={Send} color="blue" />
        <KPICard title="Delivery Rate" value={`${metrics.deliveryRate}%`} icon={MessageSquare} color="green" />
        <KPICard title="Read Rate" value={`${metrics.readRate}%`} icon={Eye} color="purple" />
        <KPICard title="Click Rate" value={`${metrics.clickRate}%`} icon={MousePointerClick} color="orange" />
        <KPICard title="Revenue" value={formatCurrency(metrics.totalRevenue)} icon={ShoppingBag} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Campaign Funnel */}
        <SectionCard title="WhatsApp Campaign Funnel" subtitle="Message to conversion pipeline">
          <div className="space-y-3 py-2">
            {funnelData.map((stage, idx) => {
              const widthPct = metrics.totalSent > 0 ? (stage.value / metrics.totalSent * 100) : 0;
              return (
                <div key={stage.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-gray-700">{stage.name}</span>
                    <span className="text-gray-500">{stage.value.toLocaleString()} ({widthPct.toFixed(1)}%)</span>
                  </div>
                  <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all"
                      style={{ width: `${Math.max(widthPct, 2)}%`, backgroundColor: stage.fill }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-700 font-medium">
              Conversion Rate: {metrics.conversionRate}% (Click → Purchase)
            </p>
          </div>
        </SectionCard>

        {/* Campaign Performance Chart */}
        <SectionCard title="Campaign Performance" subtitle="Top campaigns by revenue">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.campaigns.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="campaignName" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Campaign Details Table */}
      <SectionCard title="All Campaigns" subtitle="WhatsApp HSM campaign details">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Campaign</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Sent</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Delivered</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Read</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Clicked</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Conversions</th>
                <th className="text-right py-2 px-3 font-medium text-gray-500">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {metrics.campaigns.map((campaign) => (
                <tr key={campaign.campaignId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{campaign.campaignName}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{campaign.sent.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{campaign.delivered.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{campaign.read.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-gray-700">{campaign.clicked}</td>
                  <td className="py-2.5 px-3 text-right">
                    <Badge variant={campaign.conversions > 50 ? 'success' : 'neutral'}>{campaign.conversions}</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-gray-900">{formatCurrency(campaign.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
