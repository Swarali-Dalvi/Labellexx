import React, { useState } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  X, 
  Layers, 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { getMandatoryTestCases, SampleTestCase } from '../store/sampleData';
import { optimizeImage } from '../engine/imageOptimizer';
import { runMultiImageOCR, OCRProgressUpdate } from '../engine/ocrPipeline';
import { evaluateComplianceFromOCR } from '../engine/fieldMatcher';
import { ComplianceReportData } from '../engine/rules';
import { useSharedStore } from '../store/sharedStore';

interface SampleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: ComplianceReportData) => void;
}

export const SampleSelectorModal: React.FC<SampleSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectReport
}) => {
  const { addReport } = useSharedStore();
  const testCases = getMandatoryTestCases();
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  if (!isOpen) return null;

  /**
   * Runs the actual end-to-end OCR and compliance analysis pipeline on the selected sample test case.
   */
  const handleRunTestCase = async (testCase: SampleTestCase) => {
    setRunningCaseId(testCase.id);
    setProgressMsg('Compressing & preparing test label canvas...');
    setProgressPercent(15);

    try {
      // Step 1: Optimize all images in test case (camera or standard format)
      const optimizedImages = [];
      for (const img of testCase.images) {
        // Convert dataUrl to Blob
        const res = await fetch(img.dataUrl);
        const blob = await res.blob();
        const optimized = await optimizeImage(blob, img.panel, img.fileName);
        optimizedImages.push(optimized);
      }

      setProgressMsg('Running full-page document OCR...');
      setProgressPercent(40);

      // Step 2: Run Multi-Image OCR
      const batchResult = await runMultiImageOCR(
        optimizedImages,
        (update: OCRProgressUpdate) => {
          setProgressMsg(update.message);
          setProgressPercent(update.percent);
        },
        20
      );

      setProgressMsg('Auditing against 8 Legal Metrology Rules...');
      setProgressPercent(90);

      // Step 3: Run Field Matcher
      const report = evaluateComplianceFromOCR(batchResult, 'Packaged Goods', 'consumer');

      // Add to store and trigger report view
      addReport(report);
      
      setTimeout(() => {
        setRunningCaseId(null);
        onSelectReport(report);
        onClose();
      }, 400);

    } catch (err: any) {
      console.error('Test case execution error:', err);
      alert('Error running test case: ' + err.message);
      setRunningCaseId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-soft-xl border border-charcoal-200 animate-fadeIn my-6">
        
        {/* Modal Header */}
        <div className="p-6 bg-charcoal-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-6 h-6 text-pastel-mint" />
              <h2 className="text-xl font-bold">Mandatory Test Suite (6 Specific Cases)</h2>
            </div>
            <p className="text-xs text-charcoal-400 mt-1 max-w-2xl">
              1-Click verification for the 6 critical specification test cases. Executes real OCR and field-matching against rendered packaging labels.
            </p>
          </div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-white p-1 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Test Case Cards Grid */}
        <div className="p-6 sm:p-8 bg-cream-50/60 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((tc) => {
              const isRunning = runningCaseId === tc.id;

              return (
                <div
                  key={tc.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-soft-sm hover:shadow-soft-md ${
                    isRunning ? 'border-charcoal-900 bg-cream-100' : 'border-charcoal-200 hover:border-charcoal-300'
                  }`}
                >
                  <div>
                    {/* Badge & Case Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                        Case {tc.caseNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        tc.expectedVerdict === 'PASS' 
                          ? 'bg-pastel-mint text-pastel-mintText border-pastel-mintBorder' 
                          : 'bg-pastel-coral text-pastel-coralText border-pastel-coralBorder'
                      }`}>
                        {tc.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-charcoal-900 mb-1">
                      {tc.name}
                    </h3>
                    <p className="text-xs text-charcoal-600 leading-relaxed mb-4">
                      {tc.description}
                    </p>

                    {/* Image thumbnails preview */}
                    <div className="flex items-center space-x-2 mb-4">
                      {tc.images.map((img, idx) => (
                        <div key={idx} className="w-16 h-12 rounded-lg bg-charcoal-900 border border-charcoal-200 overflow-hidden relative group">
                          <img src={img.dataUrl} alt="Thumbnail preview" className="w-full h-full object-contain" />
                          <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1 rounded-tl">
                            {img.panel}
                          </span>
                        </div>
                      ))}
                      {tc.isMultiImage && (
                        <span className="text-[11px] font-semibold text-charcoal-500 bg-cream-100 px-2 py-1 rounded-md border border-charcoal-200">
                          Merged Multi-Panel
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress or Run Button */}
                  <div>
                    {isRunning ? (
                      <div className="p-3 bg-charcoal-900 text-white rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center space-x-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-pastel-mint" />
                            <span>{progressMsg}</span>
                          </span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-charcoal-700 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-pastel-mint h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRunTestCase(tc)}
                        disabled={runningCaseId !== null}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold shadow-soft-sm hover:scale-101 active:scale-99 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-pastel-mint" />
                        <span>Run Test & Verify Report</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-charcoal-200 flex items-center justify-between text-xs text-charcoal-500">
          <span>All 6 test cases run real OCR and field-matching algorithms.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-100 border border-charcoal-200"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
