import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export type GradeType = "TEST" | "EXAM";
export type EGradeState = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
export type ETerm = "TERM1" | "TERM2" | "TERM3";

export interface GradeDetailsRequestDto {
  studentId: string;
  mark: number;
}

export interface GradeDetailsResponseDto {
  gradeDetailsId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  mark: number;
}

export interface GradeRequestDto {
  academicYearId: string;
  term: string; // or ETerm if we strictly map enum names
  schoolClassId: string;
  courseId: string;
  gradeType: GradeType;
  maxMark: number;
  feedback?: string;
  gradeDetails: GradeDetailsRequestDto[];
}

export interface GradeResponseDto {
  gradeId: string;
  academicYearId: string;
  fiscalYear: string;
  term: string;
  schoolClassId: string;
  schoolClassName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  gradeType: GradeType;
  maxMark: number;
  submitStatus: string;
  feedback: string;
  gradeDetails: GradeDetailsResponseDto[];
}

export interface ClassGradeStatusProjection {
  classId: string;
  className: string;
  classLevel: string;
  classTeacher: string;
  academicYearId: string;
  academicYear: string;
  term: string;
  subjects: number;
  approved: number;
  status: string;
}

export interface ClassGradeDetailProjection {
  courseId: string;
  subject: string;
  teacher: string;
  students: number;
  test: number;
  exam: number;
  submittedAt: string | null;
  status: string;
}

async function parseJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const rawText = await response.text();
  if (rawText.trim().startsWith("<")) {
    throw new Error("Unexpected non-JSON response from the server.");
  }
  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error(fallbackMessage);
  }
}

async function getAllGrades(): Promise<GradeResponseDto[]> {
  const response = await fetch(getApiUrl("/api/grade/all"));
  if (!response.ok) {
    throw new Error("Failed to load grades");
  }
  return parseJsonResponse<GradeResponseDto[]>(response, "Unable to parse grades data.");
}

async function getAllGradesByTeacher(teacherId: string): Promise<GradeResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/grade/teacher/${teacherId}`));
  if (!response.ok) {
    throw new Error("Failed to load teacher grades");
  }
  return parseJsonResponse<GradeResponseDto[]>(response, "Unable to parse teacher grades data.");
}

async function getAllGradesByClass(classId: string): Promise<GradeResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/grade/class/${classId}`));
  if (!response.ok) {
    throw new Error("Failed to load class grades");
  }
  return parseJsonResponse<GradeResponseDto[]>(response, "Unable to parse class grades data.");
}

async function getGradeById(gradeId: string): Promise<GradeResponseDto> {
  const response = await fetch(getApiUrl(`/api/grade/${gradeId}`));
  if (!response.ok) {
    throw new Error("Failed to load grade");
  }
  return parseJsonResponse<GradeResponseDto>(response, "Unable to parse grade data.");
}

async function saveGrade(gradeDto: GradeRequestDto): Promise<GradeResponseDto> {
  const response = await fetch(getApiUrl("/api/grade/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gradeDto),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create grade");
    throw new Error(message || "Failed to create grade");
  }

  toast.success("Grade created successfully");
  return parseJsonResponse<GradeResponseDto>(response, "Unable to parse save grade response.");
}

async function importGrades(file: File, requestDto: GradeRequestDto): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  // Depending on how backend expects requestDto in multipart.
  // Spring usually expects a JSON string blob or separate parts. 
  // We'll append it as a string blob.
  formData.append("requestDto", new Blob([JSON.stringify(requestDto)], {
    type: "application/json"
  }));

  const response = await fetch(getApiUrl("/api/grade/import"), {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to import grades");
    throw new Error(message || "Failed to import grades");
  }

  toast.success("Grades imported successfully");
}

async function submitGrade(gradeId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/grade/submitGrade/${gradeId}`), {
    method: "DELETE", // Assuming DELETE as per controller
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to submit grade");
    throw new Error(message || "Failed to submit grade");
  }

  toast.success("Grade submitted successfully");
}

async function approveGrade(gradeId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/grade/approveGrade/${gradeId}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to approve grade");
    throw new Error(message || "Failed to approve grade");
  }

  toast.success("Grade approved successfully");
}

async function rejectGrade(gradeId: string, feedback: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/grade/rejectGrade/${gradeId}?feedback=${encodeURIComponent(feedback)}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to reject grade");
    throw new Error(message || "Failed to reject grade");
  }

  toast.success("Grade rejected successfully");
}

async function updateGrade(gradeId: string, gradeDto: GradeRequestDto): Promise<GradeResponseDto> {
  const response = await fetch(getApiUrl(`/api/grade/update/${gradeId}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gradeDto),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update grade");
    throw new Error(message || "Failed to update grade");
  }

  toast.success("Grade updated successfully");
  return parseJsonResponse<GradeResponseDto>(response, "Unable to parse update grade response.");
}

async function deleteGrade(gradeId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/grade/delete/${gradeId}`), {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete grade");
    throw new Error(message || "Failed to delete grade");
  }

  toast.success("Grade deleted successfully");
}

async function getClassGradeStatus(): Promise<ClassGradeStatusProjection[]> {
  const response = await fetch(getApiUrl("/api/grade/classGrade"));
  if (!response.ok) {
    throw new Error("Failed to load class grade status");
  }
  return parseJsonResponse<ClassGradeStatusProjection[]>(response, "Unable to parse class grade status.");
}

async function getClassGradeDetails(classId: string, academicYearId: string, term: string): Promise<ClassGradeDetailProjection[]> {
  const params = new URLSearchParams({
    classId,
    academicYearId,
    term
  });
  const response = await fetch(getApiUrl(`/api/grade/classGrade/details?${params.toString()}`));
  if (!response.ok) {
    throw new Error("Failed to load class grade details");
  }
  return parseJsonResponse<ClassGradeDetailProjection[]>(response, "Unable to parse class grade details.");
}

async function getAllByAcademicYearAndTermAndSchoolClassAndCourse(
  academicYearId: string,
  term: string,
  classId: string,
  courseId: string
): Promise<GradeResponseDto[]> {
  const params = new URLSearchParams({
    academicYearId,
    term,
    classId,
    courseId,
  });
  const response = await fetch(getApiUrl(`/api/grade/studentGradeByTerm?${params.toString()}`));
  if (!response.ok) {
    throw new Error("Failed to load student grades for term");
  }
  return parseJsonResponse<GradeResponseDto[]>(response, "Unable to parse student grade data.");
}

export const gradeService = {
  getAllGrades,
  getAllGradesByClass,
  getGradeById,
  saveGrade,
  importGrades,
  submitGrade,
  approveGrade,
  rejectGrade,
  updateGrade,
  deleteGrade,
  getClassGradeStatus,
  getClassGradeDetails,
  getAllByAcademicYearAndTermAndSchoolClassAndCourse,
};
