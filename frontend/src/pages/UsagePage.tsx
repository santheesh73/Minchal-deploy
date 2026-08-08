import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const UsagePage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    navigate('/audit/analyzing');
  };

  return (
    <PageContainer maxWidth="md">
      <PageHeader
        title="Appliance Usage & Symptoms"
        subtitle="Specify estimated daily usage hours bands (0-1, 1-2, 2-4, 4-6, 6-8, 8+) and optional performance symptoms."
        showBack
        stepNumber={3}
        totalSteps={4}
      />

      <Card variant="default" className="p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 text-base">Usage Hours & Symptoms Configuration</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Configured per appliance to refine unit calculations in the deterministic engine.
          </p>
        </div>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button
          variant="success"
          size="lg"
          rightIcon={<ArrowRight className="w-5 h-5" />}
          onClick={handleStartAnalysis}
        >
          Run Energy Audit Analysis
        </Button>
      </div>
    </PageContainer>
  );
};
