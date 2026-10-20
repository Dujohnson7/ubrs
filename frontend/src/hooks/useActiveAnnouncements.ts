import { useState, useEffect, useCallback, useMemo } from "react";
import {
  announcementService,
  AnnouncementResponseDto,
  ANNOUNCEMENT_UPDATED_EVENT,
} from "../services/announcementService";
import { useAuth } from "./useAuth";
import { ERole } from "../services/authService";

function getAnnouncementStatus(activeTime?: string, expireTime?: string): "ACTIVE" | "SCHEDULED" | "EXPIRED" {
  const now = new Date().getTime();
  const start = activeTime ? new Date(activeTime).getTime() : 0;
  const end = expireTime ? new Date(expireTime).getTime() : Infinity;

  if (start && now < start) return "SCHEDULED";
  if (end && now > end) return "EXPIRED";
  return "ACTIVE";
}

export function useActiveAnnouncements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<AnnouncementResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAllAnnouncements();
      setAnnouncements(data || []);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAnnouncements();

    const handleUpdate = () => {
      void fetchAnnouncements();
    };

    window.addEventListener(ANNOUNCEMENT_UPDATED_EVENT, handleUpdate);
    const refreshInterval = setInterval(fetchAnnouncements, 60000);

    return () => {
      window.removeEventListener(ANNOUNCEMENT_UPDATED_EVENT, handleUpdate);
      clearInterval(refreshInterval);
    };
  }, [fetchAnnouncements]);

  const activeAnnouncements = useMemo(() => {
    const role = user?.role;
    return announcements.filter((n) => {
      if (role) {
        if (role === ERole.PARENT) {
          if (n.reminderState !== "ALL" && n.reminderState !== "PARENT") return false;
        } else {
          if (n.reminderState !== "ALL" && n.reminderState !== "STAFF") return false;
        }
      }
      const status = getAnnouncementStatus(n.activeTime, n.expireTime);
      return status === "ACTIVE";
    });
  }, [announcements, user?.role]);

  return { activeAnnouncements, loading, refetch: fetchAnnouncements };
}
