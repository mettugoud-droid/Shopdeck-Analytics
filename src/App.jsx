import { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CSVUploadModal from './components/layout/CSVUploadModal';
import ExecutiveSummary from './components/sections/ExecutiveSummary';
import SalesOrders from './components/sections/SalesOrders';
import Fulfillment from './components/sections/Fulfillment';
import CustomerInsights from './components/sections/CustomerInsights';
import FinancialHealth from './components/sections/FinancialHealth';
import Marketing from './components/sections/Marketing';
import ProductPerformance from './components/sections/ProductPerformance';
import TrafficConversion from './components/sections/TrafficConversion';

function DashboardContent() {
  const { activeTab } = useDashboard();
  const [showUpload, setShowUpload] = useState(false);

  const renderSection = () => {
    switch (activeTab) {
      case 'overview': return <ExecutiveSummary />;
      case 'sales': return <SalesOrders />;
      case 'fulfillment': return <Fulfillment />;
      case 'customers': return <CustomerInsights />;
      case 'financial': return <FinancialHealth />;
      case 'marketing': return <Marketing />;
      case 'products': return <ProductPerformance />;
      case 'traffic': return <TrafficConversion />;
      default: return <ExecutiveSummary />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onUpload={() => setShowUpload(true)} />
      <main className="flex-1 ml-60">
        <Header />
        <div className="p-6">
          {renderSection()}
        </div>
      </main>
      <CSVUploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} />
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
