import { getApiUrl } from "../config/api";

export interface GradeReportProjection {
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  term: string;
  testMark: number | null;
  testMaxMark: number | null;
  examMark: number | null;
  examMaxMark: number | null;
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

async function getStudentGradeReport(
  academicYearId: string,
  schoolClassId: string
): Promise<GradeReportProjection[]> {
  const params = new URLSearchParams({ academicYearId, schoolClassId });
  const response = await fetch(getApiUrl(`/api/studentReport/grade-report?${params.toString()}`));
  if (!response.ok) {
    throw new Error("Failed to load student grade report");
  }
  return parseJsonResponse<GradeReportProjection[]>(response, "Unable to parse student grade report.");
}

async function getStudentGradeReportByClassTeacher(
  teacherId: string,
  academicYearId: string
): Promise<GradeReportProjection[]> {
  const params = new URLSearchParams({ academicYearId });
  const response = await fetch(getApiUrl(`/api/studentReport/classTeacher/grade-report/${teacherId}?${params.toString()}`));
  if (!response.ok) {
    throw new Error("Failed to load class teacher student grade report");
  }
  return parseJsonResponse<GradeReportProjection[]>(response, "Unable to parse student grade report.");
}

async function getStudentGradeReportByTerm(
  academicYearId: string,
  schoolClassId: string,
  term: string
): Promise<GradeReportProjection[]> {
  const params = new URLSearchParams({ academicYearId, schoolClassId, term });
  const response = await fetch(getApiUrl(`/api/studentReport/term/grade-report?${params.toString()}`));
  if (!response.ok) {
    throw new Error("Failed to load term student grade report");
  }
  return parseJsonResponse<GradeReportProjection[]>(response, "Unable to parse term student grade report.");
}

async function getStudentGradeReportByParent(
  parentId: string,
  academicYearId: string,
  term?: string
): Promise<GradeReportProjection[]> {
  const params = new URLSearchParams({ parentId, academicYearId });
  if (term) params.set("term", term);
  const response = await fetch(getApiUrl(`/api/studentReport/parent/grade-report?${params.toString()}`));
  if (!response.ok) {
    throw new Error("Failed to load parent student grade report");
  }
  return parseJsonResponse<GradeReportProjection[]>(response, "Unable to parse parent student grade report.");
}

export const studentReportService = {
  getStudentGradeReport,
  getStudentGradeReportByClassTeacher,
  getStudentGradeReportByTerm,
  getStudentGradeReportByParent,
};
