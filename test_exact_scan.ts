import { evaluateComplianceFromOCR } from './src/engine/fieldMatcher';
import { OCRBatchResult } from './src/engine/ocrPipeline';

// Let's test the EXACT text that was extracted in the user's latest scan:
const realScanText = `SOLUBLE COFFEE POWDER
INGREDIENT: COFFEE BEANS

MARKETED BY: AVENUE SUPERMARTS LTD. (ASL),
ANJANEYA CHS LIMITED, ORCHARD AVENUE,
OPP. HIRANANDANI FOUNDATION SCHOOL,
POWAI, MUMBAI - 400076, MAHARASHTRA.

fssai
Lic. No. 10018022008191

MANUFACTURED BY:
TATA CONSUMER PRODUCTS LTD.,
BRAHMAN PALLY VILLAGE, TOOPRAN MANDAL,
TUPRAN, MEDAK, TELANGANA- 502334.
Lic. No. 10014047000064

FOR FEEDBACK / SUGGESTIONS,
PLEASE CONTACT CONSUMER CARE
EXECUTIVE AT 'MARKETED BY' ADDRESS,
EMAIL: SUGGESTION@DMARTINDIA.COM,
PHONE: 022 71230555.

NET QUANTITY : 100g

MRP ₹ (incl. of all taxes)
: 303.00

UNIT SALE PRICE ₹ : 3.03/g
BATCH NO. : LC25MA339R
DATE OF PACKAGING + DEC/2025
USE BY : MAY/2027`;

const batch: OCRBatchResult = {
  results: [{
    panel: 'Front',
    fileName: 'coffee_label.jpg',
    dataUrl: '',
    extractedText: realScanText,
    characterCount: realScanText.length,
    confidenceScore: 95,
    retriedWithEnhancement: false,
    rawBlocks: []
  }],
  mergedText: realScanText,
  totalCharacters: realScanText.length,
  averageConfidence: 95,
  isTextIncomplete: false,
  executionTimeMs: 120
};

const report = evaluateComplianceFromOCR(batch, 'Packaged Food & Beverage', 'consumer');

console.log('Overall Status:', report.overallStatus);
console.log('Score:', report.overallScore);
console.log(`Valid: ${report.validFieldsCount} | Review: ${report.reviewFieldsCount} | Violation: ${report.violationFieldsCount}`);
console.log('');
report.fieldResults.forEach(f => {
  console.log(`Field ${f.fieldNumber} [${f.fieldName}]:`);
  console.log(`  Status: ${f.status} (${f.confidence})`);
  console.log(`  Normalized: "${f.normalizedValue}"`);
  console.log(`  Raw: "${f.extractedRawText}"`);
  console.log(`  Notes: "${f.notes}"`);
  console.log('');
});
