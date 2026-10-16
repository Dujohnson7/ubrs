import { useAuth } from "./useAuth";
import { ERole } from "../services/authService";

export const useRoleAccess = () => {
  const { user } = useAuth();
  const role = user?.role;

  const isSchoolBoardManager = role === ERole.SCHOOL_BOARD_MANAGER;
  const isAccountant = role === ERole.ACCOUNTANT;
  const isHeadTeacher = role === ERole.HEADERTEACHER;
  const isClassTeacher = role === ERole.CLASSTEACHER;
  const isTeacher = role === ERole.TEACHER;
  const isParent = role === ERole.PARENT;

  // On Finance pages: ONLY ACCOUNTANT can display actions and modify
  // (School Fees, Student Fee Payments, School Expenses, Expense Payments).
  // Other users (including SCHOOL_BOARD_MANAGER and HEADERTEACHER) will be viewing only.
  const canManageFinance = isAccountant;

  // On General/Academic management pages:
  // SCHOOL_BOARD_MANAGER and ACCOUNTANT are strictly view-only (no action buttons, no actions column).
  const canManageUsers = isHeadTeacher;
  const canManageAcademic = isHeadTeacher;
  const canManageClasses = isHeadTeacher;
  const canManageParentStudents = isHeadTeacher;
  const canManageCourses = isHeadTeacher;
  const canManageStudents = isHeadTeacher || isClassTeacher;
  const canManageAssignments = isHeadTeacher;
  const canManageGrades = !isSchoolBoardManager && !isAccountant && (isHeadTeacher || isTeacher || isClassTeacher);
  const canApproveMarks = isHeadTeacher|| isClassTeacher || isTeacher ;

  return {
    user,
    role,
    isSchoolBoardManager,
    isAccountant,
    isHeadTeacher,
    isClassTeacher,
    isTeacher,
    isParent,
    canManageFinance,
    canManageUsers,
    canManageAcademic,
    canManageClasses,
    canManageParentStudents,
    canManageCourses,
    canManageStudents,
    canManageAssignments,
    canManageGrades,
    canApproveMarks,
  };
};
