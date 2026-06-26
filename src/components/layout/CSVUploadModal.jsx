import { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Trash2, HardDrive, RotateCcw, Files } from 'lucide-react';
import { parseCSV, normalizeOrderData, normalizeDispatchedData, normalizeCashflowData, normalizeProductData, normalizeCustomerData, normalizeWhatsAppData, normalizeTaxData } from '../../utils/csvParser';
import { useDashboard } from '../../context/DashboardContext';
import { clearStorage, getStorageMeta } from '../../utils/storage';

const reportTypes = [
  { id: 'orders', label: 'Order Report', normalizer: normalizeOrderData, keywords: ['order'] },
  { id: 'dispatched', label: 'Dispatched Order Report', normalizer: normalizeDispatchedData, keywords: ['dispatch', 'shipped'] },
  { id: 'cashflow', label: 'CashFlow Report', normalizer: normalizeCashflowData, keywords: ['cash', 'flow', 'payment'] },
  { id: 'products', label: 'Product Performance', normalizer: normalizeProductData, keywords: ['product'] },
  { id: 'customers', label: 'Customer Report', normalizer: normalizeCustomerData, keywords: ['customer', 'buyer'] },
  { id: 'whatsapp', label: 'WhatsApp HSM Report', normalizer: normalizeWhatsAppData, keywords: ['whatsapp', 'hsm', 'campaign'] },
  { id: 'tax', label: 'Tax Report', normalizer: normalizeTaxData, keywords: ['tax', 'gst'] },
];

/**
 * Try to auto-detect report type from filename
 */
function detectReportType(filename) {
  const lower = filename.toLowerCase();
  for (const rt of reportTypes) {
    if (rt.keywords.some(kw => lower.includes(kw))) {
      return rt.id;
    }
  }
  return 'orders'; // default fallback
}

export default function CSVUploadModal({ isOpen, onClose }) {
  const { setData, data, dataSource, resetToMockData } = useDashboard();
  const [selectedType, setSelectedType] = useState('orders');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);

  if (!isOpen) return null;

  const storageMeta = getStorageMeta();

  // --- Process a single file ---
  const processFile = async (file, typeOverride) => {
    const type = typeOverride || (batchMode ? detectReportType(file.name) : selectedType);
    const reportType = reportTypes.find(r => r.id === type);

    try {
      const result = await parseCSV(file);
      const normalizedData = reportType.normalizer(result.data);

      setData(prev => ({ ...prev, [type]: normalizedData }));

      return {
        filename: file.name,
        type: reportType.label,
        typeId: type,
        records: normalizedData.length,
        status: 'success',
      };
    } catch (err) {
      return {
        filename: file.name,
        type: reportType.label,
        typeId: type,
        records: 0,
        status: 'error',
        error: err.message,
      };
    }
  };

  // --- Process multiple files ---
  const processFiles = async (files) => {
    setIsProcessing(true);
    setUploadResults([]);

    const results = [];
    for (const file of files) {
      if (!file.name.endsWith('.csv')) {
        results.push({
          filename: file.name,
          type: 'Unknown',
          records: 0,
          status: 'error',
          error: 'Not a CSV file',
        });
        continue;
      }
      const result = await processFile(file);
      results.push(result);
    }

    setUploadResults(results);
    setIsProcessing(false);
  };

  // --- Click Upload Handler ---
  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) processFiles(files);
    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Drag & Drop Handlers ---
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items?.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      // Auto-enable batch mode if multiple files dropped
      if (files.length > 1) setBatchMode(true);
      processFiles(files);
    }
  };

  // --- Clear Results ---
  const clearResults = () => setUploadResults([]);

  const successCount = uploadResults.filter(r => r.status === 'success').length;
  const errorCount = uploadResults.filter(r => r.status === 'error').length;
  const totalRecords = uploadResults.reduce((sum, r) => sum + r.records, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload CSV Reports</h3>
            <p className="text-xs text-gray-500">Drag & drop or click to upload. Supports batch upload.</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Mode Toggle + Report Type */}
          <div className="flex gap-3">
            {/* Batch Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={batchMode}
                  onChange={(e) => setBatchMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-xs font-medium text-gray-600">Batch Mode</span>
            </div>

            {/* Report Type (only in single mode) */}
            {!batchMode && (
              <div className="flex-1">
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
            )}

            {batchMode && (
              <div className="flex-1 flex items-center">
                <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <Files size={12} className="inline mr-1" />
                  Auto-detects report type from filename
                </p>
              </div>
            )}
          </div>

          {/* Drag & Drop Upload Area */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200
              ${isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg shadow-blue-100'
                : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              }
              ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload-input"
            />
            <label htmlFor="csv-upload-input" className="cursor-pointer">
              {isDragging ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <Upload size={28} className="text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-blue-700">Drop files here!</p>
                  <p className="text-xs text-blue-500 mt-1">Release to upload</p>
                </>
              ) : isProcessing ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">Processing files...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <Upload size={28} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Drag & drop CSV files here</p>
                  <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                  <p className="text-xs text-gray-400 mt-3">
                    Supports multiple files • Auto-saves to browser storage
                  </p>
                </>
              )}
            </label>
          </div>

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">
                  Upload Results: {successCount} success, {errorCount} failed, {totalRecords.toLocaleString()} total records
                </p>
                <button onClick={clearResults} className="text-xs text-gray-400 hover:text-gray-600">
                  Clear
                </button>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {uploadResults.map((result, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2.5 rounded-lg text-sm ${
                      result.status === 'success'
                        ? 'bg-emerald-50 border border-emerald-100'
                        : 'bg-rose-50 border border-rose-100'
                    }`}
                  >
                    {result.status === 'success'
                      ? <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      : <AlertCircle size={15} className="text-rose-600 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${
                        result.status === 'success' ? 'text-emerald-800' : 'text-rose-800'
                      }`}>
                        {result.filename}
                      </p>
                      <p className={`text-xs ${
                        result.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {result.status === 'success'
                          ? `${result.records} records → ${result.type}`
                          : result.error
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Storage Status */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-gray-500" />
                <p className="text-xs font-medium text-gray-500">Browser Storage</p>
              </div>
              {storageMeta && (
                <span className="text-xs text-gray-400">
                  {storageMeta.sizeKB}KB • Saved {new Date(storageMeta.savedAt).toLocaleString()}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
              <span>Orders: {data.orders?.length || 0}</span>
              <span>Dispatched: {data.dispatched?.length || 0}</span>
              <span>Products: {data.products?.length || 0}</span>
              <span>Customers: {data.customers?.length || 0}</span>
              <span>Cashflow: {data.cashflow?.length || 0}</span>
              <span>WhatsApp: {data.whatsapp?.length || 0}</span>
              <span>Tax: {data.tax?.length || 0}</span>
            </div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={11} />
              Data persists across page refreshes
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between shrink-0">
          <button
            onClick={() => {
              resetToMockData();
              setUploadResults([]);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
          >
            <RotateCcw size={14} />
            Reset to Demo Data
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
