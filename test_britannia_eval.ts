import { evaluateComplianceFromOCR } from './src/engine/fieldMatcher';
import { OCRBatchResult } from './src/engine/ocrPipeline';

// Actual OCR extracted from Britannia Tea Cake Back panel
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

const batch: OCRBatchResult = {
  results: [{
    panel: 'Back',
    fileName: 'britannia_back.jpg',
    dataUrl: '',
    extractedText: backPanelText,
    characterCount: backPanelText.length,
    confidenceScore: 95,
    retriedWithEnhancement: false,
    rawBlocks: []
  }],
  mergedText: backPanelText,
  totalCharacters: backPanelText.length,
  averageConfidence: 95,
  isTextIncomplete: false,
  executionTimeMs: 120
};

console.log('Testing Britannia evaluation...');
