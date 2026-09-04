import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

function parseJsonResponse<T>(response: Response, errorMessage: string): T {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(errorMessage);
  }
  return response.json() as T;
}

export enum EAssignmentState {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export interface CourseAssignmentRequestDto {
  teacherId: string;
  schoolClassId: string;
  courseId: string;
  assignmentStatus: EAssignmentState;
  assignmentDate: string;
}

export interface CourseAssignmentResponseDto {
  courseAssignmentId: string;
  teacherId: string;
  teacherName: string;
  schoolClassId: string;
  schoolClassName: string;
  courseId: string;
  courseName: string;
  assignmentStatus: EAssignmentState;
  assignmentDate: string;
  closedDate: string | null;
}

async function getAllCourseAssignments(): Promise<CourseAssignmentResponseDto[]> {
  const response = await fetch(getApiUrl("/api/courseAssignment/all"), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to fetch course assignments");
    throw new Error(message || "Failed to fetch course assignments");
  }

  return parseJsonResponse<CourseAssignmentResponseDto[]>(response, "Unable to parse course assignments response.");
}

async function getCourseAssignmentById(courseAssignmentId: string): Promise<CourseAssignmentResponseDto> {
  const response = await fetch(getApiUrl(`/api/courseAssignment/${courseAssignmentId}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to fetch course assignment");
    throw new Error(message || "Failed to fetch course assignment");
  }

  return parseJsonResponse<CourseAssignmentResponseDto>(response, "Unable to parse course assignment response.");
}

async function registerCourseAssignment(courseAssignment: CourseAssignmentRequestDto): Promise<CourseAssignmentResponseDto> {
  const response = await fetch(getApiUrl("/api/courseAssignment/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseAssignment),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create course assignment");
    throw new Error(message || "Failed to create course assignment");
  }

  toast.success("Course assignment created successfully");
  return parseJsonResponse<CourseAssignmentResponseDto>(response, "Unable to parse create course assignment response.");
}

async function closeCourseAssignment(courseAssignmentId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/courseAssignment/closeCourseAssignment/${courseAssignmentId}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to close course assignment");
    throw new Error(message || "Failed to close course assignment");
  }

  toast.success("Course assignment closed successfully");
}

async function updateCourseAssignment(courseAssignmentId: string, courseAssignment: CourseAssignmentRequestDto): Promise<CourseAssignmentResponseDto> {
  const response = await fetch(getApiUrl(`/api/courseAssignment/update/${courseAssignmentId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseAssignment),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update course assignment");
    throw new Error(message || "Failed to update course assignment");
  }

  toast.success("Course assignment updated successfully");
  return parseJsonResponse<CourseAssignmentResponseDto>(response, "Unable to parse update course assignment response.");
}

async function deleteCourseAssignment(courseAssignmentId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/courseAssignment/delete/${courseAssignmentId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete course assignment");
    throw new Error(message || "Failed to delete course assignment");
  }

  toast.success("Course assignment deleted successfully");
}

async function getAllCourseAssignmentsByTeacher(teacherId: string): Promise<CourseAssignmentResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/courseAssignment/teacher/${teacherId}`), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to fetch course assignments by teacher");
    throw new Error(message || "Failed to fetch course assignments by teacher");
  }

  return parseJsonResponse<CourseAssignmentResponseDto[]>(response, "Unable to parse course assignments by teacher response.");
}

export const courseAssignmentService = {
  getAllCourseAssignments,
  getCourseAssignmentById,
  registerCourseAssignment,
  closeCourseAssignment,
  updateCourseAssignment,
  deleteCourseAssignment,
  getAllCourseAssignmentsByTeacher,
};
