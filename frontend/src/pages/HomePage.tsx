import React from 'react';
import {
  HeroSection,
  ProblemSection,
  WorkflowSection,
  AIBoundarySection,
  FeaturesSection,
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

      {/* 5. Core Platform Features */}
      <FeaturesSection />

      {/* 6. Dashboard Preview */}
      <AuditPreviewSection />

      {/* 7. Derivations & Explainability */}
      <ExplainabilitySection />

      {/* 8. Action Recommendations */}
      <SavingsSection />

      {/* 9. Why MINCHAL */}
      <WhyMinchalSection />

      {/* 10. Privacy & Trust */}
      <TrustSection />

      {/* 11. Impact */}
      <AboutImpactSection />

      {/* 12. Final CTA Banner */}
      <FinalCTASection />

      {/* 13. Landing Footer */}
      <LandingFooter />
    </div>
  );
};
