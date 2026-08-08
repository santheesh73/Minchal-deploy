import { useState, useCallback } from 'react';
import { ExplainabilityContext } from '../utils/explainabilityMapper';

export function useExplainability() {
  const [activeContext, setActiveContext] = useState<ExplainabilityContext | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openExplainability = useCallback((context: ExplainabilityContext) => {
    setActiveContext(context);
    setIsOpen(true);
  }, []);

  const closeExplainability = useCallback(() => {
    setIsOpen(false);
    setActiveContext(null);
  }, []);

  return {
    activeContext,
    isOpen,
    openExplainability,
    closeExplainability,
  };
}
