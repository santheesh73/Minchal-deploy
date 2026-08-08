import React, { useState } from 'react';
import { Wallet, Check, X, TrendingUp } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AnalyzeRequest, BudgetPlan } from '../../types/api';
import { planBudget } from '../../api/budgetApi';
import { formatCurrency } from '../../utils/currency';

export interface BudgetPlannerProps {
  request: AnalyzeRequest | null;
}

const PRESETS = [1000, 5000, 20000];

/**
 * "What can I actually afford to fix?" — answered by the deterministic engine,
 * not by a chat box. The backend ranks actions by savings-per-rupee under the
 * ceiling; this only renders the result.
 */
export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ request }) => {
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
      setError(err?.message || 'Could not work out a plan just now.');
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

  return (
    <Card variant="default" className="p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 shrink-0 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-base">What can I afford to fix?</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tell us your budget. We pick the actions that save the most per rupee spent —
            and show you what didn't fit, and why.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            disabled={loading}
            onClick={() => { setBudget(String(p)); run(p); }}
            className="px-3.5 py-1.5 rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-brand-400 hover:text-brand-700 disabled:opacity-50"
          >
            {formatCurrency(p)}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <Input
            label="Or enter your own budget (Rs)"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="e.g. 3000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
        <Button type="submit" variant="primary" size="lg" loading={loading} disabled={!budget || loading}>
          Plan it
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
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Total cost</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(plan.total_cost_rupees)}</p>
              <p className="text-[11px] text-slate-500">{formatCurrency(plan.budget_remaining_rupees)} left over</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Saves per year</p>
              <p className="text-xl font-bold text-emerald-800">{formatCurrency(plan.total_annual_saving_rupees)}</p>
              <p className="text-[11px] text-emerald-700">across {plan.selected.length} action(s)</p>
            </div>
          </div>

          <ul className="space-y-2">
            {plan.selected.map((a, i) => (
              <li key={`s-${i}`} className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">{a.text}</p>
                  <p className="text-[11px] text-slate-500">
                    {a.cost_rupees ? formatCurrency(a.cost_rupees) : 'Free'} ·
                    saves {formatCurrency(a.saves_rupees)}/mo
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {plan.excluded.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Didn't fit this budget
              </p>
              {plan.excluded.map((e, i) => (
                <div key={`e-${i}`} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <X className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">{e.text}</p>
                    <p className="text-[11px] text-slate-500">{e.reason}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      would save {formatCurrency(e.annual_saving_rupees)}/yr
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
