import {
  LayoutDashboard, ShoppingCart, Truck, Users, DollarSign,
  MessageSquare, Package, Globe, Upload, Settings, TrendingUp,
  FileText, CreditCard, Wallet, BarChart3, MousePointerClick,
  Target, Database, Command, ChevronDown, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useDashboard } from '../../context/DashboardContext';

const navSections = [
  {
    title: 'Overview',
    items: [
      { id: 'command-center', label: 'Founder Command Center', icon: Command },
    ],
  },
  {
    title: 'Reports',
    items: [
      { id: 'orders', label: 'Order Report', icon: ShoppingCart },
      { id: 'shipping', label: 'Shipping Performance', icon: Truck },
      { id: 'dispatch', label: 'Dispatch Report', icon: Package },
      { id: 'reconciliation', label: 'Order Reconciliation', icon: CreditCard },
      { id: 'cashflow', label: 'Cashflow Report', icon: Wallet },
      { id: 'product-performance', label: 'Product Performance', icon: BarChart3 },
      { id: 'product-type', label: 'Product Type', icon: Package },
      { id: 'customers', label: 'Purchased Customers', icon: Users },
      { id: 'buy-now-clicks', label: 'Last Buy Now Click', icon: MousePointerClick },
      { id: 'whatsapp', label: 'WhatsApp HSM', icon: MessageSquare },
    ],
  },
  {
    title: 'Modules',
    items: [
      { id: 'profitability', label: 'Profitability Engine', icon: TrendingUp },
      { id: 'import-center', label: 'Import Center', icon: Database },
    ],
  },
];


export default function Sidebar({ onUpload }) {
  const { activeTab, setActiveTab } = useDashboard();
  const [expandedSections, setExpandedSections] = useState({ Overview: true, Reports: true, Modules: true });

  const toggleSection = (title) => {
    setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Nature's Crates</h1>
            <p className="text-[10px] text-slate-400">Founder Operating System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
        {navSections.map((section) => (
          <div key={section.title} className="mb-2">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              <span>{section.title}</span>
              {expandedSections[section.title] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {expandedSections[section.title] && (
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={clsx(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all',
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <Icon size={16} />
                      <span className="font-medium truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-3 border-t border-slate-700 space-y-1">
        <button
          onClick={onUpload}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Upload size={16} />
          <span className="font-medium">Upload Data</span>
        </button>
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Settings size={16} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
