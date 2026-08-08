import React, { useRef, useState } from 'react';

export interface MagicBentoProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'brand' | 'emerald' | 'amber' | 'purple' | 'slate';
  variant?: 'default' | 'dark' | 'ghost';
  onClick?: () => void;
}

export const MagicBento: React.FC<MagicBentoProps> = ({
  children,
  className = '',
  glowColor = 'brand',
  variant = 'default',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const glowGradients = {
    brand: 'rgba(13, 110, 110, 0.15)',
    emerald: 'rgba(16, 185, 129, 0.15)',
    amber: 'rgba(245, 158, 11, 0.15)',
    purple: 'rgba(168, 85, 247, 0.15)',
    slate: 'rgba(148, 163, 184, 0.15)',
  };

  const variantStyles = {
    default: 'bg-white border-slate-200/90 text-slate-900 hover:border-brand-300',
    dark: 'bg-slate-900/90 border-slate-800 text-white hover:border-slate-700',
    ghost: 'bg-slate-50/70 border-slate-200/70 text-slate-900 hover:bg-white',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`group relative rounded-3xl border transition-all duration-300 shadow-soft-md hover:shadow-soft-xl hover:-translate-y-1 overflow-hidden ${variantStyles[variant]} ${className}`}
    >
      {/* Magic Bento Spotlight Glow Layer (ReactBits Magic Bento Effect) */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(400px circle at ${spotlight.x}px ${spotlight.y}px, ${glowGradients[glowColor]}, transparent 70%)`,
        }}
      />

      {/* Glassmorphic Top Specular Highlight Edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none z-10" />

      {/* Inner Bento Card Content */}
      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
};
