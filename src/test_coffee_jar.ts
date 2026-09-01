import { evaluateComplianceFromOCR } from './engine/fieldMatcher';
import { OCRBatchResult } from './engine/ocrPipeline';

console.log('================================================================');
console.log('🧪 TESTING LE CAFÉ / D-MART SOLUBLE COFFEE JAR (NOISY OCR TEST)');
console.log('================================================================\n');

const noisyCoffeeJarBatch: OCRBatchResult = {
  results: [
    {
      panel: 'Single',
      fileName: 'coffee_jar_label.jpg',
      dataUrl: '',
      extractedText: `SOLUBLE COFFEE rouil)
INGREDIENT: COFFEE BEANS

MARKETED BY: AVENUE SUPERMARTS LTD, Ag, AJANEYA CHS LIMITED, ORCHARD AVEN, opp HIRANANDANI FOUNDATION SCHOG, AOA, MUMBAI - 400076, MAHARASHTRA., ssat
Lic. No. 10018022008191

MANUFACTURED BY: TATA CONSUMER PRODUCTS LTD.,, BRAHMAN PALLY VILLAGE, TOOPRAN MANDAE, TUPRAN, MEDAK, TELANGANA - 502334., Lic. No. 10014047000064

FOR FEEDBACK / SUGGESTIONS, PLEASE CONTACT CONSUMER CARE EXECUTIVE AT 'MARKETED BY' ADDRESS, EMAIL: SUGGESTION@DMARTINDIA.COM, PHONE: 022 71230555. L)

NET QUANTITY 100 g
MRP ₹ 303.00 (incl. of all taxes)
UNIT SALE PRICE ₹ 3.03 / g
BATCH NO. : LC25MA339R
DATE OF PACKAGING: DEC/2025
USE BY: MAY/2027`,
      characterCount: 720,
      confidenceScore: 95,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: []
    }
  ],
  mergedText: `SOLUBLE COFFEE rouil)
INGREDIENT: COFFEE BEANS

MARKETED BY: AVENUE SUPERMARTS LTD, Ag, AJANEYA CHS LIMITED, ORCHARD AVEN, opp HIRANANDANI FOUNDATION SCHOG, AOA, MUMBAI - 400076, MAHARASHTRA., ssat
Lic. No. 10018022008191

MANUFACTURED BY: TATA CONSUMER PRODUCTS LTD.,, BRAHMAN PALLY VILLAGE, TOOPRAN MANDAE, TUPRAN, MEDAK, TELANGANA - 502334., Lic. No. 10014047000064

FOR FEEDBACK / SUGGESTIONS, PLEASE CONTACT CONSUMER CARE EXECUTIVE AT 'MARKETED BY' ADDRESS, EMAIL: SUGGESTION@DMARTINDIA.COM, PHONE: 022 71230555. L)

NET QUANTITY 100 g
MRP ₹ 303.00 (incl. of all taxes)
UNIT SALE PRICE ₹ 3.03 / g
BATCH NO. : LC25MA339R
DATE OF PACKAGING: DEC/2025
USE BY: MAY/2027`,
  totalCharacters: 720,
  averageConfidence: 95,
  isTextIncomplete: false,
  executionTimeMs: 130,
  allLineBoxes: []
};

const report = evaluateComplianceFromOCR(noisyCoffeeJarBatch, 'Coffee & Tea', 'consumer');

console.log(`Product Name: "${report.productName}"`);
console.log(`Brand Name: "${report.brandName}"`);
console.log(`Overall Status: ${report.overallStatus} (Score: ${report.overallScore}/100)\n`);

console.log('Field-by-Field Grounded Audit:');
for (const f of report.fieldResults) {
  console.log(`[${f.status.toUpperCase()}] ${f.fieldNumber}. ${f.fieldName}`);
  console.log(`  Extracted Raw: "${f.extractedRawText}"`);
  console.log(`  Normalized Value: "${f.normalizedValue}"`);
  console.log(`  Notes: "${f.notes}"`);
  console.log('');
}
