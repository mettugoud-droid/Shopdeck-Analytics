import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Download, Search, Filter } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

export default function DataTable({ columns, data, title, subtitle, onExport, pageSize = 15 }) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [localSearch, setLocalSearch] = useState('');

  const filtered = useMemo(() => {
    if (!localSearch) return data;
    const q = localSearch.toLowerCase();
    return data.filter(row =>
      columns.some(col => {
        const val = row[col.key];
        return val && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, localSearch, columns]);

  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key) => {
    if (sortField === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(key);
      setSortDir('asc');
    }
  };

  const renderValue = (row, col) => {
    const val = row[col.key];
    if (val == null || val === '') return '-';
    if (col.format === 'currency') return formatCurrency(val);
    if (col.format === 'date') {
      const d = val instanceof Date ? val : new Date(val);
      return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-IN');
    }
    if (col.format === 'percent') return `${val}%`;
    if (col.render) return col.render(val, row);
    return String(val);
  };


  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          {title && <h3 className="text-sm font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={e => { setLocalSearch(e.target.value); setPage(0); }}
              placeholder="Search..."
              className="w-48 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search size={12} className="absolute left-2.5 top-2 text-gray-400" />
          </div>
          {onExport && (
            <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
              <Download size={12} /> Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left py-2.5 px-3 font-medium text-gray-500 text-xs cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortField === col.key ? (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    ) : (
                      <ChevronsUpDown size={10} className="text-gray-300" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length} className="py-8 text-center text-gray-400 text-sm">No data found</td></tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx} className="border-t border-gray-50 hover:bg-gray-50/50">
                  {columns.map(col => (
                    <td key={col.key} className="py-2 px-3 text-gray-700 text-xs whitespace-nowrap">
                      {renderValue(row, col)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-2.5 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-2.5 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
