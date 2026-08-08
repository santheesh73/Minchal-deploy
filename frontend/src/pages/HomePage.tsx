import React from 'react';
import {
  LandingHeader,
  HeroSection,
  ProblemSection,
  WorkflowSection,
  OutcomesSection,
  AuditPreviewSection,
  ExplainabilitySection,
  AIBoundarySection,
  WhyMinchalSection,
  TrustSection,
  AboutImpactSection,
  FinalCTASection,
  LandingFooter,
} from '../components/landing';

export const HomePage: React.FC = () => {
  return (
    <div className="font-landing min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* 1. Independent Landing Header */}
      <LandingHeader />

      {/* 2. Asymmetric Product Hero */}
      <HeroSection />

      {/* 3. The Real Problem Statement */}
      <ProblemSection />

      {/* 4. Workflow Journey */}
      <WorkflowSection />

      {/* 5. Practical Outcomes */}
      <OutcomesSection />

      {/* 6. Product Showcase / Audit Dashboard Preview */}
      <AuditPreviewSection />

      {/* 7. Math Derivations & Explainability */}
      <ExplainabilitySection />

      {/* 8. AI Boundary & System Integrity */}
      <AIBoundarySection />

      {/* 9. Why MINCHAL (Zero Barriers) */}
      <WhyMinchalSection />

      {/* 10. Privacy & Trust */}
      <TrustSection />

      {/* 11. About MINCHAL */}
      <AboutImpactSection />

      {/* 12. Final CTA */}
      <FinalCTASection />

      {/* 13. Clean Landing Footer */}
      <LandingFooter />
    </div>
  );
};
