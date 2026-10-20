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

                                                          
  const canManageFinance = isAccountant;
 
  const canManageUsers = isHeadTeacher;
  const canManageAcademic = isHeadTeacher;
  const canManageClasses = isHeadTeacher;
  const canManageParentStudents = isHeadTeacher;
  const canManageCourses = isHeadTeacher;
  const canManageStudents = isHeadTeacher;
  const canManageAssignments = isHeadTeacher;
  const canManageGrades = !isSchoolBoardManager && !isAccountant && (isHeadTeacher || isTeacher || isClassTeacher);
  const canApproveMarks = isHeadTeacher|| isClassTeacher || isTeacher ;
  const canManageAnnouncements = isHeadTeacher;

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
    canManageAnnouncements,
  };
};
