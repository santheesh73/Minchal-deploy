import React, { useState } from 'react';
import { PlusCircle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { HoursBand } from '../../types/api';

export interface CustomApplianceFormProps {
  onAdd: (label: string, ratedPowerW: number, hoursBand: HoursBand) => void;
}

const BANDS: HoursBand[] = ['0-1', '1-2', '2-4', '4-6', '6-8', '8+'];

/**
 * Add a device that is not in the catalogue.
 *
 * The wattage is REQUIRED and typed by the user. There is no default here on
 * purpose: we have no wattage table for an unknown appliance, and inventing one
 * would put a fabricated number underneath a real rupee figure. The backend
 * rejects a custom appliance that arrives without it.
 */
export const CustomApplianceForm: React.FC<CustomApplianceFormProps> = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [watts, setWatts] = useState('');
  const [band, setBand] = useState<HoursBand>('2-4');

  const w = Number(watts);
  const valid = label.trim().length > 0 && Number.isFinite(w) && w > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onAdd(label.trim(), w, band);
    setLabel('');
    setWatts('');
    setBand('2-4');
    setOpen(false);
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={() => setOpen(true)}
        leftIcon={<PlusCircle className="w-5 h-5" />}
        fullWidth
        className="font-semibold"
      >
        Add an appliance that's not listed
      </Button>
    );
  }

  return (
    <Card variant="default" className="p-5 space-y-4">
      <h4 className="font-bold text-slate-900 text-sm">Add your own appliance</h4>

      <form onSubmit={submit} className="space-y-3">
        <Input
          label="What is it?"
          placeholder="e.g. Aquarium pump"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <Input
          label="Power rating (watts)"
          type="number"
          inputMode="numeric"
          min="1"
          placeholder="e.g. 1200"
          value={watts}
          onChange={(e) => setWatts(e.target.value)}
          hint="Printed on the appliance label. We don't guess this — without it we can't estimate honestly."
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Hours used per day</label>
          <div className="flex flex-wrap gap-2">
            {BANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBand(b)}
                className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${
                  band === b
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>Your estimate is still scaled to match your actual bill total.</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)} className="sm:flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" disabled={!valid} className="sm:flex-1 font-bold">
            Add appliance
          </Button>
        </div>
      </form>
    </Card>
  );
};
