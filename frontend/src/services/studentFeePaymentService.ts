import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";
import { SchoolFeesResponseDto } from "./schoolFeesService";
import { notifySchoolBalanceChanged } from "./schoolBalanceService";

export type ETerm = "TERM1" | "TERM2" | "TERM3";
export type ESchoolLevel = "PRIMARY" | "NURSERY";
export type EPaymentState = "UNPAID" | "PARTIAL" | "PAID";

export interface StudentFeePaymentsDetailResponseDto {
  studentFeePaymentsDetailId: string;
  studentFeePaymentsId: string;
  amountPaid: number;
  paidDate: string;
}

export interface StudentFeePaymentsDetailRequestDto {
  studentFeePaymentsId?: string;
  amountPaid: number;
  paidDate: string;
}

export interface StudentFeePaymentsResponseDto {
  studentFeePaymentsId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  schoolFees: SchoolFeesResponseDto;
  studentLevel: ESchoolLevel;
  totalAmountPaid: number;
  remainAmount: number;
  overDueAmount: number;
  paymentStatus: EPaymentState;
  isOverDueBeUsed?: boolean;
  studentFeePaymentsDetails?: StudentFeePaymentsDetailResponseDto[];
  term?: ETerm;
}

export interface StudentFeePaymentsRequestDto {
  studentId: string;
  schoolFeesId: string;
  term: ETerm;
  studentLevel?: ESchoolLevel;
  totalAmountPaid?: number;
  remainAmount?: number;
  overDueAmount?: number;
  paymentStatus?: EPaymentState;
  studentFeePaymentsDetails?: StudentFeePaymentsDetailRequestDto[];
}

export interface ParentStudentPaymentHistoryProjection {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  schoolFeesId?: string;
  fiscalYear?: string;
  term?: ETerm;
  totalAmountPaid?: number;
  remainAmount?: number;
  paymentStatus?: EPaymentState;
}

function getAuthHeaders(isJson = true): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
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

async function getAllStudentFeePayments(): Promise<StudentFeePaymentsResponseDto[]> {
  const response = await fetch(getApiUrl("/api/studentFeePayment/all"), {
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load student fee payments");
    throw new Error(message || "Failed to load student fee payments");
  }

  return parseJsonResponse<StudentFeePaymentsResponseDto[]>(
    response,
    "Unable to parse student fee payments data from server."
  );
}

async function getStudentFeePaymentsById(id: string): Promise<StudentFeePaymentsResponseDto> {
  const response = await fetch(getApiUrl(`/api/studentFeePayment/${id}`), {
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load student fee payment");
    throw new Error(message || "Failed to load student fee payment");
  }

  return parseJsonResponse<StudentFeePaymentsResponseDto>(
    response,
    "Unable to parse student fee payment data from server."
  );
}

async function registerStudentFeePayments(
  dto: StudentFeePaymentsRequestDto
): Promise<StudentFeePaymentsResponseDto> {
  const response = await fetch(getApiUrl("/api/studentFeePayment/register"), {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to register student fee payment");
    throw new Error(message || "Failed to register student fee payment");
  }

  toast.success("Student fee payment registered successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<StudentFeePaymentsResponseDto>(
    response,
    "Unable to parse register response."
  );
}

async function repayStudentFeePayments(
  studentFeePaymentsId: string,
  requestDto: StudentFeePaymentsDetailRequestDto
): Promise<StudentFeePaymentsResponseDto> {
  const response = await fetch(
    getApiUrl(`/api/studentFeePayment/repayStudentFeePayments/${studentFeePaymentsId}`),
    {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(requestDto),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to record installment payment");
    throw new Error(message || "Failed to record installment payment");
  }

  toast.success("Payment installment added successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<StudentFeePaymentsResponseDto>(
    response,
    "Unable to parse repayment response."
  );
}

async function validateStudentFeePayments(schoolFeesId: string, term: ETerm): Promise<string> {
  const response = await fetch(
    getApiUrl(`/api/studentFeePayment/validateStudentFeePayments/${schoolFeesId}?term=${term}`),
    {
      method: "PATCH",
      headers: getAuthHeaders(true),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to validate student fee payments");
    throw new Error(message || "Failed to validate student fee payments");
  }

  const message = await response.text();
  toast.success(message || "School fees validated successfully");
  notifySchoolBalanceChanged();
  return message;
}

async function importStudentFeePayments(
  schoolFeesId: string,
  term: ETerm,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    getApiUrl(`/api/studentFeePayment/import/${schoolFeesId}?term=${term}`),
    {
      method: "POST",
      headers: getAuthHeaders(false),
      body: formData,
    }
  );

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to import student fee payments");
    throw new Error(message || "Failed to import student fee payments");
  }

  const message = await response.text();
  toast.success(message || "Student fee payments imported successfully");
  notifySchoolBalanceChanged();
  return message;
}

async function updateStudentFeePayments(
  studentFeePaymentId: string,
  dto: StudentFeePaymentsRequestDto
): Promise<StudentFeePaymentsResponseDto> {
  const response = await fetch(getApiUrl(`/api/studentFeePayment/update/${studentFeePaymentId}`), {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update student fee payment");
    throw new Error(message || "Failed to update student fee payment");
  }

  toast.success("Student fee payment updated successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<StudentFeePaymentsResponseDto>(
    response,
    "Unable to parse update response."
  );
}

async function deleteStudentFeePayments(studentFeePaymentId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/studentFeePayment/delete/${studentFeePaymentId}`), {
    method: "DELETE",
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete student fee payment");
    throw new Error(message || "Failed to delete student fee payment");
  }

  toast.success("Student fee payment deleted successfully");
  notifySchoolBalanceChanged();
}

async function getAllStudentFeePaymentsByStudentId(
  studentId: string
): Promise<StudentFeePaymentsResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/studentFeePayment/student/${studentId}`), {
    headers: getAuthHeaders(true),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load student fee payment records");
    throw new Error(message || "Failed to load student fee payment records");
  }

  return parseJsonResponse<StudentFeePaymentsResponseDto[]>(
    response,
    "Unable to parse student fee payment records."
  );
}

async function getParentStudentPaymentHistory(
  parentId: string,
  academicYearId?: string,
  term?: ETerm
): Promise<ParentStudentPaymentHistoryProjection[]> {
  const params = new URLSearchParams();
  params.append("parentId", parentId);
  if (academicYearId && academicYearId !== "ALL") {
    params.append("academicYearId", academicYearId);
  }
  if (term && term !== "ALL") {
    params.append("term", term);
  }

  const response = await fetch(
    getApiUrl(`/api/studentFeePayment/parent-student-payment-history?${params.toString()}`),
    {
      headers: getAuthHeaders(true),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load payment history");
    throw new Error(message || "Failed to load payment history");
  }

  return parseJsonResponse<ParentStudentPaymentHistoryProjection[]>(
    response,
    "Unable to parse payment history from server."
  );
}

export const studentFeePaymentService = {
  getAllStudentFeePayments,
  getStudentFeePaymentsById,
  registerStudentFeePayments,
  repayStudentFeePayments,
  validateStudentFeePayments,
  importStudentFeePayments,
  updateStudentFeePayments,
  deleteStudentFeePayments,
  getAllStudentFeePaymentsByStudentId,
  getParentStudentPaymentHistory,
};
