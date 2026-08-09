import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeAudit } from '../api/analyzeApi';
import { AnalyzeRequest, AnalyzeResponse, ApiError } from '../types/api';
import { useAudit } from '../store/AuditContext';
import { getApplianceCatalogItem } from '../config/appliances';

export type AnalysisStatus = 'idle' | 'validating' | 'analyzing' | 'success' | 'error';

export function useAnalysis() {
  const navigate = useNavigate();
  const { state, dispatch } = useAudit();

  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<ApiError | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Request identity ref & guard to prevent duplicate API executions in React Strict Mode
  const requestIdentityRef = useRef<number>(0);
  const isExecutingRef = useRef<boolean>(false);

  const validateAuditInput = useCallback(() => {
    if (!state.billData) {
      return { valid: false, message: 'Confirmed electricity bill data is missing. Please upload and confirm your bill first.' };
    }

    if (!state.appliances || state.appliances.length === 0) {
      return { valid: false, message: 'No household appliances selected. Please select at least one appliance for your audit.' };
    }

    const unconfigured = state.appliances.find((app) => {
      const catalog = getApplianceCatalogItem(app.type);
      const starOk = catalog?.supportsStar ? app.star > 0 : true;
      const yearOk = catalog?.supportsYear ? app.year > 0 : true;
      const runtimeOk = app.type === 'fridge' ? true : app.hours_band !== null;
      return !starOk || !yearOk || !runtimeOk;
    });

    if (unconfigured) {
      const catalog = getApplianceCatalogItem(unconfigured.type);
      return {
        valid: false,
        message: `Appliance "${catalog?.label || unconfigured.type}" has incomplete configuration details. Please complete configuration.`,
      };
    }

    return { valid: true };
  }, [state.billData, state.appliances]);

  const executeAnalysis = useCallback(async () => {
    if (isExecutingRef.current) return;
    isExecutingRef.current = true;

    const currentRequestId = ++requestIdentityRef.current;
    setError(null);
    setValidationMessage(null);
    setStatus('validating');

    // Pre-analysis validation
    const check = validateAuditInput();
    if (!check.valid) {
      setValidationMessage(check.message || 'Audit inputs are invalid or incomplete.');
      setStatus('error');
      isExecutingRef.current = false;
      return;
    }

    // Construct cleaned AnalyzeRequest payload
    const cleanedPayload: AnalyzeRequest = {
      bill: {
        ...state.billData!,
        units_consumed: Number(state.billData!.units_consumed),
        total_amount: Number(state.billData!.total_amount),
        billing_days: state.billData!.billing_days ? Math.round(Number(state.billData!.billing_days)) : 60,
      },
      appliances: state.appliances.map((app) => ({
        id: app.id,
        type: app.type,
        capacity: app.capacity !== null && app.capacity !== undefined ? Number(app.capacity) : null,
        star: app.star ? Math.round(Number(app.star)) : 3,
        year: app.year ? Math.round(Number(app.year)) : 2022,
        hours_band: app.type === 'fridge' || !app.hours_band ? null : app.hours_band,
        symptoms: Array.isArray(app.symptoms) ? app.symptoms : [],
        // Must be forwarded explicitly — this payload is a whitelist, so a new
        // field is silently dropped unless listed here. Confidence depends on it.
        runtime_confirmed: app.runtime_confirmed === true,
        // Custom appliances carry a user-supplied wattage and name. The
        // backend REJECTS a custom appliance without the wattage, so dropping
        // these here would turn "add your own appliance" into a 400.
        rated_power_w: app.rated_power_w !== null && app.rated_power_w !== undefined ? Number(app.rated_power_w) : null,
        label: app.label ? String(app.label).trim() : null,
      })),
      language: state.language || 'en',
    };

    try {
      setStatus('analyzing');
      const result: AnalyzeResponse = await analyzeAudit(cleanedPayload);

      // Stale response safety check
      if (currentRequestId !== requestIdentityRef.current) {
        isExecutingRef.current = false;
        return;
      }

      // Store response in central audit state
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
      dispatch({ type: 'SET_STEP', payload: 'result' });

      setStatus('success');
      isExecutingRef.current = false;

      // Navigate to /audit/result
      navigate('/audit/result');
    } catch (err: any) {
      if (currentRequestId !== requestIdentityRef.current) {
        isExecutingRef.current = false;
        return;
      }

      const normalizedError: ApiError = {
        ok: false,
        reason: err.reason || 'SERVER_ERROR',
        message: err.message || 'We could not complete your household energy analysis. Please try again.',
      };

      setError(normalizedError);
      setStatus('error');
      isExecutingRef.current = false;
    }
  }, [state.billData, state.appliances, state.language, validateAuditInput, dispatch, navigate]);

  const reset = useCallback(() => {
    isExecutingRef.current = false;
    setStatus('idle');
    setError(null);
    setValidationMessage(null);
  }, []);

  return {
    status,
    error,
    validationMessage,
    executeAnalysis,
    reset,
  };
}
