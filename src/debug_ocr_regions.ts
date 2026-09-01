import fs from 'fs';
import path from 'path';
import { createWorker, PSM } from 'tesseract.js';

// Inspect media_1788071641495.jpg
async function inspectRegions() {
  const uploadDir = 'C:\\Users\\dalvi\\.gemini\\antigravity\\brain\\36b905f8-be6c-4e43-b9dc-8a656c0b97ef\\.user_uploaded';
  const filePath = path.join(uploadDir, 'media_1788071641495.jpg');

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  const worker = await createWorker('eng');
  const buf = fs.readFileSync(filePath);

  console.log('--- FULL PAGE OCR (PSM 3 DEFAULT) ---');
  await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
  const fullResult = await worker.recognize(buf);
  console.log(fullResult.data.text);

  console.log('\n--- FULL PAGE OCR (PSM 6 UNIFORM BLOCK) ---');
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
  const psm6Result = await worker.recognize(buf);
  console.log(psm6Result.data.text);

  console.log('\n--- FULL PAGE OCR (PSM 11 SPARSE TEXT) ---');
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
  const psm11Result = await worker.recognize(buf);
  console.log(psm11Result.data.text);

  await worker.terminate();
}

inspectRegions().catch(console.error);
