import { apiClient } from './client';
import { API_CONFIG } from './config';
import { ExtractBillResponse } from '../types/api';
import extractBillMock from '../mocks/extract-bill.json';

/**
 * Extract Bill details from an electricity bill image file.
 * Endpoint: POST /api/extract-bill
 * Request Content-Type: multipart/form-data
 * Field: "image"
 */
export async function extractBill(image: File): Promise<ExtractBillResponse> {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.request<ExtractBillResponse>(
    API_CONFIG.endpoints.extractBill,
    {
      method: 'POST',
      body: formData,
    },
    extractBillMock as ExtractBillResponse
  );
}
