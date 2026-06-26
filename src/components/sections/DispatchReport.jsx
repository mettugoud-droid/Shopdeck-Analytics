import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import DataTable from '../ui/DataTable';
import FilterBar from '../ui/FilterBar';
import ExportButton from '../ui/ExportButton';
import SectionCard from '../ui/SectionCard';
import KPICard from '../ui/KPICard';
import { useDashboard } from '../../context/DashboardContext';
import { Package, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const columns = [
  { key: 'orderId', label: 'Order ID' },
  { key: 'awb', label: 'AWB' },
  { key: 'courier', label: 'Courier' },
  { key: 'dispatchDate', label: 'Dispatch Date', format: 'date' },
  { key: 'dispatchTime', label: 'Dispatch Time' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'picker', label: 'Picker' },
  { key: 'packingTime', label: 'Packing (min)' },
  { key: 'dispatchDelay', label: 'Delay (hrs)' },
  { key: 'status', label: 'Status', render: (v) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${v === 'On Time' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{v}</span>
  )},
];

export default function DispatchReport() {
  const { data, searchQuery } = useDashboard();
  const [filterValues, setFilterValues] = useState({});

  const dispatch = useMemo(() => {
    let items = data.dispatch || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(d => d.orderId.toLowerCase().includes(q) || d.awb.toLowerCase().includes(q) || d.courier.toLowerCase().includes(q));
    }
    if (filterValues.warehouse && filterValues.warehouse !== 'all') items = items.filter(d => d.warehouse === filterValues.warehouse);
    if (filterValues.courier && filterValues.courier !== 'all') items = items.filter(d => d.courier === filterValues.courier);
    if (filterValues.status && filterValues.status !== 'all') items = items.filter(d => d.status === filterValues.status);
    return items;
  }, [data.dispatch, searchQuery, filterValues]);

  const metrics = useMemo(() => {
    const onTime = dispatch.filter(d => d.status === 'On Time').length;
    const delayed = dispatch.filter(d => d.status === 'Delayed').length;
    const avgPacking = dispatch.length > 0 ? (dispatch.reduce((s, d) => s + d.packingTime, 0) / dispatch.length).toFixed(0) : 0;
    return { total: dispatch.length, onTime, delayed, avgPacking };
  }, [dispatch]);

  // Warehouse breakdown
  const warehouseData = useMemo(() => {
    const map = {};
    dispatch.forEach(d => {
      if (!map[d.warehouse]) map[d.warehouse] = { warehouse: d.warehouse, total: 0, onTime: 0, delayed: 0 };
      map[d.warehouse].total += 1;
      if (d.status === 'On Time') map[d.warehouse].onTime += 1;
      else map[d.warehouse].delayed += 1;
    });
    return Object.values(map);
  }, [dispatch]);

  const warehouses = [...new Set((data.dispatch || []).map(d => d.warehouse))].sort();
  const couriers = [...new Set((data.dispatch || []).map(d => d.courier))].sort();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Dispatched" value={metrics.total} icon={Package} color="blue" />
        <KPICard title="On Time" value={metrics.onTime} icon={CheckCircle} color="green" />
        <KPICard title="Delayed" value={metrics.delayed} icon={AlertTriangle} color="red" />
        <KPICard title="Avg Packing Time" value={`${metrics.avgPacking} min`} icon={Clock} color="orange" />
      </div>

      <FilterBar
        filters={[
          { key: 'warehouse', label: 'Warehouse', options: warehouses },
          { key: 'courier', label: 'Courier', options: couriers },
          { key: 'status', label: 'Status', options: ['On Time', 'Delayed'] },
        ]}
        values={filterValues}
        onChange={setFilterValues}
      />

      <SectionCard title="Dispatch by Warehouse">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={warehouseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="warehouse" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="onTime" stackId="a" fill="#10b981" name="On Time" />
              <Bar dataKey="delayed" stackId="a" fill="#ef4444" name="Delayed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      <div className="flex justify-end"><ExportButton data={dispatch} columns={columns} filename="dispatch-report" /></div>
      <DataTable columns={columns} data={dispatch} title="Dispatch Details" subtitle={`${dispatch.length} dispatches`} />
    </div>
  );
}
