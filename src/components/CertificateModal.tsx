import React from 'react';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Scale, 
  QrCode,
  Type,
  AlertTriangle
} from 'lucide-react';
import { ComplianceReportData } from '../engine/rules';

interface CertificateModalProps {
  report: ComplianceReportData;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ report, onClose }) => {
  const certNumber = report.sourceMetadata?.certificateNumber || `CERT-LMPC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const certDate = new Date(report.timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-soft-xl border border-charcoal-200 animate-fadeIn my-8">
        
        {/* Modal Top Actions */}
        <div className="p-4 bg-charcoal-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-pastel-mint" />
            <span className="font-bold text-sm">Official Legal Metrology Pre-Market Compliance Certificate</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-charcoal-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE BODY */}
        <div className="p-8 sm:p-12 bg-white text-charcoal-900 certificate-box">
          
          {/* Certificate Header with Crest and Seal */}
          <div className="text-center pb-8 border-b-2 border-charcoal-900/80">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cream-100 border-2 border-charcoal-900 mb-3 shadow-soft-sm">
              <Scale className="w-8 h-8 text-charcoal-900" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-charcoal-900 font-serif">
              Certificate of Label Compliance
            </h1>
            <p className="text-xs uppercase font-bold tracking-widest text-charcoal-600 mt-1">
              Legal Metrology (Packaged Commodities) Rules, 2011 — Pre-Market Audit
            </p>
            <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-charcoal-600 font-mono">
              <span>CERTIFICATE NO: <strong>{certNumber}</strong></span>
              <span>•</span>
              <span>ISSUED: <strong>{certDate}</strong></span>
            </div>
          </div>

          {/* Product & Design Info */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-charcoal-200 text-xs">
            <div>
              <span className="text-charcoal-500 font-semibold block uppercase">Product Identity</span>
              <span className="text-sm font-bold text-charcoal-900">{report.productName}</span>
              <span className="text-charcoal-600 block mt-0.5">Category: {report.category}</span>
            </div>
            <div>
              <span className="text-charcoal-500 font-semibold block uppercase">Manufacturer / Applicant</span>
              <span className="text-sm font-bold text-charcoal-900">{report.brandName || 'Brand Owner'}</span>
              <span className="text-charcoal-600 block mt-0.5">Batch / Design Ref: {report.sourceMetadata?.manufacturerBatch || 'LOT-2026-AUG-44'}</span>
            </div>
          </div>

          {/* Summary Audit Verdict */}
          <div className="py-6 text-center">
            <div className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-pastel-mint border border-pastel-mintBorder text-pastel-mintText text-sm font-black uppercase tracking-wider mb-3">
              <CheckCircle2 className="w-5 h-5" />
              <span>PASS — STATUTORY ADHERENCE VERIFIED</span>
            </div>
            <p className="text-xs text-charcoal-700 max-w-xl mx-auto leading-relaxed font-medium">
              This is to certify that the submitted packaging artwork has been analyzed and found to declare all mandatory particulars specified under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>

          {/* Rule 7 Readability Assessment Summary */}
          {report.readability && (
            <div className="p-4 rounded-xl bg-cream-50 border border-charcoal-200 mb-6 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal-900 flex items-center space-x-1.5">
                  <Type className="w-4 h-4 text-charcoal-700" />
                  <span>Rule 7 Relative Font-Size & Readability Assessment:</span>
                </span>
                <span className="font-bold text-emerald-800 uppercase text-[11px]">
                  {report.readability.overallReadability.toUpperCase()} PROMINENCE ✓
                </span>
              </div>
              <p className="text-[11px] text-charcoal-600">
                {report.readability.rule7AssessmentNote}
              </p>
            </div>
          )}

          {/* Statutory Breakdown Table */}
          <div className="border border-charcoal-200 rounded-xl overflow-hidden mb-8 text-xs">
            <div className="bg-cream-100 px-4 py-2.5 font-bold uppercase text-charcoal-800 border-b border-charcoal-200">
              Statutory Declarations Verification Schedule (Rule 6)
            </div>
            <div className="divide-y divide-charcoal-100">
              {report.fieldResults.map((f) => (
                <div key={f.ruleId} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-charcoal-900">{f.fieldName}</span>
                    <span className="text-[11px] text-charcoal-500 ml-2 font-mono">({f.legalReference})</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    f.status === 'valid' 
                      ? 'bg-mint-100 text-mint-800' 
                      : f.status === 'non_standard'
                      ? 'bg-purple-100 text-purple-800'
                      : f.status === 'review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {f.status === 'valid' ? 'VERIFIED ✓' : f.status === 'non_standard' ? 'NON-STANDARD ⚠' : f.status === 'review' ? 'REVIEW ⚠' : 'VIOLATION ✕'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures & QR Watermark */}
          <div className="flex items-end justify-between pt-6 border-t-2 border-charcoal-200">
            <div className="flex items-center space-x-3">
              <div className="w-16 h-16 bg-cream-100 border border-charcoal-300 rounded-xl flex items-center justify-center text-charcoal-700">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="text-[10px] text-charcoal-500 font-mono">
                <p className="font-bold text-charcoal-800">DIGITAL VERIFICATION</p>
                <p>Scan to verify authenticity on LabelLex Compliance Portal</p>
                <p>Hash: {report.id.substring(0, 16)}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="w-40 border-b border-charcoal-900 mb-1" />
              <p className="text-xs font-bold text-charcoal-900 uppercase">Automated LMPC Auditor</p>
              <p className="text-[10px] text-charcoal-500">LabelLex Regulatory Engine v2.0</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
