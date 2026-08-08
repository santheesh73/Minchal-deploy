import { useState, useCallback } from 'react';
import { extractNameplate } from '../api/nameplateApi';
import { NameplateData, ApiError } from '../types/api';
import { compressBillImage } from '../utils/imageCompression';

export type NameplateStatus = 'idle' | 'compressing' | 'extracting' | 'success' | 'error';

export function useNameplate() {
  const [status, setStatus] = useState<NameplateStatus>('idle');
  const [result, setResult] = useState<NameplateData | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const scanNameplate = useCallback(async (file: File) => {
    setError(null);
    setResult(null);

    try {
      setStatus('compressing');
      const compressedFile = await compressBillImage(file);

      setStatus('extracting');
      const data = await extractNameplate(compressedFile);

      setResult(data);
      setStatus('success');
    } catch (err: any) {
      const normalizedError: ApiError = {
        ok: false,
        reason: err.reason || 'SERVER_ERROR',
        message: err.message || 'Failed to extract appliance nameplate data.',
      };
      setError(normalizedError);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return {
    status,
    result,
    error,
    scanNameplate,
    reset,
  };
}
