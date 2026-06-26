import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import SectionCard from '../ui/SectionCard';
import { useDashboard } from '../../context/DashboardContext';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function ImportCenter() {
  const { setData } = useDashboard();
  const [dragActive, setDragActive] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [importStatus, setImportStatus] = useState(null); // success, error, null

  const processFile = useCallback(async (file) => {
    setProcessing(true);
    setValidationErrors([]);
    setImportStatus(null);

    try {
      let rows = [];
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'csv') {
        const text = await file.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        rows = result.data;
        if (result.errors.length > 0) {
          setValidationErrors(result.errors.slice(0, 10).map(e => ({ row: e.row, message: e.message })));
        }
      } else if (['xlsx', 'xls'].includes(ext)) {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws);
      } else {
        setValidationErrors([{ row: 0, message: `Unsupported file type: .${ext}` }]);
        setProcessing(false);
        setImportStatus('error');
        return;
      }

      // Validate rows
      const errors = [];
      const duplicates = new Set();
      rows.forEach((row, idx) => {
        const id = row['Order ID'] || row['orderId'] || row['order_id'];
        if (id && duplicates.has(id)) {
          errors.push({ row: idx + 1, message: `Duplicate Order ID: ${id}` });
        }
        if (id) duplicates.add(id);
      });

      if (errors.length > 0) setValidationErrors(errors.slice(0, 20));

      // Map to orders format
      const mappedOrders = rows.map((row, idx) => ({
        orderId: row['Order ID'] || row['orderId'] || `IMP-${idx}`,
        orderNumber: row['Order Number'] || row['orderNumber'] || '',
        externalOrderId: row['External Order ID'] || '',
        date: row['Order Date'] ? new Date(row['Order Date']) : new Date(),
        orderTime: row['Order Time'] || '',
        status: (row['Order Status'] || row['status'] || 'processing').toLowerCase(),
        paymentStatus: row['Payment Status'] || 'paid',
        paymentMethod: row['Payment Method'] || 'UPI',
        paymentGateway: row['Payment Gateway'] || 'Razorpay',
        orderSource: row['Order Source'] || 'Website',
        salesChannel: row['Sales Channel'] || 'Shopdeck',
        customerName: row['Customer Name'] || row['customerName'] || 'Unknown',
        customerPhone: row['Mobile'] || row['Phone'] || '',
        customerEmail: row['Email'] || '',
        address: row['Address'] || '',
        area: row['Area'] || '',
        landmark: row['Landmark'] || '',
        city: row['City'] || '',
        district: row['District'] || '',
        state: row['State'] || '',
        country: row['Country'] || 'India',
        pincode: row['Pincode'] || '',
        productName: row['Product Name'] || row['productName'] || '',
        sku: row['SKU'] || '',
        variant: row['Variant'] || '',
        productCategory: row['Product Category'] || row['Category'] || '',
        quantity: parseInt(row['Quantity'] || row['Qty'] || 1),
        unitPrice: parseFloat(row['Unit Price'] || 0),
        discount: parseFloat(row['Discount'] || 0),
        coupon: row['Coupon'] || '',
        tax: parseFloat(row['Tax'] || 0),
        shippingCharge: parseFloat(row['Shipping Charge'] || 0),
        grossAmount: parseFloat(row['Gross Amount'] || row['Amount'] || 0),
        discountAmount: parseFloat(row['Discount Amount'] || row['Discount'] || 0),
        netAmount: parseFloat(row['Net Amount'] || row['Total'] || 0),
        platformCharges: parseFloat(row['Platform Charges'] || 0),
        paymentGatewayCharges: parseFloat(row['Payment Gateway Charges'] || 0),
        shippingCharges: parseFloat(row['Shipping Charges'] || 0),
        settlementAmount: parseFloat(row['Settlement Amount'] || 0),
        warehouse: row['Warehouse'] || '',
        courier: row['Courier'] || '',
        awbNumber: row['AWB Number'] || row['AWB'] || '',
        dispatchDate: row['Dispatch Date'] ? new Date(row['Dispatch Date']) : null,
        deliveryDate: row['Delivery Date'] ? new Date(row['Delivery Date']) : null,
        deliverySLA: parseInt(row['Delivery SLA'] || 5),
        deliveryStatus: row['Delivery Status'] || 'Pending',
      }));

      // Update data
      setData(prev => ({ ...prev, orders: mappedOrders }));
      setImportStatus('success');
      setImportHistory(prev => [
        { id: Date.now(), filename: file.name, rows: rows.length, errors: errors.length, date: new Date(), status: errors.length > 0 ? 'partial' : 'success' },
        ...prev,
      ]);
    } catch (err) {
      setValidationErrors([{ row: 0, message: err.message }]);
      setImportStatus('error');
    } finally {
      setProcessing(false);
    }
  }, [setData]);


  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <SectionCard title="Data Import & Validation Center" subtitle="Upload CSV or XLSX files from Shopdeck">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 bg-gray-50'
          }`}
        >
          <Upload size={40} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {processing ? 'Processing...' : 'Drop your file here'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Supports CSV, XLSX, XLS files</p>
          <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition-colors">
            <FileSpreadsheet size={16} />
            <span className="text-sm font-medium">Choose File</span>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
          </label>
        </div>
      </SectionCard>

      {/* Import Status */}
      {importStatus && (
        <div className={`p-4 rounded-xl border ${importStatus === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex items-center gap-2">
            {importStatus === 'success' ? <CheckCircle size={18} className="text-emerald-600" /> : <XCircle size={18} className="text-rose-600" />}
            <span className={`font-medium ${importStatus === 'success' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {importStatus === 'success' ? 'Import completed successfully!' : 'Import failed with errors'}
            </span>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <SectionCard title="Validation Issues" subtitle={`${validationErrors.length} issues found`}>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {validationErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                <AlertTriangle size={12} className="text-amber-600 shrink-0" />
                <span className="text-xs text-amber-700">Row {err.row}: {err.message}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Import History */}
      <SectionCard title="Import History">
        {importHistory.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No imports yet</p>
        ) : (
          <div className="space-y-2">
            {importHistory.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={16} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.filename}</p>
                    <p className="text-xs text-gray-500">{item.rows} rows • {item.date.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    item.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status === 'success' ? 'Success' : `${item.errors} errors`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Field Mapping Guide */}
      <SectionCard title="Field Mapping Guide" subtitle="Expected column headers in your Shopdeck export">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['Order ID', 'Order Date', 'Order Status', 'Customer Name', 'Mobile', 'Email', 'City', 'State',
            'Product Name', 'SKU', 'Quantity', 'Unit Price', 'Gross Amount', 'Net Amount', 'Payment Method',
            'Courier', 'AWB Number', 'Dispatch Date', 'Delivery Date', 'Shipping Charge'].map(field => (
            <span key={field} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 font-mono">{field}</span>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
