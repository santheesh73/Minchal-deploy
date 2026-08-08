import React, { useEffect, useRef } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { useAnalysis } from '../hooks/useAnalysis';
import { AnalysisLoader } from '../components/analysis/AnalysisLoader';
import { AnalysisError } from '../components/analysis/AnalysisError';

export const AnalyzingPage: React.FC = () => {
  const { status, error, validationMessage, executeAnalysis, reset } = useAnalysis();
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Automatically trigger analysis on mount once
    if (!hasTriggeredRef.current && (status === 'idle' || status === 'validating')) {
      hasTriggeredRef.current = true;
      executeAnalysis();
    }
  }, [status, executeAnalysis]);

  const handleRetry = () => {
    hasTriggeredRef.current = false;
    reset();
    executeAnalysis();
  };

  return (
    <PageContainer maxWidth="md" className="py-8 sm:py-12">
      {status === 'error' ? (
        <AnalysisError
          error={error}
          validationMessage={validationMessage}
          onRetry={handleRetry}
        />
      ) : (
        <AnalysisLoader />
      )}
    </PageContainer>
  );
};
