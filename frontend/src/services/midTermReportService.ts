import { getApiUrl } from "../config/api";

export interface MidTermReportProjection {
  studentId: string;
  studentCode: string;
  studentName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  term: string;
  midTermMark: number | null;
  midTermMaxMark: number | null;
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

async function getMidTermReport(
  academicYearId: string,
  schoolClassId: string
): Promise<MidTermReportProjection[]> {
  const params = new URLSearchParams({ academicYearId, schoolClassId });
  const response = await fetch(getApiUrl(`/api/midTerm/midTerm-report?${params.toString()}`));
  if (!response.ok) throw new Error("Failed to load mid-term report");
  return parseJsonResponse<MidTermReportProjection[]>(response, "Unable to parse mid-term report.");
}

async function getMidTermReportByClassTeacher(
  teacherId: string,
  academicYearId: string
): Promise<MidTermReportProjection[]> {
  const params = new URLSearchParams({ academicYearId });
  const response = await fetch(
    getApiUrl(`/api/midTerm/classTeacher/midTerm-report/${teacherId}?${params.toString()}`)
  );
  if (!response.ok) throw new Error("Failed to load mid-term report for class teacher");
  return parseJsonResponse<MidTermReportProjection[]>(response, "Unable to parse mid-term report.");
}

async function getMidTermReportByTerm(
  academicYearId: string,
  schoolClassId: string,
  term: string
): Promise<MidTermReportProjection[]> {
  const params = new URLSearchParams({ academicYearId, schoolClassId, term });
  const response = await fetch(getApiUrl(`/api/midTerm/term/midTerm-report?${params.toString()}`));
  if (!response.ok) throw new Error("Failed to load mid-term report by term");
  return parseJsonResponse<MidTermReportProjection[]>(response, "Unable to parse mid-term report.");
}

async function getMidTermReportByParent(
  parentId: string,
  academicYearId: string,
  term?: string
): Promise<MidTermReportProjection[]> {
  const params = new URLSearchParams({ parentId, academicYearId });
  if (term) params.set("term", term);
  const response = await fetch(getApiUrl(`/api/midTerm/parent/midTerm-report?${params.toString()}`));
  if (!response.ok) throw new Error("Failed to load mid-term report for parent");
  return parseJsonResponse<MidTermReportProjection[]>(response, "Unable to parse mid-term report.");
}

export const midTermReportService = {
  getMidTermReport,
  getMidTermReportByClassTeacher,
  getMidTermReportByTerm,
  getMidTermReportByParent,
};
