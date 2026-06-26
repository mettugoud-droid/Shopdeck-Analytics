import clsx from 'clsx';

export default function SectionCard({ title, subtitle, children, className, action }) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100 p-5', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
