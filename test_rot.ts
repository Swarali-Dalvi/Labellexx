import { createWorker, PSM } from 'tesseract.js';
import fs from 'fs';
import { rotateOptimizedImage } from './src/engine/imageOptimizer';

async function testRotations() {
  const sidePath = 'C:/Users/dalvi/.gemini/antigravity/brain/36b905f8-be6c-4e43-b9dc-8a656c0b97ef/.user_uploaded/media_1788071641464.jpg';
  const imgBuffer = fs.readFileSync(sidePath);

  const worker = await createWorker('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });

  // Test with Jimp or canvas rotation in node
  console.log('Testing side panel...');
  await worker.terminate();
}

testRotations();
