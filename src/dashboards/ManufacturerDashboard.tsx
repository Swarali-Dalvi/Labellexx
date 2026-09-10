import React, { useState } from 'react';
import { 
  Building2, 
  Upload, 
  FileCheck, 
  History, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft,
  Layers,
  FileCheck2,
  Printer,
  Database,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ImageUploadPipeline } from '../components/ImageUploadPipeline';
import { ComplianceReport } from '../components/ComplianceReport';
import { CertificateModal } from '../components/CertificateModal';
import { ComplianceReportData } from '../engine/rules';
import { useSharedStore } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';

interface ManufacturerDashboardProps {
  onOpenSampleSuite: () => void;
}

export const ManufacturerDashboard: React.FC<ManufacturerDashboardProps> = ({ onOpenSampleSuite }) => {
  const { reports, addReport, saveManufacturerCertificate, language } = useSharedStore();
  const t = TRANSLATIONS[language];

  const [activeTab, setActiveTab] = useState<'pre_market' | 'design_history'>('pre_market');
  const [selectedReport, setSelectedReport] = useState<ComplianceReportData | null>(null);
  const [certificateReport, setCertificateReport] = useState<ComplianceReportData | null>(null);
  const [batchNumber, setBatchNumber] = useState('LOT-2026-AUG-44');
  const [designRevision, setDesignRevision] = useState('Packaging Artboard Rev 3.2');

  const mfgReports = reports.filter(r => r.source === 'manufacturer');

  const handleReportGenerated = (newReport: ComplianceReportData) => {
    // Generate cert number and save to shared central store
    saveManufacturerCertificate(newReport, batchNumber);
    setSelectedReport(newReport);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pastel-purple/40 via-cream-100 to-pastel-mint/30 rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pastel-purpleText bg-pastel-purple px-2.5 py-0.5 rounded-full border border-pastel-purpleBorder">
              {t.roleManufacturer} Portal
            </span>
            <span className="text-xs text-charcoal-500">• Pre-Market Certification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Pre-Market Label Compliance & Certification
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl">
            Audit packaging designs before commercial print runs. Verify mandatory legal particulars under LM(PC) Rules 2011 to avoid costly market recalls and compounding fines.
          </p>
        </div>

        <button
          onClick={onOpenSampleSuite}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-cream-100 border border-charcoal-200 text-xs font-bold text-charcoal-800 shadow-soft-sm transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Load Test Design Samples</span>
        </button>
      </div>

      {/* EXECUTIVE FINANCIAL ROI & PENALTIES SAVED METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-charcoal-200 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Pre-Print Defects Caught</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-black text-charcoal-900 block">18 SKUs</span>
          <p className="text-[11px] text-charcoal-500">Zero non-compliant packaging printed</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-charcoal-200 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Sec 36(1) Fines Prevented</span>
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-black text-purple-700 block">₹18.5 Lakhs</span>
          <p className="text-[11px] text-charcoal-500">Calculated across 8 packaging lines</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-charcoal-200 shadow-soft-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Recall Costs Saved</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-black text-emerald-700 block">₹32.0 Lakhs</span>
          <p className="text-[11px] text-charcoal-500">Zero packaging lot scrapping</p>
        </div>
      </div>

      {/* Selected Report View */}
      {selectedReport ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedReport(null)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-charcoal-800 border border-charcoal-200 shadow-soft-sm hover:bg-cream-100 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Designs</span>
            </button>

            {selectedReport.overallStatus === 'PASS' && (
              <button
                onClick={() => setCertificateReport(selectedReport)}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-soft-md transition-all"
              >
                <FileCheck className="w-4 h-4 text-pastel-purple" />
                <span>Generate Official Compliance Certificate</span>
              </button>
            )}
          </div>

          <ComplianceReport 
            report={selectedReport}
            onDownloadCertificate={(rep) => setCertificateReport(rep)}
          />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-3 border-b border-charcoal-200 pb-2">
            <button
              onClick={() => setActiveTab('pre_market')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pre_market'
                  ? 'bg-charcoal-900 text-white shadow-soft-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Pre-Market Check & Artwork Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('design_history')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'design_history'
                  ? 'bg-charcoal-900 text-white shadow-soft-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Certified Designs History ({mfgReports.length})</span>
            </button>
          </div>

          {/* Tab 1: Pre-Market Verification Upload */}
          {activeTab === 'pre_market' && (
            <div className="space-y-6">
              
              {/* Design & Batch Details */}
              <div className="bg-white p-5 rounded-2xl border border-charcoal-200 shadow-soft-sm grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Packaging Design / Artwork Reference</label>
                  <input
                    type="text"
                    value={designRevision}
                    onChange={(e) => setDesignRevision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-cream-50 focus:bg-white text-charcoal-900 font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">Manufacturing Lot / Batch ID</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-cream-50 focus:bg-white text-charcoal-900 font-medium"
                  />
                </div>
              </div>

              {/* Master ERP & GS1 DataKart Cross-Referencing Panel */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-purple-950 block">GS1 DataKart & SAP S/4HANA Master Cross-Referencing: Active</span>
                    <p className="text-[11px] text-purple-800">
                      OCR declarations will be automatically verified against your master SKU database (GTIN-13 / MRP / Net Weight).
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-white border border-purple-300 text-purple-900 flex items-center space-x-1">
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>ERP Connected</span>
                  </span>
                </div>
              </div>

              {/* Upload Pipeline */}
              <ImageUploadPipeline
                onReportGenerated={handleReportGenerated}
                source="manufacturer"
                manufacturerBatch={batchNumber}
                category="Pre-Market Packaging Verification"
              />
            </div>
          )}

          {/* Tab 2: Design History */}
          {activeTab === 'design_history' && (
            <div className="space-y-4">
              {mfgReports.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white rounded-3xl border border-charcoal-200 shadow-soft-sm space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-cream-100 border border-charcoal-200 flex items-center justify-center mx-auto text-charcoal-500">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-900">No packaging designs certified yet</h3>
                  <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                    Upload your first pre-market label artwork to run the Legal Metrology compliance engine.
                  </p>
                  <button
                    onClick={() => setActiveTab('pre_market')}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold shadow-soft-sm hover:bg-charcoal-800"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Artwork</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mfgReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-2xl p-5 border border-charcoal-200 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                            {report.sourceMetadata?.certificateNumber || report.id}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            report.overallStatus === 'PASS' ? 'bg-pastel-mint text-pastel-mintText' : 'bg-pastel-coral text-pastel-coralText'
                          }`}>
                            {report.overallStatus}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-charcoal-900 mb-1 line-clamp-1">
                          {report.productName}
                        </h4>
                        <p className="text-xs text-charcoal-500 mb-3">
                          Batch: {report.sourceMetadata?.manufacturerBatch || 'N/A'} • {new Date(report.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-charcoal-100 text-xs">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="font-bold text-charcoal-800 hover:underline"
                        >
                          View Full Audit
                        </button>
                        <button
                          onClick={() => setCertificateReport(report)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold border border-purple-200"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Certificate</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Downloadable Certificate Modal */}
      {certificateReport && (
        <CertificateModal
          report={certificateReport}
          onClose={() => setCertificateReport(null)}
        />
      )}

    </div>
  );
};
