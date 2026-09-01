import fs from 'fs';
import path from 'path';
import { createWorker, PSM } from 'tesseract.js';

// Test 180 degree rotation of media_1788071641464.jpg using sharp or canvas simulation
async function testRotation() {
  const uploadDir = 'C:\\Users\\dalvi\\.gemini\\antigravity\\brain\\36b905f8-be6c-4e43-b9dc-8a656c0b97ef\\.user_uploaded';
  const filePath = path.join(uploadDir, 'media_1788071641464.jpg');

  // Let's check Tesseract with OSD (Orientation and Script Detection) or test 180 flip
  const worker = await createWorker('eng');
  
  // Tesseract PSM 0 is Orientation and Script Detection
  try {
    await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO_OSD });
    const osd = await worker.recognize(filePath);
    console.log('OSD Result:');
    console.log(osd.data.text);
  } catch (e) {
    console.log('OSD error:', e);
  }

  await worker.terminate();
}

testRotation().catch(console.error);
