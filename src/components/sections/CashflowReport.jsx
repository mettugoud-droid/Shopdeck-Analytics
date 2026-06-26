import { useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/calculations';
import { Wallet, ArrowDownRight, ArrowUpRight, Clock, DollarSign, TrendingUp } from 'lucide-react';

export default function CashflowReport() {
  const { data } = useDashboard();
  const cf = data.cashflow || { settledTransaction: {}, nextPayment: {}, outstanding: {}, dailyCashflow: [] };

  const dailyData = useMemo(() => {
    return (cf.dailyCashflow || []).map(d => ({
      date: d.date instanceof Date ? d.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : d.date,
      inflow: d.inflow,
      outflow: d.outflow,
      net: d.net,
    }));
  }, [cf.dailyCashflow]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Net Received" value={formatCurrency(cf.settledTransaction?.netReceived || 0)} icon={Wallet} color="green" />
        <KPICard title="Next Payment" value={formatCurrency(cf.nextPayment?.totalNextPayment || 0)} icon={Clock} color="blue" />
        <KPICard title="Outstanding" value={formatCurrency(cf.outstanding?.totalOutstanding || 0)} icon={ArrowDownRight} color="orange" />
        <KPICard title="Cash Position" value={formatCurrency((cf.settledTransaction?.netReceived || 0) - (cf.outstanding?.totalOutstanding || 0))} icon={TrendingUp} color="purple" />
      </div>

      {/* Three sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Settled Transaction */}
        <SectionCard title="Settled Transaction">
          <div className="space-y-3">
            <CashRow label="Shipping Charge" value={cf.settledTransaction?.shippingCharge} />
            <CashRow label="PG Remittance" value={cf.settledTransaction?.pgRemittance} />
            <CashRow label="Service Fees" value={cf.settledTransaction?.shopdeckServiceFees} negative />
            <CashRow label="Returned Orders" value={cf.settledTransaction?.returnedOrderAmount} negative />
            <div className="border-t pt-2">
              <CashRow label="Net Received" value={cf.settledTransaction?.netReceived} bold />
            </div>
          </div>
        </SectionCard>

        {/* Next Payment */}
        <SectionCard title="Next Payment">
          <div className="space-y-3">
            <CashRow label="PG Not Settled" value={cf.nextPayment?.pgPaymentCollectedNotSettled} />
            <CashRow label="COD Not Paid" value={cf.nextPayment?.codCollectedNotPaid} />
            <div className="border-t pt-2">
              <CashRow label="Total Next Payment" value={cf.nextPayment?.totalNextPayment} bold />
            </div>
          </div>
        </SectionCard>

        {/* Outstanding */}
        <SectionCard title="Outstanding">
          <div className="space-y-3">
            <CashRow label="COD Non Delivered" value={cf.outstanding?.codNonDelivered} />
            <CashRow label="COD RTO" value={cf.outstanding?.codRTO} />
            <CashRow label="Outstanding COD" value={cf.outstanding?.outstandingCOD} />
            <div className="border-t pt-2">
              <CashRow label="Total Outstanding" value={cf.outstanding?.totalOutstanding} bold />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Cash Flow Chart */}
      <SectionCard title="Daily Cash Flow (30 Days)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={v => [formatCurrency(v)]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="inflow" stroke="#10b981" fill="url(#inflowGrad)" strokeWidth={2} name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="transparent" strokeWidth={2} name="Outflow" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}

function CashRow({ label, value, negative, bold }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold text-gray-900' : negative ? 'text-rose-600' : 'text-gray-900'} font-medium`}>
        {negative ? '-' : ''}{formatCurrency(Math.abs(value || 0))}
      </span>
    </div>
  );
}
