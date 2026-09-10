import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RefreshCw, SwitchCamera, AlertCircle, Sparkles, Check, Zap, ZapOff, ZoomIn, Grid3X3 } from 'lucide-react';
import { useSharedStore } from '../store/sharedStore';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
  panelName: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  panelName
}) => {
  const { language } = useSharedStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showPdpGrid, setShowPdpGrid] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);

  // Check camera device count
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Initialize and stop camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPreview(null);
      setCapturedBlob(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          language === 'hi' 
            ? 'आपका ब्राउज़र सीधे कैमरा एक्सेस का समर्थन नहीं करता है। कृपया फ़ाइल चयनकर्ता का उपयोग करें।'
            : 'Your browser does not support direct live camera access. Please use the file upload option.'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;

      // Check if camera track supports torch
      const track = stream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
        setHasTorch(!!capabilities.torch);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err: any) {
      console.warn('Live camera error:', err);
      setIsLoading(false);
      
      // Fallback try without facingMode constraint (useful for desktop webcams)
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setIsLoading(false);
      } catch (fallbackErr: any) {
        setErrorMsg(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? (language === 'hi' ? 'कैमरा एक्सेस की अनुमति अस्वीकार कर दी गई। कृपया ब्राउज़र सेटिंग्स में कैमरा की अनुमति दें।' : 'Camera permission was denied. Please allow camera access in your browser settings.')
            : (language === 'hi' ? 'कैमरा शुरू करने में त्रुटि हुई। कृपया जांचें कि कोई अन्य ऐप इसका उपयोग नहीं कर रहा है।' : 'Unable to start camera. Please verify your camera is connected and not in use by another app.')
        );
      }
    }
  };

  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && (track.getCapabilities as any)?.().torch) {
      try {
        const newTorchState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: newTorchState } as any]
        });
        setIsTorchOn(newTorchState);
      } catch (e) {
        console.warn('Failed to toggle torch:', e);
      }
    }
  };

  const handleSetZoom = (level: number) => {
    setZoomLevel(level);
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      if (capabilities.zoom) {
        track.applyConstraints({
          advanced: [{ zoom: level } as any]
        }).catch(() => {});
      }
    }
  };

  const handleToggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Flip horizontal if using user (selfie) camera for natural mirror feel
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        setCapturedPreview(canvas.toDataURL('image/jpeg', 0.9));
      }
    }, 'image/jpeg', 0.92);
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedBlob(null);
  };

  const handleConfirmPhoto = () => {
    if (capturedBlob) {
      onCapture(capturedBlob);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-charcoal-900/90 border-b border-charcoal-800 text-white">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-pastel-mint" />
            <span className="font-bold text-sm sm:text-base">
              {language === 'hi' ? `${panelName} की लाइव फ़ोटो लें` : `Scan ${panelName}`}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-charcoal-800 text-charcoal-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black aspect-[4/3] sm:aspect-video flex items-center justify-center overflow-hidden">
          
          {capturedPreview ? (
            <img 
              src={capturedPreview} 
              alt="Captured frame" 
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                style={{ transform: `scale(${zoomLevel}) ${facingMode === 'user' ? 'scaleX(-1)' : ''}` }}
                className="w-full h-full object-cover transition-transform duration-200 origin-center"
              />

              {/* Top Viewfinder Hardware Controls Bar */}
              {!isLoading && !errorMsg && (
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-auto">
                  
                  {/* Torch Toggle */}
                  {hasTorch && (
                    <button
                      onClick={handleToggleTorch}
                      className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                        isTorchOn 
                          ? 'bg-amber-400 text-charcoal-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]' 
                          : 'bg-charcoal-900/60 text-white border-white/20 hover:bg-charcoal-900/80'
                      }`}
                      title="Toggle Torch / Flashlight"
                    >
                      {isTorchOn ? <Zap className="w-4 h-4 fill-charcoal-950" /> : <ZapOff className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Zoom Presets */}
                  <div className="flex items-center space-x-1 bg-charcoal-900/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/20 mx-auto">
                    {[1.0, 1.5, 2.0, 3.0].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleSetZoom(lvl)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          zoomLevel === lvl
                            ? 'bg-pastel-mint text-charcoal-950 shadow-sm'
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {lvl}x
                      </button>
                    ))}
                  </div>

                  {/* PDP Grid Overlay Toggle */}
                  <button
                    onClick={() => setShowPdpGrid(!showPdpGrid)}
                    className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                      showPdpGrid
                        ? 'bg-pastel-mint text-charcoal-950 border-pastel-mint'
                        : 'bg-charcoal-900/60 text-white border-white/20 hover:bg-charcoal-900/80'
                    }`}
                    title="Toggle Rule 2(h) PDP Grid Overlay"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Viewfinder Framing Overlay */}
              {!isLoading && !errorMsg && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-[85%] h-[75%] border-2 border-dashed border-pastel-mint/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                    
                    {/* Rule 2(h) PDP Crosshair Alignment Grid */}
                    {showPdpGrid && (
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                        <div className="border-r border-b border-pastel-mint/50" />
                        <div className="border-r border-b border-pastel-mint/50" />
                        <div className="border-b border-pastel-mint/50" />
                        <div className="border-r border-b border-pastel-mint/50" />
                        <div className="border-r border-b border-pastel-mint/50" />
                        <div className="border-b border-pastel-mint/50" />
                        <div className="border-r border-pastel-mint/50" />
                        <div className="border-r border-pastel-mint/50" />
                        <div />
                      </div>
                    )}

                    {/* Corner Accent Marks */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-pastel-mint rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-pastel-mint rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-pastel-mint rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-pastel-mint rounded-br-lg" />

                    {/* Instruction Tag */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-900/80 backdrop-blur-sm text-pastel-mint px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center space-x-1 border border-pastel-mint/30 shadow-lg whitespace-nowrap">
                      <Sparkles className="w-3 h-3" />
                      <span>{language === 'hi' ? 'नियम 2(h) PDP: घोषणाओं को बॉक्स के अंदर रखें' : 'Rule 2(h) PDP: Center label in viewfinder'}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 bg-charcoal-900/90 flex flex-col items-center justify-center text-white space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-pastel-mint" />
              <p className="text-xs font-semibold text-charcoal-300">
                {language === 'hi' ? 'कैमरा शुरू हो रहा है...' : 'Connecting to live camera...'}
              </p>
            </div>
          )}

          {/* Error View */}
          {errorMsg && (
            <div className="absolute inset-0 bg-charcoal-900 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-xs sm:text-sm font-semibold text-charcoal-200 max-w-md">
                {errorMsg}
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 sm:p-5 bg-charcoal-900 border-t border-charcoal-800 flex items-center justify-between">
          
          {/* Flip Camera Switch */}
          {hasMultipleCameras && !capturedPreview && !errorMsg ? (
            <button
              onClick={handleToggleFacingMode}
              className="p-3 rounded-2xl bg-charcoal-800 text-charcoal-200 hover:text-white hover:bg-charcoal-700 transition-all cursor-pointer"
              title="Switch Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-11" />
          )}

          {/* Shutter Button / Confirm Actions */}
          {capturedPreview ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRetake}
                className="px-5 py-2.5 rounded-2xl bg-charcoal-800 hover:bg-charcoal-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पुनः लें' : 'Retake'}</span>
              </button>

              <button
                onClick={handleConfirmPhoto}
                className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-charcoal-950 text-xs font-extrabold shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'hi' ? 'उपयोग करें' : 'Use Photo'}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleCapturePhoto}
              disabled={isLoading || !!errorMsg}
              className="relative group p-1 rounded-full border-4 border-white/40 hover:border-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white group-active:scale-90 transition-transform shadow-lg flex items-center justify-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-charcoal-900 bg-white" />
              </div>
            </button>
          )}

          {/* Cancel */}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-400 hover:text-white transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
