import { getApiUrl } from "../config/api";
import { AcademicYearResponseDto } from "./academicYearService";
import { schoolBalanceService } from "./schoolBalanceService";

export interface AccountantDashboardMetrics {
  totalStudents: number;
  nurseryStudents: number;
  primaryStudents: number;
  totalTeachers: number;
  activeAcademicYear: AcademicYearResponseDto | null;
  totalSchoolExpense: number;
  totalAmountCollectedByActive: number;
  totalAmountPendingReceivableByActive: number;
  totalAmountExpectedByActive: number;
  totalStudentPaid: number;
  totalStudentPartial: number;
  totalStudentUnpaid: number;
  schoolFeeCompletionRate: number;
  schoolBalance: number;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
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

async function fetchNumber(path: string): Promise<number> {
  try {
    const response = await fetch(getApiUrl(path), {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      return 0;
    }
    const val = await parseJsonResponse<number>(response, `Failed to parse ${path}`);
    return Number(val) || 0;
  } catch (err) {
    console.warn(`Error fetching ${path}:`, err);
    return 0;
  }
}

async function getActiveAcademicYear(): Promise<AcademicYearResponseDto | null> {
  try {
    const response = await fetch(getApiUrl("/api/AccountantDashboard/academicYear/active"), {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return null;
    return await parseJsonResponse<AcademicYearResponseDto>(response, "Unable to parse active academic year");
  } catch {
    return null;
  }
}

async function getDashboardMetrics(): Promise<AccountantDashboardMetrics> {
  const [
    totalStudents,
    nurseryStudents,
    primaryStudents,
    totalTeachers,
    activeAcademicYear,
    totalSchoolExpense,
    totalAmountCollectedByActive,
    totalAmountPendingReceivableByActive,
    totalAmountExpectedByActive,
    totalStudentPaid,
    totalStudentPartial,
    totalStudentUnpaid,
    schoolFeeCompletionRate,
    schoolBalanceObj,
  ] = await Promise.all([
    fetchNumber("/api/AccountantDashboard/totalStudents"),
    fetchNumber("/api/AccountantDashboard/totalStudents/nursery"),
    fetchNumber("/api/AccountantDashboard/totalStudents/primary"),
    fetchNumber("/api/AccountantDashboard/totalTeacher"),
    getActiveAcademicYear(),
    fetchNumber("/api/AccountantDashboard/totalSchoolExpense"),
    fetchNumber("/api/AccountantDashboard/totalAmountCollectedByActive"),
    fetchNumber("/api/AccountantDashboard/totalAmountPendingReceivableByActive"),
    fetchNumber("/api/AccountantDashboard/totalAmountExpectedByActive"),
    fetchNumber("/api/AccountantDashboard/totalStudentPaid"),
    fetchNumber("/api/AccountantDashboard/totalStudentPartial"),
    fetchNumber("/api/AccountantDashboard/totalStudentUnpaid"),
    fetchNumber("/api/AccountantDashboard/schoolFeeCompletionRate"),
    schoolBalanceService.getSchoolBalance().catch(() => ({ balance: 0 })),
  ]);

  return {
    totalStudents,
    nurseryStudents,
    primaryStudents,
    totalTeachers,
    activeAcademicYear,
    totalSchoolExpense,
    totalAmountCollectedByActive,
    totalAmountPendingReceivableByActive,
    totalAmountExpectedByActive,
    totalStudentPaid,
    totalStudentPartial,
    totalStudentUnpaid,
    schoolFeeCompletionRate,
    schoolBalance: schoolBalanceObj?.balance || 0,
  };
}

export const accountantDashboardService = {
  getDashboardMetrics,
  getActiveAcademicYear,
  fetchNumber,
};
