import { API_CONFIG } from "../config/api";
import { userService } from "../services/userService";
import { schoolClassService } from "../services/schoolClassService";
import { UsersResponseDto } from "../services/authService";

export const cleanName = (name?: string | null): string => {
  if (!name) return "";
  return name.replace(/\s*\([^)]*\)/g, "").trim();
};

export const formatUserRole = (role?: string): string => {
  if (!role) return "";
  switch (role.toUpperCase()) {
    case "HEADERTEACHER":
    case "HEADTEACHER":
    case "HEAD_TEACHER":
      return "Head Teacher";
    case "ACCOUNTANT":
      return "Accountant";
    case "SCHOOL_BOARD_MANAGER":
      return "School Board Manager";
    case "CLASSTEACHER":
    case "CLASS_TEACHER":
      return "Class Teacher";
    case "TEACHER":
      return "Teacher";
    case "PARENT":
      return "Parent";
    default:
      return role
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
};

export const getSignatureUrl = (filename?: string | null): string => {
  if (!filename) return "";
  if (
    filename.startsWith("data:") ||
    filename.startsWith("http://") ||
    filename.startsWith("https://")
  ) {
    return filename;
  }
  return `${API_CONFIG.BASE_URL}/uploads/signature/${filename}`;
};

export interface ResolvedSignatory {
  name: string;
  role: string;
  signatureUrl: string;
}

let cachedHeadteacher: ResolvedSignatory | null = null;

export async function resolveHeadteacherSignatory(): Promise<ResolvedSignatory> {
  if (cachedHeadteacher) return cachedHeadteacher;
  try {
    const users = await userService.getAllUsers();
    const head = users.find(
      (u) =>
        (u.role === "HEADERTEACHER" || (u.role as string) === "HEADTEACHER") &&
        u.userStatus !== false
    );
    if (head) {
      cachedHeadteacher = {
        name: cleanName(head.names) || "Head Teacher",
        role: "Head Teacher",
        signatureUrl: getSignatureUrl(head.signature),
      };
      return cachedHeadteacher;
    }
  } catch (err) {
    console.error("Failed to fetch headteacher signatory", err);
  }
  return {
    name: "Head Teacher",
    role: "Head Teacher",
    signatureUrl: "",
  };
}

export async function resolveSignatory(
  user?: UsersResponseDto | null,
  fallbackRole = "Authorized Signatory"
): Promise<ResolvedSignatory> {
  if (user && user.names) {
    let signature = user.signature;

     if (!signature && user.userId) {
      try {
        const freshUser = await userService.getUserById(user.userId);
        if (freshUser?.signature) {
          signature = freshUser.signature;
        }
      } catch {
       }
    }

    return {
      name: cleanName(user.names),
      role: formatUserRole(user.role) || fallbackRole,
      signatureUrl: getSignatureUrl(signature),
    };
  }

   return resolveHeadteacherSignatory();
}

export async function resolveClassTeacherSignatory(
  schoolClassId?: string
): Promise<ResolvedSignatory> {
  if (!schoolClassId) {
    return {
      name: "Class Teacher",
      role: "Class Teacher",
      signatureUrl: "",
    };
  }

  try {
    const schoolClass = await schoolClassService.getSchoolClassById(schoolClassId);
    let teacherName = cleanName(schoolClass.classTeacherName) || "Class Teacher";
    let sigUrl = "";

    if (schoolClass.classTeacherId) {
      try {
        const teacherUser = await userService.getUserById(schoolClass.classTeacherId);
        sigUrl = getSignatureUrl(teacherUser.signature);
        if (teacherUser?.names) {
          teacherName = cleanName(teacherUser.names);
        }
      } catch {}
    }

    return {
      name: teacherName,
      role: "Class Teacher",
      signatureUrl: sigUrl,
    };
  } catch (err) {
    console.error("Failed to load class teacher signatory", err);
    return {
      name: "Class Teacher",
      role: "Class Teacher",
      signatureUrl: "",
    };
  }
}
