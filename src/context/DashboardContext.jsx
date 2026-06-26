import { createContext, useContext, useState, useMemo } from 'react';
import { subDays } from 'date-fns';
import { generateAllMockData } from '../data/mockData';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [data, setData] = useState(() => generateAllMockData());
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

  const value = useMemo(() => ({
    data,
    setData,
    dateRange,
    setDateRange,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
  }), [data, dateRange, activeTab, filters]);

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
