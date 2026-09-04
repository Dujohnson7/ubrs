import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export type EGender = "MALE" | "FEMALE";
export type EStudentState = "ACTIVE" | "INACTIVE" | "GRADUATED" | "SUSPENDED";

export interface StudentRequestDto {
  studentCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: EGender;
  dateOfBirth: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  guardianName?: string;
  guardianPhone?: string;
  studentStatus: EStudentState;
  schoolClassId: string;
}

export interface StudentResponseDto {
  studentId: string;
  studentCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: EGender;
  dateOfBirth: string;
  fatherName: string;
  fatherPhone: string;
  motherName: string;
  motherPhone: string;
  guardianName?: string;
  guardianPhone?: string;
  studentStatus: EStudentState;
  schoolClassId: string;
  schoolClassName: string;
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

async function getAllStudents(): Promise<StudentResponseDto[]> {
  const response = await fetch(getApiUrl("/api/student/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load students");
    throw new Error(message || "Failed to load students");
  }

  return parseJsonResponse<StudentResponseDto[]>(response, "Unable to parse students data from server.");
}

async function getPrimaryStudents(): Promise<StudentResponseDto[]> {
  const response = await fetch(getApiUrl("/api/student/primary"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load primary students");
    throw new Error(message || "Failed to load primary students");
  }

  return parseJsonResponse<StudentResponseDto[]>(response, "Unable to parse primary students data from server.");
}

async function getNurseryStudents(): Promise<StudentResponseDto[]> {
  const response = await fetch(getApiUrl("/api/student/nursery"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load nursery students");
    throw new Error(message || "Failed to load nursery students");
  }

  return parseJsonResponse<StudentResponseDto[]>(response, "Unable to parse nursery students data from server.");
}

async function getStudentsByClass(classId: string): Promise<StudentResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/student/class/${classId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load class students");
    throw new Error(message || "Failed to load class students");
  }

  return parseJsonResponse<StudentResponseDto[]>(response, "Unable to parse class students data from server.");
}

async function getStudentById(studentId: string): Promise<StudentResponseDto> {
  const response = await fetch(getApiUrl(`/api/student/${studentId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load student");
    throw new Error(message || "Failed to load student");
  }

  return parseJsonResponse<StudentResponseDto>(response, "Unable to parse student data from server.");
}

async function registerStudent(student: StudentRequestDto): Promise<StudentResponseDto> {
  const response = await fetch(getApiUrl("/api/student/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create student");
    throw new Error(message || "Failed to create student");
  }

  toast.success("Student created successfully");
  return parseJsonResponse<StudentResponseDto>(response, "Unable to parse create student response.");
}

async function importStudents(file: File, classId: string): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("classId", classId);

  const response = await fetch(getApiUrl("/api/student/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    console.error("Import students error:", message);
    toast.error(message || "Failed to import students");
    throw new Error(message || "Failed to import students");
  }

  toast.success("Students imported successfully");
}

async function updateStudent(studentId: string, student: StudentRequestDto): Promise<StudentResponseDto> {
  const response = await fetch(getApiUrl(`/api/student/update/${studentId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update student");
    throw new Error(message || "Failed to update student");
  }

  toast.success("Student updated successfully");
  return parseJsonResponse<StudentResponseDto>(response, "Unable to parse update student response.");
}

async function deleteStudent(studentId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/student/delete/${studentId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete student");
    throw new Error(message || "Failed to delete student");
  }

  toast.success("Student deleted successfully");
}

export const studentService = {
  getAllStudents,
  getPrimaryStudents,
  getNurseryStudents,
  getStudentsByClass,
  getStudentById,
  registerStudent,
  importStudents,
  updateStudent,
  deleteStudent,
};
