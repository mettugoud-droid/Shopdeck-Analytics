import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import DataTable from '../ui/DataTable';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/calculations';
import { MessageSquare, Eye, MousePointerClick, IndianRupee } from 'lucide-react';

const columns = [
  { key: 'templateName', label: 'Template Name' },
  { key: 'category', label: 'Category' },
  { key: 'sent', label: 'Sent' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'read', label: 'Read' },
  { key: 'failed', label: 'Failed' },
  { key: 'clicked', label: 'Clicked' },
  { key: 'revenue', label: 'Revenue', format: 'currency' },
  { key: 'deliveryRate', label: 'Delivery %', format: 'percent' },
  { key: 'readRate', label: 'Read %', format: 'percent' },
  { key: 'ctr', label: 'CTR %', format: 'percent' },
];

export default function WhatsAppHSM() {
  const { data } = useDashboard();
  const campaigns = data.whatsapp || [];

  const metrics = useMemo(() => {
    const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
    const totalDelivered = campaigns.reduce((s, c) => s + c.delivered, 0);
    const totalRead = campaigns.reduce((s, c) => s + c.read, 0);
    const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
    const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
    return {
      deliveryRate: totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0,
      readRate: totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : 0,
      ctr: totalRead > 0 ? ((totalClicked / totalRead) * 100).toFixed(1) : 0,
      totalRevenue,
    };
  }, [campaigns]);

  // Campaign ranking by revenue
  const ranked = useMemo(() => [...campaigns].sort((a, b) => b.revenue - a.revenue).slice(0, 10), [campaigns]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Delivery Rate" value={`${metrics.deliveryRate}%`} icon={MessageSquare} color="green" />
        <KPICard title="Read Rate" value={`${metrics.readRate}%`} icon={Eye} color="blue" />
        <KPICard title="CTR" value={`${metrics.ctr}%`} icon={MousePointerClick} color="purple" />
        <KPICard title="Total Revenue" value={formatCurrency(metrics.totalRevenue)} icon={IndianRupee} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Campaign Ranking (Revenue)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranked} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="templateName" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip formatter={v => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Engagement Funnel">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaigns.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="templateName" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="sent" fill="#94a3b8" name="Sent" />
                <Bar dataKey="delivered" fill="#3b82f6" name="Delivered" />
                <Bar dataKey="read" fill="#10b981" name="Read" />
                <Bar dataKey="clicked" fill="#f59e0b" name="Clicked" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end"><ExportButton data={campaigns} columns={columns} filename="whatsapp-hsm" /></div>
      <DataTable columns={columns} data={campaigns} title="WhatsApp HSM Templates" subtitle={`${campaigns.length} templates`} />
    </div>
  );
}
