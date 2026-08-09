import React, { useState } from 'react';
import { TrendingDown, Clock, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Action } from '../../types/api';
import { formatEstimateRupees } from '../../utils';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { DataTrustLabel } from '../explainability/DataTrustLabel';
import { useAudit } from '../../store/AuditContext';

export interface ActionCardProps {
  action: Action;
  onViewActionDetails?: (action: Action) => void;
}

interface ActionGuide {
  titleEn: string;
  titleTa: string;
  stepsEn: string[];
  stepsTa: string[];
}

const APPLIANCE_NAME_LABELS: Record<string, { en: string; ta: string }> = {
  ac: { en: 'Air Conditioner', ta: 'ஏர் கண்டிஷனர்' },
  fridge: { en: 'Refrigerator', ta: 'குளிர்சாதனப் பெட்டி' },
  geyser: { en: 'Water Heater', ta: 'வாட்டர் ஹீட்டர்' },
  washing_machine: { en: 'Washing Machine', ta: 'வாஷிங் மெஷின்' },
  fan: { en: 'Ceiling Fan', ta: 'மின்விசிறி' },
  motor_pump: { en: 'Water Pump', ta: 'மோட்டார் பம்ப்' },
  tv: { en: 'Television', ta: 'தொலைக்காட்சி' },
  lights: { en: 'Lighting', ta: 'மின்விளக்குகள்' },
};

const APPLIANCE_ACTION_GUIDES: Record<string, Record<string, ActionGuide>> = {
  ac: {
    free: {
      titleEn: 'Set AC thermostat to 26°C & optimize daily runtime hours',
      titleTa: 'ஏசியின் வெப்பநிலையை 26°C ஆக அமைத்து பயன்பாட்டு நேரத்தைக் குறைக்கவும்',
      stepsEn: [
        'Set thermostat to 26°C (each degree above 18°C cuts power consumption by ~6%).',
        'Operate ceiling fan on low speed simultaneously to circulate cool air uniformly.',
        'Turn off AC 30 minutes before waking up (room thermal inertia retains cooling).'
      ],
      stepsTa: [
        'ஏசி வெப்பநிலையை 26°C ஆக வைக்கவும் (ஒவ்வொரு டிகிரி உயர்விலும் 6% மின்சாரம் சேமிப்பாகும்).',
        'மின்விசிறியையும் இணைந்து பயன்படுத்தி குளிர்ந்த காற்றை அறை முழுவதும் பரவச் செய்யவும்.',
        'விழித்தெழுவதற்கு 30 நிமிடங்களுக்கு முன்பே ஏசியை அணைக்கவும்.'
      ]
    },
    cheap: {
      titleEn: 'Clean AC air filters & service refrigerant gas pressure',
      titleTa: 'ஏசி வடிகட்டிகளை சுத்தம் செய்து குளிரூட்டும் அமைப்பை சரிபார்க்கவும்',
      stepsEn: [
        'Remove AC mesh filter and wash under running tap water every 15 days.',
        'Clear dust buildup on outdoor condenser coils to allow efficient heat dissipation.',
        'Check refrigerant gas levels to prevent compressor overload.'
      ],
      stepsTa: [
        'ஏசி பில்டர்களை 15 நாட்களுக்கு ஒருமுறை தண்ணீரில் கழுவி சுத்தமாக வைக்கவும்.',
        'வெளியே உள்ள சுருள்களில் உள்ள தூசிகளை அகற்றி வெப்ப வெளியேற்றத்தை சீராக்கவும்.',
        'குளிரூட்டி வாயுவ அளவை பரிசோதித்து கம்ப்ரஸர் சுமையைக் குறைக்கவும்.'
      ]
    },
    investment: {
      titleEn: 'Upgrade to BEE 5-Star Inverter AC model',
      titleTa: 'பழைய ஏசிக்கு பதிலாக புதிய 5-நட்சத்திர இன்வெர்ட்டர் ஏசியை வாங்கவும்',
      stepsEn: [
        'Select a BEE 5-Star Inverter AC with high ISEER rating (>= 5.0) for maximum savings.',
        'Check DISCOM energy efficiency rebates and manufacturer exchange offers.',
        'Cuts cooling power draw by up to 40% with complete cost recovery in ~18 months.'
      ],
      stepsTa: [
        'அதிக ISEER மதிப்பீடு (>= 5.0) கொண்ட 5-நட்சத்திர இன்வெர்ட்டர் ஏசியை தேர்வு செய்யவும்.',
        'மின்வாரிய மானியம் மற்றும் பழைய சாதனப் பரிமாற்றச் சலுகைகளைப் பயன்படுத்தவும்.',
        'மாதாந்திர பயன்பாட்டை 40% வரை குறைத்து 18 மாதங்களில் செலவை மீட்டெடுக்கலாம்.'
      ]
    }
  },
  fridge: {
    free: {
      titleEn: 'Maintain 5cm wall clearance & avoid storing hot items in fridge',
      titleTa: 'குளிர்சாதனப் பெட்டியின் பின்புறம் 5 செ.மீ இடைவெளி விட்டு காற்றோட்டத்தை சீராக்கவும்',
      stepsEn: [
        'Leave at least 5cm clearance behind and on sides of fridge for heat dissipation.',
        'Allow cooked food to cool down to room temperature before placing inside.',
        'Avoid overloading shelves to ensure proper internal cold air circulation.'
      ],
      stepsTa: [
        'பின்புறம் 5 செ.மீ இடைவெளி விட்டு சுருள்களுக்கு போதுமான காற்றோட்டம் அளிக்கவும்.',
        'சூடான உணவை அறை வெப்பநிலைக்கு ஆறவைத்து பின்னரே வைக்கவும்.',
        'உட்புறக் காற்று சுழற்சியை பாதிக்காத வகையில் பொருட்களை அடுக்கவும்.'
      ]
    },
    cheap: {
      titleEn: 'Clean back condenser coils & test fridge door gasket seal',
      titleTa: 'குளிர்சாதன பெட்டியின் பின் சுருள்கள் மற்றும் கதவு கேஸ்கெட்டை சுத்தம் செய்யவும்',
      stepsEn: [
        'Perform paper slip test on door gasket: if it slides out easily, replace gasket.',
        'Defrost freezer regularly whenever ice layer exceeds 5mm thickness.',
        'Vacuum dust from back condenser coils every 6 months.'
      ],
      stepsTa: [
        'கதவு கேஸ்கெட் தளர்வாக உள்ளதா என்று காகித பரிசோதனை மூலம் சோதிக்கவும்.',
        'உறைவிப்பானில் 5மிமீக்கு மேல் ஐஸ் சேர்ந்தால் ஃப்ரோஸ்ட் பொத்தானை அழுத்தவும்.',
        'பின்புற சுருள்களில் உள்ள தூசிகளை 6 மாதங்களுக்கு ஒருமுறை துடைக்கவும்.'
      ]
    },
    investment: {
      titleEn: 'Upgrade to BEE 5-Star Smart Inverter Refrigerator',
      titleTa: 'பழைய குளிர்சாதனப் பெட்டிக்கு பதிலாக 5-நட்சத்திர இன்வெர்ட்டர் மாடலை வாங்கவும்',
      stepsEn: [
        'Choose a BEE 5-Star Smart Inverter Compressor model tailored to your family size.',
        'Reduces continuous 24/7 power consumption by 25-30%.',
        'Estimated financial payback period of ~24 months.'
      ],
      stepsTa: [
        'குடும்பத்திற்கு ஏற்ப 5-நட்சத்திர இன்வெர்ட்டர் கம்ப்ரஸர் மாடலை தேர்வு செய்யவும்.',
        '24 மணிநேர பயன்பாட்டு மின்சாரத்தில் 25-30% வரை சேமிப்பு கிடைக்கும்.',
        'சுமார் 24 மாதங்களில் முதலீட்டுத் தொகையை மீட்டெடுக்கலாம்.'
      ]
    }
  },
  geyser: {
    free: {
      titleEn: 'Turn off geyser 5 mins before ending shower & set thermostat to 50°C',
      titleTa: 'குளிப்பதற்கு 5 நிமிடங்களுக்கு முன்பே வாட்டர் ஹீட்டரை அணைக்கவும்',
      stepsEn: [
        'Turn off power switch 5 minutes before finishing shower (water stays hot).',
        'Set internal thermostat to 50°C instead of default 65°C to avoid overheating.',
        'Avoid leaving geyser switched on continuously throughout the morning.'
      ],
      stepsTa: [
        'குளித்து முடிப்பதற்கு 5 நிமிடங்களுக்கு முன்பே சுவிட்சை அணைக்கவும்.',
        'வெப்பநிலையை 65°C லிருந்து 50°C ஆகக் குறைத்து மின்சாரத்தை சேமிக்கவும்.',
        'காலை முழுவதும் வாட்டர் ஹீட்டரை இயக்கி வைப்பதைத் தவிர்க்கவும்.'
      ]
    },
    cheap: {
      titleEn: 'Descale heating element & flush tank mineral buildup',
      titleTa: 'வாட்டர் ஹீட்டர் வெப்பமூட்டும் உறுப்பில் உள்ள உப்புக் படிவுகளை அகற்றுங்கள்',
      stepsEn: [
        'Call technician to descale heating element from hard water mineral buildup.',
        'Inspect pressure release safety valve and check for pipe leakages.',
        'Insulate hot water output pipe with foam wrap to reduce standing heat loss.'
      ],
      stepsTa: [
        'வெப்பமூட்டும் உறுப்பில் உள்ள கடின உப்புக் படிவுகளை 12 மாதங்களுக்கு ஒருமுறை அகற்றவும்.',
        'பாதுகாப்பு வால்வு மற்றும் குழாய் கசிவுகளை பரிசோதிக்கவும்.',
        'சுடுநீர் குழாய்களை நுரை உறையினால் சுற்றி வெப்ப இழப்பைத் தடுக்கவும்.'
      ]
    },
    investment: {
      titleEn: 'Upgrade to Instant 5-Star or Solar Rooftop Water Heater',
      titleTa: 'பழைய ஹீட்டருக்கு பதிலாக 5-நட்சத்திர இன்ஸ்டன்ட் அல்லது சோலார் ஹீட்டரை வாங்கவும்',
      stepsEn: [
        'Replace storage geyser with a 5-Star Instant Geyser or Solar Rooftop Heater.',
        'Eliminates standing standby heat loss completely.',
        'Fast payback within ~14 months of daily morning use.'
      ],
      stepsTa: [
        'பழைய ஹீட்டருக்கு பதிலாக 5-நட்சத்திர இன்ஸ்டன்ட் அல்லது சோலார் ஹீட்டரை பொருத்தவும்.',
        'தேவையற்ற ஸ்டாண்ட்பை வெப்ப இழப்பை முற்றிலும் தடுக்கலாம்.',
        'தினசரி பயன்பாட்டின் மூலம் 14 மாதங்களில் செலவை மீட்டெடுக்கலாம்.'
      ]
    }
  },
  washing_machine: {
    free: {
      titleEn: 'Operate full washing loads using cold water eco cycle',
      titleTa: 'துணிகளை மொத்தமாக சேர்த்து குளிர் நீரில் அலசும் முறையைப் பயன்படுத்தவும்',
      stepsEn: [
        'Always run full laundry loads rather than multiple half-empty cycles.',
        'Use cold water wash (30°C or cold tap setting) to save heating power.',
        'Select Quick Wash or Eco Mode for lightly soiled daily clothes.'
      ],
      stepsTa: [
        'குறைந்த துணிகளுடன் பலமுறை துவைப்பதற்கு பதிலாக ஒரே முறையில் துவைக்கவும்.',
        'வெந்நீர் பயன்பாட்டைத் தவிர்த்து குளிர் நீரிலேயே துவைக்கவும்.',
        'தினசரி துணிகளுக்கு ஈகோ (Eco) முறையைப் பயன்படுத்தவும்.'
      ]
    },
    cheap: {
      titleEn: 'Clean lint filter & drain pump filter monthly',
      titleTa: 'துணி துவைக்கும் இயந்திர டிரமை சுத்தம் செய்து பராமரிக்கவும்',
      stepsEn: [
        'Detach and clean lint filter under running water after every 5 washes.',
        'Unscrew bottom drain pump filter to clear trapped coins and debris.',
        'Run monthly tub clean cycle with vinegar or descaling powder.'
      ],
      stepsTa: [
        'லிண்ட் வடிகட்டியை 5 துவைப்புகளுக்கு ஒருமுறை சுத்தம் செய்யவும்.',
        'அடியில் உள்ள வடிகட்டியில் சிக்கியுள்ள குப்பைகளை அகற்றவும்.',
        'மாதமொருமுறை டப் கிளீன் (Tub Clean) சுழற்சியை இயக்கவும்.'
      ]
    },
    investment: {
      titleEn: 'Upgrade to BEE 5-Star Direct Drive Inverter Washing Machine',
      titleTa: 'பழைய வாஷிங் மெஷினுக்கு பதிலாக 5-நட்சத்திர இன்வெர்ட்டர் மெஷினை வாங்கவும்',
      stepsEn: [
        'Upgrade to a Front-Load BEE 5-Star Inverter Motor Washing Machine.',
        'Reduces electricity consumption by 30% and water usage by 40%.',
        'Estimated financial payback period of ~30 months.'
      ],
      stepsTa: [
        '5-நட்சத்திர இன்வெர்ட்டர் மோட்டார் வாஷிங் மெஷினை தேர்வு செய்யவும்.',
        'மின்சாரத்தை 30% மற்றும் தண்ணீர் நுகர்வை 40% வரை குறைக்கலாம்.',
        'சுமார் 30 மாதங்களில் முதலீட்டுத் தொகையை மீட்டெடுக்கலாம்.'
      ]
    }
  },
  fan: {
    free: {
      titleEn: 'Turn off ceiling fans when leaving unoccupied rooms',
      titleTa: 'ஆள் இல்லாத அறைகளில் மின்விசிறிகளை அணைத்து வைக்கவும்',
      stepsEn: [
        'Switch off fans immediately when leaving the room (fans cool people, not rooms).',
        'Clean fan blades regularly to reduce aerodynamic drag.',
        'Ensure fan regulator is operating smoothly without heating up.'
      ],
      stepsTa: [
        'அறையை விட்டு வெளியேறும் போது மின்விசிறியை அணைக்கவும்.',
        'காற்றின் வேகத்தை சீராக்க மின்விசிறி இறக்கைகளை அடிக்கடி துடைக்கவும்.',
        'ரெகுலேட்டர் சூடாகாமல் சீராக இயங்குவதை உறுதி செய்யவும்.'
      ]
    },
    cheap: {
      titleEn: 'Service fan motor bearings & inspect speed regulator',
      titleTa: 'மின்விசிறி மோட்டாருக்கு எண்ணெய் ஊற்றி கெபாசிட்டரை சரிபார்க்கவும்',
      stepsEn: [
        'Lubricate fan bearings and inspect capacitor for smooth rotation.',
        'Replace noisy or hot regulators with electronic step regulators.'
      ],
      stepsTa: [
        'பேரிங்கிற்கு ஆயில் ஊற்றி கெபாசிட்டரை சீரமைக்கவும்.'
      ]
    },
    investment: {
      titleEn: 'Upgrade regular 75W ceiling fans to 28W BLDC energy-saving fans',
      titleTa: 'பழைய மின்விசிறிகளுக்கு பதிலாக புதிய 28W BLDC மின்விசிறிகளைப் பயன்படுத்தவும்',
      stepsEn: [
        'Replace conventional 75W induction fans with 28W BLDC motor ceiling fans.',
        'Reduces fan power consumption by over 60% with remote speed control.',
        'Payback within ~12 months per fan with daily household usage.'
      ],
      stepsTa: [
        'பழைய 75W ஃபான்களுக்கு பதிலாக 28W BLDC மின்விசிறிகளைப் பொருத்தவும்.',
        'மின்விசிறி மின்சாரக் கட்டணத்தில் 60%க்கும் மேல் சேமிக்கலாம்.',
        '12 மாதங்களில் மின்விசிறியின் விலையை மீட்டெடுக்கலாம்.'
      ]
    }
  },
  motor_pump: {
    free: {
      titleEn: 'Install automatic water level controller to stop tank overflow',
      titleTa: 'தண்ணீர் தொட்டி நிரம்பி வழிவதைத் தடுக்க தானியங்கி கட்டுப்பாட்டமைப்பை பொருத்தவும்',
      stepsEn: [
        'Fit sensor-based auto water level controller to stop pump as soon as overhead tank fills.',
        'Prevents motor running idle and saves thousands of liters of wasted water.',
        'Avoid running pump during peak grid voltage fluctuation hours.'
      ],
      stepsTa: [
        'தொட்டி நிரம்பியவுடன் பம்பை தானாக அணைக்க சென்சார் சுவிட்சைப் பொருத்தவும்.',
        'வீணாகும் தண்ணீர் மற்றும் தேவையற்ற மின் பயன்பாட்டைத் தடுக்கலாம்.',
        'வோல்டேஜ் மாறுபாடு உள்ள நேரத்தில் பம்பை இயக்குவதைத் தவிர்க்கவும்.'
      ]
    },
    cheap: {
      titleEn: 'Service pump motor bearings & replace worn impeller',
      titleTa: 'மோட்டார் பம்ப் இம்பெல்லர் மற்றும் பேரிங்கை சரிபார்க்கவும்',
      stepsEn: [
        'Grease bearings and replace worn impeller to restore full water flow rate.',
        'Fix suction pipe leaks to avoid pump running extra time to prime.'
      ],
      stepsTa: [
        'பேரிங்கிற்கு ஆயில் ஊற்றி இம்பெல்லரை சீரமைக்கவும்.',
        'குழாய் கசிவுகளை அடைத்து தொட்டி நிரம்பும் நேரத்தைக் குறைக்கவும்.'
      ]
    },
    investment: {
      titleEn: 'Upgrade to BEE 5-Star Energy-Efficient Motor Pump',
      titleTa: 'பழைய பம்பிற்கு பதிலாக புதிய 5-நட்சத்திர மோட்டார் பம்பை வாங்கவும்',
      stepsEn: [
        'Replace old pump with a BEE 5-Star Monoblock or Submersible pump.',
        'Reduces pumping power draw by 30% with faster tank fill time.',
        'Estimated payback within ~20 months of regular daily use.'
      ],
      stepsTa: [
        'புதிய 5-நட்சத்திர மோட்டார் பம்பை வாங்கிப் பொருத்தவும்.',
        'மின்சார பயன்பாட்டை 30% வரை குறைக்கலாம்.'
      ]
    }
  },
  tv: {
    free: {
      titleEn: 'Turn off main wall power switch to eliminate TV standby power draw',
      titleTa: 'தொலைக்காட்சியை பயன்படுத்தாத போது முதன்மை சுவிட்சை அணைத்து வைக்கவும்',
      stepsEn: [
        'Switch off main wall socket switch when TV is not in use (remote power off leaves set in standby).',
        'Lowers screen backlight brightness level from 100% to 70%.',
        'Saves standby power draw 24 hours a day.'
      ],
      stepsTa: [
        'ரிமோட் மூலம் அணைத்த பின் சுவரில் உள்ள சுவிட்சையும் அணைக்கவும்.',
        'திரை வெளிச்சத்தை (Backlight) 100% லிருந்து 70% ஆகக் குறைக்கவும்.',
        '24 மணிநேர ஸ்டாண்ட்பை மின்சார நுகர்வை தவிர்க்கலாம்.'
      ]
    }
  },
  lights: {
    free: {
      titleEn: 'Switch off lights when leaving unoccupied rooms & maximize daylight',
      titleTa: 'ஆள் இல்லாத அறைகளில் மின்விளக்குகளை அணைத்து இயற்கை வெளிச்சத்தைப் பயன்படுத்தவும்',
      stepsEn: [
        'Turn off lights when leaving rooms and keep window curtains open during daytime.',
        'Clean lamp shades and light fixtures to maximize lumen output.',
        'Use localized task lighting instead of illuminating entire rooms.'
      ],
      stepsTa: [
        'பகல் நேரத்தில் ஜன்னல் திரைச்சீலைகளை விலக்கி இயற்கை வெளிச்சத்தைப் பயன்படுத்தவும்.',
        'விளக்கு மூடிகளை சுத்தம் செய்து வெளிச்சத்தை அதிகரிக்கவும்.'
      ]
    },
    cheap: {
      titleEn: 'Replace old filament/CFL bulbs with high-efficiency 9W LED bulbs',
      titleTa: 'பழைய பல்புகளுக்கு பதிலாக 9W எல்இடி பல்புகளை பயன்படுத்தவும்',
      stepsEn: [
        'Replace remaining incandescent (60W) or CFL (18W) bulbs with 9W LED bulbs.',
        'Reduces lighting power draw by up to 80% with zero warm-up delay.',
        'Instant financial payback within ~2 months.'
      ],
      stepsTa: [
        'பழைய 60W மற்றும் 18W பல்புகளுக்கு பதிலாக 9W எல்இடி பல்புகளைப் பொருத்தவும்.',
        'மின் நுகர்வை 80% வரை உடனடியாகக் குறைக்கலாம்.',
        '2 மாதங்களில் பல்பின் விலையை மீட்டெடுக்கலாம்.'
      ]
    }
  }
};

export const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  const { state } = useAudit();
  const isTa = state.language === 'ta';
  const [showSteps, setShowSteps] = useState(true);

  // Match guide by appliance_type and tier
  const appType = action.appliance_type || 'ac';
  const tier = action.tier || 'free';
  
  const appGuides = APPLIANCE_ACTION_GUIDES[appType] || APPLIANCE_ACTION_GUIDES.ac;
  const guide = appGuides[tier] || appGuides.free || APPLIANCE_ACTION_GUIDES.ac.free;

  // Appliance Badge text
  const appLabelObj = APPLIANCE_NAME_LABELS[appType] || { en: appType, ta: appType };
  const applianceBadge = isTa ? appLabelObj.ta : appLabelObj.en;

  // Fallback to server text if specific guide not mapped
  const displayTitle = isTa
    ? (guide.titleTa || action.text)
    : (guide.titleEn || action.text);
    
  const steps = isTa ? guide.stepsTa : guide.stepsEn;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'free':
        return <Badge variant="success" size="sm">{isTa ? 'இலவச பழக்கம்' : 'Free Habit'}</Badge>;
      case 'cheap':
        return <Badge variant="primary" size="sm">{isTa ? 'குறைந்த பராமரிப்புச் செலவு' : 'Low Cost Fix'}</Badge>;
      case 'investment':
        return <Badge variant="warning" size="sm">{isTa ? 'சாதன மாற்றம்' : 'Appliance Upgrade'}</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{tier}</Badge>;
    }
  };

  const annualSavings = action.saves_rupees * 12;

  return (
    <Card variant="default" className="p-4 sm:p-5 space-y-4 border-slate-200 hover:border-brand-300 transition-all bg-white flex flex-col justify-between shadow-xs">
      <div className="space-y-3.5">
        {/* Appliance Badge & Tier Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 text-[11px] border border-slate-200">
              {applianceBadge}
            </span>
            {getTierBadge(action.tier)}
            <DataTrustLabel category="potential" />
          </div>

          {action.saves_rupees > 0 && (
            <span className="text-xs font-bold text-emerald-700 font-mono flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              {isTa ? 'சேமிப்பு' : 'saves'} ~{formatEstimateRupees(action.saves_rupees)} / {isTa ? 'மாதம்' : 'mo'}
            </span>
          )}
        </div>

        {/* Action Title */}
        <div className="space-y-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {displayTitle}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {isTa ? `ஆண்டுச் சேமிப்பு தோராயமாக ${formatEstimateRupees(annualSavings)}` : `Est. Annual Savings: ${formatEstimateRupees(annualSavings)} / year`}
          </p>
        </div>

        {/* Implementation Steps Box */}
        {steps && steps.length > 0 && (
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 focus:outline-none"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                {isTa ? 'செயல்படுத்தும் வழிகாட்டி' : 'Implementation Steps'}
              </span>
              {showSteps ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {showSteps && (
              <ul className="space-y-2 pt-1 border-t border-slate-200/60">
                {steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Financial Payback Metric */}
        {action.payback_months !== undefined && action.payback_months > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/70 flex items-center gap-2 text-[11px] text-amber-900">
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              {isTa ? 'செலவு மீட்புக் காலம்:' : 'Estimated payback period:'} <strong className="font-bold text-amber-900 font-mono">{action.payback_months} {isTa ? 'மாதங்கள்' : 'months'}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Footer Cost Label */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {action.cost_rupees ? `${isTa ? 'செலவு' : 'One-off Cost'}: ${formatEstimateRupees(action.cost_rupees)}` : (isTa ? 'செலவு இல்லை' : 'Zero Investment')}
        </span>
      </div>
    </Card>
  );
};
