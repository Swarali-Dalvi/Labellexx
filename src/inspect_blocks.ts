import fs from 'fs';
import path from 'path';
import { createWorker, PSM } from 'tesseract.js';

async function run() {
  const worker = await createWorker('eng');
  const uploadDir = 'C:\\Users\\dalvi\\.gemini\\antigravity\\brain\\36b905f8-be6c-4e43-b9dc-8a656c0b97ef\\.user_uploaded';

  const buf = fs.readFileSync(path.join(uploadDir, 'media_1788071641495.jpg'));
  
  // Test with PSM.SINGLE_BLOCK and PSM.SPARSE_TEXT_OSD
  console.log('--- TEST PSM 6 (SINGLE UNIFORM BLOCK) ---');
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
  const resPSM6 = await worker.recognize(buf);
  console.log(resPSM6.data.text);

  console.log('--- TEST PSM 11 (SPARSE TEXT) ---');
  await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
  const resPSM11 = await worker.recognize(buf);
  console.log(resPSM11.data.text);

  await worker.terminate();
}

run().catch(console.error);
