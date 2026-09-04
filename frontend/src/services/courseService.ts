import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export type ESchoolLevel = "PRIMARY" | "NURSERY";

export interface CourseRequestDto {
  courseCode: string;
  courseName: string;
  courseHours: number;
  courseLevel: ESchoolLevel;
}

export interface CourseResponseDto {
  courseId: string;
  courseCode: string;
  courseName: string;
  courseHours: number;
  courseLevel: ESchoolLevel;
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

async function getAllCourses(): Promise<CourseResponseDto[]> {
  const response = await fetch(getApiUrl("/api/course/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load courses");
    throw new Error(message || "Failed to load courses");
  }

  return parseJsonResponse<CourseResponseDto[]>(response, "Unable to parse courses data from server.");
}

async function getPrimaryCourses(): Promise<CourseResponseDto[]> {
  const response = await fetch(getApiUrl("/api/course/primary"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load primary courses");
    throw new Error(message || "Failed to load primary courses");
  }

  return parseJsonResponse<CourseResponseDto[]>(response, "Unable to parse primary courses data from server.");
}

async function getNurseryCourses(): Promise<CourseResponseDto[]> {
  const response = await fetch(getApiUrl("/api/course/nursery"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load nursery courses");
    throw new Error(message || "Failed to load nursery courses");
  }

  return parseJsonResponse<CourseResponseDto[]>(response, "Unable to parse nursery courses data from server.");
}

async function getCoursesByClass(classId: string): Promise<CourseResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/course/class/${classId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load courses for this class");
    throw new Error(message || "Failed to load courses for this class");
  }

  return parseJsonResponse<CourseResponseDto[]>(response, "Unable to parse class courses data from server.");
}

async function getCoursesByTeacher(teacherId: string): Promise<CourseResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/course/teacherCourses/${teacherId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load teacher courses");
    throw new Error(message || "Failed to load teacher courses");
  }

  return parseJsonResponse<CourseResponseDto[]>(response, "Unable to parse teacher courses data from server.");
}

async function getUnassignedCourses(classId: string): Promise<CourseResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/course/unassigned-courses/${classId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load unassigned courses");
    throw new Error(message || "Failed to load unassigned courses");
  }

  return parseJsonResponse<CourseResponseDto[]>(response, "Unable to parse unassigned courses data from server.");
}

async function getCourseById(courseId: string): Promise<CourseResponseDto> {
  const response = await fetch(getApiUrl(`/api/course/${courseId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load course");
    throw new Error(message || "Failed to load course");
  }

  return parseJsonResponse<CourseResponseDto>(response, "Unable to parse course data from server.");
}

async function registerCourse(course: CourseRequestDto): Promise<CourseResponseDto> {
  const response = await fetch(getApiUrl("/api/course/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(course),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create course");
    throw new Error(message || "Failed to create course");
  }

  toast.success("Course created successfully");
  return parseJsonResponse<CourseResponseDto>(response, "Unable to parse create course response.");
}

async function updateCourse(courseId: string, course: CourseRequestDto): Promise<CourseResponseDto> {
  const response = await fetch(getApiUrl(`/api/course/update/${courseId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(course),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update course");
    throw new Error(message || "Failed to update course");
  }

  toast.success("Course updated successfully");
  return parseJsonResponse<CourseResponseDto>(response, "Unable to parse update course response.");
}

async function deleteCourse(courseId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/course/delete/${courseId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete course");
    throw new Error(message || "Failed to delete course");
  }

  toast.success("Course deleted successfully");
}

export const courseService = {
  getAllCourses,
  getPrimaryCourses,
  getNurseryCourses,
  getCoursesByClass,
  getCoursesByTeacher,
  getUnassignedCourses,
  getCourseById,
  registerCourse,
  updateCourse,
  deleteCourse,
};
