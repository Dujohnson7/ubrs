import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export type ESchoolLevel = "PRIMARY" | "NURSERY";

export interface SchoolClassRequestDto {
  name: string;
  classLevel: ESchoolLevel;
  classTeacherId: string;
}

export interface SchoolClassResponseDto {
  schoolClassId: string;
  name: string;
  classLevel: ESchoolLevel;
  classTeacherId: string;
  classTeacherName: string;
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

async function getAllSchoolClasses(): Promise<SchoolClassResponseDto[]> {
  const response = await fetch(getApiUrl("/api/schoolClass/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load school classes");
    throw new Error(message || "Failed to load school classes");
  }

  return parseJsonResponse<SchoolClassResponseDto[]>(response, "Unable to parse school classes data from server.");
}

async function getPrimaryClasses(): Promise<SchoolClassResponseDto[]> {
  const response = await fetch(getApiUrl("/api/schoolClass/primary"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load primary classes");
    throw new Error(message || "Failed to load primary classes");
  }

  return parseJsonResponse<SchoolClassResponseDto[]>(response, "Unable to parse primary classes data from server.");
}

async function getNurseryClasses(): Promise<SchoolClassResponseDto[]> {
  const response = await fetch(getApiUrl("/api/schoolClass/nursery"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load nursery classes");
    throw new Error(message || "Failed to load nursery classes");
  }

  return parseJsonResponse<SchoolClassResponseDto[]>(response, "Unable to parse nursery classes data from server.");
}

async function getClassesTaughtByTeacher(teacherId: string): Promise<SchoolClassResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/schoolClass/teacher/${teacherId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load classes taught by teacher");
    throw new Error(message || "Failed to load classes taught by teacher");
  }

  return parseJsonResponse<SchoolClassResponseDto[]>(response, "Unable to parse classes data from server.");
}

async function getSchoolClassById(classId: string): Promise<SchoolClassResponseDto> {
  const response = await fetch(getApiUrl(`/api/schoolClass/${classId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load school class");
    throw new Error(message || "Failed to load school class");
  }

  return parseJsonResponse<SchoolClassResponseDto>(response, "Unable to parse school class data from server.");
}

async function registerSchoolClass(schoolClass: SchoolClassRequestDto): Promise<SchoolClassResponseDto> {
  const response = await fetch(getApiUrl("/api/schoolClass/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schoolClass),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create school class");
    throw new Error(message || "Failed to create school class");
  }

  toast.success("School class created successfully");
  return parseJsonResponse<SchoolClassResponseDto>(response, "Unable to parse create school class response.");
}

async function updateSchoolClass(schoolClassId: string, schoolClass: SchoolClassRequestDto): Promise<SchoolClassResponseDto> {
  const response = await fetch(getApiUrl(`/api/schoolClass/update/${schoolClassId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schoolClass),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update school class");
    throw new Error(message || "Failed to update school class");
  }

  toast.success("School class updated successfully");
  return parseJsonResponse<SchoolClassResponseDto>(response, "Unable to parse update school class response.");
}

async function deleteSchoolClass(schoolClassId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/schoolClass/delete/${schoolClassId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete school class");
    throw new Error(message || "Failed to delete school class");
  }

  toast.success("School class deleted successfully");
}

async function getAllTeachersWhoAreNotHeader(): Promise<import("./userService").UsersResponseDto[]> {
  const response = await fetch(getApiUrl("/api/schoolClass/teachers"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load teachers");
    throw new Error(message || "Failed to load teachers");
  }

  return parseJsonResponse<import("./userService").UsersResponseDto[]>(response, "Unable to parse teachers data from server.");
}

export const schoolClassService = {
  getAllSchoolClasses,
  getPrimaryClasses,
  getNurseryClasses,
  getClassesTaughtByTeacher,
  getSchoolClassById,
  registerSchoolClass,
  updateSchoolClass,
  deleteSchoolClass,
  getAllTeachersWhoAreNotHeader,
};
