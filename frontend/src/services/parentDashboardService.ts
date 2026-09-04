import { getApiUrl } from "../config/api";
import { AcademicYearResponseDto } from "./academicYearService";
import { studentReportService, GradeReportProjection } from "./studentReportService";

export interface ParentChildDto {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  schoolClassId?: string;
  schoolClassName?: string;
  classLevel?: string;
}

export interface ParentDashboardOverview {
  children: ParentChildDto[];
  childrenCount: number;
  activeAcademicYear: AcademicYearResponseDto | null;
}

export interface ChildSubjectMark {
  courseName: string;
  courseCode: string;
  term: string;
  testMark: number;
  testMax: number;
  examMark: number;
  examMax: number;
  percentage: number;
}

export interface ChildPerformance {
  child: ParentChildDto;
  subjects: ChildSubjectMark[];
  overallPercentage: number | null;
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

async function getOverview(parentId: string): Promise<ParentDashboardOverview> {
  const response = await fetch(getApiUrl(`/api/parentDashboard/overview/${parentId}`));
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load parent dashboard");
  }
  return parseJsonResponse<ParentDashboardOverview>(response, "Unable to parse parent dashboard.");
}

async function getChildren(parentId: string): Promise<ParentChildDto[]> {
  const response = await fetch(getApiUrl(`/api/parentDashboard/students/${parentId}`));
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load children");
  }
  return parseJsonResponse<ParentChildDto[]>(response, "Unable to parse children list.");
}

function toSubjectMarks(rows: GradeReportProjection[], studentId: string): ChildSubjectMark[] {
  return rows
    .filter((r) => r.studentId === studentId)
    .map((r) => {
      const testMark = Number(r.testMark) || 0;
      const testMax = Number(r.testMaxMark) || 0;
      const examMark = Number(r.examMark) || 0;
      const examMax = Number(r.examMaxMark) || 0;
      const tot = testMark + examMark;
      const max = testMax + examMax;
      const percentage = max > 0 ? Math.round((tot / max) * 1000) / 10 : 0;
      return {
        courseName: r.courseName,
        courseCode: r.courseCode,
        term: r.term,
        testMark,
        testMax,
        examMark,
        examMax,
        percentage,
      };
    });
}

async function getChildrenPerformance(
  children: ParentChildDto[],
  academicYearId: string
): Promise<ChildPerformance[]> {
  const classIds = [...new Set(children.map((c) => c.schoolClassId).filter(Boolean) as string[])];
  const reportsByClass = new Map<string, GradeReportProjection[]>();

  await Promise.all(
    classIds.map(async (classId) => {
      const rows = await studentReportService
        .getStudentGradeReport(academicYearId, classId)
        .catch(() => [] as GradeReportProjection[]);
      reportsByClass.set(classId, rows);
    })
  );

  return children.map((child) => {
    const rows = child.schoolClassId ? reportsByClass.get(child.schoolClassId) || [] : [];
    const subjects = toSubjectMarks(rows, child.studentId);
    const overallPercentage =
      subjects.length > 0
        ? Math.round((subjects.reduce((s, x) => s + x.percentage, 0) / subjects.length) * 10) / 10
        : null;
    return { child, subjects, overallPercentage };
  });
}

export const parentDashboardService = {
  getOverview,
  getChildren,
  getChildrenPerformance,
};
