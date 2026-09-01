import { evaluateComplianceFromOCR } from './engine/fieldMatcher';
import { OCRBatchResult } from './engine/ocrPipeline';

console.log('================================================================');
console.log('🧪 TESTING BRITANNIA ENGLISH TEA CAKE TEST CASE');
console.log('================================================================\n');

const teaCakeBatch: OCRBatchResult = {
  results: [
    {
      panel: 'Front',
      fileName: 'tea_cake_front.jpg',
      dataUrl: '',
      extractedText: 'BRITANNIA\nEnglish Tea Cake\nSoft & Delicious\nNet Weight: 250 g',
      characterCount: 65,
      confidenceScore: 92,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: [
        { text: 'BRITANNIA English Tea Cake', confidence: 95, bbox: { x0: 20, y0: 20, x1: 300, y1: 60 }, heightPx: 35 },
        { text: 'Net Weight: 250 g', confidence: 95, bbox: { x0: 20, y0: 80, x1: 200, y1: 100 }, heightPx: 20 }
      ]
    },
    {
      panel: 'Back',
      fileName: 'tea_cake_back.jpg',
      dataUrl: '',
      extractedText: `PROPRIETARY FOOD, CAKE - 7.2.1
INGREDIENTS: REFINED WHEAT FLOUR (MAIDA), EGG, SUGAR, REFINED VEGETABLE FAT, BUTTER (4.9%), LIQUID GLUCOSE, MILK SOLIDS, CAKE GEL, IODISED SALT, RAISING AGENTS.
CONTAINS WHEAT, EGG AND MILK.

--- REGIONAL DECLARATIONS & STAMPED BOX ---
NET WEIGHT: 250g
Serving Size: Approx. 20g
MRP ₹ 140.00
(INCL. OF ALL TAXES)
UNIT SALE PRICE: ₹ 0.56 / g
PKD: 15/07/26
USE BY: 14/11/26
LOT NO. 1572655
MACHINE CODE 28A

NUTRITION INFORMATION (Per 100g approx):
Energy 422 kcal | Protein 6.4g | Carbohydrate 54.1g | Total Fat 20g | Sodium 232mg

STORE IN A COOL, HYGIENIC AND DRY PLACE.

MARKETED BY: BRITANNIA INDUSTRIES LTD., 5/1A, HUNGERFORD STREET, KOLKATA, WEST BENGAL - 700017.
FOR FEEDBACK / QUERIES CONTACT: EXECUTIVE, CONSUMER CARE CELL, BRITANNIA INDUSTRIES LTD, PRESTIGE SHANTHINIKETAN, TOWER C, WHITEFIELD, BANGALORE - 560043, KARNATAKA. PHONE: 1800-425-4449 / 1800-3000-4530. EMAIL: FEEDBACK@BRITANNIA.CO.IN`,
      characterCount: 880,
      confidenceScore: 94,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: [
        { text: 'PROPRIETARY FOOD, CAKE - 7.2.1', confidence: 98, bbox: { x0: 20, y0: 20, x1: 300, y1: 45 }, heightPx: 25 },
        { text: 'NET WEIGHT: 250g', confidence: 95, bbox: { x0: 20, y0: 60, x1: 180, y1: 80 }, heightPx: 20 },
        { text: 'MRP ₹ 140.00', confidence: 95, bbox: { x0: 20, y0: 90, x1: 160, y1: 110 }, heightPx: 20 },
        { text: 'UNIT SALE PRICE: ₹ 0.56 / g', confidence: 95, bbox: { x0: 20, y0: 120, x1: 220, y1: 140 }, heightPx: 18 },
        { text: 'PKD: 15/07/26', confidence: 95, bbox: { x0: 20, y0: 150, x1: 150, y1: 170 }, heightPx: 18 }
      ]
    }
  ],
  mergedText: `--- FRONT PANEL ---
BRITANNIA
English Tea Cake
Soft & Delicious
Net Weight: 250 g

--- BACK PANEL ---
PROPRIETARY FOOD, CAKE - 7.2.1
INGREDIENTS: REFINED WHEAT FLOUR (MAIDA), EGG, SUGAR, REFINED VEGETABLE FAT, BUTTER (4.9%), LIQUID GLUCOSE, MILK SOLIDS, CAKE GEL, IODISED SALT, RAISING AGENTS.
CONTAINS WHEAT, EGG AND MILK.

--- REGIONAL DECLARATIONS & STAMPED BOX ---
NET WEIGHT: 250g
Serving Size: Approx. 20g
MRP ₹ 140.00
(INCL. OF ALL TAXES)
UNIT SALE PRICE: ₹ 0.56 / g
PKD: 15/07/26
USE BY: 14/11/26
LOT NO. 1572655
MACHINE CODE 28A

NUTRITION INFORMATION (Per 100g approx):
Energy 422 kcal | Protein 6.4g | Carbohydrate 54.1g | Total Fat 20g | Sodium 232mg

STORE IN A COOL, HYGIENIC AND DRY PLACE.

MARKETED BY: BRITANNIA INDUSTRIES LTD., 5/1A, HUNGERFORD STREET, KOLKATA, WEST BENGAL - 700017.
FOR FEEDBACK / QUERIES CONTACT: EXECUTIVE, CONSUMER CARE CELL, BRITANNIA INDUSTRIES LTD, PRESTIGE SHANTHINIKETAN, TOWER C, WHITEFIELD, BANGALORE - 560043, KARNATAKA. PHONE: 1800-425-4449 / 1800-3000-4530. EMAIL: FEEDBACK@BRITANNIA.CO.IN`,
  totalCharacters: 945,
  averageConfidence: 93,
  isTextIncomplete: false,
  executionTimeMs: 160,
  allLineBoxes: []
};

const report = evaluateComplianceFromOCR(teaCakeBatch, 'Cakes & Bakery', 'consumer');

console.log(`Product Name: "${report.productName}"`);
console.log(`Brand Name: "${report.brandName}"`);
console.log(`Overall Status: ${report.overallStatus} (Score: ${report.overallScore}/100)\n`);

console.log('Field-by-Field Grounded Audit:');
for (const f of report.fieldResults) {
  console.log(`[${f.status.toUpperCase()}] ${f.fieldNumber}. ${f.fieldName}`);
  console.log(`  Extracted Raw: "${f.extractedRawText}"`);
  console.log(`  Normalized Value: "${f.normalizedValue}"`);
  console.log(`  Notes: "${f.notes}"`);
  console.log(`  Panel: ${f.foundOnImage}`);
  console.log('');
}
