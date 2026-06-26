import { Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function FilterBar({ filters = [], values = {}, onChange }) {
  const [show, setShow] = useState(false);
  const activeCount = Object.values(values).filter(v => v && v !== 'all').length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter size={14} />
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full font-medium">{activeCount}</span>
        )}
      </button>

      {show && (
        <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-wrap gap-3 items-end">
          {filters.map(filter => (
            <div key={filter.key} className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-gray-500 uppercase">{filter.label}</label>
              <select
                value={values[filter.key] || 'all'}
                onChange={e => onChange({ ...values, [filter.key]: e.target.value })}
                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[120px]"
              >
                <option value="all">All</option>
                {filter.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
          <button
            onClick={() => {
              const reset = {};
              filters.forEach(f => { reset[f.key] = 'all'; });
              onChange(reset);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <X size={12} /> Clear
          </button>
        </div>
      )}
    </div>
  );
}
