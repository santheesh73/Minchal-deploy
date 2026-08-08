import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Info, Zap } from 'lucide-react';
import { useAudit } from '../store/AuditContext';
import { ApplianceInput, ApplianceType } from '../types/api';
import { getApplianceCatalogItem } from '../config/appliances';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { BillSummaryBar } from '../components/appliances/BillSummaryBar';
import { AppliancePicker } from '../components/appliances/AppliancePicker';
import { SelectedApplianceList } from '../components/appliances/SelectedApplianceList';
import { ApplianceConfigModal } from '../components/appliances/ApplianceConfigModal';

export const AppliancePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAudit();
  const [activeConfigInstance, setActiveConfigInstance] = useState<ApplianceInput | null>(null);

  const selectedAppliances = state.appliances;

  const handleToggleType = (type: ApplianceType) => {
    dispatch({ type: 'TOGGLE_APPLIANCE_TYPE', payload: type });
  };

  const handleOpenConfig = (instance: ApplianceInput) => {
    setActiveConfigInstance(instance);
  };

  const handleSaveConfig = (updated: ApplianceInput) => {
    dispatch({ type: 'UPDATE_APPLIANCE', payload: updated });
    setActiveConfigInstance(null);
  };

  const handleRemoveAppliance = (id: string) => {
    dispatch({ type: 'REMOVE_APPLIANCE', payload: id });
  };

  // Check if all selected appliances have completed configuration details
  const allConfigured =
    selectedAppliances.length > 0 &&
    selectedAppliances.every((app) => {
      const catalog = getApplianceCatalogItem(app.type);
      const starOk = catalog?.supportsStar ? app.star > 0 : true;
      const yearOk = catalog?.supportsYear ? app.year > 0 : true;
      const runtimeOk = app.type === 'fridge' ? true : app.hours_band !== null;
      return starOk && yearOk && runtimeOk;
    });

  const handleContinue = () => {
    if (!allConfigured) return;
    dispatch({ type: 'SET_STEP', payload: 'usage' });
    navigate('/audit/usage');
  };

  /**
   * Skip straight to the result using the defaults already applied when each
   * appliance was added (star 3, year 2020, catalog runtime band, no symptoms).
   *
   * Reviewer feedback was that a normal user faces too many inputs before
   * seeing anything. Nothing here is invented: the engine normalises every
   * estimate against the real bill total, and confidence_reasons reports
   * honestly that runtime was assumed rather than entered.
   */
  const handleUseTypicalValues = () => {
    if (selectedAppliances.length === 0) return;
    dispatch({ type: 'SET_STEP', payload: 'usage' });
    navigate('/audit/analyzing');
  };

  return (
    <PageContainer maxWidth="lg" className="space-y-6 sm:space-y-8">
      {/* Confirmed Bill Summary Bar */}
      <BillSummaryBar />

      {/* Page Header */}
      <PageHeader
        title="Select & Configure Appliances"
        subtitle="Select the major appliances present in your household and configure their rating, age, and usage patterns."
        showBack
        stepNumber={2}
        totalSteps={4}
      />

      {/* Main Appliance Catalog Picker */}
      <AppliancePicker
        selectedAppliances={selectedAppliances}
        onToggleType={handleToggleType}
        onConfigureInstance={handleOpenConfig}
      />

      {/* Selected Appliance Summary List */}
      <SelectedApplianceList
        appliances={selectedAppliances}
        onConfigure={handleOpenConfig}
        onRemove={handleRemoveAppliance}
      />

      {/* Configuration Guidance & Validation Banner */}
      {selectedAppliances.length === 0 ? (
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <Info className="w-5 h-5 text-brand-600 shrink-0" />
          <span>Please select at least one appliance above to proceed with your household energy audit.</span>
        </div>
      ) : !allConfigured ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Some selected appliances need configuration details (star rating, year, or runtime hours band). Click "Configure" to complete them.</span>
        </div>
      ) : null}

      {/* Reassurance: the details are optional, and we say so before they ask */}
      {selectedAppliances.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
          <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">You can stop here.</span> We already use typical
            values for star rating, age and runtime, and every estimate is scaled to match
            your actual bill total. Adding details only sharpens the split — and we always
            show you how confident we are.
          </span>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200">
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          {selectedAppliances.length} appliances selected • {allConfigured ? 'All configured' : 'Incomplete configuration'}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            variant="success"
            size="lg"
            disabled={selectedAppliances.length === 0}
            onClick={handleUseTypicalValues}
            rightIcon={<ArrowRight className="w-5 h-5" />}
            className="w-full sm:w-auto font-bold text-base shadow-md hover:shadow-lg"
          >
            Show my result now
          </Button>

          <Button
            variant="outline"
            size="lg"
            disabled={!allConfigured}
            onClick={handleContinue}
            className="w-full sm:w-auto font-semibold text-base"
          >
            Add usage details first
          </Button>
        </div>
      </div>

      {/* Configuration Modal */}
      <ApplianceConfigModal
        appliance={activeConfigInstance}
        isOpen={!!activeConfigInstance}
        onClose={() => setActiveConfigInstance(null)}
        onSave={handleSaveConfig}
      />
    </PageContainer>
  );
};
