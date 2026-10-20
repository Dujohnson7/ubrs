import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export type EReminderState = "ALL" | "STAFF" | "PARENT";

export interface AnnouncementRequestDto {
  message: string;
  reminderState: EReminderState;
  activeTime: string;  
  expireTime: string; 
}

export interface AnnouncementResponseDto {
  announcementId: string;
  message: string;
  reminderState: EReminderState;
  activeTime: string;
  expireTime: string;
}

export const ANNOUNCEMENT_UPDATED_EVENT = "ubrs:announcement:updated";

function notifyChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ANNOUNCEMENT_UPDATED_EVENT));
  }
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const rawText = await response.text();

  if (rawText.trim().startsWith("<")) {
    throw new Error("Unexpected non-JSON response from server.");
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error(fallbackMessage);
  }
}

async function getAllAnnouncements(): Promise<AnnouncementResponseDto[]> {
  const response = await fetch(getApiUrl("/api/announcement/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    const message = await response.text();
    toast.error(message || "Failed to load announcements");
    throw new Error(message || "Failed to load announcements");
  }

  return parseJsonResponse<AnnouncementResponseDto[]>(response, "Unable to parse announcements from server.");
}

async function getAnnouncementById(announcementId: string): Promise<AnnouncementResponseDto> {
  const response = await fetch(getApiUrl(`/api/announcement/${announcementId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load announcement");
    throw new Error(message || "Failed to load announcement");
  }

  return parseJsonResponse<AnnouncementResponseDto>(response, "Unable to parse announcement data.");
}

async function registerAnnouncement(dto: AnnouncementRequestDto): Promise<AnnouncementResponseDto> {
  const response = await fetch(getApiUrl("/api/announcement/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create announcement");
    throw new Error(message || "Failed to create announcement");
  }

  toast.success("Announcement published successfully");
  notifyChange();
  return parseJsonResponse<AnnouncementResponseDto>(response, "Unable to parse created announcement.");
}

async function updateAnnouncement(announcementId: string, dto: AnnouncementRequestDto): Promise<AnnouncementResponseDto> {
  const response = await fetch(getApiUrl(`/api/announcement/update/${announcementId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update announcement");
    throw new Error(message || "Failed to update announcement");
  }

  toast.success("Announcement updated successfully");
  notifyChange();
  return parseJsonResponse<AnnouncementResponseDto>(response, "Unable to parse updated announcement.");
}

async function deleteAnnouncement(announcementId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/announcement/delete/${announcementId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete announcement");
    throw new Error(message || "Failed to delete announcement");
  }

  toast.success("Announcement deleted successfully");
  notifyChange();
}

export const announcementService = {
  getAllAnnouncements,
  getAnnouncementById,
  registerAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
