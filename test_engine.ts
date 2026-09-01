import { evaluateComplianceFromOCR } from './src/engine/fieldMatcher';
import { OCRBatchResult } from './src/engine/ocrPipeline';

const case1Batch: OCRBatchResult = {
  results: [{
    panel: 'Single',
    fileName: 'honey_label.jpg',
    dataUrl: '',
    extractedText: `Himalayan Organic Honey (Pure Raw)
Mfg by: Himalayan Flora Pvt Ltd, Plot 14, Phase II, Solan Ind Area, HP - 173212
Net Weight: 500 g
Mfg Date: 08/2026
MRP: ₹ 380.00 (Inclusive of all taxes)
Customer Care: care@himalayanflora.in / Toll Free 1800-200-9876
Unit Sale Price: ₹ 0.76 per g
Country of Origin: India`,
    characterCount: 310,
    confidenceScore: 94,
    retriedWithEnhancement: false,
    rawBlocks: []
  }],
  mergedText: `Himalayan Organic Honey (Pure Raw)
Mfg by: Himalayan Flora Pvt Ltd, Plot 14, Phase II, Solan Ind Area, HP - 173212
Net Weight: 500 g
Mfg Date: 08/2026
MRP: ₹ 380.00 (Inclusive of all taxes)
Customer Care: care@himalayanflora.in / Toll Free 1800-200-9876
Unit Sale Price: ₹ 0.76 per g
Country of Origin: India`,
  totalCharacters: 310,
  averageConfidence: 94,
  isTextIncomplete: false,
  executionTimeMs: 120
};

const case1Report = evaluateComplianceFromOCR(case1Batch, 'Packaged Food & Beverage', 'consumer');
console.log('--- Case 1 Field Details ---');
case1Report.fieldResults.forEach(f => {
  console.log(`Field ${f.fieldNumber} (${f.fieldName}): Status=${f.status}, Normalized="${f.normalizedValue}", Notes="${f.notes}"`);
});

// Case 4 Check
const case4Batch: OCRBatchResult = {
  results: [
    {
      panel: 'Front',
      fileName: 'saffron_front.jpg',
      dataUrl: '',
      extractedText: `Royal Heritage Kashmiri Saffron Threads
Grade A1 Mogra Saffron (Kesar)
Net Weight: 5 g
MRP: ₹ 999.00 (Inclusive of all taxes)
Country of Origin: India`,
      characterCount: 160,
      confidenceScore: 92,
      retriedWithEnhancement: false,
      rawBlocks: []
    },
    {
      panel: 'Back',
      fileName: 'saffron_back.jpg',
      dataUrl: '',
      extractedText: `Royal Heritage - Mandatory Declarations
Mfg by: Kashmir Valley Spice Exporters, Pampore Saffron Park, Pulwama, J&K - 192121
Mfg Date: 08/2026
Customer Care: customercare@kashmirheritage.in / 1800-889-7700
Unit Sale Price: ₹ 199.80 per g`,
      characterCount: 220,
      confidenceScore: 93,
      retriedWithEnhancement: false,
      rawBlocks: []
    }
  ],
  mergedText: `Royal Heritage Kashmiri Saffron Threads
Grade A1 Mogra Saffron (Kesar)
Net Weight: 5 g
MRP: ₹ 999.00 (Inclusive of all taxes)
Country of Origin: India
Mfg by: Kashmir Valley Spice Exporters, Pampore Saffron Park, Pulwama, J&K - 192121
Mfg Date: 08/2026
Customer Care: customercare@kashmirheritage.in / 1800-889-7700
Unit Sale Price: ₹ 199.80 per g`,
  totalCharacters: 380,
  averageConfidence: 93,
  isTextIncomplete: false,
  executionTimeMs: 240
};

const case4Report = evaluateComplianceFromOCR(case4Batch, 'Packaged Food & Beverage', 'consumer');
console.log('--- Case 4 Field Details ---');
case4Report.fieldResults.forEach(f => {
  console.log(`Field ${f.fieldNumber} (${f.fieldName}): Status=${f.status}, Panel=${f.foundOnImage}, Normalized="${f.normalizedValue}"`);
});
