import React from 'react';
import { Select } from '../ui/Select';

export interface ManufacturingYearSelectorProps {
  value: number;
  onChange: (year: number) => void;
}

export const ManufacturingYearSelector: React.FC<ManufacturingYearSelectorProps> = ({
  value,
  onChange,
}) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => {
    const yr = currentYear - i;
    return { value: yr.toString(), label: yr.toString() };
  });

  return (
    <div className="space-y-1.5">
      <Select
        label="Manufacturing / Purchase Year"
        options={yearOptions}
        value={value.toString()}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      />
    </div>
  );
};
