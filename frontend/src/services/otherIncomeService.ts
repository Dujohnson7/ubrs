import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";
import { notifySchoolBalanceChanged } from "./schoolBalanceService";

export interface OtherIncomeRequestDto {
  description: string;
  amount: number;
  incomeDate: string;  
}

export interface OtherIncomeResponseDto {
  otherIncomeId: string;
  description: string;
  amount: number;
  incomeDate: string;
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

async function getAllOtherIncomes(): Promise<OtherIncomeResponseDto[]> {
  const response = await fetch(getApiUrl("/api/otherIncome/all"), {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load other incomes");
    throw new Error(message || "Failed to load other incomes");
  }
  return parseJsonResponse<OtherIncomeResponseDto[]>(response, "Unable to parse other incomes data from server.");
}

async function getOtherIncomeById(id: string): Promise<OtherIncomeResponseDto> {
  const response = await fetch(getApiUrl(`/api/otherIncome/${id}`), {
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load other income");
    throw new Error(message || "Failed to load other income");
  }
  return parseJsonResponse<OtherIncomeResponseDto>(response, "Unable to parse other income data from server.");
}

async function registerOtherIncome(income: OtherIncomeRequestDto): Promise<OtherIncomeResponseDto> {
  const response = await fetch(getApiUrl("/api/otherIncome/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(income),
  });
  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create other income");
    throw new Error(message || "Failed to create other income");
  }
  toast.success("Other income created successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<OtherIncomeResponseDto>(response, "Unable to parse created other income response.");
}

async function updateOtherIncome(id: string, income: OtherIncomeRequestDto): Promise<OtherIncomeResponseDto> {
  const response = await fetch(getApiUrl(`/api/otherIncome/update/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(income),
  });
  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update other income");
    throw new Error(message || "Failed to update other income");
  }
  toast.success("Other income updated successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<OtherIncomeResponseDto>(response, "Unable to parse updated other income response.");
}

async function deleteOtherIncome(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/otherIncome/delete/${id}`), {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete other income");
    throw new Error(message || "Failed to delete other income");
  }
  toast.success("Other income deleted successfully");
  notifySchoolBalanceChanged();
}

export const otherIncomeService = {
  getAllOtherIncomes,
  getOtherIncomeById,
  registerOtherIncome,
  updateOtherIncome,
  deleteOtherIncome,
};
