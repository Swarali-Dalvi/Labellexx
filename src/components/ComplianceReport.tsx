import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Package, 
  Scale, 
  Calendar, 
  Tag, 
  Headphones, 
  Percent, 
  Globe, 
  Printer, 
  Download, 
  FileWarning, 
  Info, 
  Layers,
  ShieldCheck,
  Type,
  Camera,
  Plus,
  Image as ImageIcon,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { ComplianceReportData, SupportingEvidence } from '../engine/rules';
import { useSharedStore } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';
import { optimizeImage } from '../engine/imageOptimizer';

interface ComplianceReportProps {
  report: ComplianceReportData;
  onReportViolation?: (reportId: string) => void;
  onDownloadCertificate?: (report: ComplianceReportData) => void;
  onSaveCase?: (report: ComplianceReportData) => void;
  showRoleActions?: boolean;
}

export const ComplianceReport: React.FC<ComplianceReportProps> = ({
  report,
  onReportViolation,
  onDownloadCertificate,
  onSaveCase,
  showRoleActions = true
}) => {
  const { currentRole, currentUser, language, addSupportingEvidenceToReport } = useSharedStore();
  const t = TRANSLATIONS[language];
  const [isRawOcrOpen, setIsRawOcrOpen] = useState(false);
  const [selectedImageTab, setSelectedImageTab] = useState<number>(0);
  const [reportedGrievanceId, setReportedGrievanceId] = useState<string | null>(
    report.sourceMetadata?.grievanceId || null
  );

  // Supporting Evidence Modal State
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidencePhotoFile, setEvidencePhotoFile] = useState<File | null>(null);
  const [evidenceDataUrl, setEvidenceDataUrl] = useState<string | null>(null);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidenceCategory, setEvidenceCategory] = useState<SupportingEvidence['category']>('shelf_placement');
  const [isAttachingEvidence, setIsAttachingEvidence] = useState(false);

  // Helper to render contextual icons for each field
  const renderFieldIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-4 h-4 text-charcoal-700" />;
      case 'Package': return <Package className="w-4 h-4 text-charcoal-700" />;
      case 'Scale': return <Scale className="w-4 h-4 text-charcoal-700" />;
      case 'Calendar': return <Calendar className="w-4 h-4 text-charcoal-700" />;
      case 'Tag': return <Tag className="w-4 h-4 text-charcoal-700" />;
      case 'Headphones': return <Headphones className="w-4 h-4 text-charcoal-700" />;
      case 'Percent': return <Percent className="w-4 h-4 text-charcoal-700" />;
      case 'Globe': return <Globe className="w-4 h-4 text-charcoal-700" />;
      default: return <Info className="w-4 h-4 text-charcoal-700" />;
    }
  };

  const handleTriggerReportViolation = () => {
    if (onReportViolation) {
      onReportViolation(report.id);
      setReportedGrievanceId(`GRV-2026-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  };

  const handleEvidencePhotoSelect = async (file: File) => {
    try {
      const optimized = await optimizeImage(file, 'Single', `evidence_${Date.now()}.jpg`);
      setEvidencePhotoFile(file);
      setEvidenceDataUrl(optimized.dataUrl);
    } catch (e: any) {
      alert(e.message || 'Failed to process evidence image.');
    }
  };

  const handleSaveEvidence = () => {
    if (!evidenceDataUrl) {
      alert(language === 'hi' ? 'कृपया साक्ष्य फोटो अपलोड करें।' : 'Please select an evidence photo.');
      return;
    }

    setIsAttachingEvidence(true);
    addSupportingEvidenceToReport(report.id, {
      dataUrl: evidenceDataUrl,
      fileName: evidencePhotoFile?.name || 'evidence.jpg',
      note: evidenceNote || (language === 'hi' ? 'ऑन-साइट प्रासंगिक साक्ष्य' : 'On-site contextual documentation'),
      category: evidenceCategory,
      uploaderRole: (currentRole !== 'landing' ? currentRole : 'consumer'),
      uploaderName: currentUser?.name || 'Inspector'
    });

    setIsAttachingEvidence(false);
    setIsEvidenceModalOpen(false);
    setEvidencePhotoFile(null);
    setEvidenceDataUrl(null);
    setEvidenceNote('');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LabelLex_Report_${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ["Rule ID", "Field Number", "Field Name", "Legal Reference", "Status", "Confidence", "Normalized Value", "Observed Panel", "Notes"];
    const rows = report.fieldResults.map(f => [
      `"${f.ruleId}"`,
      f.fieldNumber,
      `"${f.fieldName.replace(/"/g, '""')}"`,
      `"${f.legalReference.replace(/"/g, '""')}"`,
      `"${f.status}"`,
      `"${f.confidence}"`,
      `"${f.normalizedValue.replace(/"/g, '""')}"`,
      `"${f.foundOnImage}"`,
      `"${f.notes.replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(','), ...rows.map(r => r.join(','))].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `LabelLex_Audit_${report.id}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-3xl border border-charcoal-200 shadow-soft-lg p-6 sm:p-10 fade-in space-y-8">
      
      {/* Top Header & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold text-charcoal-500 bg-cream-100 px-2 py-0.5 rounded-md border border-charcoal-200">
              {report.id}
            </span>
            <span className="text-xs text-charcoal-500">
              {new Date(report.timestamp).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight mt-1">
            {report.productName}
          </h2>
          <div className="flex items-center space-x-3 mt-1 text-xs text-charcoal-600">
            <span>{t.brand}: <strong>{report.brandName || t.packagedCommodity}</strong></span>
            <span>•</span>
            <span>{t.category}: <strong>{report.category}</strong></span>
            {report.sourceMetadata?.officerId && (
              <>
                <span>•</span>
                <span>{t.officerLabel}: <strong>{report.sourceMetadata.officerId}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Print / Utility Actions */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-charcoal-700 bg-cream-100 hover:bg-cream-200 border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printReport} / PDF</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-charcoal-700 bg-cream-100 hover:bg-cream-200 border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer"
            title="Download Editable JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-charcoal-700 bg-cream-100 hover:bg-cream-200 border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer"
            title="Download Editable CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* PROMINENT OVERALL PASS / FAIL / REVIEW BADGE */}
      <div className="p-6 sm:p-8 rounded-3xl border shadow-soft-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          backgroundColor: report.overallStatus === 'PASS' 
            ? '#F0FDF4' 
            : report.overallStatus === 'FAIL' 
            ? '#FFF1F2' 
            : '#FFFBEB',
          borderColor: report.overallStatus === 'PASS' 
            ? '#BBF7D0' 
            : report.overallStatus === 'FAIL' 
            ? '#FECDD3' 
            : '#FDE68A'
        }}
      >
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            {report.overallStatus === 'PASS' && (
              <div className="w-12 h-12 rounded-2xl bg-mint-500 text-white flex items-center justify-center shadow-soft-sm shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            )}
            {report.overallStatus === 'FAIL' && (
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-soft-sm shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
            )}
            {report.overallStatus === 'REVIEW' && (
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-soft-sm shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
            )}

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500 block">
                {t.overallVerdict}
              </span>
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
                report.overallStatus === 'PASS' ? 'text-mint-800' : report.overallStatus === 'FAIL' ? 'text-rose-800' : 'text-amber-800'
              }`}>
                {report.overallStatus === 'PASS' ? t.statusPass : report.overallStatus === 'FAIL' ? t.statusFail : t.statusReview}
              </span>
            </div>
          </div>

          <p className="text-sm text-charcoal-700 leading-relaxed font-medium pt-1 max-w-2xl">
            {report.summarySentence}
          </p>
        </div>

        {/* Quick Stats 4-Pill (Valid, Review, Missing, Non-Standard) */}
        <div className="flex items-center space-x-3 bg-white/95 p-4 rounded-2xl border border-charcoal-200 shadow-soft-sm shrink-0">
          <div className="text-center px-1.5">
            <span className="text-2xl font-black text-mint-700 block">{report.validFieldsCount}</span>
            <span className="text-[10px] font-bold text-charcoal-500 uppercase">{t.validCount}</span>
          </div>
          <div className="w-px h-8 bg-charcoal-200" />
          <div className="text-center px-1.5">
            <span className="text-2xl font-black text-amber-600 block">{report.reviewFieldsCount}</span>
            <span className="text-[10px] font-bold text-charcoal-500 uppercase">{t.reviewCount}</span>
          </div>
          <div className="w-px h-8 bg-charcoal-200" />
          <div className="text-center px-1.5">
            <span className="text-2xl font-black text-purple-700 block">{report.nonStandardFieldsCount || 0}</span>
            <span className="text-[10px] font-bold text-charcoal-500 uppercase">{t.nonStandardCount}</span>
          </div>
          <div className="w-px h-8 bg-charcoal-200" />
          <div className="text-center px-1.5">
            <span className="text-2xl font-black text-rose-600 block">{report.violationFieldsCount}</span>
            <span className="text-[10px] font-bold text-charcoal-500 uppercase">{t.failingCount}</span>
          </div>
        </div>
      </div>

      {/* Uploaded Package Images Thumbnails */}
      {report.images && report.images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-charcoal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
              {t.scannedPanels} ({report.images.length})
            </span>
          </div>

          <div className="flex flex-wrap gap-4">
            {report.images.map((img, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden border border-charcoal-200 bg-charcoal-900 shadow-soft-sm group">
                <img 
                  src={img.dataUrl} 
                  alt={`${img.panel} panel preview`} 
                  className="w-44 h-32 object-contain" 
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-bold bg-white/90 text-charcoal-900 shadow-soft-sm">
                  {img.panel === 'Front' ? t.frontPanel : img.panel === 'Back' ? t.backPanel : img.panel === 'Side' ? t.sidePanel : img.panel}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-charcoal-900/80 text-white">
                  {img.ocrCharCount} {t.charsExtracted}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RULE 7 FONT SIZE & READABILITY ASSESSMENT CARD (SIH Requirement 3) */}
      {report.readability && (
        <div className="p-6 rounded-3xl border border-charcoal-200 bg-cream-50/80 space-y-4 shadow-soft-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-charcoal-200/70 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-xl bg-charcoal-900 text-pastel-mint">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal-900">{t.readabilityTitle}</h3>
                <p className="text-[11px] text-charcoal-500">{t.readabilitySubtitle}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                report.readability.overallReadability === 'good'
                  ? 'bg-pastel-mint text-pastel-mintText border-pastel-mintBorder'
                  : report.readability.overallReadability === 'moderate'
                  ? 'bg-pastel-amber text-pastel-amberText border-pastel-amberBorder'
                  : 'bg-pastel-coral text-pastel-coralText border-pastel-coralBorder'
              }`}>
                {report.readability.overallReadability === 'good' ? t.readabilityGood : report.readability.overallReadability === 'moderate' ? t.readabilityModerate : t.readabilityConcern}
              </span>
            </div>
          </div>

          <p className="text-xs text-charcoal-700 font-medium">
            {report.readability.rule7AssessmentNote}
          </p>

          {/* Grid of Key Declaration Font Height Prominences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {report.readability.items.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-2xl border border-charcoal-200 space-y-1.5 shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900">{item.fieldName}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.prominenceStatus === 'prominent' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : item.prominenceStatus === 'acceptable'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {item.prominenceStatus === 'prominent' ? t.readabilityProminent : item.prominenceStatus === 'acceptable' ? t.readabilityAcceptable : t.readabilityConcern}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                  <span>Measured: ~{item.pixelHeight}px</span>
                  <span>Prominence: <strong>{Math.round(item.relativeProminenceRatio * 100)}%</strong></span>
                </div>
                <p className="text-[10px] text-charcoal-600 leading-tight">
                  {item.assessmentNote}
                </p>
              </div>
            ))}
          </div>

          {/* Honest Readability Measurement Disclaimer */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <p className="font-medium">
              <strong>{language === 'hi' ? 'पारदर्शिता सूचना:' : 'Assessment Notice:'}</strong> {t.readabilityDisclaimer}
            </p>
          </div>
        </div>
      )}

      {/* RULE 2(h) & RULE 8 PLACEMENT OF DECLARATIONS ASSESSMENT */}
      {report.placement && (
        <div className="p-5 sm:p-6 rounded-3xl bg-pastel-blue/20 border border-pastel-blueBorder space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-pastel-blueBorder/60">
            <div>
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-pastel-blueText" />
                <h3 className="text-sm sm:text-base font-extrabold text-charcoal-900">
                  {t.placementTitle}
                </h3>
              </div>
              <p className="text-xs text-charcoal-600 mt-0.5">
                {t.placementSubtitle}
              </p>
            </div>

            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              report.placement.overallPlacement === 'compliant'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : report.placement.overallPlacement === 'acceptable'
                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {report.placement.overallPlacement === 'compliant' 
                  ? t.placementCompliant 
                  : report.placement.overallPlacement === 'acceptable' 
                  ? t.placementAcceptable 
                  : t.placementReview}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {report.placement.items.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-white rounded-2xl border border-charcoal-200 space-y-1.5 shadow-soft-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900 truncate" title={item.fieldName}>
                    {item.fieldNumber}. {item.fieldName}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.placementStatus === 'compliant'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : item.placementStatus === 'acceptable'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {item.placementStatus === 'compliant' ? 'Compliant' : item.placementStatus === 'acceptable' ? 'Acceptable' : 'Review'}
                  </span>
                </div>
                <div className="text-[11px] text-charcoal-600 space-y-0.5">
                  <p>Target: <strong>{item.expectedPanel}</strong></p>
                  <p>Found On: <strong className="text-charcoal-900">{item.observedPanel}</strong></p>
                </div>
                <p className="text-[10px] text-charcoal-500 leading-tight pt-1 border-t border-charcoal-100">
                  {item.notes}
                </p>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-[11px] text-sky-950 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
            <p className="font-medium">
              <strong>{language === 'hi' ? 'वैधानिक विनिर्देश:' : 'Statutory Reference:'}</strong> {report.placement.rule8AssessmentNote}
            </p>
          </div>
        </div>
      )}

      {/* Field-by-Field Statutory Audit Table (Rule 6) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-charcoal-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-mint-700" />
            <span>{t.fieldAuditTitle}</span>
          </h3>
          <span className="text-xs text-charcoal-500 font-bold">
            {t.declarationsAudited}
          </span>
        </div>

        {/* Mobile Field Cards (Phone screens < 640px) */}
        <div className="sm:hidden space-y-3">
          {report.fieldResults.map((field) => {
            const isValid = field.status === 'valid';
            const isViolation = field.status === 'violation';
            const isReview = field.status === 'review';
            const isNonStandard = field.status === 'non_standard';

            return (
              <div 
                key={field.ruleId} 
                className={`p-4 rounded-2xl border transition-all ${
                  isValid 
                    ? 'bg-white border-charcoal-200' 
                    : isNonStandard
                    ? 'bg-purple-50/60 border-purple-200'
                    : isViolation 
                    ? 'bg-rose-50/60 border-rose-200' 
                    : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-cream-100 border border-charcoal-200 flex items-center justify-center font-bold text-xs text-charcoal-700">
                      {field.fieldNumber}
                    </span>
                    <span className="font-bold text-xs text-charcoal-900">
                      {language === 'hi' ? field.fieldHindiName : field.fieldName}
                    </span>
                  </div>
                  {isValid && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pastel-mint text-pastel-mintText border border-pastel-mintBorder">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t.statusValid}</span>
                    </span>
                  )}
                  {isNonStandard && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{t.statusNonStandard}</span>
                    </span>
                  )}
                  {isReview && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pastel-amber text-pastel-amberText border border-pastel-amberBorder">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{t.statusNeedsReview}</span>
                    </span>
                  )}
                  {isViolation && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pastel-coral text-pastel-coralText border border-pastel-coralBorder">
                      <XCircle className="w-3 h-3" />
                      <span>{t.statusViolation}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-charcoal-900 bg-white/90 p-2.5 rounded-xl border border-charcoal-200">
                    {field.normalizedValue}
                  </p>
                  {field.extractedRawText && field.extractedRawText !== field.normalizedValue && (
                    <p className="text-[11px] text-charcoal-500 italic px-1">
                      {t.rawOcrLabel}: "{field.extractedRawText}"
                    </p>
                  )}
                  {field.notes && (
                    <p className="text-[11px] text-charcoal-600 px-1 font-medium">
                      {field.notes}
                    </p>
                  )}
                  {field.correctionGuidance && !isValid && (
                    <div className="p-2.5 rounded-xl bg-pastel-amber/60 border border-pastel-amberBorder text-pastel-amberText text-[11px] font-medium mt-1">
                      <strong>{t.correctionLabel}:</strong> {field.correctionGuidance}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-charcoal-100 text-[10px] text-charcoal-500">
                  <span>{t.panelLabel}: <strong>{field.foundOnImage}</strong></span>
                  <span>{t.confidenceLabel}: <strong>{field.confidence === 'high' ? t.highConf : field.confidence === 'medium' ? t.medConf : t.lowConf}</strong></span>
                  <span className="font-mono text-charcoal-400">{field.legalReference.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Audit Table (Screen >= 640px) */}
        <div className="hidden sm:block overflow-x-auto rounded-2xl border border-charcoal-200 shadow-soft-sm">
          <table className="min-w-full divide-y divide-charcoal-200 text-left text-xs">
            <thead className="bg-cream-100/90 text-charcoal-700 font-bold uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-4 py-3.5">{t.colNumber}</th>
                <th scope="col" className="px-4 py-3.5">{t.colFieldRule}</th>
                <th scope="col" className="px-4 py-3.5">{t.colExtractedValue}</th>
                <th scope="col" className="px-4 py-3.5">{t.colPanel}</th>
                <th scope="col" className="px-4 py-3.5">{t.colConfidence}</th>
                <th scope="col" className="px-4 py-3.5">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 bg-white">
              {report.fieldResults.map((field) => {
                const isValid = field.status === 'valid';
                const isViolation = field.status === 'violation';
                const isReview = field.status === 'review';
                const isNonStandard = field.status === 'non_standard';

                return (
                  <tr key={field.ruleId} className="hover:bg-cream-50/70 transition-colors">
                    
                    {/* Index */}
                    <td className="px-4 py-4 font-mono font-bold text-charcoal-500">
                      {field.fieldNumber}
                    </td>

                    {/* Field Name & Legal Citation */}
                    <td className="px-4 py-4 max-w-xs">
                      <div className="flex items-start space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cream-100 border border-charcoal-200 flex items-center justify-center shrink-0 mt-0.5">
                          {renderFieldIcon(field.iconName)}
                        </div>
                        <div>
                          <span className="font-bold text-charcoal-900 block text-xs">
                            {language === 'hi' ? field.fieldHindiName : field.fieldName}
                          </span>
                          <span className="text-[11px] text-charcoal-500 font-medium block">
                            {field.legalReference}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Extracted Value */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-charcoal-900 text-xs">
                          {field.normalizedValue}
                        </p>
                        {field.extractedRawText && field.extractedRawText !== field.normalizedValue && (
                          <p className="text-[11px] text-charcoal-500 italic">
                            {t.rawOcrLabel}: "{field.extractedRawText}"
                          </p>
                        )}
                        {field.notes && (
                          <p className="text-[11px] text-charcoal-600 font-medium">
                            {field.notes}
                          </p>
                        )}
                        {field.correctionGuidance && !isValid && (
                          <div className="p-2 rounded-lg bg-pastel-amber/50 border border-pastel-amberBorder text-pastel-amberText text-[11px] font-medium mt-1.5">
                            <strong>{t.correctionGuidanceLabel}:</strong> {field.correctionGuidance}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Panel Origin */}
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cream-100 text-charcoal-700 border border-charcoal-200">
                        {field.foundOnImage}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        field.confidence === 'high' 
                          ? 'bg-mint-100 text-mint-800 border border-mint-200' 
                          : field.confidence === 'medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {field.confidence === 'high' ? t.highConf : field.confidence === 'medium' ? t.medConf : t.lowConf}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      {isValid && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pastel-mint text-pastel-mintText border border-pastel-mintBorder">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.statusValid}</span>
                        </span>
                      )}
                      {isNonStandard && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{t.statusNonStandard}</span>
                        </span>
                      )}
                      {isReview && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pastel-amber text-pastel-amberText border border-pastel-amberBorder">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{t.statusNeedsReview}</span>
                        </span>
                      )}
                      {isViolation && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-pastel-coral text-pastel-coralText border border-pastel-coralBorder">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{t.statusViolation}</span>
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPPORTING EVIDENCE GALLERY & ATTACHMENT (SIH Requirement 6) */}
      <div className="p-6 rounded-3xl border border-charcoal-200 bg-white space-y-4 shadow-soft-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-charcoal-700" />
              <span>{t.evidenceTitle}</span>
            </h3>
            <p className="text-[11px] text-charcoal-500">{t.evidenceSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsEvidenceModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold shadow-soft-sm hover:bg-charcoal-800 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5 text-pastel-mint" />
            <span>{t.addEvidence}</span>
          </button>
        </div>

        {report.supportingEvidence && report.supportingEvidence.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {report.supportingEvidence.map((ev) => (
              <div key={ev.id} className="rounded-2xl border border-charcoal-200 overflow-hidden bg-cream-50/60 shadow-soft-sm">
                <div className="relative aspect-video bg-charcoal-900">
                  <img src={ev.dataUrl} alt="Supporting Evidence Photo" className="w-full h-full object-contain" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-charcoal-900/80 text-white capitalize">
                    {ev.category?.replace('_', ' ') || 'Documentation'}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium text-charcoal-800 line-clamp-2">
                    "{ev.note}"
                  </p>
                  <p className="text-[10px] text-charcoal-400">
                    Attached by {ev.uploaderName || ev.uploaderRole} • {new Date(ev.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-cream-50 border border-charcoal-100 text-center text-xs text-charcoal-500">
            {t.noEvidenceYet}
          </div>
        )}
      </div>

      {/* Collapsible Raw Extracted OCR Text Section */}
      <div className="rounded-2xl border border-charcoal-200 bg-cream-50 overflow-hidden shadow-soft-sm">
        <button
          type="button"
          onClick={() => setIsRawOcrOpen(!isRawOcrOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-cream-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <FileWarning className="w-4 h-4 text-charcoal-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
              {t.rawTextTitle} ({report.images?.reduce((acc, img) => acc + img.ocrCharCount, 0) || report.mergedRawOcrText.length} {t.charsTotal})
            </span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-charcoal-500 font-bold">
            <span>{isRawOcrOpen ? t.hideOcr : t.showOcr}</span>
            {isRawOcrOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isRawOcrOpen && (
          <div className="p-4 border-t border-charcoal-200 bg-white space-y-3">
            {report.images && report.images.length > 1 && (
              <div className="flex space-x-2 border-b border-charcoal-100 pb-2">
                {report.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageTab(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedImageTab === idx 
                        ? 'bg-charcoal-900 text-white' 
                        : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                    }`}
                  >
                    {img.panel} {t.colPanel} OCR ({img.ocrCharCount} {t.charsExtracted})
                  </button>
                ))}
              </div>
            )}

            <pre className="p-4 rounded-xl bg-charcoal-900 text-cream-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
              {report.images && report.images[selectedImageTab]
                ? report.images[selectedImageTab].ocrRawText
                : report.mergedRawOcrText}
            </pre>
          </div>
        )}
      </div>

      {/* Honest Scope Disclaimer */}
      <div className="p-4 rounded-2xl bg-cream-100 border border-charcoal-200 text-xs text-charcoal-600 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-charcoal-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-charcoal-800">{t.scopeNoticeTitle}</p>
          <p className="text-[11px] text-charcoal-600 mt-0.5">
            {t.disclaimerFontPDP} {t.scopeNoticeDesc}
          </p>
        </div>
      </div>

      {/* Role-Specific Action Buttons */}
      {showRoleActions && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-charcoal-200 no-print">
          
          {/* Consumer Violation Reporting */}
          {currentRole === 'consumer' && report.overallStatus !== 'PASS' && (
            <div>
              {reportedGrievanceId ? (
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-pastel-mint border border-pastel-mintBorder text-pastel-mintText text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.reportedToEnforcement} <strong>{reportedGrievanceId}</strong></span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleTriggerReportViolation}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-soft-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
                >
                  <FileWarning className="w-4 h-4" />
                  <span>{t.reportViolation}</span>
                </button>
              )}
            </div>
          )}

          {/* Manufacturer Download Certificate */}
          {currentRole === 'manufacturer' && (
            <button
              type="button"
              onClick={() => onDownloadCertificate && onDownloadCertificate(report)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-soft-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-pastel-purple" />
              <span>{t.downloadCert}</span>
            </button>
          )}

          {/* Officer Save Case */}
          {currentRole === 'officer' && (
            <button
              type="button"
              onClick={() => onSaveCase && onSaveCase(report)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold shadow-soft-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-pastel-mint" />
              <span>{t.saveCase}</span>
            </button>
          )}

          {/* Enforcement View Metadata */}
          {currentRole === 'enforcement' && (
            <div className="text-xs text-charcoal-500 font-medium">
              {t.sourceLabel}: <strong className="capitalize">{report.source}</strong>
              {report.sourceMetadata?.officerId && ` • ${t.officerLabel}: ${report.sourceMetadata.officerId}`}
              {report.sourceMetadata?.grievanceId && ` • ${t.refLabel}: ${report.sourceMetadata.grievanceId}`}
            </div>
          )}

        </div>
      )}

      {/* Add Supporting Evidence Modal */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-fadeIn no-print">
          <div className="bg-white w-full max-w-md rounded-3xl border border-charcoal-200 shadow-soft-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-charcoal-100 pb-3">
              <h4 className="text-sm font-extrabold text-charcoal-900 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-charcoal-700" />
                <span>{t.addEvidence}</span>
              </h4>
              <button 
                onClick={() => setIsEvidenceModalOpen(false)}
                className="text-charcoal-400 hover:text-charcoal-800 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Evidence Category */}
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">
                  {t.evidenceCategory}
                </label>
                <select
                  value={evidenceCategory}
                  onChange={(e) => setEvidenceCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-cream-50 font-medium outline-none"
                >
                  <option value="shelf_placement">Shelf Placement & Supermarket Context</option>
                  <option value="price_tag">Shelf Price Tag / Overstickered MRP</option>
                  <option value="damaged_packaging">Damaged / Obscured Packaging</option>
                  <option value="receipt">Store Invoice / Purchase Receipt</option>
                  <option value="other">Other Supporting Material</option>
                </select>
              </div>

              {/* Photo Input */}
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">
                  {t.evidencePhoto} *
                </label>
                {evidenceDataUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-charcoal-900 border border-charcoal-200">
                    <img src={evidenceDataUrl} alt="Evidence preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => { setEvidenceDataUrl(null); setEvidencePhotoFile(null); }}
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] cursor-pointer"
                    >
                      {t.remove}
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <label className="flex-1 flex items-center justify-center space-x-1.5 p-3 rounded-xl border-2 border-dashed border-charcoal-200 bg-cream-50 hover:bg-cream-100 cursor-pointer text-charcoal-700 font-bold">
                      <ImageIcon className="w-4 h-4" />
                      <span>{t.gallery}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleEvidencePhotoSelect(e.target.files[0]);
                          }
                          e.target.value = '';
                        }} 
                      />
                    </label>
                    <label className="flex-1 flex items-center justify-center space-x-1.5 p-3 rounded-xl bg-charcoal-900 text-white font-bold cursor-pointer">
                      <Camera className="w-4 h-4 text-pastel-mint" />
                      <span>{t.camera}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleEvidencePhotoSelect(e.target.files[0]);
                          }
                          e.target.value = '';
                        }} 
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Observation Note */}
              <div>
                <label className="font-bold text-charcoal-700 block mb-1">
                  {t.evidenceNote}
                </label>
                <textarea
                  rows={3}
                  value={evidenceNote}
                  onChange={(e) => setEvidenceNote(e.target.value)}
                  placeholder="e.g. Price sticker was pasted over the original manufacturer MRP on retail shelf."
                  className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-white font-medium outline-none focus:ring-2 focus:ring-charcoal-900"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-charcoal-200 font-bold text-charcoal-600 hover:bg-cream-100 cursor-pointer"
                >
                  {t.close}
                </button>
                <button
                  type="button"
                  onClick={handleSaveEvidence}
                  disabled={!evidenceDataUrl || isAttachingEvidence}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-soft-sm transition-all ${
                    evidenceDataUrl && !isAttachingEvidence 
                      ? 'bg-charcoal-900 hover:bg-charcoal-800 cursor-pointer' 
                      : 'bg-charcoal-300 cursor-not-allowed'
                  }`}
                >
                  {t.save}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
