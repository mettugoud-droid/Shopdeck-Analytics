import { DollarSign, TrendingDown, ReceiptText, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import KPICard from '../ui/KPICard';
import SectionCard from '../ui/SectionCard';
import { useDashboard } from '../../context/DashboardContext';
import { calculateCashflowMetrics, formatCurrency } from '../../utils/calculations';

export default function FinancialHealth() {
  const { data, dateRange } = useDashboard();
  const metrics = calculateCashflowMetrics(data.cashflow, dateRange);

  // Profit margin by product
  const marginData = data.products
    .map(p => ({
      name: p.productName.length > 15 ? p.productName.substring(0, 15) + '...' : p.productName,
      margin: p.revenue > 0 ? ((p.revenue - (p.costPrice * p.unitsSold)) / p.revenue * 100).toFixed(1) : 0,
      revenue: p.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Tax summary
  const totalTax = data.tax.reduce((s, t) => s + t.totalTax, 0);
  const totalCGST = data.tax.reduce((s, t) => s + t.cgst, 0);
  const totalSGST = data.tax.reduce((s, t) => s + t.sgst, 0);
  const totalIGST = data.tax.reduce((s, t) => s + t.igst, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Net Cash Flow" value={formatCurrency(metrics.netCashflow)} icon={DollarSign} color="green" />
        <KPICard title="Total Refunds" value={formatCurrency(metrics.totalRefunds)} icon={TrendingDown} color="rose" />
        <KPICard title="Refund Rate" value={`${metrics.refundRate}%`} icon={AlertTriangle} color="orange" />
        <KPICard title="Tax Collected" value={formatCurrency(totalTax)} icon={ReceiptText} color="indigo" />
      </div>

      {/* Cash Flow Trend */}
      <SectionCard title="Cash Flow Trend" subtitle="Monthly revenue, refunds, and net cash flow">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.monthlyTrend}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [formatCurrency(v)]} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="refunds" stroke="#ef4444" strokeWidth={2} dot={false} name="Refunds" />
              <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Net" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Profit Margin by Product */}
        <SectionCard title="Profit Margin by Product" subtitle="Top 10 products">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={120} />
                <Tooltip formatter={(v) => [`${v}%`, 'Margin']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="margin" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        {/* Tax Breakdown */}
        <SectionCard title="Tax Liability Summary">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 font-medium">Total Tax</p>
                <p className="text-lg font-bold text-indigo-900">{formatCurrency(totalTax)}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">CGST</p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(totalCGST)}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">SGST</p>
                <p className="text-lg font-bold text-purple-900">{formatCurrency(totalSGST)}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-600 font-medium">IGST</p>
                <p className="text-lg font-bold text-emerald-900">{formatCurrency(totalIGST)}</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-xs text-amber-700 font-medium">
                  Shipping costs: {formatCurrency(metrics.totalShipping)} ({metrics.totalShipping > 0 ? ((metrics.totalShipping / metrics.totalRevenue) * 100).toFixed(1) : 0}% of revenue)
                </span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
