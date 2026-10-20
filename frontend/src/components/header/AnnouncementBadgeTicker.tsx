import { useState, useEffect, useRef } from "react";
import { AnnouncementResponseDto } from "../../services/announcementService";
import { useActiveAnnouncements } from "../../hooks/useActiveAnnouncements";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

function formatDateTime(isoString?: string): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

interface AnnouncementBadgeTickerProps {
  announcements?: AnnouncementResponseDto[];
  isMobileBanner?: boolean;
}

export default function AnnouncementBadgeTicker({
  announcements: propAnnouncements,
  isMobileBanner = false,
}: AnnouncementBadgeTickerProps) {
  const { activeAnnouncements: hookAnnouncements } = useActiveAnnouncements();
  const activeAnnouncements = propAnnouncements ?? hookAnnouncements;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementResponseDto | null>(null);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeAnnouncements.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= activeAnnouncements.length) {
      setCurrentIndex(0);
    }
  }, [activeAnnouncements.length, currentIndex]);

  useEffect(() => {
    if (activeAnnouncements.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
        setAnimating(false);
      }, 200);
    }, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAnnouncements.length, isPaused]);

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const current = activeAnnouncements[currentIndex];
  if (!current) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
      setAnimating(false);
    }, 150);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
      setAnimating(false);
    }, 150);
  };

  const isStaffTarget = current.reminderState === "STAFF";
  const isParentTarget = current.reminderState === "PARENT";

  const colorStyles = isStaffTarget
    ? "border-indigo-400/30 bg-indigo-50/90 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-200"
    : isParentTarget
      ? "border-amber-400/30 bg-amber-50/90 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
      : "border-blue-400/30 bg-blue-50/90 text-blue-900 dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-200";

  const pillBadgeStyles = isStaffTarget
    ? "bg-indigo-600 text-white"
    : isParentTarget
      ? "bg-amber-600 text-white"
      : "bg-blue-600 text-white";

  const tickerContent = (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => setSelectedAnnouncement(current)}
      title="Click to view full announcement (auto-rotates every 10 seconds)"
      className={`group relative flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 rounded-full border shadow-xs cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${
        isMobileBanner
          ? "w-full max-w-full"
          : "w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[520px]"
      } ${colorStyles}`}
    >
      {/* Pulsing Announcement Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
      </div>

      {/* Audience / Badge Indicator */}
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${pillBadgeStyles}`}>
        Announcement
      </span>

      {/* Counter (e.g. 1/4) if more than 1 announcement */}
      {activeAnnouncements.length > 1 && (
        <span className="text-[11px] font-bold opacity-75 shrink-0 tabular-nums">
          {currentIndex + 1}/{activeAnnouncements.length}
        </span>
      )}

      {/* Message Content with smooth transition */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <p
          className={`text-xs sm:text-sm font-medium truncate transition-all duration-200 ${
            animating ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
          }`}
        >
          {current.message}
        </p>
      </div>

      {/* Manual prev/next arrows if multiple */}
      {activeAnnouncements.length > 1 && (
        <div className="flex items-center gap-0.5 shrink-0 ml-1">
          <button
            type="button"
            onClick={handlePrev}
            title="Previous announcement"
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Previous announcement"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            title="Next announcement"
            className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Next announcement"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobileBanner ? (
        <div className="w-full px-3 py-1.5 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50 lg:hidden flex justify-center">
          {tickerContent}
        </div>
      ) : (
        tickerContent
      )}

      {/* Detail Modal when clicked */}
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        className="w-[calc(100vw-2rem)] sm:w-full max-w-lg p-5 sm:p-6 mx-auto"
      >
        {selectedAnnouncement && (
          <div className="space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 pr-10 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                  Active Announcement
                </h3>
              </div>
              <span
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                  selectedAnnouncement.reminderState === "STAFF"
                    ? "bg-indigo-600 text-white"
                    : selectedAnnouncement.reminderState === "PARENT"
                      ? "bg-amber-600 text-white"
                      : "bg-blue-600 text-white"
                }`}
              >
                Audience: {selectedAnnouncement.reminderState}
              </span>
            </div>

            {/* Announcement Message Body - Fits when body has more words */}
            <div className="p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed text-sm sm:text-base font-normal max-h-[50vh] sm:max-h-[55vh] overflow-y-auto break-words [overflow-wrap:anywhere] overscroll-contain select-text">
              {selectedAnnouncement.message}
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 p-3 rounded-xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Active:</span>
                <span>{formatDateTime(selectedAnnouncement.activeTime)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Expires:</span>
                <span>{formatDateTime(selectedAnnouncement.expireTime)}</span>
              </div>
            </div>

            {/* Footer with Close Button */}
            <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedAnnouncement(null)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
