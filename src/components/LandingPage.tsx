import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  Scale, 
  CheckCircle2, 
  FileCheck2, 
  Sparkles,
  Lock
} from 'lucide-react';
import { useSharedStore, UserRole } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';
import { AuthModal } from './AuthModal';

interface LandingPageProps {
  onOpenSampleSuite: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenSampleSuite }) => {
  const { setCurrentRole, currentUser, language } = useSharedStore();
  const t = TRANSLATIONS[language];
  const [authModalRole, setAuthModalRole] = useState<'consumer' | 'enforcement' | 'manufacturer' | 'officer' | null>(null);

  const roleCards = [
    {
      id: 'consumer' as UserRole,
      number: '1',
      title: language === 'hi' ? '1. उपभोक्ता-उन्मुख स्कैनर ऐप' : '1. Consumer-Facing Scanner App',
      badge: language === 'hi' ? 'नागरिक एवं उपभोक्ता' : 'Public & Shoppers',
      description: language === 'hi'
        ? 'उत्पाद पैकेज स्कैन करें, लाइव कैमरे से अनिवार्य कानूनी घोषणाओं की पुष्टि करें और भ्रामक पैकेजिंग की शिकायत दर्ज करें।'
        : 'Scan product packages, verify mandatory legal declarations using live camera, and report deceptive or non-compliant packaging.',
      icon: <UserCheck className="w-8 h-8 text-pastel-mintText" />,
      bgAccent: 'bg-pastel-mint/60 hover:bg-pastel-mint',
      borderColor: 'border-pastel-mintBorder',
      textColor: 'text-pastel-mintText',
      badgeColor: 'bg-mint-100 text-mint-800 border-mint-200',
      features: language === 'hi' 
        ? ['लाइव कैमरा व्यूफ़ाइंडर एवं त्वरित स्कैन', '8 अनिवार्य वैधानिक घोषणाओं की जांच', 'नागरिक शिकायत पंजीकरण प्रणाली']
        : ['Live Camera Viewfinder & Scan', 'Instant 8-Point Legal Metrology Check', 'Citizen Violation Reporting System']
    },
    {
      id: 'enforcement' as UserRole,
      number: '2',
      title: language === 'hi' ? '2. ई-कॉमर्स अनुपालन क्रॉलर' : '2. E-Commerce Compliance Crawler',
      badge: language === 'hi' ? 'मार्केटप्लेस निगरानी' : 'Marketplace Crawler',
      description: language === 'hi'
        ? 'ई-कॉमर्स प्लेटफॉर्मों पर ऑनलाइन उत्पाद लिस्टिंग, कैटलॉग इमेज और विक्रेता घोषणाओं की स्वचालित निगरानी।'
        : 'Automated compliance crawler for online marketplace product listings, catalog image analysis, and seller violation detection.',
      icon: <ShieldCheck className="w-8 h-8 text-pastel-blueText" />,
      bgAccent: 'bg-pastel-blue/60 hover:bg-pastel-blue',
      borderColor: 'border-pastel-blueBorder',
      textColor: 'text-pastel-blueText',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      features: language === 'hi'
        ? ['स्वचालित यूआरएल एवं कैटलॉग क्रॉलर', 'केंद्रीय उल्लंघन रिपॉजिटरी', 'बाजार निगरानी एनालिटिक्स']
        : ['Automated URL & Catalog Crawler', 'Central Violations Repository', 'Marketplace Surveillance Analytics']
    },
    {
      id: 'manufacturer' as UserRole,
      number: '3',
      title: language === 'hi' ? '3. निर्माता/पैकर प्री-अनुपालन उपकरण' : '3. Manufacturer/Packer Pre-Compliance Tool',
      badge: language === 'hi' ? 'ब्रांड्स एवं पैकर्स' : 'Brand Owners & Packers',
      description: language === 'hi'
        ? 'बाजार-पूर्व पैकेजिंग डिज़ाइन सत्यापन, विधिक मापविज्ञान नियम परीक्षण और डाउनलोड योग्य कानूनी अनुपालन प्रमाणपत्र।'
        : 'Pre-market packaging design validation, legal metrology rule checks, and instant downloadable Compliance Certificates.',
      icon: <Building2 className="w-8 h-8 text-pastel-purpleText" />,
      bgAccent: 'bg-pastel-purple/60 hover:bg-pastel-purple',
      borderColor: 'border-pastel-purpleBorder',
      textColor: 'text-pastel-purpleText',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      features: language === 'hi'
        ? ['बाजार-पूर्व लेबल प्रमाणन', 'डाउनलोड योग्य कानूनी प्रमाण पत्र', 'पैकेजिंग डिजाइन संस्करण']
        : ['Pre-Market Label Certification', 'Downloadable Legal Certificate', 'Packaging Design Versioning']
    },
    {
      id: 'officer' as UserRole,
      number: '4',
      title: language === 'hi' ? '4. विधिक मापविज्ञान अधिकारी फील्ड-निरीक्षण ऐप' : '4. Legal Metrology Officer Field-Inspection App',
      badge: language === 'hi' ? 'फील्ड प्रवर्तन अधिकारी' : 'Field Enforcement Officers',
      description: language === 'hi'
        ? 'मोबाइल कैमरा ऑन-साइट निरीक्षण वर्कफ़्लो, स्वचालित वैधानिक उल्लंघन ऑडिट और साक्ष्य फोटो लॉकर।'
        : 'Mobile field-inspection camera workflow, statutory spot-audit generation, and digital case logging with photo evidence.',
      icon: <Briefcase className="w-8 h-8 text-pastel-amberText" />,
      bgAccent: 'bg-pastel-amber/60 hover:bg-pastel-amber',
      borderColor: 'border-pastel-amberBorder',
      textColor: 'text-pastel-amberText',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      features: language === 'hi'
        ? ['मोबाइल कैमरा ऑन-साइट निरीक्षण', 'सहायक फोटो साक्ष्य लॉकर', 'त्वरित जब्ती एवं नोटिस तैयार करें']
        : ['Mobile Camera On-Site Inspection', 'Supporting Photo Evidence Locker', 'Instant Seizure & Notice Filing']
    }
  ];

  const handleCardClick = (roleId: UserRole) => {
    setCurrentRole(roleId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cream-200/80 border border-charcoal-200 text-charcoal-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-soft-sm">
          <Scale className="w-3.5 h-3.5 text-charcoal-700" />
          <span>{t.lawSubtitle}</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold text-charcoal-900 tracking-tight leading-tight mb-4">
          {language === 'hi' ? 'स्वचालित पैकेज लेबल अनुपालन सत्यापन' : 'Automated Label Compliance Verification'}
        </h1>
        
        <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed mb-6 font-medium">
          {language === 'hi'
            ? 'पैकेज्ड कमोडिटी लेबलों का कुछ ही सेकंड में विश्लेषण करें। पूर्ण दस्तावेज़ ओसीआर द्वारा वैधानिक फ़ील्ड निकालें और भारतीय विधिक मापविज्ञान नियमों के 8 अनिवार्य मापदंडों पर परखें।'
            : 'Analyze packaged commodity labels in seconds. Extract declared statutory fields using full-page document OCR and validate against the 8 mandatory declarations under Indian Law.'}
        </p>

        {/* Quick Test Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenSampleSuite}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-sm font-bold shadow-soft-md hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-pastel-amber" />
            <span>{language === 'hi' ? 'टेस्ट किट खोलें (नमूना लेबल)' : 'Launch Built-in Test Suite'}</span>
          </button>
        </div>
      </div>

      {/* Role Selection Grid (Strictly 4 Cards) */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-charcoal-900 tracking-tight">
            {t.roleSelectorTitle}
          </h2>
          <p className="text-sm text-charcoal-500 mt-1 font-medium">
            {t.roleSelectorSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {roleCards.map((card) => (
            <div
              key={card.number}
              onClick={() => handleCardClick(card.id)}
              className={`group relative bg-white rounded-3xl p-6 sm:p-7 border ${card.borderColor} shadow-soft-md hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between`}
            >
              <div>
                {/* Header with Icon & Role Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-13 h-13 rounded-2xl ${card.bgAccent} border ${card.borderColor} flex items-center justify-center shadow-soft-sm group-hover:scale-108 transition-transform`}>
                    {card.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                {/* Role Title & 1-line description */}
                <h3 className="text-lg font-bold text-charcoal-900 group-hover:text-charcoal-800 transition-colors mb-2">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed mb-5 font-medium">
                  {card.description}
                </p>

                {/* Key Capabilities */}
                <div className="space-y-2 mb-6 pt-4 border-t border-charcoal-100">
                  {card.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-charcoal-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-mint-600 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between border-t border-charcoal-100/80">
                <span className="text-xs font-bold text-charcoal-700 group-hover:text-charcoal-950 transition-colors flex items-center space-x-1">
                  <span>{language === 'hi' ? 'पोर्टल खोलें' : 'Open Portal / Tool'}</span>
                </span>
                <div className="w-8 h-8 rounded-full bg-cream-100 group-hover:bg-charcoal-900 group-hover:text-white flex items-center justify-center text-charcoal-700 transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statutory Rules Bar Summary */}
      <div className="bg-cream-100/90 border border-charcoal-200 rounded-3xl p-6 sm:p-8 shadow-soft-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-charcoal-900 flex items-center space-x-2">
              <FileCheck2 className="w-5 h-5 text-mint-700" />
              <span>{language === 'hi' ? '8 अनिवार्य विधिक मापविज्ञान घोषणाओं का मूल्यांकन' : '8 Mandatory Legal Metrology Declarations Evaluated'}</span>
            </h3>
            <p className="text-xs text-charcoal-600 mt-0.5 font-medium">
              {language === 'hi' 
                ? 'विधिक मापविज्ञान (पैक की गई वस्तुएं) नियम, 2011 के नियम 6 के तहत स्वचालित जांच'
                : 'Strict automated verification under Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011'}
            </p>
          </div>
          <span className="text-xs font-semibold text-charcoal-600 bg-white px-3 py-1.5 rounded-xl border border-charcoal-200 self-start md:self-auto">
            {language === 'hi' ? 'उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय' : 'Ministry of Consumer Affairs, Food & Public Distribution'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '1. निर्माता एवं पता' : '1. Manufacturer & Address'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(1)(a) • पूर्ण पिन कोड' : 'Rule 6(1)(a) • Complete PIN'}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '2. सामान्य नाम' : '2. Generic Name'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(1)(b) • कमोडिटी नाम' : 'Rule 6(1)(b) • Commodity Name'}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '3. शुद्ध मात्रा (Net Qty)' : '3. Net Quantity'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(1)(c) • मानक SI मात्रक' : 'Rule 6(1)(c) • SI Metric Units'}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '4. निर्माण माह एवं वर्ष' : '4. Month & Year Mfg'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(1)(d) • पैकिंग तिथि' : 'Rule 6(1)(d) • Date of Packing'}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '5. एमआरपी (कर सहित)' : '5. MRP (incl. of taxes)'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(1)(e) • कर समावेशी' : 'Rule 6(1)(e) • Tax Inclusivity'}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '6. उपभोक्ता सेवा संपर्क' : '6. Consumer Care'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(1)(f) • फोन एवं ईमेल' : 'Rule 6(1)(f) • Phone & Email'}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '7. इकाई विक्रय मूल्य (USP)' : '7. Unit Sale Price (USP)'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(1)(s) • 2021 संशोधन' : 'Rule 6(1)(s) • 2021 Amdt'}</span>
          </div>
          <div className="p-3.5 bg-white rounded-2xl border border-charcoal-200">
            <span className="font-bold text-charcoal-900 block mb-0.5">{language === 'hi' ? '8. मूल देश' : '8. Country of Origin'}</span>
            <span className="text-[11px] text-charcoal-500">{language === 'hi' ? 'नियम 6(10) • घरेलू / आयातित' : 'Rule 6(10) • Domestic / Import'}</span>
          </div>
        </div>

        <p className="text-[11px] text-charcoal-500 italic mt-4">
          {t.disclaimerFontPDP}
        </p>
      </div>

      {/* Auth Modal Triggered from Role Card */}
      {authModalRole && (
        <AuthModal 
          isOpen={true} 
          onClose={() => setAuthModalRole(null)} 
          targetRole={authModalRole} 
        />
      )}

    </div>
  );
};
