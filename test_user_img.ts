import { createWorker, PSM } from 'tesseract.js';
import fs from 'fs';

async function testOCR() {
  const imagePath = 'C:/Users/dalvi/.gemini/antigravity/brain/36b905f8-be6c-4e43-b9dc-8a656c0b97ef/.user_uploaded/media_1788066015871.jpg';
  const imgBuffer = fs.readFileSync(imagePath);

  const worker = await createWorker('eng');
  
  console.log('--- Pass 1: Raw Image PSM.AUTO ---');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });
  const res1 = await worker.recognize(imgBuffer);
  console.log('Result 1 text length:', res1.data.text.length);
  console.log(res1.data.text);

  console.log('--- Pass 2: PSM.SPARSE_TEXT or PSM.SINGLE_BLOCK ---');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
  });
  const res2 = await worker.recognize(imgBuffer);
  console.log('Result 2 text length:', res2.data.text.length);
  console.log(res2.data.text);

  await worker.terminate();
}

testOCR();
