import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";
import { notifySchoolBalanceChanged } from "./schoolBalanceService";

export interface SchoolFeesRequestDto {
  academicYearId: string;
  nurseryFees: number;
  primaryFees: number;
}

export interface SchoolFeesResponseDto {
  schoolFeesId: string;
  academicYearId: string;
  fiscalYear: string;
  nurseryFees: number;
  primaryFees: number;
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const rawText = await response.text();

  if (rawText.trim().startsWith("<")) {
    throw new Error("Unexpected non-JSON response from the server. Please check your API URL or backend.");
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error(fallbackMessage);
  }
}

async function getAllSchoolFees(): Promise<SchoolFeesResponseDto[]> {
  const response = await fetch(getApiUrl("/api/schoolFees/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load school fees");
    throw new Error(message || "Failed to load school fees");
  }

  return parseJsonResponse<SchoolFeesResponseDto[]>(response, "Unable to parse school fees data from server.");
}

async function getSchoolFeesById(id: string): Promise<SchoolFeesResponseDto> {
  const response = await fetch(getApiUrl(`/api/schoolFees/${id}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load school fees");
    throw new Error(message || "Failed to load school fees");
  }

  return parseJsonResponse<SchoolFeesResponseDto>(response, "Unable to parse school fees data from server.");
}

async function registerSchoolFees(schoolFees: SchoolFeesRequestDto): Promise<SchoolFeesResponseDto> {
  const response = await fetch(getApiUrl("/api/schoolFees/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schoolFees),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create school fees");
    throw new Error(message || "Failed to create school fees");
  }

  toast.success("School fees created successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<SchoolFeesResponseDto>(response, "Unable to parse create school fees response.");
}

async function updateSchoolFees(id: string, schoolFees: SchoolFeesRequestDto): Promise<SchoolFeesResponseDto> {
  const response = await fetch(getApiUrl(`/api/schoolFees/update/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schoolFees),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update school fees");
    throw new Error(message || "Failed to update school fees");
  }

  toast.success("School fees updated successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<SchoolFeesResponseDto>(response, "Unable to parse update school fees response.");
}

async function deleteSchoolFees(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/schoolFees/delete/${id}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete school fees");
    throw new Error(message || "Failed to delete school fees");
  }

  toast.success("School fees deleted successfully");
  notifySchoolBalanceChanged();
}

export const schoolFeesService = {
  getAllSchoolFees,
  getSchoolFeesById,
  registerSchoolFees,
  updateSchoolFees,
  deleteSchoolFees,
};
