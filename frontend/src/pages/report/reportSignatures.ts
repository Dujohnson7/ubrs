import { API_CONFIG } from "../../config/api";
import { userService } from "../../services/userService";
import { schoolClassService } from "../../services/schoolClassService";

export type ReportSignatories = {
  classTeacherId?: string;
  classTeacher: string;
  classTeacherSignature: string;
  headteacher: string;
  headteacherSignature: string;
};

const toSignatureUrl = (filename?: string | null): string => {
  if (!filename) return "";
  return `${API_CONFIG.BASE_URL}/uploads/signature/${filename}`;
};

/** Resolve class teacher + HEADERTEACHER names and signature image URLs for report cards. */
export async function loadReportSignatories(
  classId: string,
  fallbackClassTeacher = ""
): Promise<ReportSignatories> {
  let classTeacher = fallbackClassTeacher;
  let classTeacherId: string | undefined;
  let classTeacherSignature = "";
  let headteacher = "";
  let headteacherSignature = "";

  try {
    const schoolClass = await schoolClassService.getSchoolClassById(classId);
    classTeacherId = schoolClass.classTeacherId;
    classTeacher = schoolClass.classTeacherName || fallbackClassTeacher;

    if (schoolClass.classTeacherId) {
      try {
        const teacher = await userService.getUserById(schoolClass.classTeacherId);
        classTeacher = teacher.names || classTeacher;
        classTeacherSignature = toSignatureUrl(teacher.signature);
      } catch {
        // keep name from class if profile fetch fails
      }
    }
  } catch {
    // keep fallbacks
  }

  try {
    const users = await userService.getAllUsers();
    const head = users.find((u) => u.role === "HEADERTEACHER" && u.userStatus !== false);
    if (head) {
      headteacher = head.names || "";
      headteacherSignature = toSignatureUrl(head.signature);
    }
  } catch {
    // optional
  }

  return {
    classTeacherId,
    classTeacher,
    classTeacherSignature,
    headteacher,
    headteacherSignature,
  };
}
