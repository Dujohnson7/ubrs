import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export type ETerm = "TERM1" | "TERM2" | "TERM3";
export type ESchoolLevel = "PRIMARY" | "NURSERY";

export interface ExpenseReportProjection {
  id: string;
  expenseName: string;
  expenseDate: string;
  amount: number;
}

export interface SchoolFinancialSummaryProjection {
  academicYearId: string;
  fiscalYear: string;
  term: ETerm | null;
  studentCount: number;
  totalFeesCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
}

export interface StudentFeeCollectionProjection {
  academicYearId: string;
  fiscalYear: string;
  term: ETerm | null;
  studentCount: number;
  totalAmountPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
}

export interface StudentPaymentHistoryProjection {
  paymentDetailId: string;
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  academicYearId: string;
  fiscalYear: string;
  term: ETerm;
  studentLevel: ESchoolLevel;
  schoolClassId: string | null;
  schoolFeesId: string | null;
  amountPaid: number;
  paidDate: string;
  overpaymentAmountToUse: number;
}

export interface ExpenseReportFilterParams {
  schoolExpenseId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface StudentPaymentHistoryFilterParams {
  studentId?: string;
  academicYearId?: string;
  term?: ETerm;
  studentLevel?: ESchoolLevel;
  schoolClassId?: string;
  schoolFeesId?: string;
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
    throw new Error("Unexpected non-JSON response from the server. Please check your API URL or backend.");
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error(fallbackMessage);
  }
}

async function getExpenseReport(params?: ExpenseReportFilterParams): Promise<ExpenseReportProjection[]> {
  const queryParams = new URLSearchParams();
  if (params?.schoolExpenseId) queryParams.append("schoolExpenseId", params.schoolExpenseId);
  if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
  if (params?.toDate) queryParams.append("toDate", params.toDate);

  const query = queryParams.toString();
  const url = getApiUrl(`/api/financialPayments/expense-report${query ? `?${query}` : ""}`);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load expense report");
    throw new Error(message || "Failed to load expense report");
  }

  return parseJsonResponse<ExpenseReportProjection[]>(response, "Unable to parse expense report data.");
}

async function getStudentPaymentHistory(params?: StudentPaymentHistoryFilterParams): Promise<StudentPaymentHistoryProjection[]> {
  const queryParams = new URLSearchParams();
  if (params?.studentId) queryParams.append("studentId", params.studentId);
  if (params?.academicYearId) queryParams.append("academicYearId", params.academicYearId);
  if (params?.term) queryParams.append("term", params.term);
  if (params?.studentLevel) queryParams.append("studentLevel", params.studentLevel);
  if (params?.schoolClassId) queryParams.append("schoolClassId", params.schoolClassId);
  if (params?.schoolFeesId) queryParams.append("schoolFeesId", params.schoolFeesId);

  const query = queryParams.toString();
  const url = getApiUrl(`/api/financialPayments/student-payment-history${query ? `?${query}` : ""}`);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load student payment history");
    throw new Error(message || "Failed to load student payment history");
  }

  return parseJsonResponse<StudentPaymentHistoryProjection[]>(response, "Unable to parse student payment history.");
}

async function getStudentFeeCollectionReport(academicYearId: string, term?: ETerm): Promise<StudentFeeCollectionProjection[]> {
  const queryParams = new URLSearchParams();
  queryParams.append("academicYearId", academicYearId);
  if (term) queryParams.append("term", term);

  const url = getApiUrl(`/api/financialPayments/student-fee-collection?${queryParams.toString()}`);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load student fee collection report");
    throw new Error(message || "Failed to load student fee collection report");
  }

  return parseJsonResponse<StudentFeeCollectionProjection[]>(response, "Unable to parse student fee collection data.");
}

async function getSchoolFinancialSummary(academicYearId: string, term?: ETerm): Promise<SchoolFinancialSummaryProjection[]> {
  const queryParams = new URLSearchParams();
  queryParams.append("academicYearId", academicYearId);
  if (term) queryParams.append("term", term);

  const url = getApiUrl(`/api/financialPayments/school-financial-summary?${queryParams.toString()}`);

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load school financial summary");
    throw new Error(message || "Failed to load school financial summary");
  }

  return parseJsonResponse<SchoolFinancialSummaryProjection[]>(response, "Unable to parse school financial summary.");
}

export const financialReportService = {
  getExpenseReport,
  getStudentPaymentHistory,
  getStudentFeeCollectionReport,
  getSchoolFinancialSummary,
};
