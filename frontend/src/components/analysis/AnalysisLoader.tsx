import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { AnalysisStep } from './AnalysisStep';

export const AnalysisLoader: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    // Stage 1 -> Stage 2 after 1.8s
    const timer1 = setTimeout(() => {
      setCurrentStage(2);
    }, 1800);

    // Stage 2 -> Stage 3 after 3.6s
    const timer2 = setTimeout(() => {
      setCurrentStage(3);
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const stageTitles: Record<number, string> = {
    1: 'Reading your bill data and tariff slab...',
    2: 'Working out each appliance energy load and cost attribution...',
    3: 'Writing your personalized audit insights and bilingual recommendations...',
  };

  return (
    <Card variant="default" className="p-8 sm:p-10 text-center space-y-8 shadow-soft-lg max-w-xl mx-auto">
      {/* Animated Visual Header */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-brand-500/20 animate-ping" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg">
          <Calculator className="w-10 h-10" />
        </div>
      </div>

      {/* Main Title & Accessible Live Status */}
      <div className="space-y-2" role="status" aria-live="polite">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Deterministic Calculation Engine</span>
        </div>
        <h2 className="text-h2 text-slate-900">Calculating Household Energy Audit</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          {stageTitles[currentStage]}
        </p>
      </div>

      {/* Sequenced 3-Stage Progress Steps */}
      <div className="space-y-3">
        <AnalysisStep
          stepNumber={1}
          label="Reading your bill..."
          sublabel="Parsing units, billing period, and tariff tiers"
          status={currentStage > 1 ? 'completed' : currentStage === 1 ? 'active' : 'pending'}
        />

        <AnalysisStep
          stepNumber={2}
          label="Working out each appliance..."
          sublabel="Attributing kWh loads, ranking impact, and efficiency gaps"
          status={currentStage > 2 ? 'completed' : currentStage === 2 ? 'active' : 'pending'}
        />

        <AnalysisStep
          stepNumber={3}
          label="Writing your audit..."
          sublabel="Structuring bilingual explanations and tiered actions"
          status={currentStage === 3 ? 'active' : 'pending'}
        />
      </div>

      {/* Trust & Guarantee Note */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Math calculations are fully reproducible & deterministic</span>
      </div>
    </Card>
  );
};
