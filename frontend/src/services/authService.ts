import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export enum ERole {
  HEADERTEACHER = "HEADERTEACHER",
  CLASSTEACHER = "CLASSTEACHER",
  TEACHER = "TEACHER",
  PARENT = "PARENT",
}

export interface UsersResponseDto {
  userId: string;
  profile: string;
  names: string;
  phone: string;
  email: string;
  role: ERole;
  signature: string;
  userStatus: boolean;
  isFirstTime: boolean;
}

export interface UsersRequestDto {
  profile?: string;
  names?: string;
  phone?: string;
  email?: string;
  password?: string;
  role?: ERole;
  signature?: string;
  userStatus?: boolean;
  isFirstTime?: boolean;
  profileFile?: File;
}

export interface LoginResponseDto {
  user: UsersResponseDto;
  token: string;
  message: string;
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

async function login(loginRequest: UsersRequestDto): Promise<LoginResponseDto> {
  const response = await fetch(getApiUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginRequest),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Login failed");
    throw new Error(message || "Login failed");
  }

  const result = await parseJsonResponse<LoginResponseDto>(response, "Unable to parse login response.");
  toast.success("Login successful");
  return result;
}

async function logout(): Promise<void> {
  const response = await fetch(getApiUrl("/api/auth/logout"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Logout failed");
    throw new Error(message || "Logout failed");
  }

  toast.success("Logout successful");
}

async function forgotPassword(email: string): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/auth/forgot-password?email=${encodeURIComponent(email)}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to send reset email");
    throw new Error(message || "Failed to send reset email");
  }

  const result = await parseJsonResponse<UsersResponseDto>(response, "Unable to parse forgot password response.");
  toast.success("Reset email sent successfully");
  return result;
}

async function verifyForgotPassword(email: string, otp: string): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/auth/verify-forgotPassword?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "OTP verification failed");
    throw new Error(message || "OTP verification failed");
  }

  const result = await parseJsonResponse<UsersResponseDto>(response, "Unable to parse verify response.");
  toast.success("OTP verified successfully");
  return result;
}

async function resetPassword(email: string, otp: string, newPassword: string): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Password reset failed");
    throw new Error(message || "Password reset failed");
  }

  const result = await parseJsonResponse<UsersResponseDto>(response, "Unable to parse reset password response.");
  toast.success("Password reset successfully");
  return result;
}

async function changePassword(email: string, oldPassword: string, newPassword: string): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/auth/change-password?email=${encodeURIComponent(email)}&oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Password change failed");
    throw new Error(message || "Password change failed");
  }

  const result = await parseJsonResponse<UsersResponseDto>(response, "Unable to parse change password response.");
  toast.success("Password changed successfully");
  return result;
}

export const authService = {
  login,
  logout,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  changePassword,
};
