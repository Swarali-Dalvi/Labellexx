import { evaluateComplianceFromOCR } from './engine/fieldMatcher';
import { OCRBatchResult } from './engine/ocrPipeline';

const testDateFormats = [
  'August 2026',
  'Aug 2026',
  'Aug-2026',
  '08/2026',
  '08-2026',
  '08 2026',
  '15/07/26',
  '15/07/2026',
  'DEC/2025',
  'AUG 2026'
];

console.log('================================================================');
console.log('🧪 TESTING ALL MANDATORY DATE FORMATS UNDER RULE 6(1)(d)');
console.log('================================================================\n');

let allPassed = true;

for (const fmt of testDateFormats) {
  const batch: OCRBatchResult = {
    results: [
      {
        panel: 'Single',
        fileName: 'test.jpg',
        dataUrl: '',
        extractedText: `NET QUANTITY 100 g\nMRP ₹ 100.00 (INCL. OF ALL TAXES)\nPKD: ${fmt}\nMARKETED BY: TEST LTD, MUMBAI - 400001`,
        characterCount: 120,
        confidenceScore: 95,
        retriedWithEnhancement: false,
        rawBlocks: [],
        lineBoxes: []
      }
    ],
    mergedText: `NET QUANTITY 100 g\nMRP ₹ 100.00 (INCL. OF ALL TAXES)\nPKD: ${fmt}\nMARKETED BY: TEST LTD, MUMBAI - 400001`,
    totalCharacters: 120,
    averageConfidence: 95,
    isTextIncomplete: false,
    executionTimeMs: 50,
    allLineBoxes: []
  };

  const report = evaluateComplianceFromOCR(batch, 'Packaged Food', 'consumer');
  const dateField = report.fieldResults.find(f => f.ruleId === 'mfg_date')!;

  const passed = dateField.status === 'valid' && (dateField.normalizedValue.includes(fmt) || dateField.normalizedValue.includes('2026') || dateField.normalizedValue.includes('2025'));

  console.log(`Format [${fmt}]: ${passed ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`  Status: ${dateField.status} | Value: "${dateField.normalizedValue}" | Raw: "${dateField.extractedRawText}"`);

  if (!passed) allPassed = false;
}

console.log('\n================================================================');
if (allPassed) {
  console.log('🎉 ALL 10 DATE FORMATS TESTED AND PASSED SUCCESSFULLY!');
} else {
  console.log('❌ SOME DATE FORMATS FAILED');
}
console.log('================================================================');
