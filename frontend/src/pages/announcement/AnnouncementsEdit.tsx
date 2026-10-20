import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  announcementService,
  AnnouncementResponseDto,
  AnnouncementRequestDto,
  EReminderState,
} from "../../services/announcementService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

function formatForDatetimeLocal(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr.slice(0, 16);
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return isoStr.slice(0, 16);
  }
}

export default function AnnouncementsEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canManageAnnouncements } = useRoleAccess();

  const [item, setItem] = useState<AnnouncementResponseDto | null>(null);
  const [message, setMessage] = useState("");
  const [reminderState, setReminderState] = useState<EReminderState>("ALL");
  const [activeTime, setActiveTime] = useState("");
  const [expireTime, setExpireTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canManageAnnouncements) {
      navigate("/announcements");
    }
  }, [canManageAnnouncements, navigate]);

  useEffect(() => {
    const state = location.state as { item?: AnnouncementResponseDto } | null;
    const stored =
      state?.item ??
      (() => {
        const storedValue = sessionStorage.getItem("announcementEditItem");
        return storedValue ? JSON.parse(storedValue) : null;
      })();

    if (!stored) {
      navigate("/announcements");
      return;
    }

    sessionStorage.setItem("announcementEditItem", JSON.stringify(stored));
    setItem(stored);
    setMessage(stored.message || "");
    setReminderState(stored.reminderState || "ALL");
    setActiveTime(formatForDatetimeLocal(stored.activeTime));
    setExpireTime(formatForDatetimeLocal(stored.expireTime));
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    if (!message.trim()) {
      toast.error("Please enter a announcement message");
      return;
    }

    if (!activeTime) {
      toast.error("Active time is required");
      return;
    }

    if (!expireTime) {
      toast.error("Expire time is required");
      return;
    }

    if (new Date(expireTime).getTime() <= new Date(activeTime).getTime()) {
      toast.error("Expire time must be after active time");
      return;
    }

    setLoading(true);

    try {
      const formatIso = (str: string) => {
        if (str.length === 16) return `${str}:00`;
        return str;
      };

      const payload: AnnouncementRequestDto = {
        message: message.trim(),
        reminderState,
        activeTime: formatIso(activeTime),
        expireTime: formatIso(expireTime),
      };

      await announcementService.updateAnnouncement(item.announcementId, payload);
      sessionStorage.removeItem("announcementEditItem");
      navigate("/announcements");
    } catch {
      // Error handled in service toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs — Edit Announcements" description="Update school announcements details." />

      <div className="space-y-6">
        <ComponentCard title="Edit Announcement" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <select
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                value={reminderState}
                onChange={(e) => setReminderState(e.target.value as EReminderState)}
                disabled={loading}
              >
                <option value="ALL">ALL</option>
                <option value="STAFF">STAFF</option>
                <option value="PARENT">PARENT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                Message Content <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-transparent p-3 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 resize-y"
                placeholder="Write your announcement or reminder message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                  Active From <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={activeTime}
                  onChange={(e) => setActiveTime(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">
                  Expires At <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={expireTime}
                  onChange={(e) => setExpireTime(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Saving Changes..." : "Save Changes"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => navigate("/announcements")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
