import { apiClient } from './client';
import { API_CONFIG } from './config';
import { NameplateData } from '../types/api';
import extractNameplateMock from '../mocks/extract-nameplate.json';

/**
 * Extract Nameplate details from an appliance rating plate photo.
 * Endpoint: POST /api/extract-nameplate
 * Request Content-Type: multipart/form-data
 * Field: "file"
 */
export async function extractNameplate(image: File): Promise<NameplateData> {
  const formData = new FormData();
  formData.append('file', image);

  return apiClient.request<NameplateData>(
    API_CONFIG.endpoints.extractNameplate,
    {
      method: 'POST',
      body: formData,
    },
    extractNameplateMock as NameplateData
  );
}
