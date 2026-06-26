import { Download, FileSpreadsheet, FileText, Printer, Copy, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function ExportButton({ data, columns, filename = 'export' }) {
  const [show, setShow] = useState(false);

  const getExportData = () => {
    return data.map(row => {
      const obj = {};
      columns.forEach(col => {
        let val = row[col.key];
        if (val instanceof Date) val = val.toLocaleDateString('en-IN');
        obj[col.label] = val ?? '';
      });
      return obj;
    });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setShow(false);
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(getExportData());
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
    setShow(false);
  };

  const exportPDF = () => {
    window.print();
    setShow(false);
  };

  const copyToClipboard = () => {
    const text = data.map(row => columns.map(c => row[c.key] ?? '').join('\t')).join('\n');
    navigator.clipboard.writeText(text);
    setShow(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <Download size={14} /> Export <ChevronDown size={12} />
      </button>
      {show && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl py-1 w-44 z-50">
          <button onClick={exportExcel} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50">
            <FileSpreadsheet size={14} /> Excel (.xlsx)
          </button>
          <button onClick={exportCSV} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50">
            <FileText size={14} /> CSV
          </button>
          <button onClick={exportPDF} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50">
            <Printer size={14} /> Print / PDF
          </button>
          <button onClick={copyToClipboard} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50">
            <Copy size={14} /> Copy
          </button>
        </div>
      )}
    </div>
  );
}
