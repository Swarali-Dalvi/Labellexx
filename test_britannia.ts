import { createWorker, PSM } from 'tesseract.js';
import fs from 'fs';

async function testBritanniaImages() {
  const sidePath = 'C:/Users/dalvi/.gemini/antigravity/brain/36b905f8-be6c-4e43-b9dc-8a656c0b97ef/.user_uploaded/media_1788071641464.jpg';
  const backPath = 'C:/Users/dalvi/.gemini/antigravity/brain/36b905f8-be6c-4e43-b9dc-8a656c0b97ef/.user_uploaded/media_1788071641495.jpg';
  const frontPath = 'C:/Users/dalvi/.gemini/antigravity/brain/36b905f8-be6c-4e43-b9dc-8a656c0b97ef/.user_uploaded/media_1788071641554.jpg';

  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });

  console.log('--- BACK PANEL OCR ---');
  const resBack = await worker.recognize(fs.readFileSync(backPath));
  console.log(resBack.data.text);

  console.log('--- SIDE PANEL OCR (Raw) ---');
  const resSideRaw = await worker.recognize(fs.readFileSync(sidePath));
  console.log(resSideRaw.data.text);

  await worker.terminate();
}

testBritanniaImages();
