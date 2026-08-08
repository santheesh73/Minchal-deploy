import React from 'react';
import { DollarSign, AlertTriangle, TrendingDown, CheckSquare } from 'lucide-react';
import { MagicBento } from './MagicBento';

export const OutcomesSection: React.FC = () => {
  const outcomes = [
    {
      number: '01',
      icon: DollarSign,
      title: 'WHERE YOUR MONEY GOES',
      description: 'See which appliances contribute most to your monthly bill in rupees and kWh.',
      color: 'amber',
    },
    {
      number: '02',
      icon: AlertTriangle,
      title: 'WHERE EFFICIENCY IS LOST',
      description: 'Spot appliances or usage patterns that may be costing more than expected.',
      color: 'rose',
    },
    {
      number: '03',
      icon: TrendingDown,
      title: 'WHAT YOU COULD SAVE',
      description: 'See estimated monthly and annual savings opportunities based on your tariff.',
      color: 'emerald',
    },
    {
      number: '04',
      icon: CheckSquare,
      title: 'WHAT TO DO NEXT',
      description: 'Get practical, prioritized actions instead of a confusing wall of numbers.',
      color: 'brand',
    },
  ];

  return (
    <section id="outcomes" className="py-16 sm:py-24 bg-white border-t border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest font-mono">
            Practical Outcomes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Not just a bill. A picture of your home.
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            MINCHAL translates raw electrical numbers into four clear, human-understandable insights.
          </p>
        </div>

        {/* 4 Outcome Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {outcomes.map((item) => {
            const Icon = item.icon;
            return (
              <MagicBento
                key={item.number}
                glowColor={item.color as any}
                className="p-6 space-y-3.5 bg-slate-50/70 border border-slate-200/90 rounded-2xl group hover:bg-white transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-800 transition-transform group-hover:scale-110">
                    <Icon className="w-5 h-5 text-brand-700" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {item.number}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-sm tracking-wider uppercase font-mono group-hover:text-brand-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </MagicBento>
            );
          })}
        </div>

      </div>
    </section>
  );
};
