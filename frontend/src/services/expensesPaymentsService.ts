import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";
import { notifySchoolBalanceChanged } from "./schoolBalanceService";

export interface ExpensesPaymentsRequestDto {
  schoolExpenseId: string;
  amount: number;
  expenseDate: string;
}

export interface ExpensesPaymentsResponseDto {
  expensesPaymentsId: string;
  schoolExpenseId: string;
  expenseName: string;
  amount: number;
  expenseDate: string;
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

async function getAllExpensesPayments(): Promise<ExpensesPaymentsResponseDto[]> {
  const response = await fetch(getApiUrl("/api/expensePayments/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load expense payments");
    throw new Error(message || "Failed to load expense payments");
  }

  return parseJsonResponse<ExpensesPaymentsResponseDto[]>(response, "Unable to parse expense payments data from server.");
}

async function getExpensesPaymentsByExpenseId(expenseId: string): Promise<ExpensesPaymentsResponseDto[]> {
  const response = await fetch(getApiUrl(`/api/expensePayments/expense/${expenseId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load expense payments");
    throw new Error(message || "Failed to load expense payments");
  }

  return parseJsonResponse<ExpensesPaymentsResponseDto[]>(response, "Unable to parse expense payments data from server.");
}

async function getExpensesPaymentById(id: string): Promise<ExpensesPaymentsResponseDto> {
  const response = await fetch(getApiUrl(`/api/expensePayments/${id}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load expense payment");
    throw new Error(message || "Failed to load expense payment");
  }

  return parseJsonResponse<ExpensesPaymentsResponseDto>(response, "Unable to parse expense payment data from server.");
}

async function registerExpensesPayment(payment: ExpensesPaymentsRequestDto): Promise<ExpensesPaymentsResponseDto> {
  const response = await fetch(getApiUrl("/api/expensePayments/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create expense payment");
    throw new Error(message || "Failed to create expense payment");
  }

  toast.success("Expense payment created successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<ExpensesPaymentsResponseDto>(response, "Unable to parse create expense payment response.");
}

async function updateExpensesPayment(id: string, payment: ExpensesPaymentsRequestDto): Promise<ExpensesPaymentsResponseDto> {
  const response = await fetch(getApiUrl(`/api/expensePayments/update/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update expense payment");
    throw new Error(message || "Failed to update expense payment");
  }

  toast.success("Expense payment updated successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<ExpensesPaymentsResponseDto>(response, "Unable to parse update expense payment response.");
}

async function deleteExpensesPayment(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/expensePayments/delete/${id}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete expense payment");
    throw new Error(message || "Failed to delete expense payment");
  }

  toast.success("Expense payment deleted successfully");
  notifySchoolBalanceChanged();
}

export const expensesPaymentsService = {
  getAllExpensesPayments,
  getExpensesPaymentsByExpenseId,
  getExpensesPaymentById,
  registerExpensesPayment,
  updateExpensesPayment,
  deleteExpensesPayment,
};
