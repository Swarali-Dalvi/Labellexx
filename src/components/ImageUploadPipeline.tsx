import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Layers,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { optimizeImage, rotateOptimizedImage, OptimizedImageResult } from '../engine/imageOptimizer';
import { runMultiImageOCR, OCRProgressUpdate } from '../engine/ocrPipeline';
import { evaluateComplianceFromOCR } from '../engine/fieldMatcher';
import { ComplianceReportData } from '../engine/rules';
import { useSharedStore } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';
import { CameraModal } from './CameraModal';

interface ImageUploadPipelineProps {
  onReportGenerated: (report: ComplianceReportData) => void;
  category?: string;
  source?: 'consumer' | 'enforcement' | 'manufacturer' | 'officer';
  officerDetails?: { officerId: string; location: string; actionTaken: any };
  manufacturerBatch?: string;
  allowMultiPanel?: boolean;
}

interface ImageSlotState {
  id: string;
  panel: 'Front' | 'Back' | 'Side' | 'Single';
  file?: File;
  optimizedResult?: OptimizedImageResult;
  status: 'idle' | 'optimizing' | 'ready' | 'error';
  errorMessage?: string;
}

export const ImageUploadPipeline: React.FC<ImageUploadPipelineProps> = ({
  onReportGenerated,
  category = 'Packaged Food & Beverage',
  source = 'consumer',
  officerDetails,
  manufacturerBatch,
  allowMultiPanel = true
}) => {
  const { language } = useSharedStore();
  const t = TRANSLATIONS[language];

  // Image slots: defaults to Front panel. Back and Side can be added
  const [slots, setSlots] = useState<ImageSlotState[]>([
    { id: 'slot-front', panel: allowMultiPanel ? 'Front' : 'Single', status: 'idle' }
  ]);

  // Live in-app camera modal state
  const [activeCameraSlot, setActiveCameraSlot] = useState<{ id: string; panel: 'Front' | 'Back' | 'Side' | 'Single'; name: string } | null>(null);

  const handleOpenLiveCamera = (slot: ImageSlotState) => {
    const name = slot.panel === 'Front' ? t.frontPanel : slot.panel === 'Back' ? t.backPanel : slot.panel === 'Side' ? t.sidePanel : t.productLabel;
    setActiveCameraSlot({ id: slot.id, panel: slot.panel, name });
  };

  // Overall pipeline progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressInfo, setProgressInfo] = useState<OCRProgressUpdate>({
    stage: 'idle',
    message: '',
    percent: 0
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTimeoutWarning, setIsTimeoutWarning] = useState(false);

  /**
   * Unified ingestion for every slot: Takes raw File or Blob from Gallery or Native Camera
   */
  const handleSlotImageIngestion = async (
    rawFileOrBlob: File | Blob, 
    slotId: string,
    panel: 'Front' | 'Back' | 'Side' | 'Single'
  ) => {
    setErrorMessage(null);
    setIsTimeoutWarning(false);

    // Update slot status to optimizing
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: 'optimizing', errorMessage: undefined } : s));

    try {
      const optimized = await optimizeImage(rawFileOrBlob, panel);

      setSlots(prev => prev.map(s => 
        s.id === slotId 
          ? { ...s, file: optimized.file, optimizedResult: optimized, status: 'ready' }
          : s
      ));
    } catch (err: any) {
      console.error('Image optimization error:', err);
      setSlots(prev => prev.map(s => 
        s.id === slotId 
          ? { ...s, status: 'error', errorMessage: err.message || (language === 'hi' ? 'छवि लोड करने में त्रुटि हुई' : 'Failed to process image') }
          : s
      ));
    }
  };

  /**
   * Add Back / Side panel slots
   */
  const addPanelSlot = (panel: 'Back' | 'Side') => {
    if (slots.some(s => s.panel === panel)) return;
    setSlots(prev => [...prev, { id: `slot-${panel.toLowerCase()}-${Date.now()}`, panel, status: 'idle' }]);
  };

  const removePanelSlot = (slotId: string) => {
    setSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const clearSlot = (slotId: string) => {
    setSlots(prev => prev.map(s => s.id === slotId ? { ...s, status: 'idle', file: undefined, optimizedResult: undefined } : s));
  };

  /**
   * Execute End-to-End Compliance Verification
   */
  const handleAnalyze = async () => {
    const readyImages = slots.filter(s => s.status === 'ready' && s.optimizedResult).map(s => s.optimizedResult!);
    
    if (readyImages.length === 0) {
      setErrorMessage(language === 'hi' ? 'कृपया विश्लेषण के लिए कम से कम एक लेबल छवि अपलोड करें।' : 'Please upload or capture at least one label image to analyze.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setIsTimeoutWarning(false);

    const timeoutTimer = setTimeout(() => {
      setIsTimeoutWarning(true);
    }, 16000);

    try {
      const batchResult = await runMultiImageOCR(
        readyImages,
        (progress) => setProgressInfo(progress),
        25
      );

      clearTimeout(timeoutTimer);

      setProgressInfo({
        stage: 'completed',
        message: t.analysisComplete,
        percent: 100
      });

      const metadata = officerDetails 
        ? { officerId: officerDetails.officerId, location: officerDetails.location, actionTaken: officerDetails.actionTaken }
        : manufacturerBatch
        ? { manufacturerBatch }
        : undefined;

      const report = evaluateComplianceFromOCR(batchResult, category, source, metadata);

      setTimeout(() => {
        setIsProcessing(false);
        onReportGenerated(report);
      }, 400);

    } catch (err: any) {
      clearTimeout(timeoutTimer);
      setIsProcessing(false);
      console.error('Compliance pipeline error:', err);
      setErrorMessage(err.message || (language === 'hi' ? 'टेक्स्ट निष्कर्षण अपूर्ण रहा — कृपया स्पष्ट, अच्छी रोशनी वाली तस्वीर अपलोड करें।' : 'Text extraction was incomplete — try a clearer, well-lit photo.'));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-charcoal-200 shadow-soft-md p-6 sm:p-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-charcoal-100">
        <div>
          <h2 className="text-xl font-bold text-charcoal-900 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-mint-600" />
            <span>{t.labelInspectionTitle}</span>
          </h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            {t.labelInspectionSubtitle}
          </p>
        </div>

        {/* Multi-Panel Add Buttons */}
        {allowMultiPanel && (
          <div className="flex items-center space-x-2">
            {!slots.some(s => s.panel === 'Back') && (
              <button
                type="button"
                onClick={() => addPanelSlot('Back')}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-pastel-blue text-pastel-blueText hover:bg-sky-200 border border-pastel-blueBorder shadow-soft-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addBackPanel}</span>
              </button>
            )}
            {!slots.some(s => s.panel === 'Side') && (
              <button
                type="button"
                onClick={() => addPanelSlot('Side')}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addSidePanel}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image Panel Upload Grid */}
      <div className={`grid gap-4 mb-6 ${slots.length === 1 ? 'grid-cols-1' : slots.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
        {slots.map((slot) => {
          const isReady = slot.status === 'ready' && slot.optimizedResult;
          const isOptimizing = slot.status === 'optimizing';

          return (
            <div 
              key={slot.id}
              className={`relative rounded-2xl border-2 transition-all p-4 ${
                isReady 
                  ? 'border-mint-300 bg-mint-50/40' 
                  : slot.status === 'error'
                  ? 'border-rose-300 bg-rose-50/40'
                  : 'border-dashed border-charcoal-200 hover:border-charcoal-300 bg-cream-50/70'
              }`}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-charcoal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
                    {slot.panel === 'Front' ? t.frontPanel : slot.panel === 'Back' ? t.backPanel : slot.panel === 'Side' ? t.sidePanel : t.productLabel}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {isReady && (
                    <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-pastel-mint text-pastel-mintText border border-pastel-mintBorder">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.ready}</span>
                    </span>
                  )}
                  {slot.panel !== 'Front' && slot.panel !== 'Single' && (
                    <button
                      type="button"
                      onClick={() => removePanelSlot(slot.id)}
                      className="p-1 text-charcoal-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                      title={t.remove}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Slot Body */}
              {isReady && slot.optimizedResult ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-charcoal-900 border border-charcoal-200 group">
                    <img 
                      src={slot.optimizedResult.dataUrl} 
                      alt={`${slot.panel} label preview`} 
                      className="w-full h-full object-contain"
                    />
                    
                    {/* Controls on hover / touch */}
                    <div className="absolute inset-0 bg-charcoal-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const rotated = await rotateOptimizedImage(slot.optimizedResult!, 90);
                          setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, optimizedResult: rotated, file: rotated.file } : s));
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/90 text-charcoal-900 text-xs font-bold hover:bg-white shadow-soft-sm flex items-center space-x-1 cursor-pointer"
                        title={t.rotate}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t.rotate}</span>
                      </button>

                      {/* Direct replace controls */}
                      <button
                        type="button"
                        onClick={() => handleOpenLiveCamera(slot)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/90 text-charcoal-900 text-xs font-bold hover:bg-white shadow-soft-sm flex items-center space-x-1 cursor-pointer"
                        title={t.camera}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{t.camera}</span>
                      </button>

                      <label 
                        className="px-2.5 py-1.5 rounded-lg bg-white/90 text-charcoal-900 text-xs font-bold hover:bg-white shadow-soft-sm cursor-pointer inline-flex items-center"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        <span>{t.gallery}</span>
                        <input 
                          type="file" 
                          accept="image/*,image/heic,image/heif" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleSlotImageIngestion(e.target.files[0], slot.id, slot.panel);
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => clearSlot(slot.id)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-soft-sm cursor-pointer"
                        title={t.remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Size & Info */}
                  <div className="flex items-center justify-between text-[11px] text-charcoal-600 bg-white/90 px-2.5 py-1.5 rounded-xl border border-charcoal-200">
                    <span>{slot.optimizedResult.width}×{slot.optimizedResult.height}px</span>
                    <span className="font-semibold text-mint-700">
                      {(slot.optimizedResult.compressedSizeBytes / 1024).toFixed(0)} KB ({slot.optimizedResult.compressionRatioPercent}% {language === 'hi' ? 'अनुकूलित' : 'optimized'})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                  {isOptimizing ? (
                    <div className="flex flex-col items-center space-y-2 py-4">
                      <RefreshCw className="w-7 h-7 text-charcoal-600 animate-spin" />
                      <span className="text-xs font-semibold text-charcoal-700">{t.optimizingImage}</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center text-charcoal-500 shadow-soft-sm">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-charcoal-800">
                          {slot.panel === 'Front' ? t.uploadFrontPrompt : slot.panel === 'Back' ? t.uploadBackPrompt : t.uploadSidePrompt}
                        </p>
                        <p className="text-[11px] text-charcoal-500 mt-0.5">{t.uploadFormats}</p>
                      </div>

                      {slot.status === 'error' && slot.errorMessage && (
                        <p className="text-[11px] font-semibold text-rose-600 px-2">
                          {slot.errorMessage}
                        </p>
                      )}

                      {/* Direct Actions: Live Camera & Gallery */}
                      <div className="flex items-center space-x-2 pt-1">
                        
                        {/* Live Camera Viewfinder Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenLiveCamera(slot)}
                          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold shadow-soft-sm transition-all cursor-pointer active:scale-95"
                        >
                          <Camera className="w-3.5 h-3.5 text-pastel-mint" />
                          <span>{t.camera}</span>
                        </button>

                        {/* Gallery / File Picker Native Label */}
                        <label 
                          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-cream-100 text-charcoal-800 text-xs font-bold border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5 text-charcoal-600" />
                          <span>{t.gallery}</span>
                          <input 
                            type="file" 
                            accept="image/*,image/heic,image/heif" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleSlotImageIngestion(e.target.files[0], slot.id, slot.panel);
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>

                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress & Status Indicators */}
      {isProcessing && (
        <div className="mb-6 p-4 rounded-2xl bg-cream-100 border border-charcoal-200 space-y-3 animate-pulseGlow">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal-800">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-charcoal-700 animate-spin" />
              <span>{progressInfo.message || t.processingPipeline}</span>
            </div>
            <span>{progressInfo.percent}%</span>
          </div>

          <div className="w-full bg-cream-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-charcoal-900 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressInfo.percent}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 text-[10px] text-center font-bold text-charcoal-500 pt-1">
            <span className={progressInfo.percent >= 20 ? 'text-charcoal-900' : ''}>{t.pipelineOptimize}</span>
            <span className={progressInfo.percent >= 40 ? 'text-charcoal-900' : ''}>{t.pipelineOCR}</span>
            <span className={progressInfo.percent >= 80 ? 'text-charcoal-900' : ''}>{t.pipelineRules}</span>
            <span className={progressInfo.percent >= 100 ? 'text-mint-700' : ''}>{t.pipelineReport}</span>
          </div>
        </div>
      )}

      {/* Timeout Warning Alert */}
      {isTimeoutWarning && isProcessing && (
        <div className="mb-6 p-4 rounded-2xl bg-pastel-amber border border-pastel-amberBorder text-pastel-amberText flex items-start space-x-3 text-xs">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <div className="flex-1">
            <p className="font-bold">{t.takingLonger}</p>
            <p className="mt-0.5 text-[11px] opacity-90">
              {t.takingLongerDesc}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-pastel-coral border border-pastel-coralBorder text-pastel-coralText flex items-start space-x-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-bold">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-soft-sm shrink-0 cursor-pointer"
          >
            {t.retryScan}
          </button>
        </div>
      )}

      {/* Action Submit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="text-xs text-charcoal-500 font-medium">
          <span>{slots.filter(s => s.status === 'ready').length} / {slots.length} {t.imagesReady}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setSlots([{ id: `slot-front-${Date.now()}`, panel: allowMultiPanel ? 'Front' : 'Single', status: 'idle' }])}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-600 hover:bg-cream-100 border border-charcoal-200 transition-colors cursor-pointer"
          >
            {t.clearAll}
          </button>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isProcessing || slots.every(s => s.status !== 'ready')}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-soft-md transition-all ${
              slots.some(s => s.status === 'ready') && !isProcessing
                ? 'bg-charcoal-900 hover:bg-charcoal-800 text-white hover:scale-102 active:scale-98 cursor-pointer'
                : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-pastel-mint" />
                <span>{t.analyzingLabel}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-pastel-amber" />
                <span>{t.runAnalysis}</span>
              </>
                  )}
          </button>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraModal
        isOpen={!!activeCameraSlot}
        onClose={() => setActiveCameraSlot(null)}
        panelName={activeCameraSlot?.name || t.productLabel}
        onCapture={(blob) => {
          if (activeCameraSlot) {
            handleSlotImageIngestion(blob, activeCameraSlot.id, activeCameraSlot.panel);
          }
        }}
      />

    </div>
  );
};
