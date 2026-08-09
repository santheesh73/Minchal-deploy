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
import { useAudit } from '../store/AuditContext';
import { getTranslation } from '../utils/translations';

export const BillUploadPage: React.FC = () => {
  const { state } = useAudit();
  const t = getTranslation(state.language);

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
        title={t.step1Title}
        subtitle={t.step1Subtitle}
        showBack
        stepNumber={1}
        totalSteps={3}
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
