import { useState, lazy, Suspense } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CSVUploadModal from './components/layout/CSVUploadModal';

// Lazy load all report sections
const FounderCommandCenter = lazy(() => import('./components/sections/FounderCommandCenter'));
const OrderReport = lazy(() => import('./components/sections/OrderReport'));
const ShippingPerformance = lazy(() => import('./components/sections/ShippingPerformance'));
const DispatchReport = lazy(() => import('./components/sections/DispatchReport'));
const OrderReconciliation = lazy(() => import('./components/sections/OrderReconciliation'));
const CashflowReport = lazy(() => import('./components/sections/CashflowReport'));
const ProductPerformanceReport = lazy(() => import('./components/sections/ProductPerformanceReport'));
const ProductTypeReport = lazy(() => import('./components/sections/ProductTypeReport'));
const PurchasedCustomers = lazy(() => import('./components/sections/PurchasedCustomers'));
const BuyNowClickReport = lazy(() => import('./components/sections/BuyNowClickReport'));
const WhatsAppHSM = lazy(() => import('./components/sections/WhatsAppHSM'));
const ProfitabilityEngine = lazy(() => import('./components/sections/ProfitabilityEngine'));
const ImportCenter = lazy(() => import('./components/sections/ImportCenter'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    </div>
  );
}


function DashboardContent() {
  const { activeTab } = useDashboard();
  const [showUpload, setShowUpload] = useState(false);

  const renderSection = () => {
    switch (activeTab) {
      case 'command-center': return <FounderCommandCenter />;
      case 'orders': return <OrderReport />;
      case 'shipping': return <ShippingPerformance />;
      case 'dispatch': return <DispatchReport />;
      case 'reconciliation': return <OrderReconciliation />;
      case 'cashflow': return <CashflowReport />;
      case 'product-performance': return <ProductPerformanceReport />;
      case 'product-type': return <ProductTypeReport />;
      case 'customers': return <PurchasedCustomers />;
      case 'buy-now-clicks': return <BuyNowClickReport />;
      case 'whatsapp': return <WhatsAppHSM />;
      case 'profitability': return <ProfitabilityEngine />;
      case 'import-center': return <ImportCenter />;
      default: return <FounderCommandCenter />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar onUpload={() => setShowUpload(true)} />
      <main className="flex-1 ml-64">
        <Header />
        <div className="p-6">
          <Suspense fallback={<LoadingFallback />}>
            {renderSection()}
          </Suspense>
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
