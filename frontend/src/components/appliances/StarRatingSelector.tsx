import React from 'react';
import { Star } from 'lucide-react';

export interface StarRatingSelectorProps {
  value: number;
  onChange: (star: number) => void;
}

export const StarRatingSelector: React.FC<StarRatingSelectorProps> = ({
  value,
  onChange,
}) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-900">
          BEE Star Rating
        </label>
        <span className="text-xs font-bold text-amber-600 font-mono">
          {value} {value === 1 ? 'Star' : 'Stars'}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {stars.map((starNum) => {
          const isSelected = value === starNum;
          return (
            <button
              key={starNum}
              type="button"
              onClick={() => onChange(starNum)}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all border ${
                isSelected
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
              }`}
            >
              <Star className={`w-4 h-4 ${isSelected ? 'fill-current text-white' : 'text-amber-400'}`} />
              <span>{starNum}★</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
