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

export const studentReportService = {
  getStudentGradeReport,
};
