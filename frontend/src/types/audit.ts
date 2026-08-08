import { BillData, ApplianceInput, ApplianceType, AnalyzeResponse, ApiError } from './api';

export type Language = 'en' | 'ta';

export type AuditStep = 'home' | 'bill' | 'appliances' | 'usage' | 'analyzing' | 'result';

export interface AuditState {
  step: AuditStep;
  language: Language;
  
  // Step 1: Bill Input State
  billFile: File | null;
  billData: BillData | null;
  isExtractingBill: boolean;
  
  // Step 2 & 3: Appliance Input State
  appliances: ApplianceInput[];
  
  // Step 4 & 5: Analysis State
  isAnalyzing: boolean;
  analysisResult: AnalyzeResponse | null;
  
  // Error state
  error: ApiError | null;
}

export type AuditAction =
  | { type: 'SET_STEP'; payload: AuditStep }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_BILL_FILE'; payload: File | null }
  | { type: 'SET_BILL_DATA'; payload: BillData | null }
  | { type: 'SET_BILL_EXTRACTING'; payload: boolean }
  | { type: 'SET_APPLIANCES'; payload: ApplianceInput[] }
  | { type: 'ADD_APPLIANCE'; payload: ApplianceInput }
  | { type: 'REMOVE_APPLIANCE'; payload: string }
  | { type: 'TOGGLE_APPLIANCE_TYPE'; payload: ApplianceType }
  | { type: 'UPDATE_APPLIANCE'; payload: ApplianceInput }
  | { type: 'SET_ANALYZING'; payload: boolean }
  | { type: 'SET_ANALYSIS_RESULT'; payload: AnalyzeResponse | null }
  | { type: 'SET_ERROR'; payload: ApiError | null }
  | { type: 'RESET_AUDIT' };
