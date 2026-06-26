import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import DataTable from '../ui/DataTable';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { filterByDateRange, formatCurrency } from '../../utils/calculations';
import { DollarSign, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#06b6d4'];

const columns = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'date', label: 'Date', format: 'date' },
  { key: 'grossRevenue', label: 'Gross Revenue', format: 'currency' },
  { key: 'shippingIncome', label: 'Shipping Income', format: 'currency' },
  { key: 'shippingCharge', label: 'Shipping Charge', format: 'currency' },
  { key: 'platformFee', label: 'Platform Fee', format: 'currency' },
  { key: 'gatewayFee', label: 'Gateway Fee', format: 'currency' },
  { key: 'commission', label: 'Commission', format: 'currency' },
  { key: 'reverseShipping', label: 'Reverse Shipping', format: 'currency' },
  { key: 'tds', label: 'TDS', format: 'currency' },
  { key: 'tcs', label: 'TCS', format: 'currency' },
  { key: 'settlementAmount', label: 'Settlement', format: 'currency' },
  { key: 'netSettlement', label: 'Net Settlement', format: 'currency' },
  { key: 'settlementStatus', label: 'Status', render: (v) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v === 'Settled' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{v}</span>
  )},
];

export default function OrderReconciliation() {
  const { data, dateRange } = useDashboard();

  const recon = useMemo(() => filterByDateRange(data.reconciliation || [], dateRange), [data.reconciliation, dateRange]);

  const metrics = useMemo(() => {
    const settled = recon.filter(r => r.settlementStatus === 'Settled');
    const pending = recon.filter(r => r.settlementStatus === 'Pending');
    const totalGross = recon.reduce((s, r) => s + r.grossRevenue, 0);
    const totalNet = recon.reduce((s, r) => s + r.netSettlement, 0);
    const leakage = totalGross - totalNet;
    return {
      settledAmount: settled.reduce((s, r) => s + r.settlementAmount, 0),
      pendingAmount: pending.reduce((s, r) => s + r.settlementAmount, 0),
      totalGross, totalNet, leakage,
      settledCount: settled.length,
      pendingCount: pending.length,
    };
  }, [recon]);

  // Fee breakdown for chart
  const feeBreakdown = useMemo(() => [
    { name: 'Platform Fee', value: recon.reduce((s, r) => s + r.platformFee, 0) },
    { name: 'Gateway Fee', value: recon.reduce((s, r) => s + r.gatewayFee, 0) },
    { name: 'Commission', value: recon.reduce((s, r) => s + r.commission, 0) },
    { name: 'Shipping', value: recon.reduce((s, r) => s + r.shippingCharge, 0) },
    { name: 'TDS/TCS', value: recon.reduce((s, r) => s + r.tds + r.tcs, 0) },
    { name: 'Reverse Ship', value: recon.reduce((s, r) => s + r.reverseShipping, 0) },
  ], [recon]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Settlement Received" value={formatCurrency(metrics.settledAmount)} icon={CheckCircle} color="green" />
        <KPICard title="Settlement Pending" value={formatCurrency(metrics.pendingAmount)} icon={AlertTriangle} color="orange" />
        <KPICard title="Revenue Leakage" value={formatCurrency(metrics.leakage)} icon={DollarSign} color="red" />
        <KPICard title="Net Settlement" value={formatCurrency(metrics.totalNet)} icon={CreditCard} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Fee Breakdown">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={v => [formatCurrency(v), 'Amount']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Settlement Status">
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[{ name: 'Settled', value: metrics.settledCount }, { name: 'Pending', value: metrics.pendingCount }]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  <Cell fill="#10b981" /><Cell fill="#f59e0b" />
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end"><ExportButton data={recon} columns={columns} filename="reconciliation-report" /></div>
      <DataTable columns={columns} data={recon} title="Reconciliation Details" subtitle={`${recon.length} records`} />
    </div>
  );
}
