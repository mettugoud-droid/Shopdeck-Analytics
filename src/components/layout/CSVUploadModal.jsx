import { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseCSV, normalizeOrderData, normalizeDispatchedData, normalizeCashflowData, normalizeProductData, normalizeCustomerData, normalizeWhatsAppData, normalizeTaxData } from '../../utils/csvParser';
import { useDashboard } from '../../context/DashboardContext';

const reportTypes = [
  { id: 'orders', label: 'Order Report', normalizer: normalizeOrderData },
  { id: 'dispatched', label: 'Dispatched Order Report', normalizer: normalizeDispatchedData },
  { id: 'cashflow', label: 'CashFlow Report', normalizer: normalizeCashflowData },
  { id: 'products', label: 'Product Performance', normalizer: normalizeProductData },
  { id: 'customers', label: 'Customer Report', normalizer: normalizeCustomerData },
  { id: 'whatsapp', label: 'WhatsApp HSM Report', normalizer: normalizeWhatsAppData },
  { id: 'tax', label: 'Tax Report', normalizer: normalizeTaxData },
];

export default function CSVUploadModal({ isOpen, onClose }) {
  const { setData, data } = useDashboard();
  const [selectedType, setSelectedType] = useState('orders');
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseCSV(file);
      const reportType = reportTypes.find(r => r.id === selectedType);
      const normalizedData = reportType.normalizer(result.data);

      setData(prev => ({ ...prev, [selectedType]: normalizedData }));
      setUploadStatus('success');
      setMessage(`Successfully imported ${normalizedData.length} records from ${file.name}`);
    } catch (err) {
      setUploadStatus('error');
      setMessage(`Error parsing file: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Upload CSV Report</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Report Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reportTypes.map(rt => (
                <option key={rt.id} value={rt.id}>{rt.label}</option>
              ))}
            </select>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-700">Click to upload CSV file</p>
              <p className="text-xs text-gray-500 mt-1">Supports Shopdeck CSV exports</p>
            </label>
          </div>

          {/* Status Message */}
          {uploadStatus && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              uploadStatus === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {uploadStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Current Data Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Currently Loaded Data</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <span>Orders: {data.orders?.length || 0}</span>
              <span>Dispatched: {data.dispatched?.length || 0}</span>
              <span>Products: {data.products?.length || 0}</span>
              <span>Customers: {data.customers?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
