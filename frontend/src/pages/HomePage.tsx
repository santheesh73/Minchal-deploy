import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Sparkles,
  FileText,
  Cpu,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Info,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const startNewAudit = () => {
    navigate('/audit/bill');
  };

  return (
    <PageContainer maxWidth="lg" className="space-y-8 sm:space-y-10">
      {/* Welcome Banner */}
      <section className="relative rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white p-6 sm:p-10 shadow-soft-lg overflow-hidden">
        {/* Subtle Background Glow Elements */}
        <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-brand-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide text-brand-100">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>AI Perception + Deterministic Engine</span>
          </div>

          <h1 className="text-display text-white leading-tight">
            Household Electricity Energy Audit
          </h1>

          <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
            Understand exactly where your electricity units go. Extract bill details, log home appliances, and get explainable tariff-level cost attribution and savings recommendations.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="success"
              size="lg"
              onClick={startNewAudit}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="text-base font-bold shadow-lg hover:shadow-xl"
            >
              Start New Audit
            </Button>
            <div className="flex items-center gap-2 text-xs text-brand-200 justify-center sm:justify-start px-2">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>No personal consumer data stored</span>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Journey Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-600" />
            Audit Journey
          </h2>
          <span className="text-xs font-medium text-slate-500">4 Simple Steps</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="default" className="p-5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                Upload EB Bill
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gemini Vision extracts units consumed, total amount, and billing period automatically.
              </p>
            </div>
          </Card>

          <Card variant="default" className="p-5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-brand-600" />
                Select Appliances
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add household appliances (AC, Fridge, Geyser, TV, Fans) and usage hours bands.
              </p>
            </div>
          </Card>

          <Card variant="default" className="p-5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-brand-600" />
                Deterministic Analysis
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Backend engine attributes bill costs, calculates efficiency gaps, and estimates savings.
              </p>
            </div>
          </Card>

          <Card variant="default" className="p-5 space-y-3 relative group">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                Actionable Audit
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                View appliance rank breakdown, efficiency insights, and bilingual explanations.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Grid Section: Latest Audit State & Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Audit Placeholder Card */}
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Latest Audit
            </h3>
            <Badge variant="neutral" size="sm">No Active Audit</Badge>
          </div>

          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-700">No completed audit yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Start a new audit to analyze your electricity bill and discover targeted savings.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startNewAudit}
              className="mt-2"
            >
              Start Audit Now
            </Button>
          </div>
        </Card>

        {/* Energy Insights Teaser */}
        <Card variant="default" className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-slate-900 text-base flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Energy Audit Features
            </h3>
            <Badge variant="purple" size="sm">Bilingual (TA/EN)</Badge>
          </div>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Deterministic Calculations:</strong> Costs, units, and savings are calculated by backend math, guaranteed reproducible.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Explainable Breakdown:</strong> Clear mathematical working steps and assumptions for every appliance.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900">Actionable Tiers:</strong> Categorized recommendations across free habits, low-cost maintenance, and high-impact investments.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
