import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileVideo,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Play,
  Info,
  X,
  Sparkles,
  Loader2,
  Film,
} from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Switch } from '../components/ui/Switch';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { ScanService } from '../services/scan.service';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/routes';

interface NewScanPageProps {
  onNavigate: (route: string) => void;
}

const SUPPORTED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv', '.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac'];
const MAX_SIZE_MB = 500;

export const NewScanPage: React.FC<NewScanPageProps> = ({ onNavigate }) => {
  const { organization } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real File Upload State
  const [realFile, setRealFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Video Metadata State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('entertainment');
  const [madeForKids, setMadeForKids] = useState('false');
  const [language, setLanguage] = useState('en');
  const [durationMinutes, setDurationMinutes] = useState('');

  // Scan Checklist Options
  const [checkCommunityGuidelines, setCheckCommunityGuidelines] = useState(true);
  const [checkAdvertiserSuitability, setCheckAdvertiserSuitability] = useState(true);
  const [checkCopyrightSignals, setCheckCopyrightSignals] = useState(true);
  const [checkMetadataIntegrity, setCheckMetadataIntegrity] = useState(true);
  const [sensitivity, setSensitivity] = useState<'STANDARD' | 'STRICT'>('STANDARD');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Real File Validation and Selection
  const handleProcessSelectedFile = (file: File) => {
    setSubmissionError(null);

    // Check size limit (500 MB)
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSubmissionError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Check extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setSubmissionError(`Unsupported format "${ext}". Please upload MP4, MOV, WebM, MP3, WAV, or AAC.`);
      return;
    }

    setRealFile(file);

    // Pre-populate title from clean filename if empty
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ').trim();
      setTitle(cleanName);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessSelectedFile(e.target.files[0]);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setRealFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Determine if CTA is ready
  const isCtaReady = () => {
    if (isSubmitting) return false;
    return realFile !== null;
  };

  // Handle Real Scan Submission
  const handleSubmitScan = async () => {
    if (!isCtaReady() || !realFile) return;
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const formData = new FormData();
      formData.append('file', realFile);
      if (organization?.id) formData.append('organizationId', organization.id);
      if (title.trim()) formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('tags', tags);
      formData.append('madeForKids', madeForKids);
      formData.append('language', language);
      formData.append('sensitivityLevel', sensitivity);
      formData.append('checkCommunityGuidelines', checkCommunityGuidelines.toString());
      formData.append('checkAdvertiserSuitability', checkAdvertiserSuitability.toString());
      formData.append('checkCopyrightSignals', checkCopyrightSignals.toString());
      formData.append('checkMetadataIntegrity', checkMetadataIntegrity.toString());

      const res = await ScanService.submitFileUploadScan(formData, (percent) => {
        setUploadProgress(percent);
      });

      // Navigate directly to scan detail / ingestion pipeline page
      onNavigate(ROUTES.SCAN_DETAIL(res.scan.id));
    } catch (err: any) {
      console.error('Scan submission error:', err);
      setSubmissionError(err?.message || 'Failed to initiate scan. Please try again.');
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Initiate PreScan"
        description="Upload video or audio media, configure planned metadata, and run AI pre-upload quality assurance."
        breadcrumbs={
          <Breadcrumb
            items={[
              { label: 'Workspace', onClick: () => onNavigate(ROUTES.DASHBOARD) },
              { label: 'New Scan' },
            ]}
          />
        }
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
            Workflow Step 1 of 2
          </span>
        }
      />

      {/* Submission Error Banner */}
      {submissionError && (
        <Alert variant="error" title="Could Not Initiate Scan">
          <div>{submissionError}</div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Media File Upload & Metadata Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: MEDIA UPLOAD */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-neutral-900">
                    Step 1: Upload Media File
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500 mt-0.5">
                    Select the exported video or audio file you want PreScan to review.
                  </CardDescription>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded border border-neutral-200">
                  Step 1 of 2
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Hidden Real File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.webm,.mkv,.mp3,.wav,.aac,.m4a,.ogg,.flac"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Dropzone Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !realFile && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  isDragging
                    ? 'border-neutral-900 bg-neutral-100/80 ring-2 ring-neutral-900/20'
                    : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/40 hover:bg-neutral-50/80 cursor-pointer'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mx-auto mb-3 shadow-2xs text-neutral-700">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-neutral-900 mb-1">
                  Drag and drop your video or audio file
                </h4>
                <p className="text-xs text-neutral-500 mb-4 max-w-md mx-auto">
                  Supported formats: MP4, MOV, WebM, MKV, MP3, WAV, AAC, M4A (up to 500 MB per scan).
                </p>

                {realFile ? (
                  <div
                    className="inline-flex items-center gap-3 p-3 px-4 rounded-xl bg-white border border-neutral-200 shadow-xs max-w-md text-left cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
                      {realFile.type.startsWith('audio') ? (
                        <FileAudio className="w-5 h-5 text-neutral-700" />
                      ) : (
                        <FileVideo className="w-5 h-5 text-neutral-700" />
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        {realFile.name}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        {(realFile.size / (1024 * 1024)).toFixed(2)} MB · {realFile.type || 'Media File'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <Button
                      type="button"
                      id="browse-file-btn"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files from Computer
                    </Button>
                  </div>
                )}
              </div>

              {/* Upload Progress Indicator during Active Upload */}
              {uploadProgress !== null && (
                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800 flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-600" />
                      Uploading Media to Partition...
                    </span>
                    <span className="font-mono text-neutral-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-neutral-900 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: METADATA CONFIGURATION */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                    Step 2: Video Metadata Context
                  </CardTitle>
                  <CardDescription>
                    Provide planned title, description, category, and tags for metadata integrity and policy checks.
                  </CardDescription>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded border border-neutral-200">
                  Metadata
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                id="video-title-input"
                label="Video Title"
                placeholder="e.g., Ultimate Productivity Systems (Full Breakdown)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText="Must match planned title on YouTube (max 100 characters)"
              />

              <Textarea
                id="video-description-input"
                label="Video Description & Links"
                placeholder="Paste the planned video description, timestamps, sponsor disclosures, and external links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                helperText="PreScan evaluates description links and sponsor disclosures for policy adherence"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  id="video-category-select"
                  label="Video Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: 'entertainment', label: 'Entertainment' },
                    { value: 'gaming', label: 'Gaming' },
                    { value: 'education', label: 'Education' },
                    { value: 'howto', label: 'Howto & Style' },
                    { value: 'news', label: 'News & Politics' },
                    { value: 'people', label: 'People & Blogs' },
                    { value: 'science', label: 'Science & Technology' },
                    { value: 'film', label: 'Film & Animation' },
                  ]}
                />

                <Select
                  id="made-for-kids-select"
                  label="Made for Kids Audience"
                  value={madeForKids}
                  onChange={(e) => setMadeForKids(e.target.value)}
                  options={[
                    { value: 'false', label: "No, it's not made for kids (Standard)" },
                    { value: 'true', label: "Yes, it's made for kids (COPPA)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    id="video-tags-input"
                    label="Tags (Comma separated)"
                    placeholder="productivity, workflow, guide"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    helperText="Checked for keyword stuffing signals"
                  />
                </div>

                <div>
                  <Select
                    id="audio-language-select"
                    label="Primary Audio Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    options={[
                      { value: 'en', label: 'English (Global)' },
                      { value: 'es', label: 'Spanish (Español)' },
                      { value: 'fr', label: 'French (Français)' },
                      { value: 'de', label: 'German (Deutsch)' },
                      { value: 'ja', label: 'Japanese (日本語)' },
                      { value: 'hi', label: 'Hindi (हिन्दी)' },
                      { value: 'pt', label: 'Portuguese (Português)' },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <Input
                    id="duration-estimate-input"
                    label="Estimated Duration (Minutes, Optional)"
                    placeholder="e.g., 14"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    helperText="Synchronized automatically during media stream analysis"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Scan Rules & Execution Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">
                Scan Rules & Scope
              </CardTitle>
              <CardDescription>
                Select which compliance dimensions to evaluate.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Switch
                label="Community Guidelines"
                description="Hate speech, harassment, violent content"
                checked={checkCommunityGuidelines}
                onCheckedChange={setCheckCommunityGuidelines}
              />

              <div className="border-t border-neutral-100 pt-3">
                <Switch
                  label="Advertiser Suitability"
                  description="Demonetization, profanity, sensitive topics"
                  checked={checkAdvertiserSuitability}
                  onCheckedChange={setCheckAdvertiserSuitability}
                />
              </div>

              <div className="border-t border-neutral-100 pt-3">
                <Switch
                  label="Copyright References"
                  description="Verbal music & commercial media mentions"
                  checked={checkCopyrightSignals}
                  onCheckedChange={setCheckCopyrightSignals}
                />
              </div>

              <div className="border-t border-neutral-100 pt-3">
                <Switch
                  label="Metadata Integrity"
                  description="Misleading tags & description alignment"
                  checked={checkMetadataIntegrity}
                  onCheckedChange={setCheckMetadataIntegrity}
                />
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Analysis Sensitivity
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="sensitivity-standard-btn"
                    onClick={() => setSensitivity('STANDARD')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      sensitivity === 'STANDARD'
                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    id="sensitivity-strict-btn"
                    onClick={() => setSensitivity('STRICT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      sensitivity === 'STRICT'
                        ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    Strict Review
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Action Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-2xs space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                Run PreScan Ingestion
              </h4>
              <p className="text-xs text-neutral-500 mt-1">
                {realFile
                  ? `${realFile.name} selected. Ready to upload and queue.`
                  : 'Select a video or audio file from your device to begin.'}
              </p>
            </div>

            <Button
              id="execute-scan-btn"
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )
              }
              disabled={!isCtaReady() || isSubmitting}
              onClick={handleSubmitScan}
            >
              {isSubmitting
                ? uploadProgress !== null
                  ? `Uploading (${uploadProgress}%)...`
                  : 'Starting Ingestion Pipeline...'
                : realFile
                ? 'Upload & Ingest File'
                : 'Select Media File'}
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>
                Tenant-isolated media storage and container analysis active.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
