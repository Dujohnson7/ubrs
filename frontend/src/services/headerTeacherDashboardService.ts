import { getApiUrl } from "../config/api";
import { AcademicYearResponseDto } from "./academicYearService";
import { schoolClassService } from "./schoolClassService";
import { gradeService, ClassGradeStatusProjection } from "./gradeService";

export interface HeaderTeacherMetrics {
  totalStudents: number;
  nurseryStudents: number;
  primaryStudents: number;
  totalTeachers: number;
  totalClassTeachers: number;
  totalCourses: number;
  nurseryCourses: number;
  primaryCourses: number;
  totalAcademicYears: number;
  activeAcademicYear: AcademicYearResponseDto | null;
  totalClasses: number;
  marksApproved: number;
  marksSubjects: number;
  marksSubmitted: number;
  marksPending: number;
  marksRejected: number;
}

export interface SubjectLevelData {
  name: string;
  averageMarks: number[];
}

export interface AverageMarksBySubject {
  subjects: string[];
  nursery: SubjectLevelData;
  primary: SubjectLevelData;
  academicYear: string;
  term: string;
}

export interface TermData {
  approved: number[];
  submitted: number[];
  pending: number[];
  rejected: number[];
}

export interface MarksSubmissionTrends {
  academicYears: string[];
  terms: string[];
  trendsByYear: Record<string, TermData>;
}

export interface ClassGradeData {
  className: string;
  a1: number;
  b2: number;
  b3: number;
  c4: number;
  d: number;
  total: number;
}

export interface GradeDistribution {
  classData: ClassGradeData[];
  academicYear: string;
  term: string;
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

async function fetchLong(path: string): Promise<number> {
  const response = await fetch(getApiUrl(path));
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  const value = await parseJsonResponse<number>(response, `Unable to parse ${path}`);
  return Number(value) || 0;
}

async function getActiveAcademicYear(): Promise<AcademicYearResponseDto | null> {
  const response = await fetch(getApiUrl("/api/headerTeacherDashboard/academicYear/active"));
  if (!response.ok) return null;
  try {
    return await parseJsonResponse<AcademicYearResponseDto>(response, "Unable to parse active year");
  } catch {
    return null;
  }
}

function summarizeApprovals(rows: ClassGradeStatusProjection[]) {
  let subjects = 0;
  let approved = 0;
  let submitted = 0;
  let pending = 0;
  let rejected = 0;

  for (const row of rows) {
    const total = Number(row.subjects) || 0;
    const ok = Number(row.approved) || 0;
    subjects += total;
    approved += ok;

    const status = (row.status || "").toUpperCase();
    if (status === "APPROVED") {
      // already counted in approved
    } else if (status === "SUBMITTED") {
      submitted += Math.max(total - ok, 0);
    } else if (status === "PARTIAL") {
      const rest = Math.max(total - ok, 0);
      submitted += Math.ceil(rest / 2);
      pending += Math.floor(rest / 2);
    } else if (status === "REJECTED") {
      rejected += Math.max(total - ok, 0);
    } else {
      pending += Math.max(total - ok, 0);
    }
  }

  return { subjects, approved, submitted, pending, rejected };
}

/** Load all KPI cards for the head-teacher dashboard (`/`). */
async function getDashboardMetrics(): Promise<HeaderTeacherMetrics> {
  const [
    totalStudents,
    nurseryStudents,
    primaryStudents,
    totalTeachers,
    totalClassTeachers,
    totalCourses,
    nurseryCourses,
    primaryCourses,
    totalAcademicYears,
    activeAcademicYear,
    classes,
    gradeStatus,
  ] = await Promise.all([
    fetchLong("/api/headerTeacherDashboard/totalStudents").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalStudents/nursery").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalStudents/primary").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalTeacher").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalClassTeacher").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalCourse").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalCourse/nursery").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalCourse/primary").catch(() => 0),
    fetchLong("/api/headerTeacherDashboard/totalAcademicYear").catch(() => 0),
    getActiveAcademicYear(),
    schoolClassService.getAllSchoolClasses().catch(() => []),
    gradeService.getClassGradeStatus().catch(() => [] as ClassGradeStatusProjection[]),
  ]);

  const approval = summarizeApprovals(gradeStatus);

  return {
    totalStudents,
    nurseryStudents,
    primaryStudents,
    totalTeachers,
    totalClassTeachers,
    totalCourses,
    nurseryCourses,
    primaryCourses,
    totalAcademicYears,
    activeAcademicYear,
    totalClasses: classes.length,
    marksApproved: approval.approved,
    marksSubjects: approval.subjects,
    marksSubmitted: approval.submitted,
    marksPending: approval.pending,
    marksRejected: approval.rejected,
  };
}

export const headerTeacherDashboardService = {
  getDashboardMetrics,
  getActiveAcademicYear,
  getAverageMarksBySubject,
  getMarksSubmissionTrends,
  getGradeDistribution,
};

async function getAverageMarksBySubject(): Promise<AverageMarksBySubject> {
  const response = await fetch(getApiUrl("/api/headerTeacherDashboard/averageMarksBySubject"));
  if (!response.ok) {
    throw new Error("Failed to load average marks by subject");
  }
  return await parseJsonResponse<AverageMarksBySubject>(response, "Unable to parse average marks data");
}

async function getMarksSubmissionTrends(): Promise<MarksSubmissionTrends> {
  const response = await fetch(getApiUrl("/api/headerTeacherDashboard/marksSubmissionTrends"));
  if (!response.ok) {
    throw new Error("Failed to load marks submission trends");
  }
  return await parseJsonResponse<MarksSubmissionTrends>(response, "Unable to parse marks trends data");
}

async function getGradeDistribution(): Promise<GradeDistribution> {
  const response = await fetch(getApiUrl("/api/headerTeacherDashboard/gradeDistribution"));
  if (!response.ok) {
    throw new Error("Failed to load grade distribution");
  }
  return await parseJsonResponse<GradeDistribution>(response, "Unable to parse grade distribution data");
}
