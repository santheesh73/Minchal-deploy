import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { SpecularButton } from './SpecularButton';
import { ArrowRight } from 'lucide-react';

export const LandingHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/audit/bill');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => scrollTo('how-it-works')}
            className="hover:text-slate-900 transition-colors"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={() => scrollTo('outcomes')}
            className="hover:text-slate-900 transition-colors"
          >
            What you get
          </button>
          <button
            type="button"
            onClick={() => scrollTo('why-minchal')}
            className="hover:text-slate-900 transition-colors"
          >
            Why MINCHAL
          </button>
          <button
            type="button"
            onClick={() => scrollTo('about')}
            className="hover:text-slate-900 transition-colors"
          >
            About
          </button>
        </nav>

        {/* Header Action Button */}
        <div className="flex items-center gap-3">
          <SpecularButton
            variant="primary"
            size="sm"
            onClick={handleStart}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Start an Audit
          </SpecularButton>
        </div>
      </div>
    </header>
  );
};
