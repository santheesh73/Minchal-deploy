import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer maxWidth="md" className="py-12 sm:py-16 text-center">
      <Card variant="default" className="p-8 sm:p-10 space-y-6 max-w-lg mx-auto shadow-soft-lg border-slate-200 bg-white">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-8 h-8 text-brand-600" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest font-mono">404 Error</span>
          <h1 className="text-h1 text-slate-900">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page or route you are looking for does not exist or has been moved.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/')}
          leftIcon={<Home className="w-5 h-5" />}
          fullWidth
          className="text-sm font-bold shadow-md"
        >
          Return to MINCHAL Home
        </Button>
      </Card>
    </PageContainer>
  );
};
