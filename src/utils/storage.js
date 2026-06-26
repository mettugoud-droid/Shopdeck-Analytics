/**
 * localStorage persistence layer for dashboard data.
 * Handles serialization/deserialization of dates and large datasets.
 */

const STORAGE_KEY = 'shopdeck_analytics_data';
const STORAGE_META_KEY = 'shopdeck_analytics_meta';

/**
 * Save dashboard data to localStorage
 * Dates are serialized as ISO strings
 */
export function saveToStorage(data) {
  try {
    const serialized = JSON.stringify(data, (key, value) => {
      // Convert Date objects to ISO strings with a marker
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      return value;
    });

    // Check size before saving (localStorage limit ~5-10MB)
    const sizeInMB = new Blob([serialized]).size / (1024 * 1024);
    if (sizeInMB > 4.5) {
      console.warn(`Data too large for localStorage (${sizeInMB.toFixed(1)}MB). Skipping save.`);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, serialized);
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      sizes: {
        orders: data.orders?.length || 0,
        dispatched: data.dispatched?.length || 0,
        cashflow: data.cashflow?.length || 0,
        products: data.products?.length || 0,
        customers: data.customers?.length || 0,
        whatsapp: data.whatsapp?.length || 0,
        tax: data.tax?.length || 0,
      },
      sizeKB: Math.round(sizeInMB * 1024),
    }));

    return true;
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return false;
  }
}

/**
 * Load dashboard data from localStorage
 * Returns null if no data found or parse fails
 */
export function loadFromStorage() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;

    const data = JSON.parse(serialized, (key, value) => {
      // Restore Date objects from ISO string markers
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });

    return data;
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return null;
  }
}

/**
 * Get metadata about stored data
 */
export function getStorageMeta() {
  try {
    const meta = localStorage.getItem(STORAGE_META_KEY);
    return meta ? JSON.parse(meta) : null;
  } catch {
    return null;
  }
}

/**
 * Clear all stored dashboard data
 */
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_META_KEY);
}

/**
 * Check if localStorage has saved data
 */
export function hasStoredData() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
