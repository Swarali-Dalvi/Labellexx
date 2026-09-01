import React, { useState } from 'react';
import { 
  Briefcase, 
  Camera, 
  MapPin, 
  ShieldCheck, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Save, 
  ArrowLeft,
  Sparkles,
  Search,
  Plus
} from 'lucide-react';
import { ImageUploadPipeline } from '../components/ImageUploadPipeline';
import { ComplianceReport } from '../components/ComplianceReport';
import { ComplianceReportData } from '../engine/rules';
import { useSharedStore } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';

interface OfficerDashboardProps {
  onOpenSampleSuite: () => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ onOpenSampleSuite }) => {
  const { reports, currentUser, saveOfficerInspection, language } = useSharedStore();
  const t = TRANSLATIONS[language];

  // Officer field metadata state derived from authenticated user
  const [officerId, setOfficerId] = useState(currentUser?.badgeNumber || 'LM-MH-8821');
  const [marketLocation, setMarketLocation] = useState(currentUser?.jurisdiction || 'Crawford Market, Mumbai');
  const [actionTaken, setActionTaken] = useState<'No Action' | 'Warning Issued' | 'Samples Seized' | 'Compounding Notice'>('Warning Issued');
  const [inspectionNotes, setInspectionNotes] = useState('On-site inspection under Section 15 of Legal Metrology Act, 2009.');

  // Navigation state
  const [activeTab, setActiveTab] = useState<'inspection' | 'case_history'>('inspection');
  const [generatedReport, setGeneratedReport] = useState<ComplianceReportData | null>(null);
  const [selectedHistoricalReport, setSelectedHistoricalReport] = useState<ComplianceReportData | null>(null);
  const [isCaseSaved, setIsCaseSaved] = useState(false);

  const officerCases = reports.filter(r => r.source === 'officer');

  const handleReportGenerated = (report: ComplianceReportData) => {
    setGeneratedReport(report);
    setIsCaseSaved(false);
  };

  const handleSaveInspectionCase = () => {
    if (!generatedReport) return;

    saveOfficerInspection(generatedReport, {
      officerId,
      location: marketLocation,
      actionTaken
    });

    setIsCaseSaved(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pastel-amber/40 via-cream-100 to-pastel-mint/30 rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pastel-amberText bg-pastel-amber px-2.5 py-0.5 rounded-full border border-pastel-amberBorder">
              {t.roleOfficer}
            </span>
            <span className="text-xs text-charcoal-500 font-medium">• {officerCases.length} {t.scansCompleted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            {language === 'hi' ? 'विधिक मापविज्ञान निरीक्षक फील्ड टर्मिनल' : 'Legal Metrology Inspector Field Terminal'}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl font-medium">
            {t.roleOfficerDesc}
          </p>
        </div>

        {/* Officer Badge Chip */}
        <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-soft-sm flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-pastel-amber flex items-center justify-center text-charcoal-900 font-bold">
            <Briefcase className="w-5 h-5 text-pastel-amberText" />
          </div>
          <div className="text-xs">
            <span className="text-charcoal-500 font-semibold block uppercase text-[10px]">{t.officerLabel}</span>
            <span className="font-bold text-charcoal-900">{officerId}</span>
            {currentUser?.name && <span className="block text-[10px] text-charcoal-500">{currentUser.name}</span>}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 border-b border-charcoal-200 pb-2">
          <button
            onClick={() => { setActiveTab('inspection'); setSelectedHistoricalReport(null); }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inspection'
                ? 'bg-charcoal-900 text-white shadow-soft-sm'
                : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{t.scanNewLabel}</span>
          </button>

          <button
            onClick={() => { setActiveTab('case_history'); setSelectedHistoricalReport(null); }}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'case_history'
                ? 'bg-charcoal-900 text-white shadow-soft-sm'
                : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>{language === 'hi' ? 'निरीक्षण केस इतिहास' : 'Inspection Case Records'} ({officerCases.length})</span>
          </button>
        </div>

        {/* Selected Historical Case View */}
        {selectedHistoricalReport ? (
          <div className="space-y-6">
            <button
              onClick={() => setSelectedHistoricalReport(null)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-charcoal-800 border border-charcoal-200 shadow-soft-sm hover:bg-cream-100 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backToDashboard}</span>
            </button>

            <ComplianceReport 
              report={selectedHistoricalReport}
            />
          </div>
        ) : activeTab === 'inspection' ? (
          <div className="space-y-6">
            
            {/* Field Metadata Form */}
            <div className="p-6 rounded-3xl bg-white border border-charcoal-200 shadow-soft-sm space-y-4">
              <h3 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>{language === 'hi' ? 'ऑन-साइट निरीक्षण विवरण' : 'On-Site Field Inspection Details'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">
                    {language === 'hi' ? 'निरीक्षक बैज संख्या' : 'Inspector Badge ID'}
                  </label>
                  <input
                    type="text"
                    value={officerId}
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-cream-50 font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">
                    {language === 'hi' ? 'निरीक्षण स्थल / बाजार' : 'Inspection Location / Market'}
                  </label>
                  <input
                    type="text"
                    value={marketLocation}
                    onChange={(e) => setMarketLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-cream-50 font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal-700 block mb-1">
                    {language === 'hi' ? 'प्रस्तावित प्रवर्तन कार्रवाई' : 'Enforcement Action Taken'}
                  </label>
                  <select
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-charcoal-200 bg-cream-50 font-semibold outline-none"
                  >
                    <option value="No Action">No Action (Compliant)</option>
                    <option value="Warning Issued">Official Warning Issued</option>
                    <option value="Samples Seized">Samples Seized (Section 15)</option>
                    <option value="Compounding Notice">Compounding Notice Served</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scan Pipeline */}
            <ImageUploadPipeline 
              onReportGenerated={handleReportGenerated}
              source="officer"
              officerDetails={{
                officerId,
                location: marketLocation,
                actionTaken
              }}
            />

            {/* Generated Report View with Save Action */}
            {generatedReport && (
              <div className="space-y-6 pt-4">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-amber-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>{language === 'hi' ? 'निरीक्षण रिपोर्ट तैयार है।' : 'Inspection scan completed. Review statutory findings below.'}</span>
                  </div>

                  {isCaseSaved ? (
                    <span className="px-3 py-1.5 rounded-xl bg-pastel-mint text-pastel-mintText border border-pastel-mintBorder text-xs font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'केस दर्ज हुआ ✓' : 'Case Filed ✓'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveInspectionCase}
                      className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold shadow-soft-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-pastel-mint" />
                      <span>{t.saveCase}</span>
                    </button>
                  )}
                </div>

                <ComplianceReport 
                  report={generatedReport}
                  onSaveCase={handleSaveInspectionCase}
                />
              </div>
            )}

          </div>
        ) : (
          /* Case History List */
          <div className="space-y-4">
            {officerCases.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-3xl border border-charcoal-200 shadow-soft-sm space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cream-100 border border-charcoal-200 flex items-center justify-center mx-auto text-charcoal-500">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900">No inspection cases filed yet</h3>
                <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                  Perform package scans during field inspections to automatically generate and file digital statutory violation records.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {officerCases.map((caseItem) => (
                  <div
                    key={caseItem.id}
                    onClick={() => setSelectedHistoricalReport(caseItem)}
                    className="bg-white rounded-2xl p-5 border border-charcoal-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          caseItem.overallStatus === 'PASS' 
                            ? 'bg-pastel-mint text-pastel-mintText border-pastel-mintBorder' 
                            : caseItem.overallStatus === 'FAIL'
                            ? 'bg-pastel-coral text-pastel-coralText border-pastel-coralBorder'
                            : 'bg-pastel-amber text-pastel-amberText border-pastel-amberBorder'
                        }`}>
                          {caseItem.overallStatus === 'PASS' ? t.statusPass.split(' ')[0] : caseItem.overallStatus === 'FAIL' ? t.statusFail.split(' ')[0] : 'REVIEW'}
                        </span>
                        <span className="text-[11px] text-charcoal-400 font-mono">
                          {new Date(caseItem.timestamp).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-charcoal-900 group-hover:text-charcoal-700 transition-colors line-clamp-1">
                        {caseItem.productName}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-0.5">
                        {caseItem.brandName || 'Packaged Commodity'} • {caseItem.category}
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-cream-50 text-[11px] text-charcoal-700 space-y-1">
                        <p><strong>Action:</strong> {caseItem.sourceMetadata?.actionTaken || 'Warning Issued'}</p>
                        <p><strong>Location:</strong> {caseItem.sourceMetadata?.location || 'On-site Inspection'}</p>
                        {caseItem.supportingEvidence && caseItem.supportingEvidence.length > 0 && (
                          <p className="text-emerald-700 font-bold">📸 {caseItem.supportingEvidence.length} Supporting Evidence Photos</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
                      <span>{caseItem.validFieldsCount} / 8 Valid</span>
                      <span className="font-bold text-charcoal-800 group-hover:translate-x-0.5 transition-transform">
                        View Case →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
