import { evaluateComplianceFromOCR } from './src/engine/fieldMatcher';
import { OCRBatchResult } from './src/engine/ocrPipeline';

const backPanelText = `PROPRIETARY FOOD, CAKE - 7.2.1
INGREDIENTS: REFINED WHEAT FLOUR (MAIDA), EGG, SUGAR, REFINED VEGETABLE FAT, BUTTER (4.9%).

CONTAINS WHEAT, EGG AND MILK.

NET WEIGHT: 250 g

MRP ₹ (INCL., OF ALL TAXES) : 140.00
PKD: ₹ 0.56/g 15/07/26
USE BY: 14/11/26
LOT NO.: 1572655

NUTRITION INFORMATION
Serving Size: Approx. 20g
Energy: 422 kcal
Total Fat: 20 g
Saturated Fatty Acids: 10.6 g
Trans Fatty Acids: 0 g
Cholesterol: 105.5 mg
Sodium: 253.2 mg

STORE IN A COOL, HYGIENIC AND DRY PLACE.
© BRITANNIA INDUSTRIES LTD.

For Feedback-Contact: Executive, Consumer Care Cell
(Toll-Free) 1-800-4254449 / 1-800-30004530
@Britannia Industries Ltd., Prestige Shanthiniketan, Tower C, Whitefield, Bangalore-560048, Karnataka.
Email: feedback@britindia.com

Lic. No. 10015043001129`;

const sidePanelText = `Marketed By: BRITANNIA INDUSTRIES LTD., 5/1A HUNGERFORD STREET, KOLKATA, WEST BENGAL - 700 017 (A WADIA Enterprise)
For Mfg. unit address and Lic. No., read the last two characters of the "LOT No." and see the address panel.
47 - EASTERN BAKERIES PVT. LTD., VILLAGE CHEOWRA, PO. SARISHA, P.S. DIAMOND HARBOUR, 24 PARGANAS (SOUTH) - 743368, WEST BENGAL Lic. No. 10012031000215
55 - DELTA FOODS PVT. LTD., B-10 BULANDSHAHR ROAD INDUSTRIAL AREA, GHAZIABAD - 201009, UTTAR PRADESH Lic. No. 10012051000067
M8 - DREAM BAKE PVT. LTD., PLOT NO. F1 & F2, KANDUAH FOOD PARK, WBIDC PHASE-II, PO. SANKRAIL, DIST. HOWRAH - 711302, WEST BENGAL Lic. No. 10012031000037
S2 - KMS CONFECTIONERIES PVT. LTD., 4/4B, 5/1B, 5/2A2, 10/1B, 10/2B THIRUVALAVAYANALLUR VILLAGE, NAGARI TO SOLAVANDHAN ROAD, VADIPATTI TALUK, MADURAI - 625221, TAMIL NADU Lic. No. 10018042004282`;

const mergedText = `${backPanelText}\n\n${sidePanelText}`;

const batch: OCRBatchResult = {
  results: [{
    panel: 'Multiple',
    fileName: 'britannia.jpg',
    dataUrl: '',
    extractedText: mergedText,
    characterCount: mergedText.length,
    confidenceScore: 95,
    retriedWithEnhancement: false,
    rawBlocks: []
  }],
  mergedText: mergedText,
  totalCharacters: mergedText.length,
  averageConfidence: 95,
  isTextIncomplete: false,
  executionTimeMs: 120
};

const report = evaluateComplianceFromOCR(batch, 'Packaged Food & Beverage', 'consumer');

console.log('=== BRITANNIA CAKE EVALUATION ===');
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
