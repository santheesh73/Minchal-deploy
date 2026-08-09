import React, { useState } from 'react';
import { Wallet, Check, X, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AnalyzeRequest, BudgetPlan } from '../../types/api';
import { planBudget } from '../../api/budgetApi';
import { formatCurrency } from '../../utils/currency';
import { useAudit } from '../../store/AuditContext';
import { getTranslation } from '../../utils/translations';

export interface BudgetPlannerProps {
  request: AnalyzeRequest | null;
}

const PRESETS = [1000, 5000, 20000];

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ request }) => {
  const { state } = useAudit();
  const t = getTranslation(state.language);

  const [budget, setBudget] = useState<string>('');
  const [plan, setPlan] = useState<BudgetPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (value: number) => {
    if (!request || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await planBudget(request, value);
      setPlan(res.budget_plan);
    } catch (err: any) {
      setError(err?.message || (state.language === 'ta' ? 'திட்டம் உருவாக்க முடியவில்லை.' : 'Could not work out a plan just now.'));
    } finally {
      setLoading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(budget);
    if (!Number.isFinite(value) || value < 0) return;
    run(value);
  };

  const hasNoActions = plan && plan.selected.length === 0 && plan.excluded.length === 0;

  return (
    <Card variant="default" className="p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-base">{t.budgetPlannerTitle}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t.budgetPlannerSubtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => {
          const isActive = Number(budget) === p;
          return (
            <button
              key={p}
              type="button"
              disabled={loading}
              onClick={() => { setBudget(String(p)); run(p); }}
              className={`px-3.5 py-1.5 rounded-full border text-sm font-semibold transition-all ${
                isActive
                  ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm font-bold ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700'
              } disabled:opacity-50`}
            >
              {formatCurrency(p)}
            </button>
          );
        })}
      </div>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <Input
            label={t.customBudgetLabel}
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="e.g. 5000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} disabled={!budget || loading}>
          {t.planItButton}
        </Button>
      </form>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {plan && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{t.totalCost}</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(plan.total_cost_rupees)}</p>
              <p className="text-[11px] text-slate-500">{formatCurrency(plan.budget_remaining_rupees)} {t.leftOver}</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">{t.savesPerYear}</p>
              <p className="text-xl font-bold text-emerald-800">{formatCurrency(plan.total_annual_saving_rupees)}</p>
              <p className="text-[11px] text-emerald-700">{t.across} {plan.selected.length} {t.actionsCount}</p>
            </div>
          </div>

          {hasNoActions ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-3 text-xs text-emerald-800 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t.noBudgetActionsMessage}</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {plan.selected.map((a, i) => {
                const annualSave = (a.saves_rupees || 0) * 12;
                return (
                  <li key={`s-${i}`} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">{a.text}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {a.cost_rupees ? formatCurrency(a.cost_rupees) : t.freeAction} · {state.language === 'ta' ? 'சேமிப்பு' : 'saves'} <span className="font-semibold text-emerald-700">{formatCurrency(a.saves_rupees)}/{state.language === 'ta' ? 'மாதம்' : 'mo'}</span> ({formatCurrency(annualSave)}/{state.language === 'ta' ? 'ஆண்டு' : 'yr'})
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {plan.excluded.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                {t.didntFitBudget}
              </p>
              {plan.excluded.map((e, i) => (
                <div key={`e-${i}`} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">{e.text}</p>
                    <p className="text-[11px] text-slate-500">{e.reason}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {state.language === 'ta' ? 'ஆண்டுச் சேமிப்பு' : 'would save'} {formatCurrency(e.annual_saving_rupees)}/{state.language === 'ta' ? 'ஆண்டு' : 'yr'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
