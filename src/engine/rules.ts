export interface ComplianceRule {
  id: string;
  fieldNumber: number;
  fieldName: string;
  fieldHindiName: string;
  legalReference: string;
  description: string;
  iconName: 'Building2' | 'Package' | 'Scale' | 'Calendar' | 'Tag' | 'Headphones' | 'Percent' | 'Globe';
  mandatory: boolean;
  correctionGuidance: string;
  examplePattern: string;
  keywords: string[];
}

export const LMPC_RULES: ComplianceRule[] = [
  {
    id: 'mfg_address',
    fieldNumber: 1,
    fieldName: 'Manufacturer / Packer / Importer Name & Address',
    fieldHindiName: 'निर्माता / पैकर / आयातक का नाम और पता',
    legalReference: 'Rule 6(1)(a) of LM(PC) Rules, 2011',
    description: 'Name and complete address of the manufacturer, packer, or importer including City, State and PIN code.',
    iconName: 'Building2',
    mandatory: true,
    correctionGuidance: 'Ensure complete physical address with PIN code is printed alongside "Mfg by:", "Packed by:", or "Imported by:".',
    examplePattern: 'Mfg by: Sun Foods Pvt Ltd, Plot 42, Okhla Ind Area, New Delhi - 110020',
    keywords: ['manufactured by', 'mfg by', 'packed by', 'pkd by', 'marketed by', 'mktd by', 'imported by', 'imp by', 'mfg.', 'packer', 'manufacturer', 'address', 'ind area', 'estate', 'pvt ltd', 'ltd.', 'industrial area', 'road', 'street', 'pin', 'pin code', 'delhi', 'mumbai', 'bengaluru', 'chennai', 'hyderabad', 'pune', 'gujarat', 'maharashtra', 'karnataka', 'haryana', 'noida']
  },
  {
    id: 'commodity_name',
    fieldNumber: 2,
    fieldName: 'Common / Generic Name of Commodity',
    fieldHindiName: 'वस्तु का सामान्य / जेनेरिक नाम',
    legalReference: 'Rule 6(1)(b) of LM(PC) Rules, 2011',
    description: 'Common or generic name of the commodity contained in the package, clear and prominent.',
    iconName: 'Package',
    mandatory: true,
    correctionGuidance: 'Declare the generic/standard product identity (e.g. "Roasted Salted Almonds", "Hand Sanitizer Gel", "Wheat Flour") clearly on the principal display panel.',
    examplePattern: 'Roasted & Salted California Almonds',
    keywords: ['commodity', 'product', 'item', 'contents', 'generic name', 'net contents', 'almonds', 'biscuit', 'cookies', 'shampoo', 'detergent', 'oil', 'tea', 'coffee', 'soap', 'juice', 'flour', 'atta', 'rice', 'pulse', 'spice', 'masala', 'noodles', 'chips', 'snack', 'chocolate', 'drink', 'cream', 'lotion', 'face wash', 'cleaner', 'toothpaste', 'salt', 'sugar', 'sauce', 'ketchup', 'honey', 'ghee', 'butter', 'paneer', 'milk', 'water']
  },
  {
    id: 'net_quantity',
    fieldNumber: 3,
    fieldName: 'Net Quantity (with standard metric unit)',
    fieldHindiName: 'शुद्ध मात्रा (मानक इकाई के साथ)',
    legalReference: 'Rule 6(1)(c) & Rule 12 of LM(PC) Rules, 2011',
    description: 'The correct net quantity declared in standard metric units (g, kg, ml, l, or number/piece count N/U).',
    iconName: 'Scale',
    mandatory: true,
    correctionGuidance: 'Declare net quantity with standard SI metric symbols (g, kg, ml, l, N, U, pcs) with proper spacing. Do not use non-standard non-metric units (lbs, oz, fluid oz, gms).',
    examplePattern: 'Net Weight: 250 g / Net Qty: 500 ml / Net Count: 10 N',
    keywords: ['net qty', 'net weight', 'net wt', 'net quantity', 'net vol', 'net volume', 'qty', 'weight', 'volume', 'net:', 'contents:']
  },
  {
    id: 'mfg_date',
    fieldNumber: 4,
    fieldName: 'Month & Year of Manufacture / Packing / Import',
    fieldHindiName: 'निर्माण / पैकिंग / आयात का माह और वर्ष',
    legalReference: 'Rule 6(1)(d) of LM(PC) Rules, 2011',
    description: 'Month and year in which the commodity is manufactured, packed or imported (e.g., MM/YYYY or Month YYYY).',
    iconName: 'Calendar',
    mandatory: true,
    correctionGuidance: 'Clearly declare month and year of packaging or manufacture in standard format (e.g. "Mfg Date: 08/2026" or "Pkd on: AUG 2026").',
    examplePattern: 'Mfg Date: 08/2026 or Pkd: 15/08/2026 or B.No & Date of Mfg: 08/26',
    keywords: ['mfg date', 'manufacturing date', 'date of mfg', 'date of manufacture', 'pkd on', 'date of packing', 'packed on', 'mfd', 'mfg', 'pkd', 'import date', 'imported on', 'date of import', 'batch & mfg', 'best before', 'use by']
  },
  {
    id: 'mrp',
    fieldNumber: 5,
    fieldName: 'MRP (Maximum Retail Price incl. of all taxes)',
    fieldHindiName: 'अधिकतम खुदरा मूल्य (सभी करों सहित)',
    legalReference: 'Rule 6(1)(e) of LM(PC) Rules, 2011',
    description: 'Maximum Retail Price expressed in Indian Rupees (₹ or Rs.) with mandatory explicit phrase "inclusive of all taxes" / "incl. of all taxes".',
    iconName: 'Tag',
    mandatory: true,
    correctionGuidance: 'The statutory phrase "inclusive of all taxes" or "(incl. of all taxes)" is strictly mandatory next to MRP. Missing this exact tax disclosure is a legal violation under Section 36(1).',
    examplePattern: 'MRP: ₹ 199.00 (Inclusive of all taxes)',
    keywords: ['mrp', 'm.r.p.', 'maximum retail price', 'max retail price', 'retail price', 'price:', 'rs.', 'inr', '₹', 'inclusive of all taxes', 'incl of all taxes', 'incl. of all taxes', 'incl of taxes', 'all taxes included']
  },
  {
    id: 'consumer_care',
    fieldNumber: 6,
    fieldName: 'Consumer Care Contact (Phone / Email / Address)',
    fieldHindiName: 'उपभोक्ता सेवा संपर्क (फोन / ईमेल / पता)',
    legalReference: 'Rule 6(1)(f) of LM(PC) Rules, 2011',
    description: 'Name, address, telephone number and email address of the person or office to contact for consumer complaints.',
    iconName: 'Headphones',
    mandatory: true,
    correctionGuidance: 'Provide a valid customer care telephone number (toll-free or landline) and email address (e.g. "care@brand.com" or "Toll Free: 1800-XXX-XXXX").',
    examplePattern: 'Customer Care: care@sunfoods.in / Toll Free: 1800-123-4567',
    keywords: ['customer care', 'consumer care', 'customer support', 'helpline', 'toll free', 'toll-free', 'care email', 'feedback', 'grievance', 'complaint', 'contact us', 'phone', 'email', 'tel:', 'care@', 'support@', 'feedback@', 'customercare@']
  },
  {
    id: 'unit_sale_price',
    fieldNumber: 7,
    fieldName: 'Unit Sale Price (USP)',
    fieldHindiName: 'इकाई विक्रय मूल्य (यूएसपी)',
    legalReference: 'Rule 6(1)(s) of LM(PC) Rules (2021 Amendment)',
    description: 'Declaration of unit sale price (e.g., ₹/g, ₹/kg, ₹/ml, ₹/l, ₹/piece) for packages containing more than 100g/100ml or multi-piece packs.',
    iconName: 'Percent',
    mandatory: false,
    correctionGuidance: 'Declare the Unit Sale Price rounded off to two decimal places (e.g., "₹ 0.50 / g" or "₹ 45.00 / 100g") to comply with the 2021 amendment.',
    examplePattern: 'Unit Sale Price: ₹ 0.80 per g (or ₹ 80.00 / 100g)',
    keywords: ['unit sale price', 'usp', 'unit price', 'per g', 'per gram', 'per kg', 'per ml', 'per litre', 'per liter', 'per piece', 'per unit', 'per n', '/g', '/kg', '/ml', '/l', '/n', '/piece', '/100g', '/100ml']
  },
  {
    id: 'country_of_origin',
    fieldNumber: 8,
    fieldName: 'Country of Origin',
    fieldHindiName: 'मूल देश (कंट्री ऑफ ओरिजिन)',
    legalReference: 'Rule 6(10) of LM(PC) Rules, 2011',
    description: 'Name of the country where the commodity is manufactured or produced, mandatory on all packaged commodities.',
    iconName: 'Globe',
    mandatory: true,
    correctionGuidance: 'Prominently declare "Country of Origin: India" (or foreign nation if imported).',
    examplePattern: 'Country of Origin: India / Made in India / Product of India',
    keywords: ['country of origin', 'origin', 'made in', 'product of', 'manufactured in', 'india', 'usa', 'china', 'germany', 'vietnam', 'thailand', 'japan', 'uk', 'france', 'italy', 'indonesia', 'malaysia', 'sri lanka', 'bangladesh']
  }
];

// 4 Official Status Categories for SIH26034 Requirement 4
export type FieldStatus = 'valid' | 'review' | 'violation' | 'non_standard';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type OverallStatus = 'PASS' | 'FAIL' | 'REVIEW';

export interface FieldEvaluationResult {
  ruleId: string;
  fieldNumber: number;
  fieldName: string;
  fieldHindiName: string;
  legalReference: string;
  iconName: ComplianceRule['iconName'];
  status: FieldStatus;
  confidence: ConfidenceLevel;
  extractedRawText: string;
  normalizedValue: string;
  foundOnImage: 'Front' | 'Back' | 'Side' | 'Multiple' | 'Not Found';
  correctionGuidance?: string;
  notes: string;
  hasAutoCorrection: boolean;
  rawConfidenceScore: number;
}

// Rule 7 Font Size & Readability Assessment Structure (SIH Requirement 3)
export interface FieldReadabilityItem {
  fieldNumber: number;
  fieldName: string;
  pixelHeight: number;
  relativeProminenceRatio: number; // Ratio compared to reference tallest text
  prominenceStatus: 'prominent' | 'acceptable' | 'concern';
  assessmentNote: string;
}

export interface ReadabilityAssessment {
  overallReadability: 'good' | 'moderate' | 'concern';
  maxHeaderHeightPx: number;
  medianBodyHeightPx: number;
  estimatedReferenceScale: string;
  rule7AssessmentNote: string;
  items: FieldReadabilityItem[];
  disclaimer: string;
}

// Rule 2(h), Rule 8 & Rule 9 Placement of Declarations Assessment Structure
export interface FieldPlacementItem {
  fieldNumber: number;
  fieldName: string;
  expectedPanel: 'Principal Display Panel (Front)' | 'Information Panel (Back/Side)' | 'Any Visible Panel';
  observedPanel: 'Front' | 'Back' | 'Side' | 'Multiple' | 'Not Found';
  placementStatus: 'compliant' | 'acceptable' | 'review';
  ruleReference: string;
  notes: string;
}

export interface PlacementAssessment {
  overallPlacement: 'compliant' | 'acceptable' | 'review';
  principalDisplayPanelDetected: boolean;
  informationPanelDetected: boolean;
  rule8AssessmentNote: string;
  items: FieldPlacementItem[];
}

// Supporting Evidence Attachment Structure (SIH Requirement 6)
export interface SupportingEvidence {
  id: string;
  dataUrl: string;
  fileName: string;
  note: string;
  timestamp: number;
  uploaderRole: 'consumer' | 'enforcement' | 'manufacturer' | 'officer';
  uploaderName?: string;
  category?: 'shelf_placement' | 'price_tag' | 'damaged_packaging' | 'receipt' | 'other';
}

export interface ComplianceReportData {
  id: string;
  timestamp: string;
  productName: string;
  brandName?: string;
  category: string;
  overallStatus: OverallStatus;
  overallScore: number; // 0 to 100
  totalFieldsChecked: number;
  validFieldsCount: number;
  reviewFieldsCount: number;
  violationFieldsCount: number;
  nonStandardFieldsCount: number;
  fieldResults: FieldEvaluationResult[];
  summarySentence: string;
  images: {
    panel: 'Front' | 'Back' | 'Side' | 'Single';
    dataUrl: string;
    fileName: string;
    ocrCharCount: number;
    ocrRawText: string;
  }[];
  mergedRawOcrText: string;
  ocrQuality: 'high' | 'medium' | 'poor';
  ocrExecutionTimeMs: number;
  source: 'consumer' | 'enforcement' | 'manufacturer' | 'officer';
  sourceMetadata?: {
    officerId?: string;
    location?: string;
    actionTaken?: 'No Action' | 'Warning Issued' | 'Samples Seized' | 'Compounding Notice' | 'Under Investigation';
    grievanceId?: string;
    manufacturerBatch?: string;
    certificateNumber?: string;
    inspectorName?: string;
  };
  readability?: ReadabilityAssessment;
  placement?: PlacementAssessment;
  supportingEvidence?: SupportingEvidence[];
}
