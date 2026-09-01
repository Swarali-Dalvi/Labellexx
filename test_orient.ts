import { createWorker, PSM } from 'tesseract.js';
import fs from 'fs';
import { evaluateComplianceFromOCR } from './src/engine/fieldMatcher';

async function testAutoOrientation() {
  const imagePath = 'C:/Users/dalvi/.gemini/antigravity/brain/36b905f8-be6c-4e43-b9dc-8a656c0b97ef/.user_uploaded/media_1788066015871.jpg';
  const imgBuffer = fs.readFileSync(imagePath);

  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });

  const res = await worker.recognize(imgBuffer);
  console.log('Extracted OCR text:');
  console.log(res.data.text);

  await worker.terminate();
}

testAutoOrientation();
