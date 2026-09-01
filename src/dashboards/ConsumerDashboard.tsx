import React, { useState } from 'react';
import { 
  UserCheck, 
  Camera, 
  History, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  PlusCircle, 
  Languages, 
  FileWarning, 
  ArrowLeft,
  User,
  ShieldCheck
} from 'lucide-react';
import { ImageUploadPipeline } from '../components/ImageUploadPipeline';
import { ComplianceReport } from '../components/ComplianceReport';
import { ComplianceReportData } from '../engine/rules';
import { useSharedStore } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';

interface ConsumerDashboardProps {
  onOpenSampleSuite: () => void;
}

export const ConsumerDashboard: React.FC<ConsumerDashboardProps> = ({ onOpenSampleSuite }) => {
  const { reports, addReport, reportViolation, language, setLanguage } = useSharedStore();
  const t = TRANSLATIONS[language];

  // Auth profile state
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string }>({
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com'
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Tab & Report View state
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [selectedReport, setSelectedReport] = useState<ComplianceReportData | null>(null);

  const consumerReports = reports.filter(r => r.source === 'consumer');

  const handleReportGenerated = (newReport: ComplianceReportData) => {
    addReport(newReport);
    setSelectedReport(newReport);
  };

  const handleViolationReported = (reportId: string) => {
    reportViolation(reportId, 'Consumer reported non-compliant packaging via Consumer Portal.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* User Greeting & Header Banner */}
      <div className="bg-gradient-to-r from-pastel-mint/40 via-cream-100 to-pastel-blue/30 rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pastel-mintText bg-pastel-mint px-2.5 py-0.5 rounded-full border border-pastel-mintBorder">
              {t.roleConsumer}
            </span>
            <span className="text-xs text-charcoal-500 font-medium">• {consumerReports.length} {t.scansCompleted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            {t.welcome}, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl font-medium">
            {t.roleConsumerDesc}
          </p>
        </div>

        {/* User Account Pill & Language Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-charcoal-800 border border-charcoal-200 shadow-soft-sm hover:bg-cream-100 transition-all cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-charcoal-500" />
            <span>{language === 'en' ? 'हिन्दी में देखें' : 'View in English'}</span>
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-charcoal-800 border border-charcoal-200 shadow-soft-sm hover:bg-cream-100 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-pastel-mint text-pastel-mintText flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <span>{currentUser.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Language / OCR notice */}
      <div className="bg-cream-100 border border-charcoal-200 rounded-2xl px-4 py-3 text-xs text-charcoal-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="font-medium">{t.demoNotice}</span>
        <button
          onClick={onOpenSampleSuite}
          className="text-xs font-bold text-charcoal-800 hover:underline flex items-center space-x-1 cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.trySamples}</span>
        </button>
      </div>

      {/* Main Content Area */}
      {selectedReport ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedReport(null)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-charcoal-800 border border-charcoal-200 shadow-soft-sm hover:bg-cream-100 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToDashboard}</span>
          </button>

          <ComplianceReport 
            report={selectedReport}
            onReportViolation={handleViolationReported}
          />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Tabs: Scan New Label vs My Past Scans */}
          <div className="flex items-center space-x-3 border-b border-charcoal-200 pb-2">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'scan'
                  ? 'bg-charcoal-900 text-white shadow-soft-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{t.scanNewLabel}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-charcoal-900 text-white shadow-soft-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>{t.tabMyScans} ({consumerReports.length})</span>
            </button>
          </div>

          {/* Active Tab Content */}
          {activeTab === 'scan' ? (
            <div className="space-y-6">
              <ImageUploadPipeline 
                onReportGenerated={handleReportGenerated}
                source="consumer"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {consumerReports.length === 0 ? (
                /* Friendly Empty State */
                <div className="text-center py-16 px-6 bg-white rounded-3xl border border-charcoal-200 shadow-soft-sm space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-cream-100 border border-charcoal-200 flex items-center justify-center mx-auto text-charcoal-500">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-900">Upload your first label to get started</h3>
                  <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                    {t.emptyStateConsumer}
                  </p>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold shadow-soft-sm hover:bg-charcoal-800 transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Scan a Package Label</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {consumerReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className="bg-white rounded-2xl p-5 border border-charcoal-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        {/* Status Pill & Timestamp */}
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            report.overallStatus === 'PASS' 
                              ? 'bg-pastel-mint text-pastel-mintText border-pastel-mintBorder' 
                              : report.overallStatus === 'FAIL'
                              ? 'bg-pastel-coral text-pastel-coralText border-pastel-coralBorder'
                              : 'bg-pastel-amber text-pastel-amberText border-pastel-amberBorder'
                          }`}>
                            {report.overallStatus === 'PASS' ? 'PASS (Valid)' : report.overallStatus === 'FAIL' ? 'FAIL (Violation)' : 'REVIEW'}
                          </span>
                          <span className="text-[11px] text-charcoal-500 font-mono">
                            {new Date(report.timestamp).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Product Title */}
                        <h4 className="text-sm font-bold text-charcoal-900 group-hover:text-charcoal-700 transition-colors mb-1 line-clamp-1">
                          {report.productName}
                        </h4>
                        <p className="text-xs text-charcoal-500 mb-3">
                          Category: {report.category}
                        </p>

                        {/* Image Thumbnail preview */}
                        {report.images && report.images[0] && (
                          <div className="w-full h-28 rounded-xl bg-charcoal-900 overflow-hidden mb-3 border border-charcoal-200">
                            <img 
                              src={report.images[0].dataUrl} 
                              alt="Scan preview" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-charcoal-100 text-xs">
                        <span className="font-semibold text-charcoal-600">
                          {report.validFieldsCount}/8 Fields Valid
                        </span>
                        <div className="flex items-center space-x-1 font-bold text-charcoal-900 group-hover:translate-x-0.5 transition-transform">
                          <span>{t.viewReport}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Auth / Profile Switcher Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-soft-xl border border-charcoal-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-200">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-charcoal-700" />
                <h3 className="text-base font-bold text-charcoal-900">Consumer Account Profile</h3>
              </div>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-charcoal-400 hover:text-charcoal-700">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal-700 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={currentUser.name} 
                  onChange={(e) => setCurrentUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-cream-50 focus:bg-white text-charcoal-900 font-medium" 
                />
              </div>
              <div>
                <label className="font-semibold text-charcoal-700 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={currentUser.email} 
                  onChange={(e) => setCurrentUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-charcoal-200 bg-cream-50 focus:bg-white text-charcoal-900 font-medium" 
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-2">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-bold shadow-soft-sm hover:bg-charcoal-800"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
