import React, { ReactNode } from 'react';

export interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  selected = false,
  onClick,
  onRemove,
  icon,
  children,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 select-none cursor-pointer border ${
        selected
          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
          : 'bg-white text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-50'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors focus:outline-none`}
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
