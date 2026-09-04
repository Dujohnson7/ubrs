import { getApiUrl } from "../config/api";
import { toast } from "../utils/toast";

export type ERole = "HEADERTEACHER" | "CLASSTEACHER" | "TEACHER" | "PARENT";

export interface UsersRequestDto {
  profile?: string;
  names: string;
  phone: string;
  email: string;
  password?: string;
  role: ERole;
  signature?: string;
  userStatus: boolean;
  isFirstTime: boolean;
}

export interface UsersResponseDto {
  userId: string;
  profile?: string;
  names: string;
  phone: string;
  email: string;
  role: ERole;
  signature?: string;
  userStatus: boolean;
  isFirstTime: boolean;
}

export interface ParentStudentRequestDto {
  names: string;
  email: string;
  phone: string;
  studentIds: string[];
}

export interface ParentStudentResponseDto {
    id: string;
    parentId: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    schoolClassId: string;
    schoolClassName: string;
    classLevel: string;
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

async function getAllUsers(): Promise<UsersResponseDto[]> {
  const response = await fetch(getApiUrl("/api/userManagement/all"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load users");
    throw new Error(message || "Failed to load users");
  }

  return parseJsonResponse<UsersResponseDto[]>(response, "Unable to parse users data from server.");
}

async function getAllTeachers(): Promise<UsersResponseDto[]> {
  const response = await fetch(getApiUrl("/api/userManagement/teachers"), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load teachers");
    throw new Error(message || "Failed to load teachers");
  }

  return parseJsonResponse<UsersResponseDto[]>(response, "Unable to parse teachers data from server.");
}


async function getUserById(userId: string): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/userManagement/${userId}`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to load user");
    throw new Error(message || "Failed to load user");
  }

  return parseJsonResponse<UsersResponseDto>(response, "Unable to parse user data from server.");
}

async function registerUser(user: UsersRequestDto): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl("/api/userManagement/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create user");
    throw new Error(message || "Failed to create user");
  }

  toast.success("User created successfully");
  return parseJsonResponse<UsersResponseDto>(response, "Unable to parse create user response.");
}

async function registerParent(parent: ParentStudentRequestDto): Promise<ParentStudentResponseDto[]> {
  const response = await fetch(getApiUrl("/api/userManagement/registerParent"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parent),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to create parent");
    throw new Error(message || "Failed to create parent");
  }

  toast.success("Parent created successfully");
  return parseJsonResponse<ParentStudentResponseDto[]>(response, "Unable to parse create parent response.");
}

async function updateUser(userId: string, user: UsersRequestDto): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/userManagement/update/${userId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to update user");
    throw new Error(message || "Failed to update user");
  }

  toast.success("User updated successfully");
  return parseJsonResponse<UsersResponseDto>(response, "Unable to parse update user response.");
}

async function changePassword(userId: string, password: string): Promise<UsersResponseDto> {
  const response = await fetch(getApiUrl(`/api/userManagement/changePassword/${userId}?password=${encodeURIComponent(password)}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to change password");
    throw new Error(message || "Failed to change password");
  }

  toast.success("Password changed successfully");
  return parseJsonResponse<UsersResponseDto>(response, "Unable to parse change password response.");
}

async function activateUser(userId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/userManagement/activate/${userId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to activate user");
    throw new Error(message || "Failed to activate user");
  }

  toast.success("User activated successfully");
}

async function suspendUser(userId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/userManagement/suspend/${userId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to suspend user");
    throw new Error(message || "Failed to suspend user");
  }

  toast.success("User suspended successfully");
}

async function deleteUser(userId: string): Promise<void> {
  const response = await fetch(getApiUrl(`/api/userManagement/delete/${userId}`), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    toast.error(message || "Failed to delete user");
    throw new Error(message || "Failed to delete user");
  }

  toast.success("User deleted successfully");
}

export const userService = {
  getAllUsers,
  getAllTeachers,
  getUserById,
  registerUser,
  registerParent,
  updateUser,
  changePassword,
  activateUser,
  suspendUser,
  deleteUser,
};
