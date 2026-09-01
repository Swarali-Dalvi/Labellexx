import { ComplianceReportData } from '../engine/rules';

/**
 * Creates high-fidelity label data URLs using HTML5 Canvas for real OCR execution during testing.
 */
export function generateLabelCanvasDataUrl(params: {
  title: string;
  subtitle?: string;
  mfgAddress?: string;
  netQty?: string;
  mfgDate?: string;
  mrp?: string;
  consumerCare?: string;
  usp?: string;
  countryOfOrigin?: string;
  nutritionTable?: boolean;
  isDense?: boolean;
  isBlurry?: boolean;
  backgroundColor?: string;
}): string {
  const canvas = document.createElement('canvas');
  canvas.width = params.isDense ? 1000 : 800;
  canvas.height = params.isDense ? 1400 : 1000;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = params.backgroundColor || '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border & Header
  ctx.strokeStyle = '#2A303C';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  ctx.fillStyle = '#1E232A';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(params.title, 40, 80);

  if (params.subtitle) {
    ctx.font = 'italic 22px sans-serif';
    ctx.fillStyle = '#525C6E';
    ctx.fillText(params.subtitle, 40, 120);
  }

  let y = 160;
  ctx.fillStyle = '#1E232A';
  ctx.font = params.isDense ? '18px sans-serif' : '22px sans-serif';

  const writeLine = (label: string, value: string, boldLabel = true) => {
    if (boldLabel) {
      ctx.font = params.isDense ? 'bold 18px sans-serif' : 'bold 22px sans-serif';
      ctx.fillText(label, 40, y);
      ctx.font = params.isDense ? '18px sans-serif' : '22px sans-serif';
      ctx.fillText(value, 40 + ctx.measureText(label).width + 10, y);
    } else {
      ctx.fillText(`${label} ${value}`, 40, y);
    }
    y += params.isDense ? 34 : 44;
  };

  if (params.mfgAddress) {
    writeLine('Mfg by:', params.mfgAddress);
  }
  if (params.netQty) {
    writeLine('Net Weight:', params.netQty);
  }
  if (params.mfgDate) {
    writeLine('Mfg Date:', params.mfgDate);
  }
  if (params.mrp) {
    writeLine('MRP:', params.mrp);
  }
  if (params.usp) {
    writeLine('Unit Sale Price:', params.usp);
  }
  if (params.consumerCare) {
    writeLine('Customer Care:', params.consumerCare);
  }
  if (params.countryOfOrigin) {
    writeLine('Country of Origin:', params.countryOfOrigin);
  }

  // Nutrition table and ingredients for dense label
  if (params.nutritionTable || params.isDense) {
    y += 20;
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(40, y, canvas.width - 80, 36);
    ctx.fillStyle = '#1E232A';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('NUTRITIONAL INFORMATION (Approx values per 100g)', 50, y + 25);
    y += 50;

    const rows = [
      ['Energy', '520 kcal', 'Carbohydrates', '55.4 g'],
      ['Protein', '9.2 g', 'Total Sugars', '22.0 g'],
      ['Total Fat', '28.5 g', 'Added Sugars', '18.5 g'],
      ['Saturated Fat', '12.0 g', 'Sodium', '340 mg'],
      ['Trans Fat', '0.0 g', 'Dietary Fibre', '4.2 g']
    ];

    ctx.font = '16px sans-serif';
    for (const r of rows) {
      ctx.fillText(`${r[0]}: ${r[1]}`, 60, y);
      ctx.fillText(`${r[2]}: ${r[3]}`, 420, y);
      y += 26;
    }

    y += 20;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('INGREDIENTS:', 40, y);
    y += 26;
    ctx.font = '15px sans-serif';
    ctx.fillText('Refined Wheat Flour (Maida), Sugar, Edible Vegetable Oil (Palm Oil), Cocoa Solids,', 40, y);
    y += 22;
    ctx.fillText('Milk Solids, Emulsifiers (INS 322, INS 471), Raising Agents [INS 500(ii), INS 503(ii)],', 40, y);
    y += 22;
    ctx.fillText('Iodised Salt, Nature Identical Vanilla Flavouring Substances.', 40, y);
    y += 30;
    ctx.font = '15px sans-serif';
    ctx.fillText('ALLERGEN INFORMATION: Contains Wheat and Milk. May contain traces of Nuts and Soy.', 40, y);
    y += 30;
    ctx.fillText('FSSAI Lic. No. 10019011000543 | Batch No: B24-8809 | Best Before 9 Months from Mfg', 40, y);
  }

  // Simulated Blur for Case 6
  if (params.isBlurry) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.filter = 'blur(6px)';
    tempCtx.drawImage(canvas, 0, 0);
    return tempCanvas.toDataURL('image/jpeg', 0.6);
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}

export interface SampleTestCase {
  id: string;
  caseNumber: number;
  name: string;
  description: string;
  badge: string;
  expectedVerdict: 'PASS' | 'FAIL' | 'REVIEW';
  isMultiImage?: boolean;
  images: {
    panel: 'Front' | 'Back' | 'Side' | 'Single';
    fileName: string;
    dataUrl: string;
  }[];
}

/**
 * Generates the 6 mandatory test cases required by the specification.
 */
export function getMandatoryTestCases(): SampleTestCase[] {
  // Case 1: Single, Clear, High-Resolution Label (Full Pass)
  const case1Url = generateLabelCanvasDataUrl({
    title: 'Himalayan Organic Honey (Pure Raw)',
    subtitle: '100% Natural Forest Apiary Harvest',
    mfgAddress: 'Himalayan Flora Pvt Ltd, Plot 14, Phase II, Solan Ind Area, HP - 173212',
    netQty: '500 g',
    mfgDate: '08/2026',
    mrp: '₹ 380.00 (Inclusive of all taxes)',
    consumerCare: 'care@himalayanflora.in / Toll Free 1800-200-9876',
    usp: '₹ 0.76 per g',
    countryOfOrigin: 'India'
  });

  // Case 2: Dense Multi-Block Label with Small Print & Nutrition Table
  const case2Url = generateLabelCanvasDataUrl({
    title: 'NutriBite Choco-Almond Crunchy Biscuits',
    subtitle: 'Rich Cocoa Baked Delights with California Almond Bits',
    mfgAddress: 'Apex Bakeries India Ltd, Khasra 49/2, Kundli Industrial Estate, Sonipat, Haryana - 131028',
    netQty: '300 g',
    mfgDate: '15/08/2026',
    mrp: '₹ 120.00 (Inclusive of all taxes)',
    consumerCare: 'feedback@nutribite.co.in / 1800-456-1122',
    usp: '₹ 0.40 per g',
    countryOfOrigin: 'India',
    isDense: true,
    nutritionTable: true
  });

  // Case 3: Live Camera Photo Simulation (High contrast standard label)
  const case3Url = generateLabelCanvasDataUrl({
    title: 'SunDew Pure Filtered Groundnut Oil',
    subtitle: 'Cold Pressed Traditional Kachi Ghani Oil',
    mfgAddress: 'SunDew Agri Foods LLP, Survey No 112, Rajkot Highway, Gondal, Gujarat - 360311',
    netQty: '1 l',
    mfgDate: '07/2026',
    mrp: '₹ 220.00 (Inclusive of all taxes)',
    consumerCare: 'helpline@sundewfoods.com / +91-98765-43210',
    usp: '₹ 220.00 per l',
    countryOfOrigin: 'India'
  });

  // Case 4: Front + Back Multi-Image Pair
  // Front Image has Product Name, Net Qty, MRP
  const case4FrontUrl = generateLabelCanvasDataUrl({
    title: 'Royal Heritage Kashmiri Saffron Threads',
    subtitle: 'Grade A1 Mogra Saffron (Kesar)',
    netQty: '5 g',
    mrp: '₹ 999.00 (Inclusive of all taxes)',
    countryOfOrigin: 'India',
    backgroundColor: '#FFFDF5'
  });

  // Back Image has Manufacturer Address, Mfg Date, Customer Care
  const case4BackUrl = generateLabelCanvasDataUrl({
    title: 'Royal Heritage - Mandatory Declarations',
    subtitle: 'Statutory Declaration as per LM(PC) Rules 2011',
    mfgAddress: 'Kashmir Valley Spice Exporters, Pampore Saffron Park, Pulwama, J&K - 192121',
    mfgDate: '08/2026',
    consumerCare: 'customercare@kashmirheritage.in / 1800-889-7700',
    usp: '₹ 199.80 per g',
    countryOfOrigin: 'India',
    backgroundColor: '#FAF8F5'
  });

  // Case 5: Fast Compression & High-Res Scaled Test
  const case5Url = generateLabelCanvasDataUrl({
    title: 'FreshValley Roasted Salted Cashews W240',
    subtitle: 'Vacuum Packed Premium Dry Fruits',
    mfgAddress: 'FreshValley Agro Foods, Industrial Estate, Mangalore, Karnataka - 575001',
    netQty: '250 g',
    mfgDate: '08/2026',
    mrp: '₹ 325.00 (Inclusive of all taxes)',
    consumerCare: 'care@freshvalley.com / 1800-111-222',
    usp: '₹ 1.30 per g',
    countryOfOrigin: 'India'
  });

  // Case 6: Blurry / Defective Non-Compliant Label (Missing 'inclusive of all taxes' & blurry)
  const case6Url = generateLabelCanvasDataUrl({
    title: 'QuickBite Masala Instant Noodles',
    subtitle: 'Spicy Seasoned Noodle Cake',
    mfgAddress: 'Generic Foods Co, Industrial Area',
    netQty: '70 gm', // Non-standard unit 'gm'
    mfgDate: '2026',
    mrp: 'Rs 15.00', // VIOLATION: Missing "(inclusive of all taxes)" phrase!
    consumerCare: 'care@generic.com',
    isBlurry: true
  });

  return [
    {
      id: 'case_1_clear_single',
      caseNumber: 1,
      name: 'Case 1: Clear High-Res Single Label',
      description: 'Single-side clear label with all 8 statutory fields declared in full standard compliance.',
      badge: 'Full PASS (8/8 Valid)',
      expectedVerdict: 'PASS',
      images: [
        {
          panel: 'Single',
          fileName: 'himalayan_honey_label.jpg',
          dataUrl: case1Url
        }
      ]
    },
    {
      id: 'case_2_dense_multiblock',
      caseNumber: 2,
      name: 'Case 2: Dense Multi-Block Label',
      description: 'Multi-block label with dense nutritional table, ingredients, allergen warnings, and statutory data.',
      badge: 'Full Document OCR (PSM 3)',
      expectedVerdict: 'PASS',
      images: [
        {
          panel: 'Single',
          fileName: 'nutribite_biscuit_dense_label.jpg',
          dataUrl: case2Url
        }
      ]
    },
    {
      id: 'case_3_camera_capture',
      caseNumber: 3,
      name: 'Case 3: Live Camera Photo',
      description: 'Simulates live camera capture through the unified pipeline with orientation correction.',
      badge: 'Unified Camera Pipeline',
      expectedVerdict: 'PASS',
      images: [
        {
          panel: 'Single',
          fileName: 'sundew_oil_camera_capture.jpg',
          dataUrl: case3Url
        }
      ]
    },
    {
      id: 'case_4_front_back_pair',
      caseNumber: 4,
      name: 'Case 4: Front + Back Multi-Image Scan',
      description: 'Product with fields split across Front (MRP, Name) and Back (Manufacturer, Care, Date). Merged seamlessly.',
      badge: 'Multi-Image Merging',
      expectedVerdict: 'PASS',
      isMultiImage: true,
      images: [
        {
          panel: 'Front',
          fileName: 'kashmiri_saffron_front.jpg',
          dataUrl: case4FrontUrl
        },
        {
          panel: 'Back',
          fileName: 'kashmiri_saffron_back.jpg',
          dataUrl: case4BackUrl
        }
      ]
    },
    {
      id: 'case_5_fast_compression',
      caseNumber: 5,
      name: 'Case 5: High-Res Speed Benchmark',
      description: 'High-resolution photo compressed client-side to < 2200px / JPEG 80% with fast OCR execution.',
      badge: 'Client Compression Speed',
      expectedVerdict: 'PASS',
      images: [
        {
          panel: 'Single',
          fileName: 'freshvalley_cashews_hi_res.jpg',
          dataUrl: case5Url
        }
      ]
    },
    {
      id: 'case_6_blurry_violation',
      caseNumber: 6,
      name: 'Case 6: Non-Compliant & Blurry Label',
      description: 'Label with missing "incl. of all taxes" tax declaration, non-standard unit, and blurry scan quality.',
      badge: 'Honest Low-Confidence & Violation',
      expectedVerdict: 'FAIL',
      images: [
        {
          panel: 'Single',
          fileName: 'quickbite_blurry_defective.jpg',
          dataUrl: case6Url
        }
      ]
    },
    {
      id: 'case_7_coffee_jar_real',
      caseNumber: 7,
      name: 'Case 7: Soluble Coffee Jar (Retail Verification)',
      description: 'Real-world packaged coffee jar with pre-price tax phrase "MRP ₹ (incl. of all taxes) : 303.00", USP ₹ 3.03/g, Marketed & Mfg by ASL / Tata Consumer, PIN 400076 / 502334.',
      badge: 'Retail Packaging (8/8 PASS)',
      expectedVerdict: 'PASS',
      images: [
        {
          panel: 'Single',
          fileName: 'dmart_coffee_jar_label.jpg',
          dataUrl: generateLabelCanvasDataUrl({
            title: 'SOLUBLE COFFEE POWDER',
            subtitle: 'INGREDIENT: COFFEE BEANS',
            mfgAddress: 'MARKETED BY: AVENUE SUPERMARTS LTD. (ASL), ANJANEYA CHS LIMITED, ORCHARD AVENUE, OPP. HIRANANDANI FOUNDATION SCHOOL, POWAI, MUMBAI - 400076, MAHARASHTRA.',
            netQty: '100 g',
            mfgDate: 'DEC/2025',
            mrp: '₹ 303.00 (Inclusive of all taxes)',
            consumerCare: 'SUGGESTION@DMARTINDIA.COM / PHONE: 022 71230555',
            usp: '₹ 3.03 / g',
            countryOfOrigin: 'India'
          })
        }
      ]
    }
  ];
}

/**
 * Initial historical seed data for the Enforcement central database
 */
export const INITIAL_ENFORCEMENT_RECORDS: ComplianceReportData[] = [
  {
    id: 'LEX-20260828-A1901',
    timestamp: '2026-08-28T14:32:00.000Z',
    productName: 'KwikClean Surface Disinfectant Liquid 500ml',
    brandName: 'KwikClean Hygiene',
    category: 'Household & Cleaning',
    overallStatus: 'FAIL',
    overallScore: 62,
    totalFieldsChecked: 8,
    validFieldsCount: 5,
    reviewFieldsCount: 1,
    violationFieldsCount: 1,
    nonStandardFieldsCount: 1,
    summarySentence: 'Non-compliant label: Non-standard MRP without mandatory statutory tax disclosure "inclusive of all taxes" and missing Country of Origin.',
    ocrQuality: 'high',
    ocrExecutionTimeMs: 1450,
    source: 'consumer',
    sourceMetadata: {
      grievanceId: 'GRV-2026-88341'
    },
    images: [],
    mergedRawOcrText: 'KwikClean Surface Disinfectant\nMfg by: CleanChem Ltd, Okhla, New Delhi - 110020\nNet Vol: 500 ml\nMfg: 06/2026\nMRP: Rs 140.00\nCustomer Support: 1800-999-888',
    fieldResults: [
      {
        ruleId: 'mfg_address',
        fieldNumber: 1,
        fieldName: 'Manufacturer / Packer / Importer Name & Address',
        fieldHindiName: 'निर्माता / पैकर / आयातक का नाम और पता',
        legalReference: 'Rule 6(1)(a)',
        iconName: 'Building2',
        status: 'valid',
        confidence: 'high',
        extractedRawText: 'Mfg by: CleanChem Ltd, Okhla, New Delhi - 110020',
        normalizedValue: 'CleanChem Ltd, Okhla, New Delhi - 110020 (PIN: 110020)',
        foundOnImage: 'Front',
        notes: 'Declared with verified 6-digit postal PIN code.',
        hasAutoCorrection: false,
        rawConfidenceScore: 95
      },
      {
        ruleId: 'mrp',
        fieldNumber: 5,
        fieldName: 'MRP (Maximum Retail Price incl. of all taxes)',
        fieldHindiName: 'अधिकतम खुदरा मूल्य (सभी करों सहित)',
        legalReference: 'Rule 6(1)(e)',
        iconName: 'Tag',
        status: 'non_standard',
        confidence: 'high',
        extractedRawText: 'MRP: Rs 140.00',
        normalizedValue: 'MRP: ₹ 140.00 [Missing Tax Inclusivity Phrase]',
        foundOnImage: 'Front',
        notes: 'Non-Standard MRP: Omission of mandatory "Inclusive of all taxes" phrasing.',
        correctionGuidance: 'Append "(Inclusive of all taxes)" next to MRP.',
        hasAutoCorrection: false,
        rawConfidenceScore: 90
      }
    ]
  },
  {
    id: 'LEX-20260829-B4812',
    timestamp: '2026-08-29T11:15:00.000Z',
    productName: 'Shakti Gold Pure Mustard Oil 1 Litre',
    brandName: 'Shakti Gold Oils',
    category: 'Packaged Food & Beverage',
    overallStatus: 'PASS',
    overallScore: 100,
    totalFieldsChecked: 8,
    validFieldsCount: 8,
    reviewFieldsCount: 0,
    violationFieldsCount: 0,
    nonStandardFieldsCount: 0,
    summarySentence: 'All 8 statutory mandatory declarations comply with the Legal Metrology (Packaged Commodities) Rules, 2011.',
    ocrQuality: 'high',
    ocrExecutionTimeMs: 1210,
    source: 'officer',
    sourceMetadata: {
      officerId: 'LMO-DL-4029',
      location: 'INA Market, New Delhi',
      actionTaken: 'No Action'
    },
    images: [],
    mergedRawOcrText: 'Shakti Gold Pure Mustard Oil\nMfg by: Shakti Oils Ltd, Alwar, Rajasthan - 301001\nNet Volume: 1 l\nMfg Date: 08/2026\nMRP: ₹ 185.00 (Inclusive of all taxes)\nUSP: ₹ 185.00 / l\nCustomer Care: 1800-444-222\nCountry of Origin: India',
    fieldResults: []
  },
  {
    id: 'LEX-20260829-C7721',
    timestamp: '2026-08-29T16:45:00.000Z',
    productName: 'GlamourGlow Vitamin C Face Serum 30ml',
    brandName: 'GlamourGlow Cosmetics',
    category: 'Cosmetics & Personal Care',
    overallStatus: 'FAIL',
    overallScore: 50,
    totalFieldsChecked: 8,
    validFieldsCount: 4,
    reviewFieldsCount: 2,
    violationFieldsCount: 2,
    nonStandardFieldsCount: 0,
    summarySentence: 'Non-compliant label: Missing complete physical manufacturer address and customer care helpline.',
    ocrQuality: 'high',
    ocrExecutionTimeMs: 1390,
    source: 'enforcement',
    sourceMetadata: {
      actionTaken: 'Warning Issued'
    },
    images: [],
    mergedRawOcrText: 'GlamourGlow Vitamin C Face Serum\nImported & Marketed by: GlamourGlow LLC\nNet Vol: 30 ml\nMfg: 05/2026\nMRP: ₹ 699.00 (Inclusive of all taxes)',
    fieldResults: []
  },
  {
    id: 'LEX-20260830-D9104',
    timestamp: '2026-08-30T08:20:00.000Z',
    productName: 'BioFresh Herbal Toothpaste 150g',
    brandName: 'BioFresh Naturals',
    category: 'Cosmetics & Personal Care',
    overallStatus: 'PASS',
    overallScore: 100,
    totalFieldsChecked: 8,
    validFieldsCount: 8,
    reviewFieldsCount: 0,
    violationFieldsCount: 0,
    nonStandardFieldsCount: 0,
    summarySentence: 'Pre-Market Label Certification passed with 100% statutory adherence.',
    ocrQuality: 'high',
    ocrExecutionTimeMs: 1100,
    source: 'manufacturer',
    sourceMetadata: {
      manufacturerBatch: 'LOT-BF-2026-89',
      certificateNumber: 'CERT-LMPC-2026-8901'
    },
    images: [],
    mergedRawOcrText: 'BioFresh Herbal Toothpaste\nMfg by: BioFresh Ayurvedic Labs, Plot 8, Haridwar Ind Area, Uttarakhand - 249401\nNet Wt: 150 g\nMfg Date: 08/2026\nMRP: ₹ 115.00 (Inclusive of all taxes)\nUSP: ₹ 0.77 per g\nCustomer Care: care@biofresh.in\nCountry of Origin: India',
    fieldResults: []
  }
];
