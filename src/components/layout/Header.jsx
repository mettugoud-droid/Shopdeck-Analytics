import { Calendar, ChevronDown, RefreshCw, Download, Bell, Database, Search, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { subDays, format, startOfMonth, startOfYear } from 'date-fns';
import { useDashboard } from '../../context/DashboardContext';

const datePresets = [
  { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
  { label: 'Yesterday', getValue: () => ({ start: subDays(new Date(), 1), end: subDays(new Date(), 1) }) },
  { label: 'Last 7 Days', getValue: () => ({ start: subDays(new Date(), 7), end: new Date() }) },
  { label: 'Last 30 Days', getValue: () => ({ start: subDays(new Date(), 30), end: new Date() }) },
  { label: 'Last 90 Days', getValue: () => ({ start: subDays(new Date(), 90), end: new Date() }) },
  { label: 'MTD', getValue: () => ({ start: startOfMonth(new Date()), end: new Date() }) },
  { label: 'YTD', getValue: () => ({ start: startOfYear(new Date()), end: new Date() }) },
];

const TAB_TITLES = {
  'command-center': 'Founder Command Center',
  'orders': 'Order Report',
  'shipping': 'Shipping Performance',
  'dispatch': 'Dispatch Report',
  'reconciliation': 'Order Reconciliation',
  'cashflow': 'Cashflow Report',
  'product-performance': 'Product Performance',
  'product-type': 'Product Type Report',
  'customers': 'Purchased Customers',
  'buy-now-clicks': 'Last Buy Now Click',
  'whatsapp': 'WhatsApp HSM Report',
  'profitability': 'Profitability Engine',
  'import-center': 'Import Center',
};


export default function Header() {
  const { dateRange, setDateRange, activeTab, data, dataSource, searchQuery, setSearchQuery } = useDashboard();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  const handlePreset = (preset) => {
    const range = preset.getValue();
    setDateRange({ ...range, label: preset.label });
    setShowDatePicker(false);
  };

  const handleAllData = () => {
    const dates = (data.orders || [])
      .map(o => { const d = o.date instanceof Date ? o.date : new Date(o.date); return isNaN(d.getTime()) ? null : d; })
      .filter(Boolean);
    if (dates.length > 0) {
      setDateRange({
        start: new Date(Math.min(...dates.map(d => d.getTime()))),
        end: new Date(Math.max(...dates.map(d => d.getTime()))),
        label: 'All Data',
      });
    }
    setShowDatePicker(false);
  };

  const formatDate = (d) => {
    try { return format(d instanceof Date ? d : new Date(d), 'MMM dd, yyyy'); }
    catch { return 'Invalid'; }
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{TAB_TITLES[activeTab] || 'Dashboard'}</h2>
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">
              {formatDate(dateRange.start)} — {formatDate(dateRange.end)}
            </p>
            {dataSource === 'uploaded' && (
              <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                <Database size={10} /> Live Data
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Universal Search */}
          {showSearch ? (
            <div className="relative">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, customers, SKU, AWB..."
                className="w-72 pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Search">
              <Search size={16} />
            </button>
          )}

          {/* Date Range Picker */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
            >
              <Calendar size={15} />
              <span>{dateRange.label}</span>
              <ChevronDown size={14} />
            </button>
            {showDatePicker && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-44 z-50">
                <button onClick={handleAllData} className="w-full text-left px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 transition-colors border-b border-gray-100">
                  All Data
                </button>
                {datePresets.map((preset) => (
                  <button key={preset.label} onClick={() => handlePreset(preset)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Refresh"><RefreshCw size={16} /></button>
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Export"><Download size={16} /></button>
          <button className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Alerts">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
