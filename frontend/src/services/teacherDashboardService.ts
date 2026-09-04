import { getApiUrl } from "../config/api";
import { CourseAssignmentResponseDto } from "./courseAssignmentService";
import { AcademicYearResponseDto } from "./academicYearService";
import { SchoolClassResponseDto } from "./schoolClassService";
import { gradeService, ClassGradeDetailProjection } from "./gradeService";
import { schoolReportService, SubjectPerformanceProjection } from "./schoolReportService";

export interface TeacherDashboardOverview {
  coursesCount: number;
  assignments: CourseAssignmentResponseDto[];
  classTeacherClass: SchoolClassResponseDto | null;
  classTeacherStudentCount: number;
  activeAcademicYear: AcademicYearResponseDto | null;
}

export interface TeacherSubjectAverage {
  courseId: string;
  subject: string;
  classId: string;
  className: string;
  avgScore: number;
  enrolled: number;
  passRate: number;
}

export interface TeacherApprovalRow {
  courseId: string;
  subject: string;
  classId: string;
  className: string;
  teacher: string;
  status: string;
  students: number;
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

async function getOverview(teacherId: string): Promise<TeacherDashboardOverview> {
  const response = await fetch(getApiUrl(`/api/teacherDashboard/overview/${teacherId}`));
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load teacher dashboard");
  }
  return parseJsonResponse<TeacherDashboardOverview>(response, "Unable to parse teacher dashboard.");
}

/** Average marks for courses assigned to this teacher (active year, optional term). */
async function getSubjectAverages(
  assignments: CourseAssignmentResponseDto[],
  academicYearId: string,
  term?: string
): Promise<TeacherSubjectAverage[]> {
  const active = assignments.filter((a) => a.assignmentStatus === "ACTIVE");
  const classIds = [...new Set(active.map((a) => a.schoolClassId))];
  const courseKeys = new Set(active.map((a) => `${a.schoolClassId}|${a.courseId}`));

  const byClass = await Promise.all(
    classIds.map((classId) =>
      schoolReportService.getSubjectPerformance({ academicYearId, classId, term }).catch(() => [] as SubjectPerformanceProjection[])
    )
  );

  const rows: TeacherSubjectAverage[] = [];
  for (const list of byClass) {
    for (const row of list) {
      if (courseKeys.has(`${row.classId}|${row.courseId}`)) {
        rows.push({
          courseId: row.courseId,
          subject: row.subject,
          classId: row.classId,
          className: row.className,
          avgScore: Number(row.avgScore) || 0,
          enrolled: Number(row.enrolled) || 0,
          passRate: Number(row.passRate) || 0,
        });
      }
    }
  }
  return rows.sort((a, b) => a.subject.localeCompare(b.subject));
}

/** Marks approval status for courses assigned to this teacher. */
async function getApprovalStatus(
  assignments: CourseAssignmentResponseDto[],
  academicYearId: string,
  term: string
): Promise<TeacherApprovalRow[]> {
  const active = assignments.filter((a) => a.assignmentStatus === "ACTIVE");
  const classIds = [...new Set(active.map((a) => a.schoolClassId))];
  const classNameById = Object.fromEntries(active.map((a) => [a.schoolClassId, a.schoolClassName]));
  const courseKeys = new Set(active.map((a) => `${a.schoolClassId}|${a.courseId}`));

  const detailsByClass = await Promise.all(
    classIds.map(async (classId) => {
      const details = await gradeService
        .getClassGradeDetails(classId, academicYearId, term)
        .catch(() => [] as ClassGradeDetailProjection[]);
      return { classId, details };
    })
  );

  const rows: TeacherApprovalRow[] = [];
  for (const { classId, details } of detailsByClass) {
    for (const d of details) {
      if (courseKeys.has(`${classId}|${d.courseId}`)) {
        rows.push({
          courseId: d.courseId,
          subject: d.subject,
          classId,
          className: classNameById[classId] || "",
          teacher: d.teacher,
          status: d.status,
          students: d.students,
          term,
        });
      }
    }
  }
  return rows.sort((a, b) => a.subject.localeCompare(b.subject));
}

export const teacherDashboardService = {
  getOverview,
  getSubjectAverages,
  getApprovalStatus,
};
