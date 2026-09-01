import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ConsumerDashboard } from './dashboards/ConsumerDashboard';
import { EnforcementDashboard } from './dashboards/EnforcementDashboard';
import { ManufacturerDashboard } from './dashboards/ManufacturerDashboard';
import { OfficerDashboard } from './dashboards/OfficerDashboard';
import { SampleSelectorModal } from './components/SampleSelectorModal';
import { FeedbackModal } from './components/FeedbackModal';
import { FeedbackWallModal } from './components/FeedbackWallModal';
import { ComplianceReport } from './components/ComplianceReport';
import { ComplianceReportData } from './engine/rules';
import { useSharedStore } from './store/sharedStore';
import { ArrowLeft, Scale, ShieldCheck } from 'lucide-react';

export function App() {
  const { currentRole, setCurrentRole } = useSharedStore();
  const [isSampleSuiteOpen, setIsSampleSuiteOpen] = useState(false);
  const [isFeedbackWallOpen, setIsFeedbackWallOpen] = useState(false);
  const [isGiveFeedbackOpen, setIsGiveFeedbackOpen] = useState(false);
  const [activeSampleReport, setActiveSampleReport] = useState<ComplianceReportData | null>(null);

  const handleSelectSampleReport = (report: ComplianceReportData) => {
    setActiveSampleReport(report);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col selection:bg-mint-200">
      
      {/* Universal Sticky Top Navigation */}
      <Navbar 
        onOpenSampleSuite={() => setIsSampleSuiteOpen(true)}
        onOpenFeedbackWall={() => setIsFeedbackWallOpen(true)}
        onOpenFeedbackForm={() => setIsGiveFeedbackOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {activeSampleReport ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <button
              onClick={() => setActiveSampleReport(null)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-charcoal-800 border border-charcoal-200 shadow-soft-sm hover:bg-cream-100 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </button>
            <ComplianceReport report={activeSampleReport} />
          </div>
        ) : (
          <>
            {currentRole === 'landing' && (
              <LandingPage 
                onOpenSampleSuite={() => setIsSampleSuiteOpen(true)} 
                onOpenFeedbackWall={() => setIsFeedbackWallOpen(true)}
                onOpenFeedbackForm={() => setIsGiveFeedbackOpen(true)}
              />
            )}
            {currentRole === 'consumer' && (
              <ConsumerDashboard onOpenSampleSuite={() => setIsSampleSuiteOpen(true)} />
            )}
            {currentRole === 'enforcement' && (
              <EnforcementDashboard onOpenSampleSuite={() => setIsSampleSuiteOpen(true)} />
            )}
            {currentRole === 'manufacturer' && (
              <ManufacturerDashboard onOpenSampleSuite={() => setIsSampleSuiteOpen(true)} />
            )}
            {currentRole === 'officer' && (
              <OfficerDashboard onOpenSampleSuite={() => setIsSampleSuiteOpen(true)} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-cream-100 border-t border-charcoal-200/70 py-6 text-center text-xs text-charcoal-500 no-print mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Scale className="w-4 h-4 text-charcoal-600" />
            <span className="font-semibold text-charcoal-800">LabelLex Compliance System</span>
            <span>•</span>
            <span>Legal Metrology (Packaged Commodities) Rules, 2011</span>
          </div>
          <p className="text-[11px] text-charcoal-500">
            Light Pastel Compliance Architecture with Unified Single-Pipeline Document OCR
          </p>
        </div>
      </footer>

      {/* Sample Test Suite Modal */}
      <SampleSelectorModal
        isOpen={isSampleSuiteOpen}
        onClose={() => setIsSampleSuiteOpen(false)}
        onSelectReport={handleSelectSampleReport}
      />

      {/* Anonymous Feedback Form Modal */}
      <FeedbackModal
        isOpen={isGiveFeedbackOpen}
        onClose={() => setIsGiveFeedbackOpen(false)}
        onSubmitted={() => setIsFeedbackWallOpen(true)}
      />

      {/* Public Feedback & Suggestions Wall Modal */}
      <FeedbackWallModal
        isOpen={isFeedbackWallOpen}
        onClose={() => setIsFeedbackWallOpen(false)}
        onOpenFeedbackForm={() => setIsGiveFeedbackOpen(true)}
      />

    </div>
  );
}

export default App;
