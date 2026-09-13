import React, { useState, useEffect } from 'react';
import { FileVideo, Sparkles } from 'lucide-react';
import { Scan } from '../types/models';

interface ScanProcessingViewProps {
  scan: Scan;
}

const EDUCATIONAL_FACTS = [
  "Strong profanity appearing in the first few seconds of a video can trigger stricter advertiser suitability checks than language appearing later.",
  "Contextual speech analysis helps distinguish between benign colloquial slang and policy-sensitive language.",
  "Reviewing timestamped transcripts before publishing enables creators to make targeted audio edits or bleeps efficiently.",
  "Clear titles and accurate descriptions help automated review systems categorize your content's intended audience correctly.",
  "Advertiser-friendly guidelines evaluate sensitive topics based on whether coverage is educational, documentary, or sensationalized.",
  "Background audio, secondary speech, and guest dialogue are evaluated alongside primary voiceovers during pre-upload checks.",
  "Disclosing commercial sponsorships and endorsements in video metadata supports consumer protection and platform transparency.",
  "The frequency of moderate language across a video can accumulate a different policy sensitivity score than an isolated occurrence.",
  "Timestamp markers give video editors exact cut points to adjust audio levels or apply targeted tone bleeps.",
  "Selecting the correct primary dialogue language ensures speech recognition models achieve the highest transcription accuracy.",
  "Educational content discussing sensitive historical or news events is evaluated differently when neutral, non-graphic framing is maintained.",
  "Pre-upload quality assurance helps creators protect their monetization status before distributing content publicly.",
  "Maintaining metadata consistency across titles, thumbnails, and descriptions helps minimize automated false-positive flags.",
  "Modern advertiser guidelines emphasize creator context and comedic tone when evaluating informal conversational expressions."
];

export const ScanProcessingView: React.FC<ScanProcessingViewProps> = ({ scan }) => {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prevIndex) => (prevIndex + 1) % EDUCATIONAL_FACTS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const mediaLabel = scan.mediaInfo?.fileName || scan.title || 'Media Upload';

  return (
    <div
      className="max-w-2xl mx-auto py-8 sm:py-12 space-y-6"
      role="status"
      aria-live="polite"
      aria-label="Scan in progress"
    >
      {/* Main Processing Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-8 sm:p-12 text-center shadow-xs space-y-6">
        {/* Subtle, Professional Loading Animation */}
        <div className="flex items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Outer subtle glow ring */}
            <div className="absolute inset-0 rounded-full bg-neutral-100 animate-ping opacity-30" />
            {/* Ambient track ring */}
            <div className="absolute inset-0 rounded-full border-2 border-neutral-100" />
            {/* Rotating dark spinner ring */}
            <div className="w-16 h-16 rounded-full border-3 border-transparent border-t-black border-r-black animate-spin" />
            {/* Center minimalist dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-black absolute" />
          </div>
        </div>

        {/* Status Headings */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Analyzing your content…
          </h2>
          <p className="text-sm text-neutral-500 max-w-md mx-auto leading-relaxed">
            Please wait while PreScan reviews your media.
          </p>
        </div>

        {/* Ingested Media Badge */}
        {mediaLabel && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-50 text-neutral-700 text-xs font-medium border border-neutral-200 max-w-full">
              <FileVideo className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate max-w-xs">{mediaLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* "Did you know?" Educational Callout Card */}
      <div className="bg-neutral-50/80 rounded-2xl border border-neutral-200/80 p-6 sm:p-8 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Did you know?</span>
        </div>

        {/* Fact content with smooth key transition */}
        <div className="min-h-[4rem] flex items-center justify-center px-2">
          <p
            key={factIndex}
            className="text-sm sm:text-base text-neutral-700 font-normal leading-relaxed italic max-w-lg transition-opacity duration-300"
          >
            "{EDUCATIONAL_FACTS[factIndex]}"
          </p>
        </div>

        {/* Subtle Rotation Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-2" aria-hidden="true">
          {EDUCATIONAL_FACTS.slice(0, 5).map((_, i) => {
            const isActive = factIndex % 5 === i;
            return (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isActive ? 'w-5 bg-neutral-800' : 'w-1.5 bg-neutral-300'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
