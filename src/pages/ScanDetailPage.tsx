import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileVideo,
  Youtube,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Trash2,
  XCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Info,
  Check,
  AlertTriangle,
  Play,
  FileCheck2,
  HelpCircle,
  Copy,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ScanService } from '../services/scan.service';
import { Scan, IngestionJob } from '../types/models';
import { ScanStatus } from '../types/enums';
import { PreScanReportView } from '../components/PreScanReportView';
import { ScanProcessingView } from '../components/ScanProcessingView';
import { PreScanV1ReportData } from '../types/report.types';
import { ROUTES } from '../router/routes';

interface ScanDetailPageProps {
  scanId: string;
  onNavigate: (route: string) => void;
}

export const ScanDetailPage: React.FC<ScanDetailPageProps> = ({ scanId, onNavigate }) => {
  const [scan, setScan] = useState<Scan | null>(null);
  const [job, setJob] = useState<IngestionJob | null>(null);
  const [report, setReport] = useState<PreScanV1ReportData | null>(null);
  const [transcript, setTranscript] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTechnicalLogs, setShowTechnicalLogs] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Fetch report data if scan completed
  const fetchReport = useCallback(async () => {
    try {
      const repData = await ScanService.getScanReport(scanId);
      if (repData && repData.report) {
        setReport(repData.report);
        setTranscript(repData.transcript);
        if (repData.reviews) {
          setReviews(repData.reviews);
        }
      }
    } catch (err) {
      console.warn('Report not ready yet:', err);
    }
  }, [scanId]);

  // Handle Review Update
  const handleUpdateReview = async (findingId: string, reviewStatus: any, creatorNote?: string) => {
    try {
      const res = await ScanService.updateFindingReview(scanId, findingId, reviewStatus, creatorNote);
      if (res.success && res.review) {
        setReviews((prev) => {
          const idx = prev.findIndex((r) => r.findingId === findingId);
          if (idx !== -1) {
            const copy = [...prev];
            copy[idx] = res.review;
            return copy;
          } else {
            return [...prev, res.review];
          }
        });
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update finding review state.');
    }
  };

  // Fetch scan data
  const fetchScan = useCallback(async (isBackground = false) => {
    if (!isBackground) setIsLoading(true);
    try {
      const data = await ScanService.getScanById(scanId);
      setScan(data.scan);
      if (data.job) setJob(data.job);
      setError(null);

      if (data.scan.status === ScanStatus.COMPLETED) {
        await fetchReport();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load scan details.');
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, [scanId, fetchReport]);

  // Retry pipeline execution
  const handleRetryScan = async () => {
    setIsRetrying(true);
    try {
      const res = await ScanService.retryScan(scanId);
      if (res.scan) {
        setScan(res.scan);
        setReport(null);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to retry scan.');
    } finally {
      setIsRetrying(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  // Active polling while scan is running
  useEffect(() => {
    if (!scan) return;
    const isTerminal =
      scan.status === ScanStatus.COMPLETED ||
      scan.status === ScanStatus.FAILED ||
      scan.status === ScanStatus.CANCELLED;

    if (isTerminal) return;

    const interval = setInterval(async () => {
      try {
        const logsData = await ScanService.getScanLogs(scanId);
        setScan((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: logsData.scanStatus as ScanStatus,
            progressPercent: logsData.progressPercent,
            currentStepMessage: logsData.currentStep,
            errorMessage: logsData.errorDetails || prev.errorMessage,
          };
        });

        if (job) {
          setJob((prevJob) => {
            if (!prevJob) return null;
            return {
              ...prevJob,
              status: logsData.jobStatus as any,
              progressPercent: logsData.progressPercent,
              currentStep: logsData.currentStep,
              logs: logsData.logs,
            };
          });
        }

        if (logsData.scanStatus === ScanStatus.COMPLETED) {
          fetchReport();
          fetchScan(true);
        } else if (
          logsData.scanStatus === ScanStatus.FAILED ||
          logsData.scanStatus === ScanStatus.CANCELLED
        ) {
          fetchScan(true);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [scan?.status, scanId, fetchScan, fetchReport, job]);

  // Scroll terminal to bottom on new logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job?.logs?.length]);

  // Cancel in-progress scan
  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await ScanService.cancelScan(scanId);
      await fetchScan(true);
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel scan.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Delete scan
  const handleDeleteScan = async () => {
    setIsDeleting(true);
    try {
      await ScanService.deleteScan(scanId);
      onNavigate(ROUTES.SCANS);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete scan.');
      setIsDeleting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Status helper badge
  const getStatusBadge = (status: ScanStatus | string) => {
    switch (status) {
      case ScanStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Scan Complete
          </span>
        );
      case ScanStatus.FAILED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-300">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            Scan Failed
          </span>
        );
      case ScanStatus.CANCELLED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
            <XCircle className="w-3.5 h-3.5 text-neutral-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 text-white border border-neutral-800 shadow-2xs">
            <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            Analyzing Content…
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin" />
        <p className="text-xs text-neutral-500 font-mono">Loading scan details...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="space-y-6 py-12 max-w-xl mx-auto">
        <Alert variant="error" title="Scan Not Found">
          {error || 'The requested scan record could not be loaded or has been deleted.'}
        </Alert>
        <Button variant="outline" onClick={() => onNavigate(ROUTES.SCANS)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Scan History
        </Button>
      </div>
    );
  }

  const isTerminal =
    scan.status === ScanStatus.COMPLETED ||
    scan.status === ScanStatus.FAILED ||
    scan.status === ScanStatus.CANCELLED;

  const logs = job?.logs || [];
  const errorCode = scan.errorCode || scan.errorDetails?.code || 'PROCESSING_ERROR';
  const attempts = scan.attempts || 1;
  const canRetry = attempts < 3;

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumbs */}
      <PageHeader
        title={scan.title}
        description={`PreScan Workflow · Initiated ${new Date(scan.createdAt).toLocaleString()}`}
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Workspace', onClick: () => onNavigate(ROUTES.DASHBOARD) },
              { label: 'Scans', onClick: () => onNavigate(ROUTES.SCANS) },
              { label: scan.title },
            ]}
          />
        }
        badge={getStatusBadge(scan.status)}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!isTerminal && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                leftIcon={<XCircle className="w-4 h-4 text-neutral-500" />}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Scan'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
            >
              Delete
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate(ROUTES.NEW_SCAN)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              New Scan
            </Button>
          </div>
        }
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">Delete Scan Record?</h3>
                <p className="text-xs text-neutral-500">This action will remove the scan and its stored media files.</p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{scan.title}</strong>? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Keep Scan
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteScan}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FAILED STATE CARDS */}
      {scan.status === ScanStatus.FAILED && (
        <div className="p-6 rounded-2xl bg-white border border-red-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-red-100">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600 shrink-0 border border-red-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">
                    {scan.errorMessage || scan.errorDetails?.message || 'Scan Processing Encountered an Error'}
                  </h3>
                  <button
                    onClick={() => handleCopyCode(errorCode)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
                    title="Click to copy error code"
                  >
                    <code>{errorCode}</code>
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-red-500" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {scan.errorDetails?.reason || 'The media processing pipeline was interrupted during execution.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-neutral-500 font-medium">
                Attempt {attempts} of 3
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRetryScan}
                disabled={isRetrying || !canRetry}
                className="bg-neutral-900 text-white hover:bg-neutral-800"
                leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />}
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            </div>
          </div>

          {/* Actionable Advice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <HelpCircle className="w-4 h-4 text-neutral-600" />
                Recommended Next Step
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {scan.errorDetails?.action ||
                  'Verify that the video is public/unlisted and contains clear audio dialogue, then click Try Again.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                <FileVideo className="w-4 h-4 text-neutral-600" />
                Alternative Source Option
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                If YouTube URL streaming is restricted, you can upload the original MP4 video or MP3 audio file directly.
              </p>
            </div>
          </div>

          {/* Collapsible Technical Error Logs */}
          <div className="border-t border-neutral-100 pt-4">
            <button
              onClick={() => setShowTechnicalLogs(!showTechnicalLogs)}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Technical Diagnostics & Event Logs</span>
              {showTechnicalLogs ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>

            {showTechnicalLogs && (
              <div className="mt-3 bg-neutral-950 text-neutral-200 font-mono text-xs rounded-xl p-4 space-y-2 max-h-56 overflow-y-auto border border-neutral-900">
                {logs.length > 0 ? (
                  logs.map((log: any, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <span className="text-neutral-500 text-[10px] shrink-0 select-none">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                          log.level === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.level === 'WARN'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : log.level === 'ERROR'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {log.level}
                      </span>
                      <span className="text-neutral-300">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 text-xs py-1">No execution logs captured.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLETED REPORT VIEW */}
      {scan.status === ScanStatus.COMPLETED && report ? (
        <PreScanReportView
          report={report}
          transcript={transcript}
          reviews={reviews}
          onUpdateReview={handleUpdateReview}
          onRetryAnalysis={handleRetryScan}
          isAnalyzing={isRetrying}
        />
      ) : scan.status !== ScanStatus.FAILED ? (
        /* CLEAN PRESCAN PROCESSING STATE */
        <ScanProcessingView scan={scan} />
      ) : null}
    </div>
  );
};
