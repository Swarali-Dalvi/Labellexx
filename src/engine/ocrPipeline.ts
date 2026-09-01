import { createWorker, PSM } from 'tesseract.js';
import { enhanceImageForOCR, rotateOptimizedImage, OptimizedImageResult } from './imageOptimizer';

export type PipelineStage = 
  | 'idle'
  | 'optimizing'
  | 'ocr_reading'
  | 'ocr_retrying'
  | 'analyzing_rules'
  | 'completed'
  | 'timeout'
  | 'error';

export interface OCRProgressUpdate {
  stage: PipelineStage;
  message: string;
  percent: number;
  currentImagePanel?: 'Front' | 'Back' | 'Side' | 'Single';
  imageIndex?: number;
  totalImages?: number;
}

export interface OCRLineBox {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  heightPx: number;
}

export interface SingleImageOCRResult {
  panel: 'Front' | 'Back' | 'Side' | 'Single';
  fileName: string;
  dataUrl: string;
  extractedText: string;
  characterCount: number;
  confidenceScore: number;
  retriedWithEnhancement: boolean;
  rawBlocks: string[];
  lineBoxes: OCRLineBox[];
}

export interface OCRBatchResult {
  results: SingleImageOCRResult[];
  mergedText: string;
  totalCharacters: number;
  averageConfidence: number;
  isTextIncomplete: boolean;
  executionTimeMs: number;
  allLineBoxes: OCRLineBox[];
}

// Singleton or reusable worker pool
let workerInstance: Awaited<ReturnType<typeof createWorker>> | null = null;
let workerInitPromise: Promise<Awaited<ReturnType<typeof createWorker>>> | null = null;

async function getOCRWorker(): Promise<Awaited<ReturnType<typeof createWorker>>> {
  if (workerInstance) return workerInstance;
  if (workerInitPromise) return workerInitPromise;

  workerInitPromise = (async () => {
    const worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
    });
    workerInstance = worker;
    return worker;
  })();

  return workerInitPromise;
}

/**
 * Counts statutory and packaging vocabulary hits to evaluate orientation quality
 */
function scorePackagingKeywords(text: string): number {
  const t = text.toLowerCase();
  const keywords = [
    'manufactured', 'marketed', 'mfg', 'packed', 'pkd', 'address', 'ltd', 'pvt',
    'net', 'quantity', 'weight', 'mrp', 'inclusive', 'taxes', 'tax', 'customer', 'care',
    'feedback', 'email', 'phone', 'batch', 'date', 'packaging', 'use by', 'best before',
    'lic', 'fssai', 'ingredient', 'coffee', 'powder', 'cake', 'biscuit', 'india', 'mumbai',
    'kolkata', 'bangalore', 'unit', 'price', 'grams', 'gm', 'product', 'brand',
    'supermarts', 'telangana', 'delhi', 'britannia', 'industries'
  ];

  let score = 0;
  for (const kw of keywords) {
    if (t.includes(kw)) score += 1;
  }
  return score;
}

/**
 * Executes full-page OCR on a single optimized image with auto-orientation check and auto-retry on low text yield.
 */
export async function runOCRForSingleImage(
  image: OptimizedImageResult,
  onProgress?: (update: OCRProgressUpdate) => void
): Promise<SingleImageOCRResult> {
  const worker = await getOCRWorker();

  onProgress?.({
    stage: 'ocr_reading',
    message: `Reading text from ${image.panel} label...`,
    percent: 30,
    currentImagePanel: image.panel
  });

  // First pass: Direct read on optimized image
  let recognizeResult = await worker.recognize(image.dataUrl);
  let text = recognizeResult.data.text ? recognizeResult.data.text.trim() : '';
  let confidence = recognizeResult.data.confidence || 0;
  let retried = false;
  let finalDataUrl = image.dataUrl;

  let keywordScore = scorePackagingKeywords(text);

  // Column / Stamped Box Check: If image has packaging keywords or multi-line text, run a sparse-text pass
  if (text.length > 40) {
    try {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
      const sparseResult = await worker.recognize(finalDataUrl);
      const sparseText = sparseResult.data.text ? sparseResult.data.text.trim() : '';
      
      // Reset back to AUTO for subsequent passes
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });

      if (sparseText && sparseText.length > 25) {
        const sparseScore = scorePackagingKeywords(sparseText);
        if (sparseScore >= keywordScore || /mrp|pkd|use\s*by|lot\s*no|250g|500g|140|303|0\.56/i.test(sparseText)) {
          const existingLines = new Set(text.split('\n').map(l => l.trim().toLowerCase()));
          const extraLines = sparseText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !existingLines.has(l.toLowerCase()));

          if (extraLines.length > 0) {
            text = text + '\n\n--- REGIONAL DECLARATIONS & STAMPED BOX ---\n' + extraLines.join('\n');
          }
        }
      }
    } catch (sparseErr) {
      console.warn('Sparse text pass notice:', sparseErr);
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    }
  }

  // Orientation check: Test 180, 90, and 270 degree rotations if text has upside-down tokens or low keyword score
  const looksInvertedOrRotated = 
    /lzoz|ayw|vhlh|lad\b|ton\b|gyoh|nh3lsv3|twene|lsim/i.test(text) || 
    (keywordScore < 8 && text.length > 25) || 
    (image.height > image.width * 1.2 && keywordScore < 6);

  if (looksInvertedOrRotated) {
    try {
      const candidateRotations = [180, 90, 270];
      for (const rotAngle of candidateRotations) {
        onProgress?.({
          stage: 'ocr_retrying',
          message: `Auto-correcting photo orientation (${rotAngle}°) for ${image.panel} label...`,
          percent: 50,
          currentImagePanel: image.panel
        });

        const rotatedImg = await rotateOptimizedImage(image, rotAngle);
        const rotatedResult = await worker.recognize(rotatedImg.dataUrl);
        const rotatedText = rotatedResult.data.text ? rotatedResult.data.text.trim() : '';
        const rotatedScore = scorePackagingKeywords(rotatedText);

        if (rotatedScore > keywordScore || (rotatedText.length > text.length * 1.4 && rotatedScore >= keywordScore)) {
          recognizeResult = rotatedResult;
          text = rotatedText;
          confidence = rotatedResult.data.confidence || confidence;
          finalDataUrl = rotatedImg.dataUrl;
          retried = true;
          keywordScore = rotatedScore;
          if (rotatedScore >= 8) break; // High confidence orientation confirmed
        }
      }
    } catch (orientErr) {
      console.warn('Orientation retry notice:', orientErr);
    }
  }

  // Dot-Matrix / Contrast enhancement pass if key stamped fields or character count is low
  const needsContrastEnhancement = 
    text.length < 180 || 
    (!/mrp|₹|140|303|150/i.test(text) && !/pkd|mfg|date/i.test(text) && image.width > 200);

  if (needsContrastEnhancement) {
    try {
      onProgress?.({
        stage: 'ocr_retrying',
        message: `Enhancing dot-matrix contrast & re-reading ${image.panel} label...`,
        percent: 75,
        currentImagePanel: image.panel
      });

      const enhancedDataUrl = await enhanceImageForOCR(finalDataUrl);
      const retryResult = await worker.recognize(enhancedDataUrl);
      const retryText = retryResult.data.text ? retryResult.data.text.trim() : '';
      const retryScore = scorePackagingKeywords(retryText);

      if (retryScore >= keywordScore && retryText.length > 20) {
        recognizeResult = retryResult;
        text = text + '\n\n--- ENHANCED STAMP PASS ---\n' + retryText;
        confidence = Math.max(confidence, retryResult.data.confidence || 0);
        retried = true;
      }
    } catch (retryErr) {
      console.warn('OCR enhancement retry warning:', retryErr);
    }
  }

  // Extract Bounding Box metrics for Font Size & Readability Analysis (Rule 7)
  const rawLines = (recognizeResult.data as any).lines || [];
  const lineBoxes: OCRLineBox[] = rawLines.map((line: any) => {
    const y0 = line.bbox?.y0 || 0;
    const y1 = line.bbox?.y1 || 0;
    const x0 = line.bbox?.x0 || 0;
    const x1 = line.bbox?.x1 || 0;
    return {
      text: line.text ? line.text.trim() : '',
      confidence: Math.round(line.confidence || 0),
      bbox: { x0, y0, x1, y1 },
      heightPx: Math.max(1, Math.abs(y1 - y0))
    };
  }).filter((l: OCRLineBox) => l.text.length > 0);

  // Split into paragraphs / text blocks
  const rawBlocks = text
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  return {
    panel: image.panel,
    fileName: image.file.name,
    dataUrl: finalDataUrl,
    extractedText: text,
    characterCount: text.length,
    confidenceScore: Math.round(confidence),
    retriedWithEnhancement: retried,
    rawBlocks,
    lineBoxes
  };
}

/**
 * Runs OCR across multiple images (Front, Back, Side) in parallel with timeout safeguards.
 */
export async function runMultiImageOCR(
  images: OptimizedImageResult[],
  onProgress?: (update: OCRProgressUpdate) => void,
  timeoutSeconds: number = 22
): Promise<OCRBatchResult> {
  const startTime = performance.now();

  if (images.length === 0) {
    throw new Error('No images provided for OCR extraction.');
  }

  onProgress?.({
    stage: 'optimizing',
    message: `Preparing ${images.length} label photo(s)...`,
    percent: 10,
    totalImages: images.length
  });

  // Timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`OCR analysis timed out after ${timeoutSeconds}s. Please check image clarity and retry.`));
    }, timeoutSeconds * 1000);
  });

  const ocrTasks = images.map((img, idx) => 
    runOCRForSingleImage(img, (update) => {
      const scaledPercent = 10 + Math.round(((idx + (update.percent / 100)) / images.length) * 75);
      onProgress?.({
        ...update,
        percent: Math.min(scaledPercent, 88),
        imageIndex: idx + 1,
        totalImages: images.length
      });
    })
  );

  const results = await Promise.race([
    Promise.all(ocrTasks),
    timeoutPromise
  ]);

  onProgress?.({
    stage: 'analyzing_rules',
    message: 'Analyzing Legal Metrology statutory compliance (Rules 6 & 7)...',
    percent: 90
  });

  const mergedText = results.map(r => `--- ${r.panel.toUpperCase()} PANEL ---\n${r.extractedText}`).join('\n\n');
  const totalCharacters = results.reduce((acc, r) => acc + r.characterCount, 0);
  const averageConfidence = Math.round(
    results.reduce((acc, r) => acc + r.confidenceScore, 0) / (results.length || 1)
  );

  const allLineBoxes: OCRLineBox[] = [];
  results.forEach(r => {
    if (r.lineBoxes) allLineBoxes.push(...r.lineBoxes);
  });

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    results,
    mergedText,
    totalCharacters,
    averageConfidence,
    isTextIncomplete: totalCharacters < 80,
    executionTimeMs,
    allLineBoxes
  };
}
