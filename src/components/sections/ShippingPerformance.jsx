import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DataTable from '../ui/DataTable';
import FilterBar from '../ui/FilterBar';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { formatCurrency } from '../../utils/calculations';
import { Truck, Clock, IndianRupee, CheckCircle } from 'lucide-react';

const columns = [
  { key: 'awb', label: 'AWB' },
  { key: 'courier', label: 'Courier' },
  { key: 'pickupDate', label: 'Pickup Date', format: 'date' },
  { key: 'dispatchDate', label: 'Dispatch Date', format: 'date' },
  { key: 'deliveryDate', label: 'Delivery Date', format: 'date' },
  { key: 'transitDays', label: 'Transit Days' },
  { key: 'zone', label: 'Zone' },
  { key: 'shippingCost', label: 'Shipping Cost', format: 'currency' },
  { key: 'deliveryStatus', label: 'Status' },
  { key: 'ndrStatus', label: 'NDR Status' },
  { key: 'rtoStatus', label: 'RTO Status' },
  { key: 'deliveryAttempts', label: 'Attempts' },
];

export default function ShippingPerformance() {
  const { data, searchQuery } = useDashboard();
  const [filterValues, setFilterValues] = useState({});

  const shipping = useMemo(() => {
    let items = data.shipping || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(s => s.awb.toLowerCase().includes(q) || s.courier.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q));
    }
    if (filterValues.courier && filterValues.courier !== 'all') items = items.filter(s => s.courier === filterValues.courier);
    if (filterValues.zone && filterValues.zone !== 'all') items = items.filter(s => s.zone === filterValues.zone);
    if (filterValues.deliveryStatus && filterValues.deliveryStatus !== 'all') items = items.filter(s => s.deliveryStatus === filterValues.deliveryStatus);
    return items;
  }, [data.shipping, searchQuery, filterValues]);

  const metrics = useMemo(() => {
    const delivered = shipping.filter(s => s.deliveryStatus === 'Delivered');
    const avgTransit = delivered.length > 0 ? (delivered.reduce((s, d) => s + (d.transitDays || 0), 0) / delivered.length).toFixed(1) : 0;
    const totalCost = shipping.reduce((s, d) => s + d.shippingCost, 0);
    const successRate = shipping.length > 0 ? ((delivered.length / shipping.length) * 100).toFixed(1) : 0;
    return { total: shipping.length, avgTransit, totalCost, successRate };
  }, [shipping]);

  // Courier ranking
  const courierRanking = useMemo(() => {
    const map = {};
    shipping.forEach(s => {
      if (!map[s.courier]) map[s.courier] = { courier: s.courier, total: 0, delivered: 0, totalDays: 0, totalCost: 0 };
      map[s.courier].total += 1;
      map[s.courier].totalCost += s.shippingCost;
      if (s.deliveryStatus === 'Delivered') { map[s.courier].delivered += 1; map[s.courier].totalDays += (s.transitDays || 0); }
    });
    return Object.values(map).map(c => ({
      ...c,
      avgDays: c.delivered > 0 ? (c.totalDays / c.delivered).toFixed(1) : 'N/A',
      successRate: c.total > 0 ? ((c.delivered / c.total) * 100).toFixed(1) : 0,
      avgCost: c.total > 0 ? Math.round(c.totalCost / c.total) : 0,
    })).sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));
  }, [shipping]);

  const couriers = [...new Set((data.shipping || []).map(s => s.courier))].sort();
  const zones = [...new Set((data.shipping || []).map(s => s.zone))].sort();
  const statuses = [...new Set((data.shipping || []).map(s => s.deliveryStatus))].sort();


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Shipments" value={metrics.total} icon={Truck} color="blue" />
        <KPICard title="Avg Transit Days" value={`${metrics.avgTransit} days`} icon={Clock} color="orange" />
        <KPICard title="Total Shipping Cost" value={formatCurrency(metrics.totalCost)} icon={IndianRupee} color="purple" />
        <KPICard title="Success Rate" value={`${metrics.successRate}%`} icon={CheckCircle} color="green" />
      </div>

      <FilterBar
        filters={[
          { key: 'courier', label: 'Courier', options: couriers },
          { key: 'zone', label: 'Zone', options: zones },
          { key: 'deliveryStatus', label: 'Status', options: statuses },
        ]}
        values={filterValues}
        onChange={setFilterValues}
      />

      {/* Courier Ranking Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Courier Ranking (Success %)">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courierRanking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="courier" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="successRate" fill="#10b981" radius={[0, 4, 4, 0]} name="Success %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
        <SectionCard title="Avg Delivery Days by Courier">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courierRanking}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="courier" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="avgDays" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Days" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="flex justify-end"><ExportButton data={shipping} columns={columns} filename="shipping-performance" /></div>
      <DataTable columns={columns} data={shipping} title="Shipping Details" subtitle={`${shipping.length} shipments`} />
    </div>
  );
}
