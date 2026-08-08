import React from 'react';
import {
  FileText,
  Sparkles,
  Cpu,
  Sliders,
  Calculator,
  BarChart2,
} from 'lucide-react';
import { Card } from '../ui/Card';

export const WorkflowSection: React.FC = () => {
  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Upload Electricity Bill',
      description: 'Take a photo or upload your DISCOM electricity bill (JPEG, PNG, PDF up to 10MB).',
      badge: 'Capture',
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI Reads the Bill',
      description: 'Gemini Vision extracts units consumed, total amount, billing cycle, and tariff slab without consumer account PII.',
      badge: 'AI Perception',
    },
    {
      number: '03',
      icon: Cpu,
      title: 'Select Household Appliances',
      description: 'Choose major home appliances (AC, Refrigerator, Geyser, Washing Machine, Fans, TV, Pumps).',
      badge: 'Catalog',
    },
    {
      number: '04',
      icon: Sliders,
      title: 'Configure Usage & Symptoms',
      description: 'Log daily usage hours bands, star ratings, manufacturing year, and observable fault symptoms.',
      badge: 'Configuration',
    },
    {
      number: '05',
      icon: Calculator,
      title: 'Deterministic Engine',
      description: 'Backend math attributes consumption, calculates baseline load, and normalizes estimates against actual bill units.',
      badge: 'Engine Calculation',
    },
    {
      number: '06',
      icon: BarChart2,
      title: 'Household Energy Audit',
      description: 'Receive ranked cost attribution, efficiency gap %, carbon footprint, and prioritized savings actions.',
      badge: 'Audit Dashboard',
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            How MINCHAL Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            From Electricity Bill to Household Energy Audit
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Six simple, transparent steps connecting your physical bill to actionable energy intelligence.
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.number}
                variant="default"
                className="p-6 space-y-4 relative hover:border-brand-300 hover:shadow-soft-lg transition-all group bg-white"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-brand-600/30 group-hover:text-brand-600 transition-colors">
                    {step.number}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200/60 uppercase tracking-wider">
                    {step.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
