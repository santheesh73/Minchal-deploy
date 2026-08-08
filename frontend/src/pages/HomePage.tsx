import React from 'react';
import {
  HeroSection,
  ProblemSection,
  WorkflowSection,
  AIBoundarySection,
  AuditPreviewSection,
  ExplainabilitySection,
  SavingsSection,
  WhyMinchalSection,
  TrustSection,
  AboutImpactSection,
  FinalCTASection,
  LandingFooter,
} from '../components/landing';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Problem Section */}
      <ProblemSection />

      {/* 3. Workflow Section */}
      <WorkflowSection />

      {/* 4. AI Boundary System Section */}
      <AIBoundarySection />

      {/* 5. Dashboard Preview */}
      <AuditPreviewSection />

      {/* 6. Derivations & Explainability */}
      <ExplainabilitySection />

      {/* 7. Action Recommendations */}
      <SavingsSection />

      {/* 8. Why MINCHAL */}
      <WhyMinchalSection />

      {/* 9. Privacy & Trust */}
      <TrustSection />

      {/* 10. Impact */}
      <AboutImpactSection />

      {/* 11. Final CTA Banner */}
      <FinalCTASection />

      {/* 12. Landing Footer */}
      <LandingFooter />
    </div>
  );
};
