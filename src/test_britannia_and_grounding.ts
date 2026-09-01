import { evaluateComplianceFromOCR } from './engine/fieldMatcher';
import { OCRBatchResult } from './engine/ocrPipeline';

console.log('================================================================');
console.log('🧪 TESTING STRICT GROUNDING & BRITANNIA BOURBON 500G CASE');
console.log('================================================================\n');

// -------------------------------------------------------------------------
// TEST CASE 1: Real Britannia Bourbon 500g Family Pack (Front + Back panels)
// -------------------------------------------------------------------------
console.log('--- TEST CASE 1: Britannia Bourbon 500g Family Pack ---');
const britanniaBatch: OCRBatchResult = {
  results: [
    {
      panel: 'Front',
      fileName: 'bourbon_front.jpg',
      dataUrl: '',
      extractedText: 'BRITANNIA\nBOURBON\nCHOCOLATE CREME BISCUITS\nNET WEIGHT: 500 g (5 U x 100 g)\nMRP ₹ 150.00 (INCL. OF ALL TAXES)\nUSP: ₹ 0.30 / g',
      characterCount: 140,
      confidenceScore: 95,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: [
        { text: 'BRITANNIA BOURBON', confidence: 98, bbox: { x0: 20, y0: 20, x1: 300, y1: 60 }, heightPx: 40 },
        { text: 'CHOCOLATE CREME BISCUITS', confidence: 95, bbox: { x0: 20, y0: 70, x1: 280, y1: 95 }, heightPx: 25 },
        { text: 'NET WEIGHT: 500 g (5 U x 100 g)', confidence: 95, bbox: { x0: 20, y0: 105, x1: 250, y1: 125 }, heightPx: 20 },
        { text: 'MRP ₹ 150.00 (INCL. OF ALL TAXES)', confidence: 95, bbox: { x0: 20, y0: 135, x1: 290, y1: 155 }, heightPx: 20 },
        { text: 'USP: ₹ 0.30 / g', confidence: 95, bbox: { x0: 20, y0: 165, x1: 180, y1: 180 }, heightPx: 15 }
      ]
    },
    {
      panel: 'Back',
      fileName: 'bourbon_back.jpg',
      dataUrl: '',
      extractedText: 'PROPRIETARY FOOD, BISCUITS\nINGREDIENTS: REFINED WHEAT FLOUR (MAIDA), SUGAR, REFINED PALM OIL, COCOA SOLIDS (2.3%), RAISING AGENTS, EMULSIFIER (322, 471), IODISED SALT.\n\nMANUFACTURED BY: BRITANNIA INDUSTRIES LTD., 5/1A, HUNGERFORD STREET, KOLKATA, WEST BENGAL - 700017.\nAT: PLOT NO. 10/18, INDUSTRIAL ESTATE, JHARSUGUDA, ODISHA - 768204.\n\nFOR FEEDBACK / QUERIES CONTACT: EXECUTIVE, CONSUMER CARE CELL, BRITANNIA INDUSTRIES LTD, PRESTIGE SHANTHINIKETAN, TOWER C, WHITEFIELD, BANGALORE - 560043, KARNATAKA. PHONE: 1800-425-4449. EMAIL: FEEDBACK@BRITANNIA.CO.IN\n\nPKD: 08/2026\nUSE BY: 02/2027\nBATCH: BRB2026X',
      characterCount: 650,
      confidenceScore: 94,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: [
        { text: 'MANUFACTURED BY: BRITANNIA INDUSTRIES LTD.', confidence: 95, bbox: { x0: 20, y0: 50, x1: 300, y1: 65 }, heightPx: 15 },
        { text: '5/1A, HUNGERFORD STREET, KOLKATA, WEST BENGAL - 700017', confidence: 95, bbox: { x0: 20, y0: 70, x1: 350, y1: 85 }, heightPx: 15 },
        { text: 'PKD: 08/2026', confidence: 95, bbox: { x0: 20, y0: 150, x1: 120, y1: 165 }, heightPx: 15 }
      ]
    }
  ],
  mergedText: 'BRITANNIA\nBOURBON\nCHOCOLATE CREME BISCUITS\nNET WEIGHT: 500 g (5 U x 100 g)\nMRP ₹ 150.00 (INCL. OF ALL TAXES)\nUSP: ₹ 0.30 / g\n\nPROPRIETARY FOOD, BISCUITS\nINGREDIENTS: REFINED WHEAT FLOUR (MAIDA), SUGAR, REFINED PALM OIL, COCOA SOLIDS (2.3%), RAISING AGENTS, EMULSIFIER (322, 471), IODISED SALT.\n\nMANUFACTURED BY: BRITANNIA INDUSTRIES LTD., 5/1A, HUNGERFORD STREET, KOLKATA, WEST BENGAL - 700017.\nAT: PLOT NO. 10/18, INDUSTRIAL ESTATE, JHARSUGUDA, ODISHA - 768204.\n\nFOR FEEDBACK / QUERIES CONTACT: EXECUTIVE, CONSUMER CARE CELL, BRITANNIA INDUSTRIES LTD, PRESTIGE SHANTHINIKETAN, TOWER C, WHITEFIELD, BANGALORE - 560043, KARNATAKA. PHONE: 1800-425-4449. EMAIL: FEEDBACK@BRITANNIA.CO.IN\n\nPKD: 08/2026\nUSE BY: 02/2027\nBATCH: BRB2026X',
  totalCharacters: 790,
  averageConfidence: 94.5,
  isTextIncomplete: false,
  executionTimeMs: 140,
  allLineBoxes: []
};

const report = evaluateComplianceFromOCR(britanniaBatch, 'Biscuits & Cookies', 'consumer');

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

// -------------------------------------------------------------------------
// TEST CASE 2: Britannia Cake Back Panel where values are unprinted
// -------------------------------------------------------------------------
console.log('--- TEST CASE 2: Britannia Panel with Unprinted Values & Nutrition Table ---');
const unprintedBatch: OCRBatchResult = {
  results: [
    {
      panel: 'Back',
      fileName: 'unprinted_cake_back.jpg',
      dataUrl: '',
      extractedText: 'PROPRIETARY FOOD, CAKE - 7.2.1\nINGREDIENTS: REFINED WHEAT FLOUR, EGG, SUGAR, VEGETABLE FAT, BUTTER (4.9%).\nNET WEIGHT:\nALL TAXES)\nPKD:\nUSE BY:\nLOT NO:\nPer 100g product approx:\nEnergy 422 kcal\nProtein 6.4g\nCarbohydrate 54.1g\nTotal Fat 20g\nSodium 232mg\n© BRITANNIA INDUSTRIES LTD.\nFor Feedback-Contact: Executive, Consumer Care Cell @ Britannia Industries Ltd, Prestige Shanthiniketan, Tower C, Whitefield, Bangalore - 560043, Karnataka. Toll-Free: 1-800-4254449. Email: feedback@britannia.co.in',
      characterCount: 520,
      confidenceScore: 92,
      retriedWithEnhancement: false,
      rawBlocks: [],
      lineBoxes: []
    }
  ],
  mergedText: 'PROPRIETARY FOOD, CAKE - 7.2.1\nINGREDIENTS: REFINED WHEAT FLOUR, EGG, SUGAR, VEGETABLE FAT, BUTTER (4.9%).\nNET WEIGHT:\nALL TAXES)\nPKD:\nUSE BY:\nLOT NO:\nPer 100g product approx:\nEnergy 422 kcal\nProtein 6.4g\nCarbohydrate 54.1g\nTotal Fat 20g\nSodium 232mg\n© BRITANNIA INDUSTRIES LTD.\nFor Feedback-Contact: Executive, Consumer Care Cell @ Britannia Industries Ltd, Prestige Shanthiniketan, Tower C, Whitefield, Bangalore - 560043, Karnataka. Toll-Free: 1-800-4254449. Email: feedback@britannia.co.in',
  totalCharacters: 520,
  averageConfidence: 92,
  isTextIncomplete: false,
  executionTimeMs: 120,
  allLineBoxes: []
};

const unprintedReport = evaluateComplianceFromOCR(unprintedBatch, 'Cakes', 'consumer');
console.log('Unprinted Panel Grounded Audit:');
for (const f of unprintedReport.fieldResults) {
  console.log(`[${f.status.toUpperCase()}] ${f.fieldNumber}. ${f.fieldName}`);
  console.log(`  Extracted Raw: "${f.extractedRawText}"`);
  console.log(`  Normalized Value: "${f.normalizedValue}"`);
  console.log(`  Notes: "${f.notes}"`);
  console.log('');
}
