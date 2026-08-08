import React from 'react';
import { ListChecks } from 'lucide-react';
import { Action } from '../../types/api';
import { ActionCard } from './ActionCard';

export interface ActionSectionProps {
  actions: Action[];
  onViewActionDetails?: (action: Action) => void;
}

export const ActionSection: React.FC<ActionSectionProps> = ({ actions, onViewActionDetails }) => {
  if (!actions || actions.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
        No specific recommended actions generated for this audit.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-emerald-600" />
          <h2 className="text-h2 text-slate-900">Recommended Energy Saving Actions</h2>
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {actions.length} prioritized recommendations
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((act, idx) => (
          <ActionCard key={idx} action={act} onViewActionDetails={onViewActionDetails} />
        ))}
      </div>
    </div>
  );
};
