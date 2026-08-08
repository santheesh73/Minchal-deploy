import React from 'react';
import {
  Upload,
  FileCheck2,
  Tv,
  SlidersHorizontal,
  Calculator,
  PieChart,
} from 'lucide-react';
import { MagicBento } from './MagicBento';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'Upload your bill',
      description: 'Take a photo or upload a PDF of your DISCOM electricity bill.',
    },
    {
      number: '02',
      icon: FileCheck2,
      title: 'Check the details',
      description: 'Verify extracted units, billing period, and total amount.',
    },
    {
      number: '03',
      icon: Tv,
      title: 'Tell us about your appliances',
      description: 'Select major household equipment (AC, Fridge, Geyser, Fans, TV).',
    },
    {
      number: '04',
      icon: SlidersHorizontal,
      title: 'Add how you use them',
      description: 'Specify daily usage hours, star rating, and observable symptoms.',
    },
    {
      number: '05',
      icon: Calculator,
      title: 'Run the audit',
      description: 'Our backend calculation engine attributes kWh and calculates baseline load.',
    },
    {
      number: '06',
      icon: PieChart,
      title: 'See where the energy goes',
      description: 'Review cost attribution, efficiency gaps, and practical action steps.',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest font-mono">
            Step-by-step Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From your bill to a clearer picture of your home.
          </h2>
          <p className="text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Six simple steps connecting your physical paper or PDF bill to clear household energy understanding.
          </p>
        </div>

        {/* Horizontal Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <MagicBento
                key={step.number}
                glowColor="brand"
                className="p-6 space-y-4 bg-white border border-slate-200/80 rounded-2xl group hover:border-brand-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-brand-600/30 group-hover:text-brand-600 transition-colors">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {step.description}
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
