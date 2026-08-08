import React, { useState, useEffect } from 'react';
import { ApplianceInput, NameplateData } from '../../types/api';
import { getApplianceCatalogItem } from '../../config/appliances';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CapacitySelector } from './CapacitySelector';
import { StarRatingSelector } from './StarRatingSelector';
import { ManufacturingYearSelector } from './ManufacturingYearSelector';
import { RuntimeSelector } from './RuntimeSelector';
import { SymptomSelector } from './SymptomSelector';
import { NameplateScanner } from './NameplateScanner';

export interface ApplianceConfigModalProps {
  appliance: ApplianceInput | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ApplianceInput) => void;
}

export const ApplianceConfigModal: React.FC<ApplianceConfigModalProps> = ({
  appliance,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ApplianceInput | null>(appliance);

  useEffect(() => {
    setFormData(appliance);
  }, [appliance]);

  if (!appliance || !formData) {
    return null;
  }

  const catalogItem = getApplianceCatalogItem(appliance.type);

  if (!catalogItem) {
    return null;
  }

  const handleApplyNameplate = (nameplate: NameplateData) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        capacity: nameplate.capacity !== null ? nameplate.capacity : prev.capacity,
        star: nameplate.star_rating !== null ? nameplate.star_rating : prev.star,
        year: nameplate.manufacture_year !== null ? nameplate.manufacture_year : prev.year,
      };
    });
  };

  const handleSave = () => {
    if (formData) {
      // The user opened this screen and saved it, so runtime is now confirmed
      // rather than assumed. This is the ONLY place that may set it true.
      onSave({ ...formData, runtime_confirmed: true });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${catalogItem.label}`}
      footer={
        <>
          <Button variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} className="font-bold">
            Save Appliance Details
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Optional Rating Plate Scanner */}
        <NameplateScanner
          currentApplianceType={appliance.type}
          onApplyNameplate={handleApplyNameplate}
        />

        {/* Capacity Selector */}
        {catalogItem.supportsCapacity && (
          <CapacitySelector
            catalogItem={catalogItem}
            value={formData.capacity}
            onChange={(cap) => setFormData({ ...formData, capacity: cap })}
          />
        )}

        {/* Star Rating Selector */}
        {catalogItem.supportsStar && (
          <StarRatingSelector
            value={formData.star}
            onChange={(star) => setFormData({ ...formData, star })}
          />
        )}

        {/* Manufacturing Year */}
        {catalogItem.supportsYear && (
          <ManufacturingYearSelector
            value={formData.year}
            onChange={(year) => setFormData({ ...formData, year })}
          />
        )}

        {/* Runtime Hours Band (Handling Refrigerator Special Case) */}
        <RuntimeSelector
          applianceType={appliance.type}
          value={formData.hours_band}
          onChange={(band) => setFormData({ ...formData, hours_band: band })}
        />

        {/* Symptoms Selector */}
        <SymptomSelector
          catalogItem={catalogItem}
          selectedSymptoms={formData.symptoms}
          onChange={(symptoms) => setFormData({ ...formData, symptoms })}
        />
      </div>
    </Modal>
  );
};
