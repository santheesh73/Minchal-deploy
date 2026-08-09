export interface TranslationKeys {
  // Navigation & Header
  deterministicEngine: string;
  languageName: string;
  home: string;
  billUpload: string;
  appliances: string;
  auditResults: string;
  privacyBadge: string;
  
  // Bill Upload Page & Components
  step1Title: string;
  step1Subtitle: string;
  uploadPhoto: string;
  manualEntry: string;
  unitsConsumed: string;
  totalAmount: string;
  billingDays: string;
  tariffCategory: string;
  continueToAppliances: string;
  
  // Appliance Page & Components
  step2Title: string;
  step2Subtitle: string;
  addAppliance: string;
  runFullAudit: string;
  starRating: string;
  ageYears: string;
  dailyUsageHours: string;
  reportSymptoms: string;
  
  // Audit Results Page & Cards
  step3Title: string;
  step3Subtitle: string;
  confidenceScore: string;
  confidenceTitle: string;
  billSummary: string;
  extractedBillSummary: string;
  breakdownTitle: string;
  potentialSavings: string;
  efficiencyGapTitle: string;
  biggestSurpriseTitle: string;
  recommendedActionsTitle: string;
  noActionsMessage: string;
  co2Title: string;
  solarTitle: string;
  
  // Budget Planner
  budgetPlannerTitle: string;
  budgetPlannerSubtitle: string;
  customBudgetLabel: string;
  planItButton: string;
  totalCost: string;
  savesPerYear: string;
  leftOver: string;
  across: string;
  actionsCount: string;
  didntFitBudget: string;
  freeAction: string;
  noBudgetActionsMessage: string;
}

export const translations: Record<'en' | 'ta', TranslationKeys> = {
  en: {
    deterministicEngine: 'Deterministic Engine',
    languageName: 'English',
    home: 'Home',
    billUpload: 'Bill Upload',
    appliances: 'Appliances',
    auditResults: 'Audit Results',
    privacyBadge: 'Privacy first — No personal consumer account data stored',
    
    step1Title: 'Step 1: Capture Electricity Bill',
    step1Subtitle: 'Upload a photo of your TNEB bill or enter numbers manually to begin',
    uploadPhoto: 'Upload Bill Photo',
    manualEntry: 'Manual Entry',
    unitsConsumed: 'Units Consumed (kWh)',
    totalAmount: 'Total Amount (₹)',
    billingDays: 'Billing Cycle (Days)',
    tariffCategory: 'Tariff Category',
    continueToAppliances: 'Continue to Appliances →',
    
    step2Title: 'Step 2: Appliance Inventory',
    step2Subtitle: 'Select appliances in your home to audit their energy consumption',
    addAppliance: 'Add Appliance',
    runFullAudit: 'Run Full Energy Audit →',
    starRating: 'BEE Star Rating',
    ageYears: 'Appliance Age (Years)',
    dailyUsageHours: 'Daily Usage Hours',
    reportSymptoms: 'Report Symptoms / Faults',
    
    step3Title: 'Step 3: Energy Audit & Breakdown Results',
    step3Subtitle: 'Deterministic appliance load analysis and personalized savings action plan',
    confidenceScore: 'Confidence Score',
    confidenceTitle: 'Audit Calculation Confidence',
    billSummary: 'Bill Summary',
    extractedBillSummary: 'Extracted Bill Summary',
    breakdownTitle: 'YOUR ENERGY BREAKDOWN',
    potentialSavings: 'Potential Savings',
    efficiencyGapTitle: 'Efficiency Opportunity Gap',
    biggestSurpriseTitle: 'Biggest Surprise Load',
    recommendedActionsTitle: 'Recommended Action Plan',
    noActionsMessage: 'No urgent corrective actions required — your appliances are running efficiently!',
    co2Title: 'Environmental Footprint (CO₂)',
    solarTitle: 'Rooftop Solar Opportunity',
    
    budgetPlannerTitle: 'What can I afford to fix?',
    budgetPlannerSubtitle: 'Tell us your budget. We pick the actions that save the most per rupee spent — and show you what didn\'t fit, and why.',
    customBudgetLabel: 'Or enter your own budget (Rs)',
    planItButton: 'Plan it',
    totalCost: 'TOTAL COST',
    savesPerYear: 'SAVES PER YEAR',
    leftOver: 'left over',
    across: 'across',
    actionsCount: 'action(s)',
    didntFitBudget: 'Didn\'t fit this budget',
    freeAction: 'Free',
    noBudgetActionsMessage: 'Your home energy efficiency is already optimized! No paid actions needed for this budget.',
  },
  ta: {
    deterministicEngine: 'துல்லிய கணக்கீட்டு பொறி',
    languageName: 'தமிழ்',
    home: 'முகப்பு',
    billUpload: 'மின் கட்டணம்',
    appliances: 'சாதனங்கள்',
    auditResults: 'ஆய்வு முடிவுகள்',
    privacyBadge: 'தனியுரிமை பாதுகாப்பு — தனிநபர் கணக்கு விவரங்கள் சேமிக்கப்படுவதில்லை',
    
    step1Title: 'படி 1: மின் கட்டணத்தைப் பதிவேற்றவும்',
    step1Subtitle: 'TNEB மின் கட்டண புகைப்படத்தைப் பதிவேற்றவும் அல்லது எண்களை உள்ளிடவும்',
    uploadPhoto: 'கட்டணப் படம் பதிவேற்று',
    manualEntry: 'நேரடி பதிவு',
    unitsConsumed: 'பயன்படுத்திய யூனிட்கள் (kWh)',
    totalAmount: 'மொத்தக் கட்டணம் (₹)',
    billingDays: 'கட்டண நாட்கள் (Days)',
    tariffCategory: 'மின் கட்டணப் பிரிவு',
    continueToAppliances: 'சாதனங்கள் பகுதிக்குச் செல் →',
    
    step2Title: 'படி 2: வீட்டுச் சாதனங்கள் பட்டியல்',
    step2Subtitle: 'உங்கள் வீட்டில் உள்ள மின் சாதனங்களைத் தேர்ந்தெடுத்து ஆய்வு செய்யவும்',
    addAppliance: 'சாதனம் சேர்',
    runFullAudit: 'முழு தணிக்கையைத் தொடங்கு →',
    starRating: 'BEE ஸ்டார் ரேட்டிங்',
    ageYears: 'சாதனத்தின் வயது (ஆண்டுகள்)',
    dailyUsageHours: 'தினசரி பயன்பாட்டு நேரம்',
    reportSymptoms: 'பழுதுகள் / அறிகுறிகளைப் பதிவு செய்க',
    
    step3Title: 'படி 3: ஆற்றல் தணிக்கை & பயன்பாட்டு பகுப்பாய்வு',
    step3Subtitle: 'சாதன வாரியான மின் நுகர்வு பகுப்பாய்வு மற்றும் சேமிப்பு திட்டம்',
    confidenceScore: 'நம்பகத்தன்மை அளவு',
    confidenceTitle: 'கணக்கீட்டு நம்பகத்தன்மை',
    billSummary: 'கட்டணச் சுருக்கம்',
    extractedBillSummary: 'மின் கட்டணச் சுருக்கம்',
    breakdownTitle: 'மின் பயன்பாட்டு பகுப்பாய்வு',
    potentialSavings: 'சாத்தியமான மாதாந்திர சேமிப்பு',
    efficiencyGapTitle: 'ஆற்றல் திறன் மேம்பாட்டு வாய்ப்பு',
    biggestSurpriseTitle: 'அதிக மின் நுகர்வு காரணி',
    recommendedActionsTitle: 'பரிந்துரைக்கப்பட்ட நடவடிக்கை திட்டம்',
    noActionsMessage: 'சிறப்பு பராமரிப்பு நடவடிக்கைகள் ஏதும் தேவையில்லை — உங்கள் சாதனங்கள் சீராக இயங்குகின்றன!',
    co2Title: 'சுற்றுச்சூழல் தாக்கம் (CO₂)',
    solarTitle: 'சூரிய மின்சக்தி (Solar) வாய்ப்பு',
    
    budgetPlannerTitle: 'எனது பட்ஜெட்டில் என்ன நடவடிக்கை எடுக்கலாம்?',
    budgetPlannerSubtitle: 'உங்கள் பட்ஜெட்டை உள்ளிடவும். அதிக சேமிப்பு தரும் சிறந்த நடவடிக்கைகளை நாங்கள் தேர்வு செய்து தருகிறோம்.',
    customBudgetLabel: 'அல்லது உங்கள் பட்ஜெட்டை உள்ளிடவும் (ரூ)',
    planItButton: 'திட்டமிடு',
    totalCost: 'மொத்தச் செலவு',
    savesPerYear: 'ஆண்டுச் சேமிப்பு',
    leftOver: 'மீதம் உள்ள தொகை',
    across: 'மொத்தம்',
    actionsCount: 'நடவடிக்கைகள்',
    didntFitBudget: 'இந்த பட்ஜெட்டில் பொருந்தாதவை',
    freeAction: 'இலவசம்',
    noBudgetActionsMessage: 'உங்கள் வீட்டு சாதனங்கள் ஏற்கெனவே திறம்பட இயங்குகின்றன! இந்த பட்ஜெட்டில் கூடுதல் செலவுத் தேவையில்லை.',
  },
};

export function getTranslation(lang?: string): TranslationKeys {
  const language = (lang === 'ta' ? 'ta' : 'en') as 'en' | 'ta';
  return translations[language];
}
