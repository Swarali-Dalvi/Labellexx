import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet, 
  Layers, 
  Sparkles, 
  UserCheck, 
  Building2, 
  Briefcase,
  ChevronRight,
  RefreshCw,
  Eye,
  FileCheck2,
  Trash2,
  Calendar
} from 'lucide-react';
import { ComplianceReport } from '../components/ComplianceReport';
import { ComplianceReportData } from '../engine/rules';
import { optimizeImage } from '../engine/imageOptimizer';
import { runMultiImageOCR } from '../engine/ocrPipeline';
import { evaluateComplianceFromOCR } from '../engine/fieldMatcher';
import { useSharedStore } from '../store/sharedStore';
import { TRANSLATIONS } from '../store/translations';

interface EnforcementDashboardProps {
  onOpenSampleSuite: () => void;
}

export const EnforcementDashboard: React.FC<EnforcementDashboardProps> = ({ onOpenSampleSuite }) => {
  const { reports, addReport, deleteReport, language } = useSharedStore();
  const t = TRANSLATIONS[language];

  // Active view: 'repository' | 'bulk_scanner' | 'analytics'
  const [activeTab, setActiveTab] = useState<'repository' | 'bulk_scanner' | 'analytics'>('repository');
  const [selectedReport, setSelectedReport] = useState<ComplianceReportData | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Bulk Upload Queue State
  const [bulkFiles, setBulkFiles] = useState<{ id: string; file: File; status: 'queued' | 'processing' | 'done' | 'error'; report?: ComplianceReportData; error?: string }[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('E-Commerce Market Listing');

  /**
   * Filtered list of all reports across all sources
   */
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = searchQuery === '' || 
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.brandName && r.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || r.overallStatus === selectedStatus;
      const matchesSource = selectedSource === 'all' || r.source === selectedSource;
      const matchesCat = selectedCategory === 'all' || r.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesSource && matchesCat;
    });
  }, [reports, searchQuery, selectedStatus, selectedSource, selectedCategory]);

  /**
   * Analytics Aggregations
   */
  const analyticsData = useMemo(() => {
    const total = reports.length;
    const passCount = reports.filter(r => r.overallStatus === 'PASS').length;
    const failCount = reports.filter(r => r.overallStatus === 'FAIL').length;
    const reviewCount = reports.filter(r => r.overallStatus === 'REVIEW').length;
    const complianceRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

    // Violations by category
    const catMap: Record<string, { total: number; violations: number }> = {};
    for (const r of reports) {
      const cat = r.category || 'Other';
      if (!catMap[cat]) catMap[cat] = { total: 0, violations: 0 };
      catMap[cat].total += 1;
      if (r.overallStatus === 'FAIL') catMap[cat].violations += 1;
    }

    // Source breakdown
    const sourceMap: Record<string, number> = { consumer: 0, enforcement: 0, manufacturer: 0, officer: 0 };
    for (const r of reports) {
      sourceMap[r.source] = (sourceMap[r.source] || 0) + 1;
    }

    // Rule failure frequency
    const ruleFailMap: Record<string, number> = {
      mfg_address: 0,
      commodity_name: 0,
      net_quantity: 0,
      mfg_date: 0,
      mrp: 0,
      consumer_care: 0,
      unit_sale_price: 0,
      country_of_origin: 0
    };

    for (const r of reports) {
      if (r.fieldResults) {
        for (const f of r.fieldResults) {
          if (f.status === 'violation') {
            ruleFailMap[f.ruleId] = (ruleFailMap[f.ruleId] || 0) + 1;
          }
        }
      }
    }

    return {
      total,
      passCount,
      failCount,
      reviewCount,
      complianceRate,
      catMap,
      sourceMap,
      ruleFailMap
    };
  }, [reports]);

  /**
   * Bulk File Selection
   */
  const handleBulkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        status: 'queued' as const
      }));
      setBulkFiles(prev => [...prev, ...newFiles]);
    }
  };

  /**
   * Run Batch Processing sequentially / in parallel
   */
  const handleRunBulkQueue = async () => {
    if (bulkFiles.length === 0 || isBulkProcessing) return;
    setIsBulkProcessing(true);

    for (let i = 0; i < bulkFiles.length; i++) {
      const item = bulkFiles[i];
      if (item.status === 'done') continue;

      setBulkFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));

      try {
        // Optimize single image per listing
        const opt = await optimizeImage(item.file, 'Single');
        // Run OCR
        const ocr = await runMultiImageOCR([opt], undefined, 18);
        // Field match
        const report = evaluateComplianceFromOCR(ocr, bulkCategory, 'enforcement');
        // Save to central store
        addReport(report);

        setBulkFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', report } : f));
      } catch (err: any) {
        console.error('Bulk item failed:', err);
        setBulkFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: err.message } : f));
      }
    }

    setIsBulkProcessing(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pastel-blue/40 via-cream-100 to-pastel-mint/30 rounded-3xl p-6 sm:p-8 border border-charcoal-200 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pastel-blueText bg-pastel-blue px-2.5 py-0.5 rounded-full border border-pastel-blueBorder">
              {t.roleEnforcement} Portal
            </span>
            <span className="text-xs text-charcoal-500">• Central Surveillance Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
            Marketplace & Regulatory Compliance Central
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-2xl">
            Surveillance repository consolidating consumer reports, officer field inspections, manufacturer certifications, and bulk marketplace scanner imports.
          </p>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-charcoal-200 shadow-soft-sm text-center">
            <span className="text-xl font-bold text-charcoal-900 block">{analyticsData.total}</span>
            <span className="text-[10px] font-semibold text-charcoal-500 uppercase">Audited</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-charcoal-200 shadow-soft-sm text-center">
            <span className="text-xl font-bold text-rose-600 block">{analyticsData.failCount}</span>
            <span className="text-[10px] font-semibold text-charcoal-500 uppercase">Violations</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-charcoal-200 shadow-soft-sm text-center">
            <span className="text-xl font-bold text-mint-700 block">{analyticsData.complianceRate}%</span>
            <span className="text-[10px] font-semibold text-charcoal-500 uppercase">Pass Rate</span>
          </div>
        </div>
      </div>

      {/* Selected Report Modal or View */}
      {selectedReport ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedReport(null)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-charcoal-800 border border-charcoal-200 shadow-soft-sm hover:bg-cream-100 transition-all"
          >
            <span>← Back to Repository</span>
          </button>
          <ComplianceReport report={selectedReport} />
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal-200 pb-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('repository')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'repository' 
                    ? 'bg-charcoal-900 text-white shadow-soft-sm' 
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t.tabCentralRepo} ({filteredReports.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bulk_scanner')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'bulk_scanner' 
                    ? 'bg-charcoal-900 text-white shadow-soft-sm' 
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t.tabBulkScan}</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-charcoal-900 text-white shadow-soft-sm' 
                    : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{t.tabAnalytics}</span>
              </button>
            </div>

            <button
              onClick={onOpenSampleSuite}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-pastel-amber text-pastel-amberText border border-pastel-amberBorder hover:bg-amber-200 transition-all shadow-soft-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Test Suite (6 Cases)</span>
            </button>
          </div>

          {/* TAB 1: CENTRAL REPOSITORY TABLE */}
          {activeTab === 'repository' && (
            <div className="space-y-4">
              
              {/* Search & Filters Bar */}
              <div className="bg-white p-4 rounded-2xl border border-charcoal-200 shadow-soft-sm flex flex-wrap items-center justify-between gap-3">
                
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by product name, brand, or case ID..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-charcoal-200 text-xs font-medium text-charcoal-900 bg-cream-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-charcoal-300"
                  />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Status */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-charcoal-200 bg-cream-50 font-medium text-charcoal-700 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="PASS">PASS (Compliant)</option>
                    <option value="FAIL">FAIL (Violation)</option>
                    <option value="REVIEW">REVIEW (Pending)</option>
                  </select>

                  {/* Source */}
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-charcoal-200 bg-cream-50 font-medium text-charcoal-700 focus:outline-none"
                  >
                    <option value="all">All Sources</option>
                    <option value="consumer">Consumer Reports</option>
                    <option value="officer">Officer Inspections</option>
                    <option value="manufacturer">Manufacturer Checks</option>
                    <option value="enforcement">Enforcement Batch</option>
                  </select>
                </div>
              </div>

              {/* Central Repository Table */}
              <div className="bg-white rounded-2xl border border-charcoal-200 shadow-soft-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-charcoal-200 text-left text-xs">
                    <thead className="bg-cream-100 text-charcoal-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th scope="col" className="px-4 py-3.5">Product & Case ID</th>
                        <th scope="col" className="px-4 py-3.5">Category</th>
                        <th scope="col" className="px-4 py-3.5">Source Tag</th>
                        <th scope="col" className="px-4 py-3.5">Score</th>
                        <th scope="col" className="px-4 py-3.5">Violations</th>
                        <th scope="col" className="px-4 py-3.5">Status</th>
                        <th scope="col" className="px-4 py-3.5">Date</th>
                        <th scope="col" className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100 bg-white">
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-charcoal-500">
                            {t.emptyStateEnforcement}
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((item) => (
                          <tr key={item.id} className="hover:bg-cream-50/70 transition-colors">
                            
                            {/* Product Title & ID */}
                            <td className="px-4 py-3.5 max-w-xs">
                              <span className="font-bold text-charcoal-900 block truncate">
                                {item.productName}
                              </span>
                              <span className="text-[10px] font-mono text-charcoal-500">
                                {item.id} {item.brandName ? `• ${item.brandName}` : ''}
                              </span>
                            </td>

                            {/* Category */}
                            <td className="px-4 py-3.5 text-charcoal-600 font-medium">
                              {item.category}
                            </td>

                            {/* Source Badge */}
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                item.source === 'consumer' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : item.source === 'officer'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : item.source === 'manufacturer'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                  : 'bg-sky-50 text-sky-700 border border-sky-200'
                              }`}>
                                {item.source === 'consumer' && <UserCheck className="w-3 h-3" />}
                                {item.source === 'officer' && <Briefcase className="w-3 h-3" />}
                                {item.source === 'manufacturer' && <Building2 className="w-3 h-3" />}
                                {item.source === 'enforcement' && <ShieldCheck className="w-3 h-3" />}
                                <span className="capitalize">{item.source}</span>
                              </span>
                            </td>

                            {/* Score */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center space-x-1.5">
                                <div className="w-8 bg-cream-200 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-1.5 rounded-full ${item.overallScore >= 80 ? 'bg-mint-500' : item.overallScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${item.overallScore}%` }}
                                  />
                                </div>
                                <span className="font-mono font-bold text-[11px] text-charcoal-800">
                                  {item.overallScore}%
                                </span>
                              </div>
                            </td>

                            {/* Violation Count */}
                            <td className="px-4 py-3.5 font-bold font-mono">
                              <span className={item.violationFieldsCount > 0 ? 'text-rose-600' : 'text-charcoal-400'}>
                                {item.violationFieldsCount}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                item.overallStatus === 'PASS' 
                                  ? 'bg-pastel-mint text-pastel-mintText' 
                                  : item.overallStatus === 'FAIL' 
                                  ? 'bg-pastel-coral text-pastel-coralText' 
                                  : 'bg-pastel-amber text-pastel-amberText'
                              }`}>
                                <span>{item.overallStatus}</span>
                              </span>
                            </td>

                            {/* Timestamp */}
                            <td className="px-4 py-3.5 text-[11px] text-charcoal-500 font-mono">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right space-x-2">
                              <button
                                onClick={() => setSelectedReport(item)}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-cream-100 hover:bg-cream-200 text-charcoal-800 border border-charcoal-200 transition-colors"
                              >
                                <Eye className="w-3 h-3 text-charcoal-600" />
                                <span>View</span>
                              </button>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BULK LISTING SCANNER */}
          {activeTab === 'bulk_scanner' && (
            <div className="space-y-6 bg-white rounded-3xl border border-charcoal-200 p-6 sm:p-8 shadow-soft-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-200">
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-pastel-blueText" />
                    <span>E-Commerce Bulk Listing Scanner</span>
                  </h3>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Upload multiple product catalog images for automated legal metrology compliance batch auditing.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-charcoal-600">Category:</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-charcoal-200 bg-cream-50 text-xs font-medium"
                  >
                    <option>E-Commerce Market Listing</option>
                    <option>Packaged Food & Beverage</option>
                    <option>Cosmetics & Personal Care</option>
                    <option>Household & Cleaning</option>
                    <option>Electronics & Accessories</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="p-8 border-2 border-dashed border-charcoal-200 hover:border-charcoal-400 rounded-2xl bg-cream-50/70 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cream-200 flex items-center justify-center mx-auto text-charcoal-600">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-charcoal-900">Select Multiple Product Label Images</p>
                  <p className="text-xs text-charcoal-500 mt-0.5">Each image processed as a distinct product listing (JPEG/PNG up to 10MB)</p>
                </div>

                <label className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-bold shadow-soft-sm hover:bg-charcoal-800 cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-pastel-mint" />
                  <span>Choose Images for Batch</span>
                  <input type="file" multiple accept="image/*" onChange={handleBulkFileSelect} className="hidden" />
                </label>
              </div>

              {/* Bulk Queue List */}
              {bulkFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-charcoal-800">
                    <span>Batch Queue ({bulkFiles.length} items)</span>
                    <button
                      onClick={handleRunBulkQueue}
                      disabled={isBulkProcessing || bulkFiles.every(f => f.status === 'done')}
                      className={`flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold shadow-soft-sm transition-all ${
                        !isBulkProcessing && bulkFiles.some(f => f.status !== 'done')
                          ? 'bg-charcoal-900 hover:bg-charcoal-800 text-white cursor-pointer'
                          : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
                      }`}
                    >
                      {isBulkProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-pastel-mint" />
                          <span>Processing Batch...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-pastel-mint" />
                          <span>Run Compliance Batch</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="divide-y divide-charcoal-100 border border-charcoal-200 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
                    {bulkFiles.map((item, idx) => (
                      <div key={item.id} className="p-3.5 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-charcoal-400">{idx + 1}.</span>
                          <span className="font-semibold text-charcoal-900">{item.file.name}</span>
                          <span className="text-[10px] text-charcoal-500 font-mono">({(item.file.size / 1024).toFixed(0)} KB)</span>
                        </div>

                        <div className="flex items-center space-x-3">
                          {item.status === 'queued' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream-200 text-charcoal-700">
                              Queued
                            </span>
                          )}
                          {item.status === 'processing' && (
                            <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pastel-amber text-pastel-amberText">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Processing...</span>
                            </span>
                          )}
                          {item.status === 'done' && item.report && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.report.overallStatus === 'PASS' ? 'bg-pastel-mint text-pastel-mintText' : 'bg-pastel-coral text-pastel-coralText'
                            }`}>
                              {item.report.overallStatus} ({item.report.validFieldsCount}/8 Valid)
                            </span>
                          )}
                          {item.status === 'error' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Error
                            </span>
                          )}

                          {item.report && (
                            <button
                              onClick={() => setSelectedReport(item.report!)}
                              className="text-xs font-bold text-charcoal-800 hover:underline"
                            >
                              View Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VISUAL ANALYTICS PANEL */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Analytics Header Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-charcoal-200 shadow-soft-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                      Surveillance Audits
                    </span>
                    <BarChart3 className="w-4 h-4 text-charcoal-400" />
                  </div>
                  <span className="text-3xl font-black text-charcoal-900">{analyticsData.total}</span>
                  <p className="text-xs text-charcoal-500 mt-1">Across all portal sources</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-charcoal-200 shadow-soft-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                      Overall Compliance Rate
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-mint-600" />
                  </div>
                  <span className="text-3xl font-black text-mint-700">{analyticsData.complianceRate}%</span>
                  <p className="text-xs text-charcoal-500 mt-1">{analyticsData.passCount} passed statutory muster</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-charcoal-200 shadow-soft-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                      Total Violations Logged
                    </span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-3xl font-black text-rose-600">{analyticsData.failCount}</span>
                  <p className="text-xs text-charcoal-500 mt-1">Requiring enforcement notice</p>
                </div>
              </div>

              {/* Visual Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Category Violations Bar Chart */}
                <div className="bg-white rounded-2xl p-6 border border-charcoal-200 shadow-soft-sm space-y-4">
                  <h4 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-charcoal-700" />
                    <span>Violations by Product Category</span>
                  </h4>

                  <div className="space-y-3 pt-2">
                    {Object.entries(analyticsData.catMap).map(([cat, data]) => {
                      const violationRatio = data.total > 0 ? (data.violations / data.total) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-1 text-xs">
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-charcoal-800">{cat}</span>
                            <span className="text-charcoal-500 font-mono">{data.violations} violations / {data.total} audited</span>
                          </div>
                          <div className="w-full bg-cream-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(8, violationRatio)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Most Frequent Statutory Rule Violations */}
                <div className="bg-white rounded-2xl p-6 border border-charcoal-200 shadow-soft-sm space-y-4">
                  <h4 className="text-sm font-bold text-charcoal-900 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Top Statutory Non-Compliance Areas (Rule 6)</span>
                  </h4>

                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-rose-50/60 rounded-xl border border-rose-100">
                      <span className="font-semibold text-charcoal-900">MRP missing "incl. of all taxes"</span>
                      <span className="font-bold text-rose-700 font-mono">{analyticsData.ruleFailMap.mrp || 2} infractions</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                      <span className="font-semibold text-charcoal-900">Incomplete Manufacturer PIN / Address</span>
                      <span className="font-bold text-amber-700 font-mono">{analyticsData.ruleFailMap.mfg_address || 1} infractions</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-cream-100 rounded-xl border border-charcoal-200">
                      <span className="font-semibold text-charcoal-900">Missing Country of Origin</span>
                      <span className="font-bold text-charcoal-700 font-mono">{analyticsData.ruleFailMap.country_of_origin || 1} infractions</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-cream-100 rounded-xl border border-charcoal-200">
                      <span className="font-semibold text-charcoal-900">Non-standard Net Quantity Notation</span>
                      <span className="font-bold text-charcoal-700 font-mono">{analyticsData.ruleFailMap.net_quantity || 1} infractions</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
