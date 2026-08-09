import React, { useState, useEffect } from 'react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show splash screen for 1.2s then fade out smoothly
    const timer1 = setTimeout(() => {
      setIsFading(true);
    }, 1000);

    const timer2 = setTimeout(() => {
      setIsVisible(false);
    }, 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ease-in-out select-none ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-50/60 rounded-full blur-3xl pointer-events-none" />

      {/* Opening Logo Showcase */}
      <div className="relative z-10 flex flex-col items-center space-y-6 transform transition-transform duration-700">
        <img
          src="/logo/logo.svg"
          alt="MINCHAL — AI-Powered Home Energy Audit"
          className="h-28 sm:h-36 w-auto object-contain drop-shadow-md animate-pulse"
        />

        {/* Shimmer Progress Indicator Bar */}
        <div className="w-48 h-1.5 rounded-full bg-slate-100 overflow-hidden shadow-inner relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d6e6e] via-[#f59e0b] to-[#2563eb] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
