import fs from 'fs';
import path from 'path';
import { createWorker, PSM } from 'tesseract.js';
import sharp from 'sharp';

async function testSharpRotation() {
  const uploadDir = 'C:\\Users\\dalvi\\.gemini\\antigravity\\brain\\36b905f8-be6c-4e43-b9dc-8a656c0b97ef\\.user_uploaded';
  const filePath = path.join(uploadDir, 'media_1788071641464.jpg');

  const buf = fs.readFileSync(filePath);
  const rotated180 = await sharp(buf).rotate(180).toBuffer();

  const worker = await createWorker('eng');
  await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
  const res = await worker.recognize(rotated180);

  console.log('=== ROTATED 180 DEGREES OCR OUTPUT ===');
  console.log(res.data.text);

  await worker.terminate();
}

testSharpRotation().catch(console.error);
