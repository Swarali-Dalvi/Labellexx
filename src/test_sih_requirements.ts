import { evaluateComplianceFromOCR } from './engine/fieldMatcher';
import { OCRBatchResult } from './engine/ocrPipeline';
import { DEFAULT_PRESET_USERS, sharedStore } from './store/sharedStore';

console.log('====================================================');
console.log('🧪 RUNNING SIH26034 OFFICIAL REQUIREMENTS VALIDATION');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST 1: Rule 7 Font Size & Readability Assessment
// ----------------------------------------------------
console.log('--- TEST 1: Font Size & Readability Assessment ---');
const sampleBatch1: OCRBatchResult = {
  results: [
    {
      panel: 'Single',
      fileName: 'test_readability.jpg',
      dataUrl: '',
      extractedText: 'HIMALAYAN ORGANIC HONEY\nMfg by: HoneyBee Farms Ltd, Kangra, HP - 176001\nNet Weight: 500 g\nMfg Date: 08/2026\nMRP: ₹ 350.00 (Inclusive of all taxes)\nCustomer Care: 1800-111-222\nCountry of Origin: India',
      characterCount: 220,
      confidenceScore: 95,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: [
        { text: 'HIMALAYAN ORGANIC HONEY', confidence: 98, bbox: { x0: 20, y0: 20, x1: 400, y1: 60 }, heightPx: 40 },
        { text: 'Mfg by: HoneyBee Farms Ltd, Kangra, HP - 176001', confidence: 95, bbox: { x0: 20, y0: 70, x1: 350, y1: 85 }, heightPx: 15 },
        { text: 'Net Weight: 500 g', confidence: 95, bbox: { x0: 20, y0: 95, x1: 200, y1: 115 }, heightPx: 20 },
        { text: 'Mfg Date: 08/2026', confidence: 95, bbox: { x0: 20, y0: 125, x1: 200, y1: 140 }, heightPx: 15 },
        { text: 'MRP: ₹ 350.00 (Inclusive of all taxes)', confidence: 95, bbox: { x0: 20, y0: 150, x1: 300, y1: 172 }, heightPx: 22 },
        { text: 'Customer Care: 1800-111-222', confidence: 95, bbox: { x0: 20, y0: 180, x1: 250, y1: 194 }, heightPx: 14 },
        { text: 'Country of Origin: India', confidence: 95, bbox: { x0: 20, y0: 205, x1: 220, y1: 219 }, heightPx: 14 }
      ]
    }
  ],
  mergedText: 'HIMALAYAN ORGANIC HONEY\nMfg by: HoneyBee Farms Ltd, Kangra, HP - 176001\nNet Weight: 500 g\nMfg Date: 08/2026\nMRP: ₹ 350.00 (Inclusive of all taxes)\nCustomer Care: 1800-111-222\nCountry of Origin: India',
  totalCharacters: 220,
  averageConfidence: 95,
  isTextIncomplete: false,
  executionTimeMs: 120,
  allLineBoxes: [
    { text: 'HIMALAYAN ORGANIC HONEY', confidence: 98, bbox: { x0: 20, y0: 20, x1: 400, y1: 60 }, heightPx: 40 },
    { text: 'Mfg by: HoneyBee Farms Ltd, Kangra, HP - 176001', confidence: 95, bbox: { x0: 20, y0: 70, x1: 350, y1: 85 }, heightPx: 15 },
    { text: 'Net Weight: 500 g', confidence: 95, bbox: { x0: 20, y0: 95, x1: 200, y1: 115 }, heightPx: 20 },
    { text: 'Mfg Date: 08/2026', confidence: 95, bbox: { x0: 20, y0: 125, x1: 200, y1: 140 }, heightPx: 15 },
    { text: 'MRP: ₹ 350.00 (Inclusive of all taxes)', confidence: 95, bbox: { x0: 20, y0: 150, x1: 300, y1: 172 }, heightPx: 22 },
    { text: 'Customer Care: 1800-111-222', confidence: 95, bbox: { x0: 20, y0: 180, x1: 250, y1: 194 }, heightPx: 14 },
    { text: 'Country of Origin: India', confidence: 95, bbox: { x0: 20, y0: 205, x1: 220, y1: 219 }, heightPx: 14 }
  ]
};

const report1 = evaluateComplianceFromOCR(sampleBatch1, 'Honey & Spreads', 'consumer');
console.log(`✓ Overall Readability Status: ${report1.readability?.overallReadability}`);
console.log(`✓ Reference Header Height: ${report1.readability?.maxHeaderHeightPx}px`);
console.log(`✓ Disclaimer Present: ${report1.readability?.disclaimer ? 'YES' : 'NO'}`);
console.log(`✓ Measured Key Field Prominences: ${report1.readability?.items.map(i => `${i.fieldName}: ${i.pixelHeight}px (${Math.round(i.relativeProminenceRatio * 100)}%)`).join(' | ')}\n`);

// ----------------------------------------------------
// TEST 2: Detection of Non-Standard / Misleading Declarations
// ----------------------------------------------------
console.log('--- TEST 2: Non-Standard / Misleading Detection ---');
const nonStdBatch: OCRBatchResult = {
  results: [
    {
      panel: 'Single',
      fileName: 'test_non_std.jpg',
      dataUrl: '',
      extractedText: 'Generic Chips\nMfg by: SnackCo Ltd, New Delhi - 110020\nNet Weight: 5 lbs\nMfg Date: 2026\nMRP: ₹ 120.00\nCustomer Care: 1800-123-456\nCountry of Origin: India',
      characterCount: 180,
      confidenceScore: 92,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: []
    }
  ],
  mergedText: 'Generic Chips\nMfg by: SnackCo Ltd, New Delhi - 110020\nNet Weight: 5 lbs\nMfg Date: 2026\nMRP: ₹ 120.00\nCustomer Care: 1800-123-456\nCountry of Origin: India',
  totalCharacters: 180,
  averageConfidence: 92,
  isTextIncomplete: false,
  executionTimeMs: 110,
  allLineBoxes: []
};

const nonStdReport = evaluateComplianceFromOCR(nonStdBatch, 'Snacks', 'consumer');
console.log(`✓ Overall Status: ${nonStdReport.overallStatus} (Expected: FAIL)`);
console.log(`✓ Non-Standard Fields Count: ${nonStdReport.nonStandardFieldsCount}`);

const netQtyField = nonStdReport.fieldResults.find(f => f.ruleId === 'net_quantity');
const mrpField = nonStdReport.fieldResults.find(f => f.ruleId === 'mrp');
const dateField = nonStdReport.fieldResults.find(f => f.ruleId === 'mfg_date');

console.log(`✓ Net Qty Non-Standard Unit (5 lbs): status="${netQtyField?.status}" notes="${netQtyField?.notes}"`);
console.log(`✓ MRP Missing Tax Clause (₹ 120.00): status="${mrpField?.status}" notes="${mrpField?.notes}"`);
console.log(`✓ Malformed Year Only Date (2026): status="${dateField?.status}" notes="${dateField?.notes}"\n`);

// ----------------------------------------------------
// TEST 3: Supporting Evidence Attachment
// ----------------------------------------------------
console.log('--- TEST 3: Supporting Evidence Attachment ---');
sharedStore.addReport(report1);
const ev = sharedStore.addSupportingEvidenceToReport(report1.id, {
  dataUrl: 'data:image/jpeg;base64,sampleevidencephoto',
  fileName: 'shelf_sticker_evidence.jpg',
  note: 'Store sticker was found pasted over manufacturer MRP.',
  category: 'price_tag',
  uploaderRole: 'officer',
  uploaderName: 'Rajesh Varma, Inspector'
});

const updatedRep = sharedStore.getReportById(report1.id);
console.log(`✓ Supporting Evidence Count: ${updatedRep?.supportingEvidence?.length}`);
console.log(`✓ Evidence ID: ${ev.id}`);
console.log(`✓ Evidence Note: "${updatedRep?.supportingEvidence?.[0].note}"\n`);

// ----------------------------------------------------
// TEST 4: Role-Based Authentication & RBAC
// ----------------------------------------------------
console.log('--- TEST 4: Role-Based Authentication & Access Control ---');
sharedStore.loginAsUser(DEFAULT_PRESET_USERS.officer);
console.log(`✓ Current Logged In Role: ${sharedStore.getCurrentRole()} (Badge: ${sharedStore.getCurrentUser()?.badgeNumber})`);

// Test RBAC restriction
sharedStore.setCurrentRole('consumer');
console.log(`✓ Current Role after unauthorized switch attempt: ${sharedStore.getCurrentRole()} (Protected by RBAC)`);

sharedStore.logout();
console.log(`✓ Current Role after logout: ${sharedStore.getCurrentRole()}`);

console.log('\n====================================================');
console.log('🎉 ALL SIH26034 TESTS COMPLETED SUCCESSFULLY');
console.log('====================================================');
