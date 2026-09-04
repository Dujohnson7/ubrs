import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export interface AcademicYearRequestDto {
  fiscalYear: string;
  eAcademicStatus: EAcademicState;
}

export type EAcademicState = "PENDING" | "ACTIVE" | "DONE";

export interface AcademicYearResponseDto {
  academicYearId: string;
  fiscalYear: string;
  academicYearStatus: EAcademicState;
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

async function getAllAcademicYears(): Promise<AcademicYearResponseDto[]> {
  const response = await fetch(getApiUrl("/api/academicYear/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load academic years");
    throw new Error(message || "Failed to load academic years");
  }

  return parseJsonResponse<AcademicYearResponseDto[]>(response, "Unable to parse academic years data from server.");
}

async function getActiveAcademicYear(): Promise<AcademicYearResponseDto> {
  const response = await fetch(getApiUrl("/api/academicYear/active"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load active academic year");
    throw new Error(message || "Failed to load active academic year");
  }

  return parseJsonResponse<AcademicYearResponseDto>(response, "Unable to parse active academic year data from server.");
}

async function getAcademicYearById(id: string): Promise<AcademicYearResponseDto> {
  const response = await fetch(getApiUrl(`/api/academicYear/${id}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load academic year");
    throw new Error(message || "Failed to load academic year");
  }

  return parseJsonResponse<AcademicYearResponseDto>(response, "Unable to parse academic year data from server.");
}

async function registerAcademicYear(academicYear: AcademicYearRequestDto): Promise<AcademicYearResponseDto> {
  const response = await fetch(getApiUrl("/api/academicYear/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(academicYear),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create academic year");
    throw new Error(message || "Failed to create academic year");
  }

  toast.success("Academic year created successfully");
  return parseJsonResponse<AcademicYearResponseDto>(response, "Unable to parse create academic year response.");
}

async function activateAcademicYear(academicYearId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/academicYear/activateAcademic/${academicYearId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to activate academic year");
    throw new Error(message || "Failed to activate academic year");
  }

  toast.success("Academic year activated successfully");
}

async function completeAcademicYear(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/academicYear/completeAcademic/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to complete academic year");
    throw new Error(message || "Failed to complete academic year");
  }

  toast.success("Academic year completed successfully");
}

async function updateAcademicYear(id: string, academicYear: AcademicYearRequestDto): Promise<AcademicYearResponseDto> {
  const response = await fetch(getApiUrl(`/api/academicYear/update/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(academicYear),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update academic year");
    throw new Error(message || "Failed to update academic year");
  }

  toast.success("Academic year updated successfully");
  return parseJsonResponse<AcademicYearResponseDto>(response, "Unable to parse update academic year response.");
}

async function deleteAcademicYear(academicYearId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/academicYear/delete/${academicYearId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete academic year");
    throw new Error(message || "Failed to delete academic year");
  }

  toast.success("Academic year deleted successfully");
}

export const academicYearService = {
  getAllAcademicYears,
  getActiveAcademicYear,
  getAcademicYearById,
  registerAcademicYear,
  activateAcademicYear,
  completeAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
};
