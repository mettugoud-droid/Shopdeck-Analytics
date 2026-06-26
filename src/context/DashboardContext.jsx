import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { subDays } from 'date-fns';
import { generateAllMockData } from '../data/mockData';
import { saveToStorage, loadFromStorage, hasStoredData, clearStorage, getStorageMeta } from '../utils/storage';

const DashboardContext = createContext(null);

function initializeData() {
  // Try to load from localStorage first
  const stored = loadFromStorage();
  if (stored) {
    console.log('[Dashboard] Loaded data from localStorage');
    return stored;
  }
  // Fall back to mock data
  console.log('[Dashboard] No stored data found, using mock data');
  return generateAllMockData();
}

export function DashboardProvider({ children }) {
  const [data, setDataRaw] = useState(initializeData);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 Days',
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    city: 'all',
  });
  const [dataSource, setDataSource] = useState(() =>
    hasStoredData() ? 'localStorage' : 'mock'
  );

  // Persist data to localStorage whenever it changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = saveToStorage(data);
      if (saved) {
        setDataSource('localStorage');
      }
    }, 500); // debounce 500ms

    return () => clearTimeout(timer);
  }, [data]);

  // Wrapped setData that also updates source indicator and auto-adjusts date range
  const setData = useCallback((updater) => {
    setDataRaw(prev => {
      const newData = typeof updater === 'function' ? updater(prev) : updater;

      // Auto-adjust date range to cover uploaded order data
      if (newData.orders && newData.orders.length > 0) {
        const dates = newData.orders
          .map(o => {
            if (!o.date) return null;
            const d = o.date instanceof Date ? o.date : new Date(o.date);
            return isNaN(d.getTime()) ? null : d;
          })
          .filter(Boolean);

        if (dates.length > 0) {
          const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

          // Expand date range to cover all uploaded data
          setDateRange({
            start: minDate,
            end: maxDate,
            label: 'All Data',
          });
        }
      }

      return newData;
    });
    setDataSource('uploaded');
  }, []);

  // Reset to mock data and clear storage
  const resetToMockData = useCallback(() => {
    clearStorage();
    const mockData = generateAllMockData();
    setDataRaw(mockData);
    setDataSource('mock');
  }, []);

  // Get storage metadata
  const storageMeta = useMemo(() => getStorageMeta(), [data]);

  const value = useMemo(() => ({
    data,
    setData,
    dateRange,
    setDateRange,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    dataSource,
    storageMeta,
    resetToMockData,
  }), [data, setData, dateRange, activeTab, filters, dataSource, storageMeta, resetToMockData]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
