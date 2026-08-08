import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { IconButton } from '../ui/IconButton';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  action?: ReactNode;
  stepNumber?: number;
  totalSteps?: number;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  action,
  stepNumber,
  totalSteps = 4,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`mb-6 sm:mb-8 space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <IconButton
              ariaLabel="Go back"
              onClick={handleBack}
              icon={<ArrowLeft className="w-5 h-5" />}
              variant="outline"
              size="md"
            />
          )}
          <div>
            {stepNumber && (
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-0.5 block">
                Step {stepNumber} of {totalSteps}
              </span>
            )}
            <h1 className="text-h1 text-slate-900 leading-tight">{title}</h1>
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {subtitle && <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
};
