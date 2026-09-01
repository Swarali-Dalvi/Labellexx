import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Languages, 
  FlaskConical, 
  RotateCcw,
  Building,
  UserCheck,
  Briefcase,
  Menu,
  X,
  LogOut,
  LogIn,
  User,
  MessageSquarePlus
} from 'lucide-react';
import { useSharedStore, UserRole } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';
import { AuthModal } from './AuthModal';

interface NavbarProps {
  onOpenSampleSuite: () => void;
  onOpenFeedbackWall?: () => void;
  onOpenFeedbackForm?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenSampleSuite,
  onOpenFeedbackWall,
  onOpenFeedbackForm
}) => {
  const { currentRole, setCurrentRole, currentUser, logout, language, setLanguage, resetToSampleData } = useSharedStore();
  const t = TRANSLATIONS[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const roles: { id: UserRole; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'consumer', label: t.roleConsumer, icon: <UserCheck className="w-4 h-4" />, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { id: 'enforcement', label: t.roleEnforcement, icon: <ShieldCheck className="w-4 h-4" />, color: 'text-sky-700 bg-sky-50 border-sky-200' },
    { id: 'manufacturer', label: t.roleManufacturer, icon: <Building className="w-4 h-4" />, color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { id: 'officer', label: t.roleOfficer, icon: <Briefcase className="w-4 h-4" />, color: 'text-amber-700 bg-amber-50 border-amber-200' }
  ];

  const handleRoleSelect = (roleId: UserRole) => {
    if (currentUser && currentUser.role !== roleId && roleId !== 'landing') {
      alert(`${t.rbacRestricted} ${currentUser.role.toUpperCase()} (${currentUser.name}). ${t.logoutToSwitch}`);
      return;
    }
    setCurrentRole(roleId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-charcoal-200/70 transition-all no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => { setCurrentRole('landing'); setIsMobileMenuOpen(false); }}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pastel-mint border border-pastel-mintBorder flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-pastel-mintText" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-lg sm:text-xl text-charcoal-900 tracking-tight">LabelLex</span>
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-pastel-amber text-pastel-amberText border border-pastel-amberBorder">
                  LMPC 2011
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-charcoal-500 hidden sm:block">Legal Metrology Compliance Engine</p>
            </div>
          </div>

          {/* Center: Desktop Role Indicator & Switching */}
          {currentRole !== 'landing' && (
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={() => setCurrentRole('landing')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cream-200/80 hover:bg-cream-200 text-charcoal-800 border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer"
                title="Return to the 5-System Selection Dashboard"
              >
                <Users className="w-3.5 h-3.5 text-charcoal-700" />
                <span>{language === 'hi' ? 'पोर्टल बदलें (5 सिस्टम)' : 'All 5 Portals'}</span>
              </button>

              <div className="flex items-center bg-cream-100 p-1 rounded-xl border border-charcoal-200 shadow-soft-sm">
                {currentUser ? (
                  <div className="flex items-center space-x-2 px-3 py-1 text-xs font-bold text-charcoal-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{currentUser.role === 'officer' ? `⚖️ Officer Badge: ${currentUser.badgeNumber || 'LM-MH'}` : currentUser.role === 'manufacturer' ? `🏢 ${currentUser.organization || 'QA Lab'}` : currentUser.role === 'enforcement' ? `🛡️ Central Directorate` : `👤 Consumer Portal`}</span>
                  </div>
                ) : (
                  roles.map((r) => {
                    const isActive = currentRole === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-white text-charcoal-900 shadow-soft-sm font-semibold' 
                            : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/50'
                        }`}
                      >
                        {r.icon}
                        <span>{r.label.split(' ')[0]}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Feedback & Suggestions Button */}
            <button
              onClick={onOpenFeedbackWall}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-1.5 min-h-[38px] sm:min-h-[36px] rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-soft-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
              title="View or give anonymous feedback"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">{language === 'hi' ? 'सुझाव / फीडबैक' : 'Feedback'}</span>
              <span className="md:hidden text-[11px]">{language === 'hi' ? 'सुझाव' : 'Feedback'}</span>
            </button>

            {/* Quick Test Suite Button */}
            <button
              onClick={onOpenSampleSuite}
              className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-1.5 min-h-[38px] sm:min-h-[36px] rounded-xl text-xs font-semibold bg-pastel-blue hover:bg-sky-200 text-pastel-blueText border border-pastel-blueBorder shadow-soft-sm transition-all hover:scale-102 active:scale-98 cursor-pointer"
              title="Run standard test samples"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{language === 'hi' ? 'टेस्ट किट' : 'Test Suite'}</span>
              <span className="md:hidden text-[11px]">{language === 'hi' ? 'टेस्ट' : 'Tests'}</span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 min-h-[38px] sm:min-h-[36px] rounded-xl text-xs font-bold bg-white text-charcoal-700 hover:bg-cream-100 border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer"
              title="Toggle English / Hindi"
            >
              <Languages className="w-3.5 h-3.5 text-charcoal-500" />
              <span>{t.langToggle}</span>
            </button>

            {/* Authenticated User Pill vs Login Button */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5">
                <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white border border-charcoal-200 shadow-soft-sm text-xs">
                  <div className="w-5 h-5 rounded-full bg-pastel-mint text-pastel-mintText flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="font-bold text-charcoal-800">{currentUser.name.split(' ')[0]}</span>
                </div>

                <button
                  onClick={() => logout()}
                  className="flex items-center space-x-1 px-2.5 py-1.5 min-h-[38px] sm:min-h-[36px] rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 shadow-soft-sm transition-all cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-1.5 min-h-[38px] sm:min-h-[36px] rounded-xl text-xs font-bold bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-soft-sm transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-pastel-mint" />
                <span>{t.login}</span>
              </button>
            )}

            {/* Reset Demo Data Button */}
            <button
              onClick={() => {
                if (confirm('Reset database to clean initial sample records?')) {
                  resetToSampleData();
                }
              }}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-100 border border-charcoal-200 shadow-soft-sm transition-all cursor-pointer"
              title="Reset to Sample Demo Dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center space-x-1 px-2.5 py-1.5 min-h-[38px] rounded-xl bg-charcoal-900 text-white text-xs font-semibold shadow-soft-sm cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="capitalize">{currentRole === 'landing' ? 'Roles' : currentRole}</span>
            </button>

          </div>

        </div>

        {/* Mobile Drawer / Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-charcoal-200 bg-cream-50 px-4 py-4 space-y-3 animate-fadeIn shadow-soft-lg">
            <div className="flex items-center justify-between text-xs font-bold text-charcoal-500 uppercase tracking-wider">
              <span>{language === 'hi' ? 'सक्रिय पोर्टल' : 'Select Active Portal'}</span>
              {currentRole !== 'landing' && (
                <button 
                  onClick={() => { setCurrentRole('landing'); setIsMobileMenuOpen(false); }} 
                  className="text-charcoal-800 underline font-semibold normal-case cursor-pointer"
                >
                  {language === 'hi' ? 'मुख्य पृष्ठ' : 'Go to Landing Hub'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => {
                const isActive = currentRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRoleSelect(r.id)}
                    className={`flex items-center space-x-2 p-3 min-h-[48px] rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                      isActive 
                        ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-soft-sm' 
                        : 'bg-white text-charcoal-800 border-charcoal-200 hover:bg-cream-100'
                    }`}
                  >
                    <span className={`p-1.5 rounded-lg border ${isActive ? 'bg-charcoal-800 border-charcoal-700 text-white' : r.color}`}>
                      {r.icon}
                    </span>
                    <span>{r.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Role-Based Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        targetRole={currentRole !== 'landing' ? currentRole : 'consumer'} 
      />
    </>
  );
};
