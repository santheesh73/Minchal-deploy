import React from 'react';
import { Badge } from '../ui/Badge';
import { MagicBento } from './MagicBento';

export const SavingsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            Prioritized Recommendations
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Actionable Guidance for Every Household Budget
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            MINCHAL categorizes energy-saving actions into clear, achievable tiers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Tier 1: Free Habits */}
          <MagicBento glowColor="emerald" className="p-6 space-y-4 border-emerald-200 bg-emerald-50/20">
            <div className="flex justify-between items-center">
              <Badge variant="success" size="sm">FREE HABIT</Badge>
              <span className="text-xs font-bold font-mono text-emerald-700">Instant Impact</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Set AC Temperature to 24°C</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Raising thermostat setpoint from 18°C to 24°C reduces compressor load by up to 24%.
            </p>
            <div className="pt-2 border-t border-emerald-100 font-mono font-bold text-xs text-emerald-800">
              Saves up to ~₹280 / month
            </div>
          </MagicBento>

          {/* Tier 2: Cheap Fixes */}
          <MagicBento glowColor="brand" className="p-6 space-y-4 border-brand-200 bg-brand-50/20">
            <div className="flex justify-between items-center">
              <Badge variant="primary" size="sm">LOW COST</Badge>
              <span className="text-xs font-bold font-mono text-brand-700">Quick Maintenance</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Clean Refrigerator Condenser Coils</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clearing dust from rear coils improves heat dissipation and lowers compressor duty cycle.
            </p>
            <div className="pt-2 border-t border-brand-100 font-mono font-bold text-xs text-brand-800">
              Saves up to ~₹95 / month
            </div>
          </MagicBento>

          {/* Tier 3: Upgrades */}
          <MagicBento glowColor="purple" className="p-6 space-y-4 border-purple-200 bg-purple-50/20">
            <div className="flex justify-between items-center">
              <Badge variant="purple" size="sm">UPGRADE</Badge>
              <span className="text-xs font-bold font-mono text-purple-700">Long-term Investment</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">Replace Non-Star Geyser with 5★ Model</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Modern polyurethane insulation reduces standing loss during morning heating cycles.
            </p>
            <div className="pt-2 border-t border-purple-100 font-mono font-bold text-xs text-purple-800">
              Payback ~14 months
            </div>
          </MagicBento>
        </div>
      </div>
    </section>
  );
};
