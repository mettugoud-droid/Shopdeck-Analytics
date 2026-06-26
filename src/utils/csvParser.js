import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Detect file type and route to appropriate parser
 */
export function parseFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    return parseCSV(file);
  }

  if (ext === 'xls' || ext === 'xlsx' || ext === 'xlsb' || ext === 'xlsm') {
    return parseExcel(file);
  }

  return Promise.reject(new Error(`Unsupported file format: .${ext}. Use .csv, .xls, or .xlsx`));
}

/**
 * Parse a CSV file and return cleaned data
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        resolve({
          data: results.data,
          errors: results.errors,
          meta: results.meta,
        });
      },
      error: (error) => reject(error),
    });
  });
}

/**
 * Parse an Excel file (.xls, .xlsx) and return cleaned data
 * Reads the first sheet by default, or all sheets if multi-sheet
 */
export function parseExcel(file, options = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        // Use specified sheet or first sheet
        const sheetName = options.sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          reject(new Error(`Sheet "${sheetName}" not found. Available: ${workbook.SheetNames.join(', ')}`));
          return;
        }

        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: null,
          raw: false, // format dates as strings
        });

        // Normalize headers (lowercase, underscores)
        const normalizedData = jsonData.map(row => {
          const normalized = {};
          Object.entries(row).forEach(([key, value]) => {
            const normalKey = key.trim().toLowerCase().replace(/\s+/g, '_');
            normalized[normalKey] = value;
          });
          return normalized;
        });

        resolve({
          data: normalizedData,
          errors: [],
          meta: {
            fields: Object.keys(normalizedData[0] || {}),
            sheetName,
            totalSheets: workbook.SheetNames.length,
            allSheets: workbook.SheetNames,
          },
        });
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse Excel file and return all sheets as separate datasets
 */
export function parseExcelAllSheets(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        const sheets = {};
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null, raw: false });

          sheets[sheetName] = jsonData.map(row => {
            const normalized = {};
            Object.entries(row).forEach(([key, value]) => {
              const normalKey = key.trim().toLowerCase().replace(/\s+/g, '_');
              normalized[normalKey] = value;
            });
            return normalized;
          });
        });

        resolve(sheets);
      } catch (err) {
        reject(new Error(`Failed to parse Excel file: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse CSV string directly
 */
export function parseCSVString(csvString) {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
  });
  return results.data;
}

/**
 * Get list of supported file extensions
 */
export const SUPPORTED_EXTENSIONS = ['.csv', '.xls', '.xlsx', '.xlsb', '.xlsm', '.tsv'];
export const SUPPORTED_ACCEPT = '.csv,.xls,.xlsx,.xlsb,.xlsm,.tsv';

/**
 * Normalize order data from Shopdeck export
 */
export function normalizeOrderData(rawData) {
  return rawData.map((row) => ({
    orderId: row.order_id || row.order_no || row.id,
    date: parseDate(row.order_date || row.date || row.created_at),
    customerName: row.customer_name || row.name,
    customerEmail: row.customer_email || row.email,
    customerPhone: row.customer_phone || row.phone,
    amount: parseFloat(row.total_amount || row.amount || row.order_value || 0),
    status: (row.status || row.order_status || '').toLowerCase(),
    paymentStatus: (row.payment_status || '').toLowerCase(),
    paymentMethod: row.payment_method || row.payment_mode,
    city: row.city || row.shipping_city,
    state: row.state || row.shipping_state,
    pincode: row.pincode || row.zip,
    items: parseInt(row.items || row.quantity || row.total_items || 1),
    discount: parseFloat(row.discount || row.discount_amount || 0),
    shippingCharge: parseFloat(row.shipping_charge || row.shipping_cost || 0),
  }));
}

/**
 * Normalize dispatched order data
 */
export function normalizeDispatchedData(rawData) {
  return rawData.map((row) => ({
    orderId: row.order_id || row.order_no,
    dispatchDate: parseDate(row.dispatch_date || row.dispatched_date || row.shipped_date),
    deliveryDate: parseDate(row.delivery_date || row.delivered_date),
    carrier: row.carrier || row.logistics_partner || row.courier,
    trackingId: row.tracking_id || row.awb_number || row.tracking_number,
    status: (row.delivery_status || row.status || '').toLowerCase(),
    city: row.city || row.delivery_city,
    state: row.state || row.delivery_state,
    weight: parseFloat(row.weight || 0),
    shippingCost: parseFloat(row.shipping_cost || row.freight_charge || 0),
  }));
}

/**
 * Normalize cashflow data
 */
export function normalizeCashflowData(rawData) {
  return rawData.map((row) => ({
    date: parseDate(row.date || row.transaction_date),
    type: row.type || row.transaction_type,
    amount: parseFloat(row.amount || row.value || 0),
    description: row.description || row.remarks,
    orderId: row.order_id,
    category: row.category || inferCategory(row.type || row.transaction_type),
  }));
}

/**
 * Normalize product performance data
 */
export function normalizeProductData(rawData) {
  return rawData.map((row) => ({
    productId: row.product_id || row.sku || row.id,
    productName: row.product_name || row.name || row.title,
    category: row.category || row.product_type || row.type,
    unitsSold: parseInt(row.units_sold || row.quantity_sold || row.qty || 0),
    revenue: parseFloat(row.revenue || row.total_revenue || row.sales || 0),
    costPrice: parseFloat(row.cost_price || row.cost || row.cogs || 0),
    sellingPrice: parseFloat(row.selling_price || row.price || row.mrp || 0),
    returns: parseInt(row.returns || row.return_count || 0),
    avgRating: parseFloat(row.rating || row.avg_rating || 0),
  }));
}

/**
 * Normalize customer data
 */
export function normalizeCustomerData(rawData) {
  return rawData.map((row) => ({
    customerId: row.customer_id || row.id,
    name: row.customer_name || row.name,
    email: row.email || row.customer_email,
    phone: row.phone || row.customer_phone,
    totalOrders: parseInt(row.total_orders || row.order_count || row.purchases || 1),
    totalSpent: parseFloat(row.total_spent || row.lifetime_value || row.ltv || 0),
    firstPurchase: parseDate(row.first_purchase || row.first_order_date),
    lastPurchase: parseDate(row.last_purchase || row.last_order_date || row.last_buy),
    city: row.city,
    state: row.state,
  }));
}

/**
 * Normalize WhatsApp HSM data
 */
export function normalizeWhatsAppData(rawData) {
  return rawData.map((row) => ({
    campaignId: row.campaign_id || row.id,
    campaignName: row.campaign_name || row.name || row.template_name,
    date: parseDate(row.date || row.sent_date),
    sent: parseInt(row.sent || row.total_sent || 0),
    delivered: parseInt(row.delivered || row.total_delivered || 0),
    read: parseInt(row.read || row.total_read || 0),
    clicked: parseInt(row.clicked || row.total_clicked || 0),
    conversions: parseInt(row.conversions || row.orders || 0),
    revenue: parseFloat(row.revenue || row.conversion_value || 0),
  }));
}

/**
 * Normalize tax data
 */
export function normalizeTaxData(rawData) {
  return rawData.map((row) => ({
    date: parseDate(row.date || row.invoice_date),
    orderId: row.order_id,
    taxableAmount: parseFloat(row.taxable_amount || row.base_amount || 0),
    cgst: parseFloat(row.cgst || 0),
    sgst: parseFloat(row.sgst || 0),
    igst: parseFloat(row.igst || 0),
    totalTax: parseFloat(row.total_tax || row.tax_amount || 0),
    state: row.state || row.billing_state,
  }));
}

// Helpers
function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;

  // Convert to string for processing
  const str = String(value).trim();
  if (!str) return null;

  // Try native Date parse first (handles ISO, "Mon DD YYYY", etc.)
  let d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // Handle DD-MM-YYYY or DD/MM/YYYY (common Indian format)
  const ddmmyyyy = str.match(/^(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(d.getTime())) return d;
  }

  // Handle YYYY/MM/DD
  const yyyymmdd = str.match(/^(\d{4})[\-\/\.](\d{1,2})[\-\/\.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(d.getTime())) return d;
  }

  // Handle DD MMM YYYY or DD-MMM-YYYY (e.g., "25 Jun 2025", "25-Jun-2025")
  const ddMmmYyyy = str.match(/^(\d{1,2})[\s\-]([A-Za-z]{3,9})[\s\-](\d{4})$/);
  if (ddMmmYyyy) {
    d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  // Handle Excel serial date number
  const num = parseFloat(str);
  if (!isNaN(num) && num > 10000 && num < 100000) {
    // Excel date serial: days since 1900-01-01 (with Excel's leap year bug)
    const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
    d = new Date(excelEpoch.getTime() + num * 86400000);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function inferCategory(type) {
  if (!type) return 'other';
  const t = type.toLowerCase();
  if (t.includes('sale') || t.includes('order')) return 'revenue';
  if (t.includes('refund') || t.includes('return')) return 'refund';
  if (t.includes('ship') || t.includes('freight')) return 'shipping';
  if (t.includes('tax')) return 'tax';
  return 'other';
}
