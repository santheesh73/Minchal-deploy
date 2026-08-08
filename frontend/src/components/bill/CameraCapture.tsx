import React, { useRef, ChangeEvent } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '../ui/Button';

export interface CameraCaptureProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onFileSelect,
  disabled = false,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        aria-label="Take photo of bill using camera"
      />
      <Button
        variant="primary"
        size="lg"
        onClick={handleCameraClick}
        disabled={disabled}
        leftIcon={<Camera className="w-5 h-5" />}
        fullWidth
        className="text-base font-bold shadow-md hover:shadow-lg"
      >
        Take Photo
      </Button>
    </>
  );
};
