import { evaluateComplianceFromOCR } from './src/engine/fieldMatcher';
import { OCRBatchResult } from './src/engine/ocrPipeline';

const realOcrText = `SOLUBLE COFFEE POWDER
INGREDIENT: COFFEE BEANS

MARKETED BY: AVENUE SUPERMARTS LTD, (ASL)
ANJANEYA CHS LIMITED, ORCHARD AVENUE
OPP. HIRANANDANI FOUNDATION SCHOOL
POWAI, MUMBAI - 400076, MAHARASHTRA,

fssai
Lic. No. 10018022008191
MANUFACTURED BY:
TATA CONSUMER PRODUCTS LTD.,
BRAHMAN PALLY VILLAGE, TOOPRAN MANDAL,
TUPRAN, MEDAK, TELANGANA- 502334.
Lic. No.10014047000064
FOR FEEDBACK / SUGGESTIONS,
PLEASE CONTACT CONSUMER CARE
EXECUTIVE AT 'MARKETED BY' ADDRESS,
EMAIL: SUGGESTION@DMARTINDIA.COM,
PHONE: 022 71230555.

NET QUANTITY  : 100 g
MRP Z (incl. of all taxes) : 303.00

UNIT SALE PRICE Z : 3.03/g
BATCH NO. : LC25MA339R

DATE OF PACKAGING : DEC/2025
USE BY : MAY/2027`;

const batch: OCRBatchResult = {
  results: [{
    panel: 'Single',
    fileName: 'coffee_jar.jpg',
    dataUrl: '',
    extractedText: realOcrText,
    characterCount: realOcrText.length,
    confidenceScore: 94,
    retriedWithEnhancement: false,
    rawBlocks: []
  }],
  mergedText: realOcrText,
  totalCharacters: realOcrText.length,
  averageConfidence: 94,
  isTextIncomplete: false,
  executionTimeMs: 150
};

const report = evaluateComplianceFromOCR(batch, 'Packaged Food & Beverage', 'consumer');

console.log('=== REAL COFFEE JAR LABEL EVALUATION ===');
console.log('Overall Status:', report.overallStatus);
console.log('Overall Score:', report.overallScore);
console.log(`Valid: ${report.validFieldsCount} | Review: ${report.reviewFieldsCount} | Violation: ${report.violationFieldsCount}`);
console.log('');
report.fieldResults.forEach(f => {
  console.log(`Field ${f.fieldNumber} [${f.fieldName}]:`);
  console.log(`  Status: ${f.status} (${f.confidence} confidence)`);
  console.log(`  Normalized: "${f.normalizedValue}"`);
  console.log(`  Raw: "${f.extractedRawText}"`);
  console.log(`  Notes: "${f.notes}"`);
  console.log('');
});
