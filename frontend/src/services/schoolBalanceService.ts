import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export interface SchoolBalanceResponseDto {
  balance: number;
  [key: string]: any;
}

export const SCHOOL_BALANCE_UPDATED_EVENT = "school-balance-updated";

export function notifySchoolBalanceChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SCHOOL_BALANCE_UPDATED_EVENT));
  }
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

async function getSchoolBalance(showToastOnError = false): Promise<SchoolBalanceResponseDto> {
  const response = await fetch(getApiUrl("/api/schoolBalance"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    if (showToastOnError) {
      toast.error(message || "Failed to load school balance");
    }
    throw new Error(message || "Failed to load school balance");
  }

  return parseJsonResponse<SchoolBalanceResponseDto>(response, "Unable to parse school balance data from server.");
}

export const schoolBalanceService = {
  getSchoolBalance,
  notifySchoolBalanceChanged,
};
