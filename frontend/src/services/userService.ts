export interface User {
  id: string;
  userName: string;
  role: string;
  phone: string;
  email: string;
  password: string;
  status?: string;
  isFirstTime: boolean;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE}/users`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to load users");
  }

  const rawText = await response.text();

  if (rawText.trim().startsWith("<")) {
    console.warn("Non-JSON response received from /users endpoint, falling back to sample data.");
    return [];
  }

  try {
    return JSON.parse(rawText) as User[];
  } catch (_error) {
    console.warn("Unable to parse JSON from /users endpoint, falling back to sample data.");
    return [];
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

async function getUserById(id: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const rawText = await response.text();
    const message = rawText.trim().startsWith("<")
      ? "Unexpected non-JSON response from the server. Please check your API URL or backend."
      : rawText;
    throw new Error(message || "Failed to load user");
  }

  return parseJsonResponse<User>(response, "Unable to parse user data from server.");
}

async function createUser(user: Omit<User, "id">): Promise<User> {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const rawText = await response.text();
    const message = rawText.trim().startsWith("<")
      ? "Unexpected non-JSON response from the server. Please check your API URL or backend."
      : rawText;
    throw new Error(message || "Failed to create user");
  }

  return parseJsonResponse<User>(response, "Unable to parse create user response.");
}

async function updateUser(id: string, user: Partial<User>): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    const rawText = await response.text();
    const message = rawText.trim().startsWith("<")
      ? "Unexpected non-JSON response from the server. Please check your API URL or backend."
      : rawText;
    throw new Error(message || "Failed to update user");
  }

  return parseJsonResponse<User>(response, "Unable to parse update user response.");
}

export const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
};
