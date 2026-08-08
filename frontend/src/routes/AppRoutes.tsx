import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { BillUploadPage } from '../pages/BillUploadPage';
import { AppliancePage } from '../pages/AppliancePage';
import { UsagePage } from '../pages/UsagePage';
import { AnalyzingPage } from '../pages/AnalyzingPage';
import { AuditPage } from '../pages/AuditPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/audit/bill" element={<BillUploadPage />} />
      <Route path="/audit/appliances" element={<AppliancePage />} />
      <Route path="/audit/usage" element={<UsagePage />} />
      <Route path="/audit/analyzing" element={<AnalyzingPage />} />
      <Route path="/audit/result" element={<AuditPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
