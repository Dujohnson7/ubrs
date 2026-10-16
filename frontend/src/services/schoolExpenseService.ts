import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";
import { notifySchoolBalanceChanged } from "./schoolBalanceService";

export interface SchoolExpenseRequestDto {
  expenseName: string;
  expenseStaus: boolean;
}

export interface SchoolExpenseResponseDto {
  schoolExpenseId: string;
  expenseName: string;
  expenseStaus: boolean;
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

async function getAllSchoolExpenses(): Promise<SchoolExpenseResponseDto[]> {
  const response = await fetch(getApiUrl("/api/schoolExpense/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load school expenses");
    throw new Error(message || "Failed to load school expenses");
  }

  return parseJsonResponse<SchoolExpenseResponseDto[]>(response, "Unable to parse school expenses data from server.");
}

async function getAllActiveSchoolExpenses(): Promise<SchoolExpenseResponseDto[]> {
  const response = await fetch(getApiUrl("/api/schoolExpense/all/active"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load active school expenses");
    throw new Error(message || "Failed to load active school expenses");
  }

  return parseJsonResponse<SchoolExpenseResponseDto[]>(response, "Unable to parse active school expenses data from server.");
}

async function getSchoolExpenseById(id: string): Promise<SchoolExpenseResponseDto> {
  const response = await fetch(getApiUrl(`/api/schoolExpense/${id}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load school expense");
    throw new Error(message || "Failed to load school expense");
  }

  return parseJsonResponse<SchoolExpenseResponseDto>(response, "Unable to parse school expense data from server.");
}

async function registerSchoolExpense(schoolExpense: SchoolExpenseRequestDto): Promise<SchoolExpenseResponseDto> {
  const response = await fetch(getApiUrl("/api/schoolExpense/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schoolExpense),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create school expense");
    throw new Error(message || "Failed to create school expense");
  }

  toast.success("School expense created successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<SchoolExpenseResponseDto>(response, "Unable to parse create school expense response.");
}

async function updateSchoolExpense(id: string, schoolExpense: SchoolExpenseRequestDto): Promise<SchoolExpenseResponseDto> {
  const response = await fetch(getApiUrl(`/api/schoolExpense/update/${id}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(schoolExpense),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update school expense");
    throw new Error(message || "Failed to update school expense");
  }

  toast.success("School expense updated successfully");
  notifySchoolBalanceChanged();
  return parseJsonResponse<SchoolExpenseResponseDto>(response, "Unable to parse update school expense response.");
}

async function deleteSchoolExpense(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/schoolExpense/delete/${id}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete school expense");
    throw new Error(message || "Failed to delete school expense");
  }

  toast.success("School expense deleted successfully");
  notifySchoolBalanceChanged();
}

async function activateSchoolExpense(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/schoolExpense/active/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to activate school expense");
    throw new Error(message || "Failed to activate school expense");
  }

  toast.success("School expense activated successfully");
  notifySchoolBalanceChanged();
}

async function deactivateSchoolExpense(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/schoolExpense/deactive/${id}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to deactivate school expense");
    throw new Error(message || "Failed to deactivate school expense");
  }

  toast.success("School expense deactivated successfully");
  notifySchoolBalanceChanged();
}

export const schoolExpenseService = {
  getAllSchoolExpenses,
  getAllActiveSchoolExpenses,
  getSchoolExpenseById,
  registerSchoolExpense,
  updateSchoolExpense,
  deleteSchoolExpense,
  activateSchoolExpense,
  deactivateSchoolExpense,
};
