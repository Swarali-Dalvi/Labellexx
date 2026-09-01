import fs from 'fs';
import path from 'path';
import { createWorker } from 'tesseract.js';

async function testOCR() {
  const uploadDir = 'C:\\Users\\dalvi\\.gemini\\antigravity\\brain\\36b905f8-be6c-4e43-b9dc-8a656c0b97ef\\.user_uploaded';
  const files = fs.readdirSync(uploadDir);

  const imagesToTest = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
  const worker = await createWorker('eng');

  for (const f of imagesToTest) {
    const fullPath = path.join(uploadDir, f);
    const buf = fs.readFileSync(fullPath);
    
    console.log(`\n======================================================`);
    console.log(`Testing OCR on: ${f} (${(buf.length / 1024).toFixed(1)} KB)`);
    console.log(`======================================================`);

    const result = await worker.recognize(buf);
    
    console.log(`\n--- RAW OCR TEXT FOR ${f} ---`);
    console.log(result.data.text);
    console.log(`------------------------------------------------------\n`);
  }

  await worker.terminate();
}

testOCR().catch(console.error);
