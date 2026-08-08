import React from 'react';
import {
  FileText,
  BarChart2,
  Clock,
  Camera,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  ListChecks,
  Activity,
  Globe,
  Leaf,
} from 'lucide-react';
import { Card } from '../ui/Card';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: FileText,
      title: 'AI Bill Extraction',
      description: 'Automatically reads units, billed amount, tariff slab, and billing days from electricity bill photos.',
    },
    {
      icon: BarChart2,
      title: 'Appliance Cost Attribution',
      description: 'Ranks home appliances by monthly energy units and rupee contribution to the total bill.',
    },
    {
      icon: Clock,
      title: 'Usage Hours Banding',
      description: 'Captures daily appliance operating hours across realistic operational duration bands.',
    },
    {
      icon: Camera,
      title: 'Rating Plate OCR Scanning',
      description: 'Optionally scans appliance manufacturer rating plates for accurate wattage and capacity inputs.',
    },
    {
      icon: TrendingDown,
      title: 'Energy Efficiency Gap',
      description: 'Quantifies percentage efficiency opportunity compared to modern star-rated alternatives.',
    },
    {
      icon: Sparkles,
      title: 'Potential Savings Estimate',
      description: 'Estimates monthly and annual rupee savings achievable through optimized operation and upgrades.',
    },
    {
      icon: Leaf,
      title: 'CO₂ Environmental Impact',
      description: 'Calculates household annual carbon footprint (kg CO₂) and potential emissions reduction.',
    },
    {
      icon: AlertTriangle,
      title: 'Biggest Surprise Detector',
      description: 'Highlights the appliance consuming disproportionately more electricity than expected.',
    },
    {
      icon: HelpCircle,
      title: 'Explainable Calculation Steps',
      description: 'Inspect step-by-step mathematical working and assumptions for every metric.',
    },
    {
      icon: ListChecks,
      title: 'Actionable Recommendation Tiers',
      description: 'Prioritized recommendations categorized by Free Habits, Low-Cost Fixes, and Appliance Upgrades.',
    },
    {
      icon: Activity,
      title: 'Fault Symptom Logging',
      description: 'Log observable symptoms (e.g. noise, insufficient cooling) indicating efficiency degradation.',
    },
    {
      icon: Globe,
      title: 'Bilingual Support (Tamil & English)',
      description: 'Full audit interface and explainable derivations available in Tamil and English.',
    },
  ];

  return (
    <section className="py-12 sm:py-20 bg-slate-50/70 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need for a Complete Energy Audit
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Purpose-built tools for household electricity transparency, precision attribution, and actionable savings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card
                key={idx}
                variant="default"
                className="p-6 space-y-3 bg-white border-slate-200/90 hover:border-brand-300 hover:shadow-soft-md transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{feat.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
