import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/audit/bill');
  };

  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-8 sm:p-12 shadow-2xl overflow-hidden text-center space-y-6 max-w-4xl mx-auto">
          {/* Subtle Background Glow Elements */}
          <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-100">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Ready for Actionable Energy Savings?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Your next electricity bill can tell you more.
            </h2>

            <p className="text-sm sm:text-base text-brand-100 leading-relaxed font-normal">
              Turn it into a clear household energy audit with MINCHAL today.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="success"
                size="lg"
                onClick={handleStart}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full sm:w-auto px-8 py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Start Your Energy Audit
              </Button>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-brand-200">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>No smart meter or hardware required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
