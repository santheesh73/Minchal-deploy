import React, { ReactNode } from 'react';

export interface CardProps {
  variant?: 'default' | 'flat' | 'outline' | 'interactive' | 'brand';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200 overflow-hidden';

  const variantClasses = {
    default: 'bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg',
    flat: 'bg-slate-100 border border-slate-200/60',
    outline: 'bg-white border border-slate-200',
    interactive:
      'bg-white border border-slate-200 shadow-soft hover:shadow-soft-lg hover:border-brand-300 cursor-pointer active:scale-[0.99]',
    brand:
      'bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-soft-lg',
  };

  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </div>
  );
};
