import { AuditState, AuditAction } from '../types/audit';
import { getApplianceCatalogItem } from '../config/appliances';
import { ApplianceInput } from '../types/api';

export const initialAuditState: AuditState = {
  step: 'home',
  language: 'en',
  billFile: null,
  billData: null,
  isExtractingBill: false,
  appliances: [],
  isAnalyzing: false,
  analysisResult: null,
  error: null,
};

export function auditReducer(state: AuditState, action: AuditAction): AuditState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };

    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };

    case 'SET_BILL_FILE':
      return { ...state, billFile: action.payload };

    case 'SET_BILL_DATA':
      return { ...state, billData: action.payload };

    case 'SET_BILL_EXTRACTING':
      return { ...state, isExtractingBill: action.payload };

    case 'SET_APPLIANCES':
      return { ...state, appliances: action.payload };

    // A household can own two ACs. Ids must be unique per INSTANCE, not per
    // type, or the engine keys its estimates by a colliding id and the second
    // one overwrites the first.
    case 'ADD_ANOTHER_APPLIANCE': {
      const targetType = action.payload;
      const catalogItem = getApplianceCatalogItem(targetType);
      const defaultCapacity =
        catalogItem?.capacityPresets?.[1] ?? catalogItem?.capacityPresets?.[0] ?? null;
      const nextIndex =
        state.appliances.filter((a) => a.type === targetType).length + 1;

      return {
        ...state,
        appliances: [
          ...state.appliances,
          {
            id: `${targetType}-${nextIndex}`,
            type: targetType,
            capacity: catalogItem?.supportsCapacity ? defaultCapacity : null,
            star: 3,
            year: 2020,
            hours_band: targetType === 'fridge' ? null : (catalogItem?.defaultHoursBand || '4-6'),
            symptoms: [],
            runtime_confirmed: false,
          },
        ],
      };
    }

    // A device that is not in the catalogue. The user supplies its wattage —
    // there is no honest default for something we have never heard of, and the
    // backend rejects a custom appliance that arrives without one.
    case 'ADD_CUSTOM_APPLIANCE': {
      const { label, rated_power_w, hours_band } = action.payload;
      const nextIndex = state.appliances.filter((a) => a.type === 'custom').length + 1;
      return {
        ...state,
        appliances: [
          ...state.appliances,
          {
            id: `custom-${nextIndex}`,
            type: 'custom',
            capacity: null,
            star: 3,
            year: 2020,
            hours_band: hours_band || '2-4',
            symptoms: [],
            // The user typed both of these, so runtime is genuinely confirmed.
            runtime_confirmed: true,
            rated_power_w,
            label,
          },
        ],
      };
    }

    case 'ADD_APPLIANCE':
      return { ...state, appliances: [...state.appliances, action.payload] };

    case 'REMOVE_APPLIANCE':
      return {
        ...state,
        appliances: state.appliances.filter((item) => item.id !== action.payload),
      };

    case 'TOGGLE_APPLIANCE_TYPE': {
      const targetType = action.payload;
      const existingIndex = state.appliances.findIndex((item) => item.type === targetType);

      if (existingIndex >= 0) {
        // Untoggling a type removes every instance of it, not just the first —
        // otherwise a second AC is left orphaned with no way to reach it.
        // Remove appliance
        return {
          ...state,
          appliances: state.appliances.filter((item) => item.type !== targetType),
        };
      } else {
        // Add appliance with defaults
        const catalogItem = getApplianceCatalogItem(targetType);
        const defaultCapacity = catalogItem?.capacityPresets?.[1] ?? catalogItem?.capacityPresets?.[0] ?? null;
        
        const newAppliance: ApplianceInput = {
          id: `${targetType}-1`,
          type: targetType,
          capacity: catalogItem?.supportsCapacity ? defaultCapacity : null,
          star: 3,
          year: 2020,
          hours_band: targetType === 'fridge' ? null : (catalogItem?.defaultHoursBand || '4-6'),
          symptoms: [],
          // A default we chose, not a value the user gave us. Set true only
          // when they open the config modal and save.
          runtime_confirmed: false,
        };

        return {
          ...state,
          appliances: [...state.appliances, newAppliance],
        };
      }
    }

    case 'UPDATE_APPLIANCE':
      return {
        ...state,
        appliances: state.appliances.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };

    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };

    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET_AUDIT':
      return {
        ...initialAuditState,
        language: state.language,
      };

    default:
      return state;
  }
}
