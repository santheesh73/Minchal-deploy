import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { useBillExtraction } from '../hooks/useBillExtraction';
import { BillUploader } from '../components/bill/BillUploader';
import { ImagePreview } from '../components/bill/ImagePreview';
import { ExtractionLoading } from '../components/bill/ExtractionLoading';
import { ExtractedBillDetails } from '../components/bill/ExtractedBillDetails';
import { BillExtractionError } from '../components/bill/BillExtractionError';
import { ManualBillEntry } from '../components/bill/ManualBillEntry';

export const BillUploadPage: React.FC = () => {
  const {
    status,
    selectedFile,
    previewUrl,
    extractedBill,
    billSource,
    error,
    validationError,
    selectFile,
    retake,
    extract,
    enterManual,
    acceptManualBill,
    confirmBill,
  } = useBillExtraction();

  return (
    <PageContainer maxWidth="md">
      <PageHeader
        title="Upload Electricity Bill"
        subtitle="Take a clear photo or select a PDF of your TNEB / Electricity Bill. Gemini Vision extracts units, billing period, and total bill amount."
        showBack
        stepNumber={1}
        totalSteps={4}
      />

      {/* State Machine UI Dispatcher */}
      {status === 'idle' && (
        <BillUploader
          onFileSelect={selectFile}
          validationError={validationError}
          onManualEntry={enterManual}
        />
      )}

      {status === 'selected' && selectedFile && previewUrl && (
        <ImagePreview
          file={selectedFile}
          previewUrl={previewUrl}
          onRetake={retake}
          onExtract={extract}
        />
      )}

      {(status === 'compressing' || status === 'extracting') && (
        <ExtractionLoading status={status} />
      )}

      {status === 'success' && extractedBill && (
        <ExtractedBillDetails
          bill={extractedBill}
          onConfirm={confirmBill}
          onScanAgain={retake}
          source={billSource}
        />
      )}

      {status === 'error' && error && (
        <BillExtractionError
          error={error}
          onRetry={retake}
          onManualEntry={enterManual}
        />
      )}

      {status === 'manual' && (
        <ManualBillEntry onSuccess={acceptManualBill} onCancel={retake} />
      )}
    </PageContainer>
  );
};
