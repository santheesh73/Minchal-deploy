import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle, RotateCcw } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export interface ErrorPageProps {
  message?: string;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
  const navigate = useNavigate();

  return (
    <PageContainer maxWidth="md" className="py-12 sm:py-16 text-center">
      <Card variant="default" className="p-8 sm:p-10 space-y-6 max-w-lg mx-auto shadow-soft-lg border-amber-200 bg-white">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-h1 text-slate-900">Application Error</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
            {message || 'An unexpected error occurred while processing your session. Please try returning home or reloading.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
            leftIcon={<RotateCcw className="w-5 h-5 text-slate-600" />}
            fullWidth
            className="text-sm font-semibold"
          >
            Reload App
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/')}
            leftIcon={<Home className="w-5 h-5" />}
            fullWidth
            className="text-sm font-bold shadow-md"
          >
            Return Home
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
};
