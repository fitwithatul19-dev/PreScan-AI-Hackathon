import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  FileDown,
  VolumeX,
  Music,
  Scissors,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  PreScanV1ReportData,
  PreScanFinding,
  FindingSeverity,
  ReviewStatus,
  FindingReviewRecord,
  RiskLevel
} from '../types/report.types';

interface PreScanReportViewProps {
  report: PreScanV1ReportData;
  transcript?: {
    segments: Array<{ startSeconds: number; endSeconds: number; text: string }>;
    fullText: string;
    language?: string;
  } | null;
  reviews?: FindingReviewRecord[];
  onUpdateReview?: (findingId: string, reviewStatus: ReviewStatus, creatorNote?: string) => Promise<void>;
  onRetryAnalysis?: () => void;
  isAnalyzing?: boolean;
}

export const PreScanReportView: React.FC<PreScanReportViewProps> = ({
  report,
  transcript,
  onRetryAnalysis,
  isAnalyzing = false,
}) => {
  // Selected creator actions state in Verification Checklist
  const [selectedActions, setSelectedActions] = useState<Record<string, boolean>>({});
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const toggleAction = (actionKey: string) => {
    setSelectedActions((prev) => ({
      ...prev,
      [actionKey]: !prev[actionKey]
    }));
  };

  // Helper to extract category audit data safely
  const getCategoryData = (key: 'communityGuidelines' | 'advertiserSuitability' | 'copyrightSignals' | 'metadataIntegrity') => {
    const cats = report.categories as any;
    if (!cats) return null;
    if (key === 'communityGuidelines') return cats.communityGuidelines || cats.community_guidelines;
    if (key === 'advertiserSuitability') return cats.advertiserSuitability || cats.advertiser_suitability;
    if (key === 'copyrightSignals') return cats.copyrightSignals || cats.copyright_signals;
    if (key === 'metadataIntegrity') return cats.metadataIntegrity || cats.metadata_integrity;
    return null;
  };

  // 4 Core Category Audits
  const categoriesConfig = [
    {
      id: 'communityGuidelines',
      headline: 'Community Guidelines',
      defaultSubheadline: 'Standard safety guidelines appear satisfied.',
      data: getCategoryData('communityGuidelines'),
    },
    {
      id: 'advertiserSuitability',
      headline: 'Advertiser Suitability',
      defaultSubheadline: 'Language and subject matter appear advertiser-appropriate.',
      data: getCategoryData('advertiserSuitability'),
    },
    {
      id: 'copyrightSignals',
      headline: 'Copyright Signals',
      defaultSubheadline: 'No notable third-party media signal detected.',
      data: getCategoryData('copyrightSignals'),
    },
    {
      id: 'metadataIntegrity',
      headline: 'Metadata Integrity',
      defaultSubheadline: 'Dialogue aligns with the supplied video context.',
      data: getCategoryData('metadataIntegrity'),
    },
  ];

  // Helper for Category Risk Badge
  const renderRiskBadge = (level?: RiskLevel | string) => {
    const norm = (level || 'LOW').toUpperCase();
    switch (norm) {
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 border border-red-200 text-xs font-bold tracking-tight">
            <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
            <span>CRITICAL</span>
            <span className="text-red-700 font-normal ml-0.5">Risk Signal</span>
          </div>
        );
      case 'HIGH':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold tracking-tight">
            <ShieldAlert className="w-3.5 h-3.5 text-orange-700" />
            <span>HIGH</span>
            <span className="text-orange-700 font-normal ml-0.5">Risk Signal</span>
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold tracking-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>MEDIUM</span>
            <span className="text-amber-700 font-normal ml-0.5">Risk Signal</span>
          </div>
        );
      case 'LOW':
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold tracking-tight">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>LOW</span>
            <span className="text-emerald-700 font-normal ml-0.5">Risk Signal</span>
          </div>
        );
    }
  };

  // Severity badge for individual finding
  const renderSeverityBadge = (sev?: FindingSeverity | string) => {
    switch (sev) {
      case 'CRITICAL':
        return <Badge variant="danger">Critical</Badge>;
      case 'HIGH':
        return <Badge variant="warning">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">Medium</Badge>;
      case 'LOW':
      default:
        return <Badge variant="success">Low</Badge>;
    }
  };

  // Format timestamp (e.g., 00:42)
  const formatTimestamp = (finding: PreScanFinding) => {
    if (finding.start_timestamp) return finding.start_timestamp;
    if (finding.timestamp) return finding.timestamp;
    if (typeof finding.startSeconds === 'number') {
      const mins = Math.floor(finding.startSeconds / 60);
      const secs = Math.floor(finding.startSeconds % 60);
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return '00:00';
  };

  const findingsList = report.findings || [];
  const hasFindings = findingsList.length > 0;

  // Format upload / analysis date
  const formattedDate = report.metadata?.analyzedAt
    ? new Date(report.metadata.analyzedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const videoTitle = report.metadata?.title || 'Scanned Media';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* 1. TOP REPORT HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {videoTitle}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal">
            Uploaded {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 print:hidden">
          {onRetryAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetryAnalysis}
              disabled={isAnalyzing}
              className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-medium"
              leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />}
            >
              {isAnalyzing ? 'Re-scanning...' : 'Re-scan'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 font-semibold px-4 shadow-2xs text-xs"
            leftIcon={<FileDown className="w-3.5 h-3.5 text-neutral-600" />}
          >
            PDF
          </Button>
        </div>
      </div>

      {/* 2. RISK SUMMARY SECTION (4 CATEGORIES IN VERTICAL LAYOUT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Analysis Categories
          </h2>
        </div>

        <div className="space-y-3">
          {categoriesConfig.map((cat) => {
            const riskLevel = cat.data?.risk_level || 'LOW';
            // Use actual summary if short, otherwise use clean concise subheadline
            const rawSummary = cat.data?.summary;
            const subheadline =
              rawSummary && rawSummary.length < 110
                ? rawSummary
                : cat.defaultSubheadline;

            return (
              <div
                key={cat.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-xl bg-white border border-neutral-200/90 shadow-2xs hover:border-neutral-300 transition-colors"
              >
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-semibold text-neutral-900">
                    {cat.headline}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal max-w-xl">
                    {subheadline}
                  </p>
                </div>

                <div className="shrink-0 self-start sm:self-center">
                  {renderRiskBadge(riskLevel)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FINDINGS SECTION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            Findings
            {hasFindings && (
              <span className="text-[11px] font-mono font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-full">
                {findingsList.length}
              </span>
            )}
          </h2>
        </div>

        {/* Findings Container with internal vertical scroll */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
          {hasFindings ? (
            <div className="max-h-[380px] overflow-y-auto divide-y divide-neutral-100 p-2 sm:p-3 space-y-1">
              {findingsList.map((finding) => {
                const ts = formatTimestamp(finding);
                const title = finding.title || finding.category || 'Policy finding';
                const explanation =
                  finding.explanation ||
                  finding.reasoning ||
                  finding.quote ||
                  'Flagged during contextual dialogue analysis.';

                return (
                  <div
                    key={finding.id}
                    className="p-3.5 sm:p-4 rounded-xl hover:bg-neutral-50/80 transition-colors space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-xs font-mono font-semibold border border-neutral-200/80">
                          <Clock className="w-3 h-3 text-neutral-500" />
                          {ts}
                        </span>
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-900">
                          {title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {renderSeverityBadge(finding.severity)}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pl-0.5">
                      {explanation}
                    </p>

                    {finding.quote && (
                      <div className="text-xs text-neutral-500 bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-200/60 italic font-mono">
                        "{finding.quote}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean neutral confidence-oriented empty state */
            <div className="py-12 px-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">
                No notable language findings
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed font-normal">
                No flagged language moments were identified in the analyzed transcript.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. VERIFICATION CHECKLIST (Shown only when there are relevant findings) */}
      {hasFindings && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Verification Checklist
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'beep', label: 'Beep / Mute', icon: VolumeX },
              { key: 'replace', label: 'Replace Audio', icon: Music },
              { key: 'cut', label: 'Edit / Cut', icon: Scissors },
              { key: 'review', label: 'Review Context', icon: Eye },
            ].map((action) => {
              const Icon = action.icon;
              const isSelected = !!selectedActions[action.key];

              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={() => toggleAction(action.key)}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all select-none text-left ${
                    isSelected
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs ring-1 ring-neutral-900'
                      : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isSelected ? 'text-white' : 'text-neutral-600'
                    }`}
                  />
                  <span>{action.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional: Collapsible Transcript Explorer for reference */}
      {transcript && transcript.segments && transcript.segments.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowFullTranscript(!showFullTranscript)}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors py-1"
          >
            <FileText className="w-3.5 h-3.5 text-neutral-500" />
            <span>Full Transcript ({transcript.segments.length} segments)</span>
            {showFullTranscript ? (
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
            )}
          </button>

          {showFullTranscript && (
            <div className="mt-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 max-h-60 overflow-y-auto space-y-2 text-xs text-neutral-700 font-mono">
              {transcript.segments.map((seg, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="text-neutral-400 shrink-0 select-none">
                    [{Math.floor(seg.startSeconds / 60)}:{(seg.startSeconds % 60).toFixed(0).padStart(2, '0')}]
                  </span>
                  <span className="text-neutral-800 font-sans">{seg.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
