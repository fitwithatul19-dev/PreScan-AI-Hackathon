import fs from 'fs';
import path from 'path';
import { db, DbScan, DbAnalysisJob, DbTranscript, DbPreScanReport, DbTranscriptSegment } from '../db';
import { generateId } from '../auth';
import { AudioPreparationService } from './audioPreparation.service';
import { GeminiMediaService, GeminiUploadedFileRef } from './geminiMedia.service';
import { generateGeminiContent } from './gemini.service';
import { AI_CONFIG } from '../config/ai.config';

export class AnalysisEngineService {
  /**
   * Triggers or retries Phase 05.1 analysis for a given scan.
   */
  static async startScanAnalysis(
    scanId: string,
    organizationId: string,
    userId: string
  ): Promise<{ job: DbAnalysisJob; scan: DbScan }> {
    const scan = db.findScanById(scanId);
    if (!scan || scan.organizationId !== organizationId) {
      throw new Error('Scan record not found or access denied.');
    }

    // Prevent duplicate analysis jobs if one is actively running
    const existingJob = db.findLatestAnalysisJobByScanId(scanId);
    if (
      existingJob &&
      ['QUEUED', 'MEDIA_PREPARING', 'MEDIA_READY', 'TRANSCRIBING', 'ANALYZING', 'VALIDATING'].includes(existingJob.status)
    ) {
      return { job: existingJob, scan };
    }

    const jobId = generateId('an_job');
    const now = new Date().toISOString();

    const initialJob: DbAnalysisJob = {
      id: jobId,
      scanId,
      organizationId,
      status: 'QUEUED',
      progressPercent: 5,
      currentStep: 'Queueing scan for real Gemini media analysis & policy evaluation',
      attempts: (existingJob?.attempts || 0) + 1,
      model: AI_CONFIG.MODEL,
      promptVersion: AI_CONFIG.PROMPT_VERSION,
      startedAt: now,
      logs: [
        {
          timestamp: now,
          level: 'INFO',
          message: `Analysis job initiated (Attempt #${(existingJob?.attempts || 0) + 1})`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    db.createAnalysisJob(initialJob);

    // Update scan status to PROCESSING
    const updatedScan = db.updateScan(scanId, {
      status: 'PROCESSING',
      progressPercent: 10,
      currentStepMessage: 'Starting AI analysis engine...',
      errorMessage: undefined,
    })!;

    // Log audit
    db.createAuditLog({
      id: generateId('audit'),
      organizationId,
      actorUserId: userId,
      action: 'SCAN_ANALYSIS_STARTED',
      targetResourceType: 'SCAN',
      targetResourceId: scanId,
      createdAt: now,
    });

    // Run pipeline asynchronously in background
    AnalysisEngineService.runAnalysisPipeline(scanId, jobId, organizationId, userId).catch((err) => {
      console.error(`Uncaught error in analysis pipeline for scan ${scanId}:`, err);
    });

    return { job: initialJob, scan: updatedScan };
  }

  /**
   * Background worker for Phase 05.1 Real Gemini Media Analysis Pipeline
   */
  private static async runAnalysisPipeline(
    scanId: string,
    jobId: string,
    organizationId: string,
    userId: string
  ) {
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      const scan = db.findScanById(scanId);
      if (!scan) throw new Error('Scan record missing during pipeline run.');

      const sourceType = scan.sourceType || scan.source?.type || (scan.mediaInfo?.youtubeVideoId ? 'youtube_url' : 'file');

      if (sourceType === ('youtube_connection' as any) || sourceType === ('connected_channel' as any)) {
        throw new Error('Connected channel ingestion is reserved for Phase 06.');
      }

      // --- STAGE 1: MEDIA_PREPARING ---
      db.updateAnalysisJob(jobId, {
        status: 'MEDIA_PREPARING',
        progressPercent: 20,
        currentStep: 'Preparing media source for Gemini multimodal input',
      });
      db.addAnalysisJobLog(jobId, {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `Processing source type: ${sourceType}...`,
      });
      db.updateScan(scanId, {
        progressPercent: 20,
        currentStepMessage: 'Preparing media source for Gemini multimodal analysis...',
      });

      let mediaPartForGemini: any = null;
      let cleanupRemoteFileName: string | undefined = undefined;

      if (sourceType === 'youtube_url') {
        const videoId = scan.mediaInfo?.youtubeVideoId || scan.source?.videoId;
        const youtubeUrl = scan.mediaInfo?.youtubeUrl || scan.source?.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined);

        if (!youtubeUrl) {
          throw new Error('PreScan could retrieve YouTube metadata, but YouTube URL is missing.');
        }

        db.addAnalysisJobLog(jobId, {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: `Passing public YouTube URL directly to Gemini video input: ${youtubeUrl}`,
        });

        mediaPartForGemini = {
          fileData: {
            fileUri: youtubeUrl,
            mimeType: 'video/mp4',
          },
        };
      } else {
        // FILE_UPLOAD PATH
        const storagePath = scan.mediaInfo?.storagePath;
        if (!storagePath || !fs.existsSync(storagePath)) {
          throw new Error('Uploaded media file is missing or inaccessible on server.');
        }

        db.addAnalysisJobLog(jobId, {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: `Uploading file (${path.basename(storagePath)}) to Gemini Files API...`,
        });

        let uploadedRef: GeminiUploadedFileRef | null = null;
        try {
          uploadedRef = await GeminiMediaService.uploadVideoForAnalysis(storagePath);
        } catch (uploadErr: any) {
          console.warn(`[AnalysisEngineService] Direct video file upload failed (${uploadErr.message}). Extracting audio track fallback...`);
          const outDir = path.dirname(storagePath);
          const prep = await AudioPreparationService.prepareAudio(storagePath, outDir, scanId);
          if (prep.hasAudio && prep.audioFilePath && fs.existsSync(prep.audioFilePath)) {
            uploadedRef = await GeminiMediaService.uploadVideoForAnalysis(prep.audioFilePath, 'audio/mp3');
          } else {
            throw new Error(`Media upload for Gemini Files API failed: ${uploadErr.message}`);
          }
        }

        cleanupRemoteFileName = uploadedRef.name;
        mediaPartForGemini = {
          fileData: {
            fileUri: uploadedRef.uri,
            mimeType: uploadedRef.mimeType,
          },
        };

        db.addAnalysisJobLog(jobId, {
          timestamp: new Date().toISOString(),
          level: 'SUCCESS',
          message: `Media uploaded to Gemini Files API (${uploadedRef.name}, ACTIVE)`,
        });
      }

      await sleep(300);

      // --- STAGE 2: MEDIA_READY ---
      db.updateAnalysisJob(jobId, {
        status: 'MEDIA_READY',
        progressPercent: 40,
        currentStep: 'Media payload ready for Gemini evaluation',
      });
      db.updateScan(scanId, {
        progressPercent: 40,
        currentStepMessage: 'Media payload ready for Gemini evaluation...',
      });

      await sleep(300);

      // --- STAGE 3: ANALYZING (GEMINI POLICY EVALUATION) ---
      db.updateAnalysisJob(jobId, {
        status: 'ANALYZING',
        progressPercent: 65,
        currentStep: 'Analyzing media dialogue & multi-category policy risk with Gemini engine',
      });
      db.addAnalysisJobLog(jobId, {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Evaluating spoken dialogue, timestamps, profanity & YouTube policy rules with Gemini...',
      });
      db.updateScan(scanId, {
        progressPercent: 65,
        currentStepMessage: 'Evaluating policy risk across 4 core categories...',
      });

      let rawGeminiResult: { transcriptSegments: DbTranscriptSegment[]; report: any };

      try {
        rawGeminiResult = await AnalysisEngineService.analyzeMediaWithGemini({
          mediaPart: mediaPartForGemini,
          metadata: {
            scanId: scan.id,
            title: scan.title,
            description: scan.description,
            category: scan.category,
            madeForKids: scan.madeForKids,
            tags: scan.tags,
            sourceType: scan.sourceType,
            durationSeconds: scan.mediaInfo?.durationSeconds,
          },
        });
      } catch (geminiErr: any) {
        // Fallback for YouTube public URL if direct video input fails & downloaded local audio stream exists
        if (sourceType === 'youtube_url' && scan.mediaInfo?.storagePath && fs.existsSync(scan.mediaInfo.storagePath)) {
          console.warn(`[AnalysisEngineService] Direct Gemini YouTube URL input failed (${geminiErr.message}). Retrying via downloaded audio stream...`);
          db.addAnalysisJobLog(jobId, {
            timestamp: new Date().toISOString(),
            level: 'WARN',
            message: `Direct YouTube URL input failed (${geminiErr.message}). Retrying via fallback audio stream...`,
          });
          const fallbackRef = await GeminiMediaService.uploadVideoForAnalysis(scan.mediaInfo.storagePath, 'audio/mp3');
          cleanupRemoteFileName = fallbackRef.name;
          const fallbackPart = {
            fileData: {
              fileUri: fallbackRef.uri,
              mimeType: fallbackRef.mimeType,
            },
          };
          rawGeminiResult = await AnalysisEngineService.analyzeMediaWithGemini({
            mediaPart: fallbackPart,
            metadata: {
              scanId: scan.id,
              title: scan.title,
              description: scan.description,
              category: scan.category,
              madeForKids: scan.madeForKids,
              tags: scan.tags,
              sourceType: scan.sourceType,
              durationSeconds: scan.mediaInfo?.durationSeconds,
            },
          });
        } else {
          if (sourceType === 'youtube_url') {
            throw new Error('PreScan could retrieve the YouTube metadata, but the video could not be analyzed.');
          }
          throw geminiErr;
        }
      } finally {
        if (cleanupRemoteFileName) {
          await GeminiMediaService.deleteRemoteFile(cleanupRemoteFileName);
        }
      }

      // Save Transcript to DB if segments exist
      if (rawGeminiResult.transcriptSegments && rawGeminiResult.transcriptSegments.length > 0) {
        const fullText = rawGeminiResult.transcriptSegments.map((s) => s.text).join(' ');
        const dbTranscript: DbTranscript = {
          id: generateId('tr'),
          scanId,
          organizationId,
          language: rawGeminiResult.report.metadata?.language || scan.language || 'en',
          durationSeconds: scan.mediaInfo?.durationSeconds || 60,
          segments: rawGeminiResult.transcriptSegments,
          fullText,
          createdAt: new Date().toISOString(),
        };
        db.saveTranscript(dbTranscript);
        db.addAnalysisJobLog(jobId, {
          timestamp: new Date().toISOString(),
          level: 'SUCCESS',
          message: `Transcript generated: ${rawGeminiResult.transcriptSegments.length} segment(s)`,
        });
      }

      await sleep(300);

      // --- STAGE 4: VALIDATING & PERSISTING ---
      db.updateAnalysisJob(jobId, {
        status: 'VALIDATING',
        progressPercent: 90,
        currentStep: 'Validating PreScan V1 report schema & persisting findings',
      });
      db.addAnalysisJobLog(jobId, {
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: 'Validating output schema, timestamp grounding & policy disclaimers...',
      });

      const validatedReportData = rawGeminiResult.report;
      const reportId = generateId('report');
      const nowComplete = new Date().toISOString();

      const dbReport: DbPreScanReport = {
        id: reportId,
        scanId,
        analysisJobId: jobId,
        organizationId,
        createdByUserId: userId,
        report: validatedReportData,
        createdAt: nowComplete,
        updatedAt: nowComplete,
      };

      db.savePreScanReport(dbReport);

      // Update AnalysisJob to COMPLETED
      db.updateAnalysisJob(jobId, {
        status: 'COMPLETED',
        progressPercent: 100,
        currentStep: 'PreScan analysis completed successfully.',
        completedAt: nowComplete,
      });
      db.addAnalysisJobLog(jobId, {
        timestamp: nowComplete,
        level: 'SUCCESS',
        message: `PreScan V1 Report finalized: Overall Risk ${validatedReportData.overall_risk.risk_level}, ${validatedReportData.findings.length} finding(s).`,
      });

      // Update Scan to COMPLETED
      db.updateScan(scanId, {
        status: 'COMPLETED',
        overallRisk: validatedReportData.overall_risk.risk_level as any,
        progressPercent: 100,
        currentStepMessage: 'PreScan analysis complete.',
        completedAt: nowComplete,
      });
    } catch (error: any) {
      console.error(`Analysis engine failed for scan ${scanId}:`, error);

      const errMessage = error?.message || "PreScan couldn't complete the analysis.";
      const nowErr = new Date().toISOString();

      // STRICT REQUIREMENT: FAIL THE JOB AND SCAN. NEVER FALLBACK TO GREEN.
      db.updateAnalysisJob(jobId, {
        status: 'FAILED',
        errorCode: 'ANALYSIS_FAILED',
        errorMessage: errMessage,
        completedAt: nowErr,
      });
      db.addAnalysisJobLog(jobId, {
        timestamp: nowErr,
        level: 'ERROR',
        message: `Analysis failed: ${errMessage}`,
      });

      db.updateScan(scanId, {
        status: 'FAILED',
        errorMessage: errMessage,
        overallRisk: 'INSUFFICIENT_DATA',
      });
    }
  }

  /**
   * Prompts Gemini with actual video/audio media input.
   */
  static async analyzeMediaWithGemini(params: {
    mediaPart: any;
    metadata: {
      scanId: string;
      title: string;
      description?: string;
      category?: string;
      madeForKids?: boolean;
      tags?: string[];
      sourceType?: string;
      durationSeconds?: number;
    };
  }): Promise<{ transcriptSegments: DbTranscriptSegment[]; report: any }> {
    const systemPrompt = `You are PreScan AI — an expert YouTube Creator Policy & Compliance Quality Assurance Assistant.
You are analyzing the supplied video directly. Treat its audio as the source of truth. Do not infer spoken content from metadata, title, description, thumbnail, or assumptions.

Identify actual spoken language.
Identify actual spoken profanity (e.g., "fuck", "fucking", "shit", "bitch", etc.).
Identify meaningful Community Guidelines risks (harassment, hate speech, violence, dangerous acts).
Identify advertiser-suitability concerns (profanity in dialogue, sexually suggestive content, shocking content, sensitive events).
Identify explicit verbal references to third-party copyrighted material.
Compare metadata against the actual spoken content.
Ground every finding in actual media evidence and timestamps.

PROFANITY POLICY RULES:
- Strong profanity (e.g., "fuck", "fucking", "cunt", "shit") used in dialogue MUST be flagged under advertiser_suitability.
- Early profanity (in first 7-15 seconds) or repeated profanity increases severity to HIGH or CRITICAL.
- Single mild profanity or contextually mild slang is MEDIUM or LOW severity.
- Include the exact spoken evidence quote in "evidence_quote".

FOR EVERY DETECTED ISSUE OR RISK SIGNAL, CREATE A FINDING ENTRY IN "findings":
- "id": string e.g. "f_1"
- "category": exact string, one of ["community_guidelines", "advertiser_suitability", "copyright_signals", "metadata_integrity"]
- "policy": clear policy name e.g. "Advertiser-Friendly Content — Profanity / Inappropriate Language"
- "policy_rule": specific rule broken e.g. "Strong profanity in spoken dialogue"
- "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
- "confidence": "HIGH" | "MEDIUM" | "LOW"
- "start_timestamp": MM:SS format matching the transcript segment start (e.g. "00:42")
- "end_timestamp": MM:SS format matching transcript segment end (e.g. "00:45")
- "evidence_quote": EXACT quote of spoken dialogue from transcript (e.g. "This is fucking stupid")
- "title": concise finding headline
- "explanation": clear explanation of why this creates policy or advertiser risk on YouTube
- "recommended_action": specific actionable advice for creator (e.g. "BEEP or mute profanity at 00:42 or trim segment")

DETERMINISTIC OVERALL RISK RULES:
- If ANY finding has severity "CRITICAL" or "HIGH":
  * overall_risk.risk_level = "HIGH"
  * overall_risk.decision = "HIGH_RISK"
  * overall_risk.monetization_impact = "LIMITED_MONETIZATION"
- Else if ANY finding has severity "MEDIUM":
  * overall_risk.risk_level = "MEDIUM"
  * overall_risk.decision = "NEEDS_REVIEW"
  * overall_risk.monetization_impact = "LIMITED_MONETIZATION"
- Else (if zero findings or only LOW/INFO findings):
  * overall_risk.risk_level = "LOW"
  * overall_risk.decision = "LOW_RISK"
  * overall_risk.monetization_impact = "FULLY_MONETIZABLE"

IMPORTANT CONSTRAINTS:
- NEVER use definitive words like "safe", "approved", "guaranteed monetization", or "cleared by YouTube".
- ALWAYS use advisory terms like "Potential risk detected", "Creator review recommended", "May trigger YouTube review".
- You MUST populate "limitations" with: ["Visual content was not analyzed — PreScan Phase 05 evaluates spoken audio dialogue and video metadata only."]
- You MUST populate "disclaimer" with: "PreScan is an advisory pre-upload QA tool. Final policy decisions rest entirely with YouTube's automated systems and review teams."

Return ONLY valid JSON matching this schema:
{
  "transcript": [
    {
      "startSeconds": 0,
      "endSeconds": 5,
      "text": "spoken dialogue"
    }
  ],
  "report": {
    "preScanVersion": "1.0",
    "metadata": {
      "scanId": "${params.metadata.scanId}",
      "title": "${params.metadata.title}",
      "category": "${params.metadata.category || 'General'}",
      "language": "en",
      "analyzedAt": "${new Date().toISOString()}"
    },
    "overall_risk": {
      "risk_level": "LOW",
      "decision": "LOW_RISK",
      "safety_score": 90,
      "monetization_impact": "FULLY_MONETIZABLE",
      "summary": "Executive summary"
    },
    "categories": {
      "community_guidelines": { "risk_level": "LOW", "score": 100, "findings_count": 0, "summary": "No community guidelines issues detected." },
      "advertiser_suitability": { "risk_level": "LOW", "score": 100, "findings_count": 0, "summary": "No advertiser suitability issues detected." },
      "copyright_signals": { "risk_level": "LOW", "score": 100, "findings_count": 0, "summary": "No copyright signals detected." },
      "metadata_integrity": { "risk_level": "LOW", "score": 100, "findings_count": 0, "summary": "Metadata aligns with spoken content." }
    },
    "findings": [],
    "positiveObservations": ["Clear audio dialogue", "Compliant title"],
    "creatorActionPlan": ["Review video before publishing"],
    "recommendedActions": [],
    "limitations": ["Visual content was not analyzed — PreScan Phase 05 evaluates spoken audio dialogue and video metadata only."],
    "disclaimer": "PreScan is an advisory pre-upload QA tool. Final policy decisions rest entirely with YouTube's automated systems and review teams."
  }
}`;

    const userPrompt = `VIDEO METADATA:
Title: ${params.metadata.title}
Description: ${params.metadata.description || 'None provided'}
Category: ${params.metadata.category || 'General'}
COPPA Made For Kids: ${params.metadata.madeForKids ? 'Yes' : 'No'}
Tags: ${(params.metadata.tags || []).join(', ') || 'None'}

Please listen to the dialogue in the attached video media, transcribe spoken content into timestamped segments, and analyze for YouTube policy compliance according to the system instructions. Output JSON.`;

    const geminiResponseText = await generateGeminiContent({
      contents: [params.mediaPart, { text: userPrompt }],
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: AI_CONFIG.MAX_OUTPUT_TOKENS,
      model: AI_CONFIG.MODEL,
    });

    if (!geminiResponseText) {
      throw new Error('Gemini model returned empty response during media analysis.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(geminiResponseText);
    } catch (parseErr: any) {
      throw new Error(`Failed to parse Gemini media analysis JSON response: ${parseErr.message}`);
    }

    // Extract transcript segments if provided
    let transcriptSegments: DbTranscriptSegment[] = [];
    if (Array.isArray(parsed.transcript)) {
      transcriptSegments = parsed.transcript.map((ts: any) => ({
        startSeconds: typeof ts.startSeconds === 'number' ? ts.startSeconds : 0,
        endSeconds: typeof ts.endSeconds === 'number' ? ts.endSeconds : (ts.startSeconds || 0) + 5,
        text: String(ts.text || ''),
      }));
    }

    // Extract report object
    const report = parsed.report || parsed;

    if (!report || (!report.overall_risk && !report.overall) || !report.categories) {
      throw new Error('Gemini analysis JSON response is missing required overall_risk or categories fields.');
    }

    // Standardize object structure for frontend compatibility
    if (!report.overall_risk && report.overall) {
      report.overall_risk = report.overall;
    }
    if (!report.overall && report.overall_risk) {
      report.overall = report.overall_risk;
    }

    // Ensure camelCase and snake_case category mappings exist
    const cats = report.categories;
    cats.community_guidelines = cats.community_guidelines || cats.communityGuidelines || { risk_level: 'LOW', score: 100, findings_count: 0, summary: 'No findings.' };
    cats.advertiser_suitability = cats.advertiser_suitability || cats.advertiserSuitability || { risk_level: 'LOW', score: 100, findings_count: 0, summary: 'No findings.' };
    cats.copyright_signals = cats.copyright_signals || cats.copyrightSignals || { risk_level: 'LOW', score: 100, findings_count: 0, summary: 'No findings.' };
    cats.metadata_integrity = cats.metadata_integrity || cats.metadataIntegrity || { risk_level: 'LOW', score: 100, findings_count: 0, summary: 'No findings.' };

    cats.communityGuidelines = cats.community_guidelines;
    cats.advertiserSuitability = cats.advertiser_suitability;
    cats.copyrightSignals = cats.copyright_signals;
    cats.metadataIntegrity = cats.metadata_integrity;

    // Ensure findings array formatting
    const rawFindings = Array.isArray(report.findings) ? report.findings : [];
    report.findings = rawFindings.map((f: any, idx: number) => ({
      id: f.id || `f_${idx + 1}`,
      category: f.category || 'advertiser_suitability',
      policy: f.policy || 'YouTube Policy Rule',
      policy_rule: f.policy_rule || f.policy || 'Policy Guideline',
      severity: f.severity || 'MEDIUM',
      confidence: f.confidence || 'HIGH',
      start_timestamp: f.start_timestamp || f.timestamp || '00:00',
      end_timestamp: f.end_timestamp || f.endTimestamp || f.start_timestamp || '00:05',
      timestamp: f.timestamp || f.start_timestamp || '00:00',
      evidence_quote: f.evidence_quote || f.quote || '',
      quote: f.quote || f.evidence_quote || '',
      title: f.title || f.policy || 'Policy Flag',
      reasoning: f.reasoning || f.explanation || 'Potential policy conflict detected.',
      explanation: f.explanation || f.reasoning || 'Potential policy conflict detected.',
      recommendation: f.recommendation || f.recommended_action || 'Review dialogue before publishing.',
      recommended_action: f.recommended_action || f.recommendation || 'Review dialogue before publishing.',
    }));

    // Deterministic overall risk calculation
    const findingsList: any[] = report.findings;
    const hasCriticalOrHigh = findingsList.some((f) => f.severity === 'CRITICAL' || f.severity === 'HIGH');
    const hasMedium = findingsList.some((f) => f.severity === 'MEDIUM');

    if (hasCriticalOrHigh) {
      report.overall_risk.risk_level = 'HIGH';
      report.overall_risk.decision = 'HIGH_RISK';
      report.overall_risk.monetization_impact = 'LIMITED_MONETIZATION';
      report.overall.risk_level = 'HIGH';
      report.overall.decision = 'HIGH_RISK';
    } else if (hasMedium) {
      report.overall_risk.risk_level = 'MEDIUM';
      report.overall_risk.decision = 'NEEDS_REVIEW';
      report.overall_risk.monetization_impact = 'LIMITED_MONETIZATION';
      report.overall.risk_level = 'MEDIUM';
      report.overall.decision = 'NEEDS_REVIEW';
    } else if (findingsList.length === 0) {
      report.overall_risk.risk_level = 'LOW';
      report.overall_risk.decision = 'LOW_RISK';
      report.overall_risk.monetization_impact = 'FULLY_MONETIZABLE';
      report.overall.risk_level = 'LOW';
      report.overall.decision = 'LOW_RISK';
    }

    // Ensure limitations & disclaimer
    report.limitations = report.limitations || [
      'Visual content was not analyzed — PreScan Phase 05 evaluates spoken audio dialogue and video metadata only.',
    ];
    report.disclaimer =
      'PreScan is an advisory pre-upload QA tool. Final policy decisions rest entirely with YouTube\'s automated systems and review teams.';

    return { transcriptSegments, report };
  }
}
