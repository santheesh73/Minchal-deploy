import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { SpecularButton } from './SpecularButton';

export const FinalCTASection: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/audit/bill');
  };

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Ready to see where your electricity goes?
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Upload your latest bill and let MINCHAL build your household energy audit.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <SpecularButton
            variant="primary"
            size="lg"
            onClick={handleStart}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto"
          >
            Start Your Energy Audit
          </SpecularButton>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Your existing bill is enough to get started.</span>
        </div>
      </div>
    </section>
  );
};
