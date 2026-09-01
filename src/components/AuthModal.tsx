import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Building2, 
  Briefcase, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  Building,
  MapPin,
  BadgeAlert
} from 'lucide-react';
import { useSharedStore, DEFAULT_PRESET_USERS, UserProfile } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'consumer' | 'enforcement' | 'manufacturer' | 'officer';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, targetRole = 'consumer' }) => {
  const { language, loginAsUser, signupNewUser } = useSharedStore();
  const t = TRANSLATIONS[language];

  const [activeRole, setActiveRole] = useState<'consumer' | 'enforcement' | 'manufacturer' | 'officer'>(targetRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [govtPin, setGovtPin] = useState('');

  if (!isOpen) return null;

  const handle1ClickDemoLogin = (role: 'consumer' | 'enforcement' | 'manufacturer' | 'officer') => {
    const preset = DEFAULT_PRESET_USERS[role];
    loginAsUser(preset);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate Officer Govt PIN
    if (activeRole === 'officer' && isSignUp) {
      if (govtPin.trim().toUpperCase() !== 'LMPC-OFFICER-2026') {
        setErrorMessage(language === 'hi' ? 'अमान्य सरकारी प्राधिकरण पिन। कृपया "LMPC-OFFICER-2026" का उपयोग करें।' : 'Invalid Govt Access PIN. Please enter "LMPC-OFFICER-2026" for official inspector verification.');
        return;
      }
    }

    // Validate Enforcement Passcode
    if (activeRole === 'enforcement' && isSignUp) {
      if (govtPin.trim().toUpperCase() !== 'ENFORCE-GOV-2026') {
        setErrorMessage(language === 'hi' ? 'अमान्य प्रवर्तन पासकोड। कृपया "ENFORCE-GOV-2026" का उपयोग करें।' : 'Invalid Enforcement Passcode. Please enter "ENFORCE-GOV-2026" for regulatory directorate access.');
        return;
      }
    }

    if (isSignUp) {
      if (!name || !email) {
        setErrorMessage(language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill in all required fields.');
        return;
      }

      const user = signupNewUser({
        name,
        email,
        role: activeRole,
        organization: organization || (activeRole === 'enforcement' ? 'State Enforcement Agency' : undefined),
        badgeNumber: badgeNumber || (activeRole === 'officer' ? `LM-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
        jurisdiction: jurisdiction || (activeRole === 'officer' ? 'Field Metrology Division' : undefined),
        verifiedGovtOfficer: activeRole === 'officer' || activeRole === 'enforcement'
      });

      loginAsUser(user);
      onClose();
    } else {
      // Login flow: match or use preset
      const preset = DEFAULT_PRESET_USERS[activeRole];
      loginAsUser({
        ...preset,
        name: name || preset.name,
        email: email || preset.email
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-charcoal-200 shadow-soft-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-charcoal-200 bg-cream-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-charcoal-900 text-white flex items-center justify-center shadow-soft-sm">
              <ShieldCheck className="w-5 h-5 text-pastel-mint" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-charcoal-900">{t.authTitle}</h3>
              <p className="text-xs text-charcoal-500">{t.authSubtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-800 rounded-xl hover:bg-cream-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Role Selection Tabs */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">
              {t.loginRoleTab}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => { setActiveRole('consumer'); setErrorMessage(null); }}
                className={`flex flex-col items-center p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'consumer' 
                    ? 'bg-pastel-mint text-pastel-mintText border-pastel-mintBorder shadow-soft-sm ring-2 ring-emerald-500' 
                    : 'bg-cream-50 text-charcoal-700 border-charcoal-200 hover:bg-cream-100'
                }`}
              >
                <UserCheck className="w-4 h-4 mb-1 text-emerald-700" />
                <span>{t.roleConsumer}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveRole('manufacturer'); setErrorMessage(null); }}
                className={`flex flex-col items-center p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'manufacturer' 
                    ? 'bg-pastel-purple text-pastel-purpleText border-pastel-purpleBorder shadow-soft-sm ring-2 ring-purple-500' 
                    : 'bg-cream-50 text-charcoal-700 border-charcoal-200 hover:bg-cream-100'
                }`}
              >
                <Building2 className="w-4 h-4 mb-1 text-purple-700" />
                <span>{t.roleManufacturer}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveRole('officer'); setErrorMessage(null); }}
                className={`flex flex-col items-center p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'officer' 
                    ? 'bg-pastel-amber text-pastel-amberText border-pastel-amberBorder shadow-soft-sm ring-2 ring-amber-500' 
                    : 'bg-cream-50 text-charcoal-700 border-charcoal-200 hover:bg-cream-100'
                }`}
              >
                <Briefcase className="w-4 h-4 mb-1 text-amber-700" />
                <span>{t.roleOfficer}</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveRole('enforcement'); setErrorMessage(null); }}
                className={`flex flex-col items-center p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  activeRole === 'enforcement' 
                    ? 'bg-pastel-blue text-pastel-blueText border-pastel-blueBorder shadow-soft-sm ring-2 ring-sky-500' 
                    : 'bg-cream-50 text-charcoal-700 border-charcoal-200 hover:bg-cream-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mb-1 text-sky-700" />
                <span>{t.roleEnforcement}</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Demo Profiles Bar */}
          <div className="p-3.5 rounded-2xl bg-cream-100/90 border border-charcoal-200 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-charcoal-700 font-bold">
              <span>{t.demoLoginTip}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handle1ClickDemoLogin('consumer')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-cream-50 text-charcoal-800 text-[11px] font-bold border border-charcoal-200 shadow-soft-sm cursor-pointer"
              >
                👤 Aarav (Consumer)
              </button>
              <button
                type="button"
                onClick={() => handle1ClickDemoLogin('manufacturer')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-cream-50 text-charcoal-800 text-[11px] font-bold border border-charcoal-200 shadow-soft-sm cursor-pointer"
              >
                🏢 Britannia QA (Manufacturer)
              </button>
              <button
                type="button"
                onClick={() => handle1ClickDemoLogin('officer')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-cream-50 text-charcoal-800 text-[11px] font-bold border border-charcoal-200 shadow-soft-sm cursor-pointer"
              >
                ⚖️ Rajesh Varma (Officer #8821)
              </button>
              <button
                type="button"
                onClick={() => handle1ClickDemoLogin('enforcement')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-cream-50 text-charcoal-800 text-[11px] font-bold border border-charcoal-200 shadow-soft-sm cursor-pointer"
              >
                🛡️ Central Enforcement HQ
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-pastel-coral border border-pastel-coralBorder text-pastel-coralText flex items-start space-x-2 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">
                  {t.accountName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={activeRole === 'officer' ? 'e.g. Rajesh Varma, Inspector' : 'e.g. Aarav Sharma'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-charcoal-900 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">
                {t.accountEmail} *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeRole === 'officer' 
                      ? 'officer.rajesh@lm.gov.in' 
                      : activeRole === 'manufacturer'
                      ? 'compliance@brand.com'
                      : activeRole === 'enforcement'
                      ? 'surveillance@consumeraffairs.gov.in'
                      : 'user@example.com'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-charcoal-900 outline-none"
                />
              </div>
            </div>

            {/* Manufacturer Extra Fields */}
            {isSignUp && activeRole === 'manufacturer' && (
              <div>
                <label className="text-xs font-bold text-charcoal-700 block mb-1">
                  {t.accountOrg} *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Britannia Industries Limited"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-charcoal-900 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Officer Extra Fields & Government PIN */}
            {isSignUp && activeRole === 'officer' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1">
                      {t.accountBadge} *
                    </label>
                    <input
                      type="text"
                      required
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      placeholder="LM-MH-8821"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-charcoal-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-charcoal-700 block mb-1">
                      {t.accountJurisdiction} *
                    </label>
                    <input
                      type="text"
                      required
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      placeholder="Mumbai Suburban"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-charcoal-900 outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                  <label className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                    <BadgeAlert className="w-3.5 h-3.5 text-amber-700" />
                    <span>{t.govtOfficerPin} *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={govtPin}
                    onChange={(e) => setGovtPin(e.target.value)}
                    placeholder="Enter LMPC-OFFICER-2026"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-bold tracking-wider outline-none"
                  />
                  <p className="text-[11px] text-amber-700">Official security key for Legal Metrology officers.</p>
                </div>
              </>
            )}

            {/* Enforcement Extra Fields */}
            {isSignUp && activeRole === 'enforcement' && (
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 space-y-1">
                <label className="text-xs font-bold text-sky-900 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                  <span>{t.enforcementPasscode} *</span>
                </label>
                <input
                  type="password"
                  required
                  value={govtPin}
                  onChange={(e) => setGovtPin(e.target.value)}
                  placeholder="Enter ENFORCE-GOV-2026"
                  className="w-full px-3 py-2 rounded-xl border border-sky-300 bg-white text-xs font-bold tracking-wider outline-none"
                />
                <p className="text-[11px] text-sky-700">Restricted passcode for regulatory surveillance access.</p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-charcoal-700 block mb-1">
                {t.accountPassword} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-charcoal-200 bg-white text-xs font-medium focus:ring-2 focus:ring-charcoal-900 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold shadow-soft-md transition-all cursor-pointer active:scale-98"
            >
              {isSignUp ? `${t.signup} & Access ${activeRole.toUpperCase()}` : `${t.login} to ${activeRole.toUpperCase()} Portal`}
            </button>
          </form>

          {/* Toggle Login / SignUp */}
          <div className="text-center pt-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(null); }}
              className="text-xs font-bold text-charcoal-700 hover:underline cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Log In' : 'Need a new portal account? Sign Up'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
