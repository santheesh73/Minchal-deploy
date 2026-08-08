import React, { useRef, useState } from 'react';

export interface SpecularButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'outline' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  className?: string;
}

export const SpecularButton: React.FC<SpecularButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  rightIcon,
  leftIcon,
  className = '',
  onClick,
  ...props
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setMousePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-bold',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-brand-600 via-brand-500 to-blue-600 text-white shadow-lg shadow-brand-500/25 border border-brand-400/40 hover:shadow-brand-500/40',
    success:
      'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 border border-emerald-400/40 hover:shadow-emerald-500/40',
    outline:
      'bg-white/90 backdrop-blur-md text-slate-700 border border-slate-300/80 shadow-xs hover:bg-slate-50 hover:border-slate-400',
    dark:
      'bg-slate-900 text-white border border-slate-700/80 shadow-xl hover:bg-slate-800',
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 rounded-2xl overflow-hidden transition-all duration-300 group active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {/* Specular Mouse Highlight Sheen Sweep (ReactBits Specular Effect) */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: mousePos.opacity,
          background: `radial-gradient(160px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.45), transparent 70%)`,
        }}
      />

      {/* Subtle Ambient Glass Shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {/* Content */}
      {leftIcon && <span className="relative z-10">{leftIcon}</span>}
      <span className="relative z-10">{children}</span>
      {rightIcon && (
        <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
          {rightIcon}
        </span>
      )}
    </button>
  );
};
