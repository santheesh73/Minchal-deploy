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
