import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  FileText,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { PreScanV1ReportData, PreScanFinding } from '../types/report.types';

interface PreScanReportViewProps {
  report: PreScanV1ReportData;
  transcript?: {
    segments: Array<{ startSeconds: number; endSeconds: number; text: string }>;
    fullText: string;
    language?: string;
  } | null;
  onRetryAnalysis?: () => void;
  isAnalyzing?: boolean;
}

export const PreScanReportView: React.FC<PreScanReportViewProps> = ({
  report,
  transcript,
  onRetryAnalysis,
  isAnalyzing = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'findings' | 'transcript' | 'categories'>('findings');
  const [highlightedTime, setHighlightedTime] = useState<number | null>(null);
  const [copiedQuoteId, setCopiedQuoteId] = useState<string | null>(null);

  // Filter findings based on category and severity
  const filteredFindings = report.findings.filter((finding) => {
    const matchesCategory =
      selectedCategory === 'ALL' || finding.category === selectedCategory;
    const matchesSeverity =
      selectedSeverity === 'ALL' || finding.severity === selectedSeverity;
    return matchesCategory && matchesSeverity;
  });

  // Overall Risk styling helper
  const getOverallRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold uppercase tracking-wide">Low Policy Risk</span>
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span className="text-xs font-bold uppercase tracking-wide">Moderate Risk — Review Advised</span>
          </div>
        );
      case 'HIGH':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 text-orange-900 border border-orange-300 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-orange-700" />
            <span className="text-xs font-bold uppercase tracking-wide">High Risk Detected</span>
          </div>
        );
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-900 border border-red-300 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-red-700" />
            <span className="text-xs font-bold uppercase tracking-wide">Critical Policy Flag</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300">
            <Info className="w-4 h-4 text-neutral-500" />
            <span className="text-xs font-bold uppercase tracking-wide">{level}</span>
          </div>
        );
    }
  };

  // Severity pill helper
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <Badge variant="danger">Critical</Badge>;
      case 'HIGH':
        return <Badge variant="warning">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium</Badge>;
      case 'LOW':
        return <Badge variant="success">Low</Badge>;
      case 'INFO':
        return <Badge variant="neutral">Info</Badge>;
      default:
        return <Badge variant="neutral">{severity}</Badge>;
    }
  };

  // Category name formatting
  const formatCategoryName = (catKey: string) => {
    switch (catKey) {
      case 'community_guidelines':
        return 'Community Guidelines';
      case 'advertiser_suitability':
        return 'Advertiser Suitability';
      case 'copyright_signals':
        return 'Copyright Signals';
      case 'metadata_integrity':
        return 'Metadata Integrity';
      default:
        return catKey.replace(/_/g, ' ');
    }
  };

  const handleCopyQuote = (quote: string, id: string) => {
    navigator.clipboard.writeText(quote);
    setCopiedQuoteId(id);
    setTimeout(() => setCopiedQuoteId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP OVERALL RISK BANNER */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-700" />
              <h3 className="text-base font-bold text-neutral-900">PreScan V1 Policy Audit Report</h3>
            </div>
            <p className="text-xs text-neutral-500">
              Evaluated with Gemini AI against YouTube Policy & Advertiser Guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {getOverallRiskBadge(report.overall_risk?.risk_level || (report.overall as any)?.risk_level)}
            {onRetryAnalysis && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryAnalysis}
                disabled={isAnalyzing}
                leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />}
              >
                {isAnalyzing ? 'Re-analyzing...' : 'Re-run Scan'}
              </Button>
            )}
          </div>
        </div>

        {/* Executive Summary & Metadata Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2 bg-neutral-50/70 p-4 rounded-xl border border-neutral-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Executive Summary & Policy Posture
            </h4>
            <p className="text-xs text-neutral-700 leading-relaxed font-sans">
              {report.overall_risk?.summary || report.overall?.summary}
            </p>
          </div>

          <div className="space-y-2 bg-neutral-50/70 p-4 rounded-xl border border-neutral-200 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              Scan Specifications
            </h4>
            <div className="space-y-1.5 text-neutral-600 font-sans">
              <div className="flex justify-between">
                <span>Language:</span>
                <span className="font-mono font-bold text-neutral-900">{transcript?.language || report.metadata?.language || 'en'}</span>
              </div>
              <div className="flex justify-between">
                <span>Content Category:</span>
                <span className="font-semibold text-neutral-900">{report.metadata?.category || 'General'}</span>
              </div>
              {transcript?.segments && (
                <div className="flex justify-between">
                  <span>Audio Segments:</span>
                  <span className="font-mono font-bold text-neutral-900">{transcript.segments.length} segments</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Category Risk Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(report.categories || {}).map(([catKey, catData]: [string, any]) => {
            if (['communityGuidelines', 'advertiserSuitability', 'copyrightSignals', 'metadataIntegrity'].includes(catKey)) {
              return null; // Skip duplicate camelCase entries
            }
            const riskLevel = catData.risk_level;
            const isHigh = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
            const isMedium = riskLevel === 'MEDIUM';

            return (
              <div
                key={catKey}
                onClick={() => {
                  setSelectedCategory(catKey);
                  setActiveTab('findings');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCategory === catKey
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                    : isHigh
                    ? 'border-red-200 bg-red-50/50 hover:bg-red-50'
                    : isMedium
                    ? 'border-amber-200 bg-amber-50/50 hover:bg-amber-50'
                    : 'border-neutral-200 bg-white hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      selectedCategory === catKey ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {formatCategoryName(catKey)}
                  </span>
                  <Badge
                    variant={
                      selectedCategory === catKey
                        ? 'neutral'
                        : isHigh
                        ? 'danger'
                        : isMedium
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {riskLevel}
                  </Badge>
                </div>
                <div
                  className={`text-sm font-bold font-sans ${
                    selectedCategory === catKey
                      ? 'text-white'
                      : isHigh
                      ? 'text-red-700'
                      : isMedium
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  Status: {riskLevel} RISK
                </div>
                <p
                  className={`text-[11px] mt-1 line-clamp-2 ${
                    selectedCategory === catKey ? 'text-neutral-300' : 'text-neutral-500'
                  }`}
                >
                  {catData.findings_count} finding(s) identified.
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. TABBED NAVIGATION */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'findings' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('findings')}
            leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
          >
            Findings ({filteredFindings.length})
          </Button>
          {transcript && (
            <Button
              variant={activeTab === 'transcript' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('transcript')}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              Speech Transcript ({transcript.segments?.length || 0} segments)
            </Button>
          )}
          <Button
            variant={activeTab === 'categories' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('categories')}
            leftIcon={<Info className="w-3.5 h-3.5" />}
          >
            Category Audits
          </Button>
        </div>

        {activeTab === 'findings' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-neutral-300 rounded-lg text-xs px-2.5 py-1 text-neutral-800 font-medium focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="ALL">All Categories ({report.findings.length})</option>
              <option value="community_guidelines">Community Guidelines</option>
              <option value="advertiser_suitability">Advertiser Suitability</option>
              <option value="copyright_signals">Copyright Signals</option>
              <option value="metadata_integrity">Metadata Integrity</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. TAB CONTENT: FINDINGS */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {filteredFindings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-900">No Policy Flags Match Filter</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  No policy issues or risk signals were detected under the currently selected category or severity level.
                </p>
                {selectedCategory !== 'ALL' && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedCategory('ALL')}>
                    Reset Category Filter
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredFindings.map((finding) => (
              <Card key={finding.id} className="overflow-hidden border-neutral-200">
                <CardHeader className="bg-neutral-50/50 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {getSeverityBadge(finding.severity)}
                      <span className="text-xs font-bold font-mono uppercase text-neutral-500">
                        {formatCategoryName(finding.category)}
                      </span>
                      <span className="text-neutral-300">•</span>
                      <span className="text-xs font-mono font-semibold text-neutral-700 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {finding.start_timestamp} → {finding.end_timestamp}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-neutral-400">
                      Rule: {finding.policy_rule}
                    </span>
                  </div>

                  <CardTitle className="text-sm font-bold text-neutral-900 mt-2">
                    {finding.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  {/* Spoken Quote Box */}
                  {finding.evidence_quote && (
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                          Spoken Dialogue Evidence Quote
                        </span>
                        <button
                          onClick={() => handleCopyQuote(finding.evidence_quote, finding.id)}
                          className="text-amber-800 hover:text-amber-950 text-[11px] flex items-center gap-1 font-mono"
                        >
                          {copiedQuoteId === finding.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Quote</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-amber-950 italic font-serif leading-relaxed">
                        "{finding.evidence_quote}"
                      </p>
                    </div>
                  )}

                  {/* Policy Explanation */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                      Policy Analysis & Risk Context
                    </span>
                    <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                      {finding.explanation}
                    </p>
                  </div>

                  {/* Creator Action */}
                  <div className="p-3 rounded-lg bg-neutral-900 text-neutral-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                      Recommended Creator Action
                    </span>
                    <p className="text-xs text-neutral-200 leading-relaxed font-sans">
                      {finding.recommended_action}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 4. TAB CONTENT: TRANSCRIPT */}
      {activeTab === 'transcript' && transcript && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-neutral-900">
                  Audio Speech Transcript
                </CardTitle>
                <CardDescription className="text-xs text-neutral-500">
                  Extracted audio text with timestamp anchors for line-by-line review.
                </CardDescription>
              </div>
              <Badge variant="neutral">Language: {transcript.language || 'en'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {transcript.segments.map((seg, idx) => {
                const isSelected =
                  highlightedTime !== null &&
                  highlightedTime >= seg.startSeconds &&
                  highlightedTime <= seg.endSeconds;

                const minutes = Math.floor(seg.startSeconds / 60);
                const seconds = Math.floor(seg.startSeconds % 60);
                const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

                return (
                  <div
                    key={idx}
                    onClick={() => setHighlightedTime(seg.startSeconds)}
                    className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isSelected ? 'bg-neutral-800 text-emerald-400' : 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        [{timeStr}]
                      </span>
                    </div>
                    <p className="leading-relaxed font-sans">{seg.text}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. TAB CONTENT: CATEGORY AUDITS */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(report.categories || {}).map(([catKey, catData]: [string, any]) => (
            <Card key={catKey}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-neutral-900">
                    {formatCategoryName(catKey)}
                  </CardTitle>
                  <Badge
                    variant={
                      catData.risk_level === 'HIGH' || catData.risk_level === 'CRITICAL'
                        ? 'danger'
                        : catData.risk_level === 'MEDIUM'
                        ? 'warning'
                        : 'success'
                    }
                  >
                    {catData.risk_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500">Compliance Score</span>
                  <span className="font-mono font-bold text-neutral-900">{catData.score} / 100</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Category Audit Summary
                  </span>
                  <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                    {catData.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* POSITIVE OBSERVATIONS & CREATOR ACTION PLAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report.positiveObservations && report.positiveObservations.length > 0 && (
          <Card className="border-emerald-200 bg-emerald-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Positive Compliance Observations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-xs text-neutral-800 font-sans">
                {report.positiveObservations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{obs}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {(report.creatorActionPlan || report.recommendedActions) && (
          <Card className="border-neutral-900 bg-neutral-900 text-neutral-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Creator Pre-Upload Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-xs text-neutral-200 font-sans">
                {(report.creatorActionPlan || report.recommendedActions).map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono font-bold">{i + 1}.</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* LIMITATIONS NOTICE */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-950 space-y-1">
        <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-700" />
          PreScan Phase 05 Technical Limitations
        </h5>
        <p className="text-[11px] text-amber-900 leading-relaxed font-sans">
          {report.limitations?.[0] || 'Visual content was not analyzed — PreScan Phase 05 evaluates spoken audio dialogue and video metadata only.'}
        </p>
      </div>

      {/* 6. MANDATORY PRESCAN DISCLAIMER */}
      <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-600 space-y-1.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-neutral-700" />
          <h5 className="font-bold text-neutral-900 text-xs uppercase tracking-wider">
            PreScan Mandatory Policy Disclaimer
          </h5>
        </div>
        <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">
          {report.disclaimer ||
            'PreScan is an advisory pre-upload QA tool. Final policy decisions rest entirely with YouTube\'s automated systems and review teams.'}
        </p>
      </div>
    </div>
  );
};
