import React from 'react';
import { Link } from 'react-router-dom';

export interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      <img
        src="/logo/mark.png"
        alt="MINCHAL Logo"
        className={`${heights[size]} w-auto object-contain shrink-0 group-hover:scale-105 transition-transform`}
      />
      {showText && (
        <div className="flex flex-col select-none">
          <span className="font-extrabold text-lg tracking-tight leading-none">
            <span className="text-[#0f595e]">M</span><span className="text-[#0f172a]">inchal</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold tracking-tight mt-0.5 whitespace-nowrap">
            AI Home Energy Audit
          </span>
        </div>
      )}
    </Link>
  );
};
