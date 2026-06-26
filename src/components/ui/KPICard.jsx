import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import clsx from 'clsx';

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-emerald-500 to-emerald-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  rose: 'from-rose-500 to-rose-600',
  red: 'from-rose-500 to-rose-600',
  indigo: 'from-indigo-500 to-indigo-600',
  teal: 'from-teal-500 to-teal-600',
};

export default function KPICard({ title, value, change, icon: Icon, color = 'blue', compact = false }) {
  const changeNum = parseFloat(change);
  const isPositive = changeNum > 0;
  const isNegative = changeNum < 0;
  const isNeutral = changeNum === 0 || isNaN(changeNum);

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          {Icon && (
            <div className={clsx('p-1.5 rounded-md bg-gradient-to-br text-white', colorMap[color])}>
              <Icon size={14} />
            </div>
          )}
          <p className="text-[11px] font-medium text-gray-500 truncate">{title}</p>
        </div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {Icon && (
          <div className={clsx('p-2.5 rounded-lg bg-gradient-to-br text-white', colorMap[color])}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="flex items-center mt-3 gap-1">
          {isPositive && <TrendingUp size={14} className="text-emerald-500" />}
          {isNegative && <TrendingDown size={14} className="text-rose-500" />}
          {isNeutral && <Minus size={14} className="text-gray-400" />}
          <span className={clsx(
            'text-sm font-medium',
            isPositive && 'text-emerald-600',
            isNegative && 'text-rose-600',
            isNeutral && 'text-gray-500',
          )}>
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-400 ml-1">vs prior period</span>
        </div>
      )}
    </div>
  );
}
