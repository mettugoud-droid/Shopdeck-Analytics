import { Calendar, ChevronDown, RefreshCw, Download, Bell } from 'lucide-react';
import { useState } from 'react';
import { subDays, format } from 'date-fns';
import { useDashboard } from '../../context/DashboardContext';

const datePresets = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 14 Days', days: 14 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 60 Days', days: 60 },
  { label: 'Last 90 Days', days: 90 },
];

export default function Header() {
  const { dateRange, setDateRange } = useDashboard();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePreset = (preset) => {
    setDateRange({
      start: subDays(new Date(), preset.days),
      end: new Date(),
      label: preset.label,
    });
    setShowDatePicker(false);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-xs text-gray-500">
            {format(dateRange.start, 'MMM dd, yyyy')} — {format(dateRange.end, 'MMM dd, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-3">
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
                {datePresets.map((preset) => (
                  <button
                    key={preset.days}
                    onClick={() => handlePreset(preset)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Refresh Data">
            <RefreshCw size={16} />
          </button>

          {/* Export */}
          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Export">
            <Download size={16} />
          </button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors" title="Alerts">
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
