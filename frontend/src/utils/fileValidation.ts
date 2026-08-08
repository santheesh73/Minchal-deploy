/**
 * Client-side File Validation Utility for MINCHAL
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB max raw upload limit

export function validateBillFile(file: File | null | undefined): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected. Please select an electricity bill image.' };
  }

  // Check file type
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a clear photo (JPG, PNG, WEBP) or PDF of your electricity bill.',
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size is too large (exceeds 20MB limit). Please select a smaller bill photo.',
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected file is empty. Please select a valid electricity bill photo.',
    };
  }

  return { valid: true };
}
