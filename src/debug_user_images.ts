import fs from 'fs';
import path from 'path';
import { createWorker, PSM } from 'tesseract.js';

async function testAllImages() {
  const uploadDir = 'C:\\Users\\dalvi\\.gemini\\antigravity\\brain\\36b905f8-be6c-4e43-b9dc-8a656c0b97ef\\.user_uploaded';
  const files = ['media_1788071641464.jpg', 'media_1788071641495.jpg', 'media_1788071641554.jpg'];

  const worker = await createWorker('eng');

  for (const f of files) {
    const filePath = path.join(uploadDir, f);
    if (!fs.existsSync(filePath)) continue;

    console.log(`\n======================================================`);
    console.log(`FILE: ${f}`);
    console.log(`======================================================`);
    const buf = fs.readFileSync(filePath);

    await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    const r1 = await worker.recognize(buf);
    console.log('--- DEFAULT OCR ---');
    console.log(r1.data.text);
  }

  await worker.terminate();
}

testAllImages().catch(console.error);
