import { createWorker, PSM } from 'tesseract.js';
import fs from 'fs';

async function inspectOcrLines() {
  const imagePath = 'C:/Users/dalvi/.gemini/antigravity/brain/36b905f8-be6c-4e43-b9dc-8a656c0b97ef/.user_uploaded/media_1788066015871.jpg';
  const imgBuffer = fs.readFileSync(imagePath);

  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });

  const res = await worker.recognize(imgBuffer);
  console.log('=== FULL OCR OUTPUT FROM REAL IMAGE ===');
  console.log(res.data.text);
  console.log('=======================================');

  const lines = res.data.text.split('\n');
  lines.forEach((l, idx) => {
    console.log(`Line ${idx + 1}: "${l}"`);
  });

  await worker.terminate();
}

inspectOcrLines();
