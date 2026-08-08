import { ApplianceType, HoursBand } from '../types/api';

export interface ApplianceCatalogItem {
  type: ApplianceType;
  label: string;
  category: string;
  description: string;
  iconName: string;
  supportsCapacity: boolean;
  capacityUnit?: string;
  capacityPresets?: number[];
  supportsStar: boolean;
  supportsYear: boolean;
  supportsRuntime: boolean; // false for fridge (hours_band is null)
  defaultHoursBand?: HoursBand;
  symptomOptions: { id: string; label: string }[];
}

export const APPLIANCE_CATALOG: ApplianceCatalogItem[] = [
  {
    type: 'ac',
    label: 'Air Conditioner',
    category: 'Cooling',
    description: 'Split or window AC units used for room cooling',
    iconName: 'Snowflake',
    supportsCapacity: true,
    capacityUnit: 'Tons',
    capacityPresets: [1.0, 1.5, 2.0, 2.5],
    supportsStar: true,
    supportsYear: true,
    supportsRuntime: true,
    defaultHoursBand: '4-6',
    symptomOptions: [
      { id: 'not_cooling_well', label: 'Does not cool well' },
      { id: 'running_continuously', label: 'Compressor runs continuously' },
      { id: 'unusual_noise', label: 'Unusual noise or vibration' },
      { id: 'water_leakage', label: 'Water leaking indoors' },
      { id: 'high_power_spike', label: 'Causes lights to flicker when turning on' },
    ],
  },
  {
    type: 'fridge',
    label: 'Refrigerator',
    category: 'Kitchen',
    description: 'Single, double-door, or side-by-side refrigerator',
    iconName: 'Refrigerator',
    supportsCapacity: true,
    capacityUnit: 'Liters',
    capacityPresets: [180, 250, 350, 500],
    supportsStar: true,
    supportsYear: true,
    supportsRuntime: false, // REFRIGERATOR SPECIAL CASE: hours_band is null (Always on 24/7)
    symptomOptions: [
      { id: 'excessive_frost', label: 'Excessive frost buildup' },
      { id: 'gasket_leak', label: 'Door seal / gasket loose or worn' },
      { id: 'warm_compartment', label: 'Food compartment not cold enough' },
      { id: 'compressor_hot', label: 'Compressor stays hot constantly' },
    ],
  },
  {
    type: 'geyser',
    label: 'Water Heater / Geyser',
    category: 'Heating',
    description: 'Storage or instant electric bathroom water heater',
    iconName: 'Flame',
    supportsCapacity: true,
    capacityUnit: 'Liters',
    capacityPresets: [10, 15, 25, 35],
    supportsStar: true,
    supportsYear: true,
    supportsRuntime: true,
    defaultHoursBand: '1-2',
    symptomOptions: [
      { id: 'slow_heating', label: 'Takes long time to heat water' },
      { id: 'thermostat_faulty', label: 'Thermostat indicator lights malfunction' },
      { id: 'water_scaling', label: 'Heavy hard-water scale accumulation' },
    ],
  },
  {
    type: 'washing_machine',
    label: 'Washing Machine',
    category: 'Laundry',
    description: 'Top-load or front-load automatic/semi-automatic washer',
    iconName: 'Shirt',
    supportsCapacity: true,
    capacityUnit: 'Kg',
    capacityPresets: [6.0, 7.0, 8.0, 10.0],
    supportsStar: true,
    supportsYear: true,
    supportsRuntime: true,
    defaultHoursBand: '0-1',
    symptomOptions: [
      { id: 'long_spin_cycle', label: 'Spin cycle takes abnormally long' },
      { id: 'water_heater_used', label: 'Built-in water heater enabled during wash' },
      { id: 'vibrates_excessively', label: 'Excessive shaking during spin' },
    ],
  },
  {
    type: 'fan',
    label: 'Ceiling / Table Fan',
    category: 'Ventilation',
    description: 'Standard, induction, or BLDC ceiling & pedestal fans',
    iconName: 'Fan',
    supportsCapacity: false,
    supportsStar: true,
    supportsYear: true,
    supportsRuntime: true,
    defaultHoursBand: '6-8',
    symptomOptions: [
      { id: 'slow_speed', label: 'Runs at reduced speed even on high regulator' },
      { id: 'humming_sound', label: 'Loud motor humming noise' },
      { id: 'old_regulator', label: 'Using old resistance-type speed regulator' },
    ],
  },
  {
    type: 'tv',
    label: 'Television',
    category: 'Entertainment',
    description: 'LED, LCD, or Smart TV screen',
    iconName: 'Tv',
    supportsCapacity: true,
    capacityUnit: 'Inches',
    capacityPresets: [32, 43, 55, 65],
    supportsStar: true,
    supportsYear: true,
    supportsRuntime: true,
    defaultHoursBand: '2-4',
    symptomOptions: [
      { id: 'standby_always', label: 'Kept on standby mode continuously' },
      { id: 'set_top_box_always_on', label: 'Set-top box / soundbar left powered on 24/7' },
    ],
  },
  {
    type: 'lights',
    label: 'Lighting & Bulbs',
    category: 'Lighting',
    description: 'Total household lighting load (LED, Tubelights, CFL)',
    iconName: 'Lightbulb',
    supportsCapacity: false,
    supportsStar: false,
    supportsYear: true,
    supportsRuntime: true,
    defaultHoursBand: '4-6',
    symptomOptions: [
      { id: 'incandescent_bulbs', label: 'Using old incandescent / halogen bulbs' },
      { id: 'daytime_left_on', label: 'Lights frequently left turned on during daytime' },
    ],
  },
  {
    type: 'motor_pump',
    label: 'Water Motor Pump',
    category: 'Water System',
    description: 'Submersible or monoblock water lifting pump',
    iconName: 'Gauge',
    supportsCapacity: true,
    capacityUnit: 'HP',
    capacityPresets: [0.5, 1.0, 1.5, 2.0],
    supportsStar: true,
    supportsYear: true,
    supportsRuntime: true,
    defaultHoursBand: '0-1',
    symptomOptions: [
      { id: 'low:pressure', label: 'Takes longer than usual to fill overhead tank' },
      { id: 'frequent_dry_run', label: 'Motor runs dry without water flow' },
      { id: 'bearing_friction', label: 'Motor overheating or noisy bearing' },
    ],
  },
];

export function getApplianceCatalogItem(type: ApplianceType): ApplianceCatalogItem | undefined {
  return APPLIANCE_CATALOG.find((item) => item.type === type);
}
