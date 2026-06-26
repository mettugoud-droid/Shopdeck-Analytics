import {
  LayoutDashboard, ShoppingCart, Truck, Users, DollarSign,
  MessageSquare, Package, Globe, Upload, Settings
} from 'lucide-react';
import clsx from 'clsx';
import { useDashboard } from '../../context/DashboardContext';

const navItems = [
  { id: 'overview', label: 'Executive Summary', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales & Orders', icon: ShoppingCart },
  { id: 'fulfillment', label: 'Fulfillment', icon: Truck },
  { id: 'customers', label: 'Customer Insights', icon: Users },
  { id: 'financial', label: 'Financial Health', icon: DollarSign },
  { id: 'marketing', label: 'Marketing', icon: MessageSquare },
  { id: 'products', label: 'Product Performance', icon: Package },
  { id: 'traffic', label: 'Traffic & Conversion', icon: Globe },
];

export default function Sidebar({ onUpload }) {
  const { activeTab, setActiveTab } = useDashboard();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900 text-white flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold">Analytics</h1>
            <p className="text-[10px] text-slate-400">E-Commerce Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={18} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Upload Section */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={onUpload}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <Upload size={18} />
          <span className="font-medium">Upload CSV</span>
        </button>
      </div>
    </aside>
  );
}
