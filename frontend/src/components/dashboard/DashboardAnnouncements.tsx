import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { AnnouncementResponseDto } from "../../services/announcementService";
import { useActiveAnnouncements } from "../../hooks/useActiveAnnouncements";
import { useRoleAccess } from "../../hooks/useRoleAccess";
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

export default function DashboardAnnouncements() {
  const { activeAnnouncements, loading } = useActiveAnnouncements();
  const { canManageAnnouncements } = useRoleAccess();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
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
    if (activeAnnouncements.length <= 1 || isPaused || isDismissed) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
        setAnimating(false);
      }, 200);
    }, 12000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeAnnouncements.length, isPaused, isDismissed]);

  if (loading || activeAnnouncements.length === 0) {
    return null;
  }

  
  if (isDismissed) {
    return (
      <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="font-semibold">
            {activeAnnouncements.length} active announcement{activeAnnouncements.length > 1 ? "s" : ""} available
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Show Announcement
        </button>
      </div>
    );
  }

  const current = activeAnnouncements[currentIndex];
  if (!current) return null;

  const handlePrev = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + activeAnnouncements.length) % activeAnnouncements.length);
      setAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
      setAnimating(false);
    }, 150);
  };

  const isStaffTarget = current.reminderState === "STAFF";
  const isParentTarget = current.reminderState === "PARENT";

  const cardTheme = isStaffTarget
    ? "border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/20 dark:from-indigo-950/30 dark:via-gray-900 dark:to-indigo-950/20 dark:border-indigo-900/50"
    : isParentTarget
      ? "border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/20 dark:from-amber-950/30 dark:via-gray-900 dark:to-amber-950/20 dark:border-amber-900/50"
      : "border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/20 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/20 dark:border-blue-900/50";

  const pillBadgeStyles = isStaffTarget
    ? "bg-indigo-600 text-white"
    : isParentTarget
      ? "bg-amber-600 text-white"
      : "bg-blue-600 text-white";

  const iconBubbleStyles = isStaffTarget
    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
    : isParentTarget
      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
      : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300";

  return (
    <>
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-300 ${cardTheme}`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Announcement Megaphone Icon */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 ${iconBubbleStyles}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                />
              </svg>
            </div>

            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                School Announcement
              </span>
 

            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Counter if multiple */}
            {activeAnnouncements.length > 1 && (
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 tabular-nums mr-1">
                {currentIndex + 1} of {activeAnnouncements.length}
              </span>
            )}

            {/* Previous / Next buttons */}
            {activeAnnouncements.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 rounded-lg text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
                  aria-label="Previous Announcement"
                  title="Previous"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 rounded-lg text-gray-500 hover:bg-black/5 dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
                  aria-label="Next Announcement"
                  title="Next"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/5 dark:hover:text-gray-200 dark:hover:bg-white/5 transition-colors ml-1"
              title="Dismiss announcement banner for now"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Announcement Message Body - Fits when body has more words */}
        <div className="py-3">
          <div
            className={`transition-all duration-200 ${
              animating ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            <div className="max-h-36 overflow-y-auto break-words [overflow-wrap:anywhere] pr-1.5 custom-scrollbar select-text text-sm sm:text-base font-normal leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
              {current.message}
            </div>
          </div>
        </div>

        {/* Bottom Metadata & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Active:</span>
              <span>{formatDateTime(current.activeTime)}</span>
            </span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span className="flex items-center gap-1">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Expires:</span>
              <span>{formatDateTime(current.expireTime)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Dots indicator if multiple */}
            {activeAnnouncements.length > 1 && (
              <div className="flex items-center gap-1.5 mr-2">
                {activeAnnouncements.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentIndex
                        ? "w-4 bg-gray-800 dark:bg-white"
                        : "w-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                    }`}
                    aria-label={`Go to announcement ${idx + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Read / View details button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedAnnouncement(current)}
              className="text-xs py-1.5 px-3 h-8 shadow-2xs"
            >
              View Full Notice
            </Button>

            {/* Manage shortcut for head teachers */}
            {canManageAnnouncements && (
              <Link
                to="/announcements"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 ml-1 hover:underline"
              >
                Manage
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Full Details Modal when clicking 'View Full Notice' */}
      <Modal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        className="w-[calc(100vw-2rem)] sm:w-full max-w-lg p-5 sm:p-6 mx-auto"
      >
        {selectedAnnouncement && (
          <div className="space-y-4">
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
