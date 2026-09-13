import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  DollarSign,
  Copyright,
  FileText,
  Plus,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileVideo,
  Clock,
  RefreshCw,
  AlertCircle,
  UploadCloud,
  History,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { CAPABILITIES } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';
import { ScanService } from '../services/scan.service';
import { Scan } from '../types/models';
import { ScanStatus, RiskLevel } from '../types/enums';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, organization } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState(true);

  const capabilityIcons: Record<string, React.ReactNode> = {
    'community-guidelines': <ShieldAlert className="w-5 h-5 text-neutral-800" />,
    'advertiser-suitability': <DollarSign className="w-5 h-5 text-neutral-800" />,
    'copyright-signals': <Copyright className="w-5 h-5 text-neutral-800" />,
    'metadata-integrity': <FileText className="w-5 h-5 text-neutral-800" />,
  };

  useEffect(() => {
    let isMounted = true;
    const fetchScans = async () => {
      setIsLoadingScans(true);
      try {
        const res = await ScanService.listScans({
          organizationId: organization?.id,
          limit: 5,
        });
        if (isMounted) {
          setScans(res.scans || []);
        }
      } catch (err) {
        console.error('Failed to load scans:', err);
      } finally {
        if (isMounted) setIsLoadingScans(false);
      }
    };

    fetchScans();
    return () => {
      isMounted = false;
    };
  }, [organization?.id]);

  const renderStatusBadge = (status: ScanStatus, progress?: number) => {
    switch (status) {
      case ScanStatus.READY_FOR_ANALYSIS:
      case ScanStatus.COMPLETED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Ready
          </span>
        );
      case ScanStatus.INGESTING:
      case ScanStatus.VALIDATING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
            Processing {progress ? `(${progress}%)` : ''}
          </span>
        );
      case ScanStatus.QUEUED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Queued
          </span>
        );
      case ScanStatus.FAILED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-800 border border-red-200">
            <AlertCircle className="w-3 h-3 text-red-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700">
            {status}
          </span>
        );
    }
  };

  const renderRiskBadge = (risk?: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            Low Risk
          </span>
        );
      case RiskLevel.REVIEW_REQUIRED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-700" />
            Review Required
          </span>
        );
      case RiskLevel.IMPORTANT:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-700" />
            Important Review
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Page Header */}
      <PageHeader
        title="Dashboard"
        description="Pre-upload quality assurance and risk analysis workspace."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active Session
          </span>
        }
      />

      {/* 1. Medium-sized "Start your new scan" Primary Section */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-medium">
              <UploadCloud className="w-3.5 h-3.5 text-neutral-200" />
              <span>Pre-Upload Content Verification</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Start your new scan
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Upload your video (MP4, MOV, WebM) or audio (MP3, WAV, AAC) to run multi-dimensional policy, advertiser suitability, and copyright risk screening before publishing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="lg"
              className="bg-white text-neutral-950 hover:bg-neutral-100 font-bold shadow-sm"
              leftIcon={<Plus className="w-5 h-5 text-neutral-950" />}
              onClick={() => onNavigate(ROUTES.NEW_SCAN)}
            >
              New Scan
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Scan History Section — ONLY rendered when scans exist for current user */}
      {scans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Scan History
                </h3>
                <p className="text-xs text-neutral-500">
                  Recent pre-upload scans and analysis reports for your account.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate(ROUTES.SCANS)}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-950 inline-flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-neutral-100"
            >
              <span>View all scans ({scans.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {scans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => onNavigate(ROUTES.SCAN_DETAIL(scan.id))}
                className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50/70 transition-all cursor-pointer shadow-2xs"
              >
                {/* Media Icon & Details */}
                <div className="flex items-center gap-3.5 overflow-hidden flex-1">
                  <div className="w-11 h-11 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 shrink-0 shadow-2xs group-hover:bg-neutral-200/70 transition-colors">
                    <FileVideo className="w-5 h-5" />
                  </div>

                  <div className="overflow-hidden space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900 truncate group-hover:text-neutral-950">
                        {scan.title}
                      </h4>
                      {renderRiskBadge(scan.overallRisk)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                      <span className="font-mono text-[11px] font-semibold text-neutral-700 uppercase">
                        {scan.mediaInfo?.format || 'Media File'}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">
                        {new Date(scan.createdAt).toLocaleDateString()} at{' '}
                        {new Date(scan.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {scan.mediaInfo?.fileSizeBytes && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[11px]">
                            {(scan.mediaInfo.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(scan.status, scan.progressPercent)}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:border-neutral-900 font-semibold"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Analysis Capabilities Overview */}
      <div className="space-y-3 pt-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
            Analysis Capabilities
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Four core dimensions evaluated during each PreScan execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {CAPABILITIES.map((cap) => (
            <Card key={cap.id} variant="default" className="flex flex-col justify-between">
              <div>
                <CardHeader className="mb-2.5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                      {capabilityIcons[cap.id]}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-neutral-900">
                        {cap.name}
                      </CardTitle>
                      <span className="text-[11px] text-neutral-500 font-medium">
                        {cap.shortDescription}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="mb-3">
                  <p className="text-xs text-neutral-600 leading-relaxed mb-2.5">
                    {cap.details}
                  </p>
                  <ul className="space-y-1.5">
                    {cap.coverageList.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-neutral-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-mono text-[11px]">Compliance Engine</span>
                <span className="text-neutral-400">Standard Rule-Set</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Multi-Tenant Isolation Architecture Note */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 flex items-start gap-4 shadow-xs">
        <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
          <Lock className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-1">
            Tenant Isolation Architecture
          </h4>
          <p className="text-xs text-neutral-500 leading-relaxed">
            All media files, audio transcriptions, and generated reports are partitioned by workspace ID (<code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-800 font-mono">{organization?.id || 'org_active'}</code>).
          </p>
        </div>
      </div>
    </div>
  );
};

