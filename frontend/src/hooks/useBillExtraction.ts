import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractBill } from '../api/billApi';
import { ExtractBillResponse, ApiError } from '../types/api';
import { validateBillFile } from '../utils/fileValidation';
import { compressBillImage } from '../utils/imageCompression';
import { useAudit } from '../store/AuditContext';

export type BillExtractionStatus =
  | 'idle'
  | 'selected'
  | 'compressing'
  | 'extracting'
  | 'success'
  | 'error';

export function useBillExtraction() {
  const navigate = useNavigate();
  const { dispatch } = useAudit();

  const [status, setStatus] = useState<BillExtractionStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extractedBill, setExtractedBill] = useState<ExtractBillResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Identity ref to prevent stale response race conditions
  const requestIdentityRef = useRef<number>(0);

  // Clean up Object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectFile = useCallback((file: File) => {
    // Validate file
    const validation = validateBillFile(file);
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid bill file selected.');
      return;
    }

    setValidationError(null);
    setError(null);
    setExtractedBill(null);

    // Create object URL for instant user-facing preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setStatus('selected');
  }, []);

  const retake = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedBill(null);
    setError(null);
    setValidationError(null);
    setStatus('idle');
  }, [previewUrl]);

  const runExtraction = useCallback(async () => {
    if (!selectedFile) return;

    const currentRequestId = ++requestIdentityRef.current;
    setError(null);
    setValidationError(null);

    try {
      // 1. Compression step
      setStatus('compressing');
      const compressedFile = await compressBillImage(selectedFile);

      // Check if stale request
      if (currentRequestId !== requestIdentityRef.current) return;

      // 2. Extraction step
      setStatus('extracting');
      const result = await extractBill(compressedFile);

      // Check if stale request
      if (currentRequestId !== requestIdentityRef.current) return;

      setExtractedBill(result);
      setStatus('success');
    } catch (err: any) {
      if (currentRequestId !== requestIdentityRef.current) return;

      const normalizedError: ApiError = {
        ok: false,
        reason: err.reason || 'SERVER_ERROR',
        message: err.message || 'We could not process your bill image. Please try again.',
      };
      setError(normalizedError);
      setStatus('error');
    }
  }, [selectedFile]);

  const confirmBill = useCallback(() => {
    if (!extractedBill) return;

    // Save extracted bill data to central audit state
    dispatch({ type: 'SET_BILL_DATA', payload: extractedBill });
    dispatch({ type: 'SET_BILL_FILE', payload: selectedFile });
    dispatch({ type: 'SET_STEP', payload: 'appliances' });

    // Navigate to next route
    navigate('/audit/appliances');
  }, [extractedBill, selectedFile, dispatch, navigate]);

  return {
    status,
    selectedFile,
    previewUrl,
    extractedBill,
    error,
    validationError,
    selectFile,
    retake,
    extract: runExtraction,
    confirmBill,
  };
}
