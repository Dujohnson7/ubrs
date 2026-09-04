import { getApiUrl } from "../config/api";

export interface ClassPerformanceProjection {
  classId: string;
  className: string;
  students: number;
  avgScore: number;
  passingRate: number;
  failing: number;
  topGrade: string;
  term: string;
  year: string;
}

export interface SubjectPerformanceProjection {
  courseId: string;
  subject: string;
  classId: string;
  className: string;
  enrolled: number;
  avgScore: number;
  passRate: number;
  highest: number;
  lowest: number;
  term: string;
  year: string;
}

export interface PromotionRetentionProjection {
  classId: string;
  className: string;
  academicYearId: string;
  academicYear: string;
  totalStudents: number;
  promoted: number;
  repeated: number;
  transferred: number;
  promotionRate: number;
}

export interface SchoolReportFilters {
  academicYearId?: string;
  term?: string;
  classId?: string;
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

function buildQuery(params: SchoolReportFilters): string {
  const search = new URLSearchParams();
  if (params.academicYearId) search.set("academicYearId", params.academicYearId);
  if (params.term) search.set("term", params.term);
  if (params.classId) search.set("classId", params.classId);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function getClassPerformance(filters: SchoolReportFilters = {}): Promise<ClassPerformanceProjection[]> {
  const response = await fetch(getApiUrl(`/api/schoolReport/class-performance${buildQuery(filters)}`));
  if (!response.ok) {
    throw new Error("Failed to load class performance");
  }
  return parseJsonResponse<ClassPerformanceProjection[]>(response, "Unable to parse class performance data.");
}

async function getSubjectPerformance(filters: SchoolReportFilters = {}): Promise<SubjectPerformanceProjection[]> {
  const response = await fetch(getApiUrl(`/api/schoolReport/subject-performance${buildQuery(filters)}`));
  if (!response.ok) {
    throw new Error("Failed to load subject performance");
  }
  return parseJsonResponse<SubjectPerformanceProjection[]>(response, "Unable to parse subject performance data.");
}

async function getPromotionRetention(filters: Omit<SchoolReportFilters, "term"> = {}): Promise<PromotionRetentionProjection[]> {
  const search = new URLSearchParams();
  if (filters.academicYearId) search.set("academicYearId", filters.academicYearId);
  if (filters.classId) search.set("classId", filters.classId);
  const qs = search.toString();
  const response = await fetch(getApiUrl(`/api/schoolReport/promotion-retention${qs ? `?${qs}` : ""}`));
  if (!response.ok) {
    throw new Error("Failed to load promotion & retention");
  }
  return parseJsonResponse<PromotionRetentionProjection[]>(response, "Unable to parse promotion retention data.");
}

export const schoolReportService = {
  getClassPerformance,
  getSubjectPerformance,
  getPromotionRetention,
};
