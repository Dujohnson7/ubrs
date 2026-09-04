import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";
import { UsersResponseDto, ERole } from "./authService";

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

async function getUserProfile(userId: string): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/profile/${userId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load profile");
    throw new Error(message || "Failed to load profile");
  }

  return parseJsonResponse<UsersResponseDto>(response, "Unable to parse profile data from server.");
}

async function updateProfile(userId: string, formData: FormData): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/profile/update/${userId}`), {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update profile");
    throw new Error(message || "Failed to update profile");
  }

  toast.success("Profile updated successfully");
  return parseJsonResponse<UsersResponseDto>(response, "Unable to parse update profile response.");
}

async function uploadSignature(userId: string, formData: FormData): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/profile/signature/${userId}`), {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to upload signature");
    throw new Error(message || "Failed to upload signature");
  }

  toast.success("Signature uploaded successfully");
  return parseJsonResponse<UsersResponseDto>(response, "Unable to parse signature upload response.");
}

async function checkPassword(userId: string, password: string): Promise<boolean> {
  const formData = new URLSearchParams();
  formData.append("userId", userId);
  formData.append("password", password);

  const response = await fetch(getApiUrl(`/api/profile/checkPassword`), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    return false;
  }

  return true;
}

async function changePassword(userId: string, password: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/profile/changePassword/${userId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to change password");
    throw new Error(message || "Failed to change password");
  }

  toast.success("Password changed successfully");
}

export const profileService = {
  getUserProfile,
  updateProfile,
  uploadSignature,
  checkPassword,
  changePassword,
};
