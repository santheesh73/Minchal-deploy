import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Info, Zap } from 'lucide-react';
import { useAudit } from '../store/AuditContext';
import { ApplianceInput, ApplianceType, HoursBand } from '../types/api';
import { getApplianceCatalogItem } from '../config/appliances';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { BillSummaryBar } from '../components/appliances/BillSummaryBar';
import { AppliancePicker } from '../components/appliances/AppliancePicker';
import { SelectedApplianceList } from '../components/appliances/SelectedApplianceList';
import { ApplianceConfigModal } from '../components/appliances/ApplianceConfigModal';
import { CustomApplianceForm } from '../components/appliances/CustomApplianceForm';
import { getTranslation } from '../utils/translations';

export const AppliancePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAudit();
  const t = getTranslation(state.language);
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

  const handleAddAnother = (type: ApplianceType) => {
    dispatch({ type: 'ADD_ANOTHER_APPLIANCE', payload: type });
  };

  const handleAddCustom = (label: string, rated_power_w: number, hours_band: HoursBand) => {
    dispatch({ type: 'ADD_CUSTOM_APPLIANCE', payload: { label, rated_power_w, hours_band } });
  };

  const allConfigured =
    selectedAppliances.length > 0 &&
    selectedAppliances.every((app) => {
      if (app.type === 'custom') {
        return !!app.rated_power_w && app.rated_power_w > 0 && app.hours_band !== null;
      }
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
        title={t.step2Title}
        subtitle={t.step2Subtitle}
        showBack
        stepNumber={2}
        totalSteps={3}
      />

      {/* Main Appliance Catalog Picker */}
      <AppliancePicker
        selectedAppliances={selectedAppliances}
        onToggleType={handleToggleType}
        onConfigureInstance={handleOpenConfig}
      />

      {/* Add a device that is not in the catalogue */}
      <CustomApplianceForm onAdd={handleAddCustom} />

      {/* Selected Appliance Summary List */}
      <SelectedApplianceList
        appliances={selectedAppliances}
        onConfigure={handleOpenConfig}
        onRemove={handleRemoveAppliance}
        onAddAnother={(app) => handleAddAnother(app.type)}
      />

      {/* Configuration Guidance & Validation Banner */}
      {selectedAppliances.length === 0 ? (
        <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <Info className="w-5 h-5 text-brand-600 shrink-0" />
          <span>{state.language === 'ta' ? 'மின் ஆற்றல் தணிக்கையைத் தொடங்க குறைந்தது ஒரு சாதனத்தையாவது தேர்ந்தெடுக்கவும்.' : 'Please select at least one appliance above to proceed with your household energy audit.'}</span>
        </div>
      ) : !allConfigured ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{state.language === 'ta' ? 'சில சாதனங்களுக்கு கூடுதல் விவரங்கள் தேவை. "அமைப்புகளுக்குச் செல்" என்பதைக் கிளிக் செய்யவும்.' : 'Some selected appliances need configuration details (star rating, year, or runtime hours band). Click "Configure" to complete them.'}</span>
        </div>
      ) : null}

      {/* Reassurance: default typical values applied */}
      {selectedAppliances.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
          <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold">{state.language === 'ta' ? 'இப்போதே முடிவைப் பார்க்கலாம்.' : 'You can stop here.'}</span> {state.language === 'ta' ? 'இயல்பான பொதுவான மதிப்புகள் ஏற்கனவே பயன்படுத்தப்பட்டுள்ளன. உங்கள் முடிவை உடனே காணலாம்.' : 'We already use typical values for star rating, age and runtime, and every estimate is scaled to match your actual bill total.'}
          </span>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200">
        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          {selectedAppliances.length} {state.language === 'ta' ? 'சாதனங்கள் தேர்ந்தெடுக்கப்பட்டுள்ளன' : 'appliances selected'} • {allConfigured ? (state.language === 'ta' ? 'அனைத்தும் பூர்த்தி செய்யப்பட்டன' : 'All configured') : (state.language === 'ta' ? 'முழுமையடையவில்லை' : 'Incomplete configuration')}
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
            {state.language === 'ta' ? 'எனது தணிக்கை முடிவைக் காட்டு' : 'Show my result now'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            disabled={!allConfigured}
            onClick={handleContinue}
            className="w-full sm:w-auto font-semibold text-base"
          >
            {state.language === 'ta' ? 'பயன்பாட்டு விவரங்களைச் சேர்க்கவும்' : 'Add usage details first'}
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
