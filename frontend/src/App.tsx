import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import VerifyOtp from "./pages/AuthPages/VerifyOtp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Users from "./pages/users/Users";
import UsersCreate from "./pages/users/UsersCreate";
import UsersEdit from "./pages/users/UsersEdit";
import ParentStudents from "./pages/parentStudents/ParentStudents";
import ParentStudentsCreate from "./pages/parentStudents/ParentStudentsCreate";
import ParentStudentsEdit from "./pages/parentStudents/ParentStudentsEdit";
import ParentStudentsDetails from "./pages/parentStudents/ParentStudentsDetails";
import AcademicYears from "./pages/academicYear/AcademicYears";
import AcademicYearsCreate from "./pages/academicYear/AcademicYearsCreate";
import AcademicYearsEdit from "./pages/academicYear/AcademicYearsEdit";
import Classes from "./pages/class/Classes";
import ClassesCreate from "./pages/class/ClassesCreate";
import ClassesEdit from "./pages/class/ClassesEdit";
import Courses from "./pages/course/Courses";
import CoursesCreate from "./pages/course/CoursesCreate";
import CoursesEdit from "./pages/course/CoursesEdit";
import Students from "./pages/student/Students";
import StudentsCreate from "./pages/student/StudentsCreate";
import StudentsEdit from "./pages/student/StudentsEdit";
import Assignments from "./pages/classAssignment/Assignments";
import AssignmentsCreate from "./pages/classAssignment/AssignmentsCreate";
import AssignmentsEdit from "./pages/classAssignment/AssignmentsEdit";
import Grades from "./pages/grade/Grades";
import GradesCreate from "./pages/grade/GradesCreate";
import GradesEdit from "./pages/grade/GradesEdit";
import GradeDetails from "./pages/grade/GradeDetails";
import Calendar from "./pages/Calendar";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import SchoolBoardDashboard from "./pages/Dashboard/SchoolBoardDashboard";
import StudentReports from "./pages/report/StudentReports";
import ClassStudentReports from "./pages/report/ClassStudentReports";
import MarksApproval from "./pages/report/MarksApproval";
import ClassSubjectsApproval from "./pages/report/ClassSubjectsApproval";
import SubjectMarksApproval from "./pages/report/SubjectMarksApproval";
import SchoolReports from "./pages/report/SchoolReports";
import FinancialReport from "./pages/report/FinancialReport";
import ParentReports from "./pages/report/ParentReports";
import SchoolFees from "./pages/schoolFees/SchoolFees";
import SchoolFeesCreate from "./pages/schoolFees/SchoolFeesCreate";
import SchoolFeesEdit from "./pages/schoolFees/SchoolFeesEdit";
import ParentSchoolFees from "./pages/schoolFees/ParentSchoolFees";
import ParentSchoolFeesBreakdown from "./pages/schoolFees/ParentSchoolFeesBreakdown";
import SchoolExpenses from "./pages/schoolExpense/SchoolExpenses";
import SchoolExpensesCreate from "./pages/schoolExpense/SchoolExpensesCreate";
import SchoolExpensesEdit from "./pages/schoolExpense/SchoolExpensesEdit";
import ExpensesPayments from "./pages/expensesPayments/ExpensesPayments";
import ExpensesPaymentsCreate from "./pages/expensesPayments/ExpensesPaymentsCreate";
import ExpensesPaymentsEdit from "./pages/expensesPayments/ExpensesPaymentsEdit";
import StudentFeePayments from "./pages/studentFeePayments/StudentFeePayments";
import StudentFeePaymentsCreate from "./pages/studentFeePayments/StudentFeePaymentsCreate";
import StudentFeePaymentsEdit from "./pages/studentFeePayments/StudentFeePaymentsEdit";
import StudentFeePaymentsInstallments from "./pages/studentFeePayments/StudentFeePaymentsInstallments";
import Announcements from "./pages/announcement/Announcement";
import AnnouncementsCreate from "./pages/announcement/AnnouncementsCreate";
import AnnouncementsEdit from "./pages/announcement/AnnouncementsEdit";
import { AuthProvider } from "./context/AuthContext";
import ToastContainer from "./components/common/ToastContainer";


export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ToastContainer />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route path="/school-board-dashboard" element={<SchoolBoardDashboard />} />

            {/* UBRS Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/create" element={<UsersCreate />} />
            <Route path="/users/edit" element={<UsersEdit />} />
            <Route path="/parent-students" element={<ParentStudents />} />
            <Route path="/parent-students/create" element={<ParentStudentsCreate />} />
            <Route path="/parent-students/edit" element={<ParentStudentsEdit />} />
            <Route path="/parent-students/details" element={<ParentStudentsDetails />} />
            <Route path="/academic-years" element={<AcademicYears />} />
            <Route path="/academic-years/create" element={<AcademicYearsCreate />} />
            <Route path="/academic-years/edit" element={<AcademicYearsEdit />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/create" element={<ClassesCreate />} />
            <Route path="/classes/edit" element={<ClassesEdit />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/create" element={<CoursesCreate />} />
            <Route path="/courses/edit" element={<CoursesEdit />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/create" element={<StudentsCreate />} />
            <Route path="/students/edit" element={<StudentsEdit />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/assignments/create" element={<AssignmentsCreate />} />
            <Route path="/assignments/edit" element={<AssignmentsEdit />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/grades/create" element={<GradesCreate />} />
            <Route path="/grades/edit" element={<GradesEdit />} />
            <Route path="/grades/details" element={<GradeDetails />} />
            <Route path="/student-reports" element={<StudentReports />} />
            <Route path="/student-reports/:classId" element={<ClassStudentReports />} />
            <Route path="/marks-approval" element={<MarksApproval />} />
            <Route path="/marks-approval/details" element={<ClassSubjectsApproval />} />
            <Route path="/marks-approval/details/studentGrade" element={<SubjectMarksApproval />} />
            <Route path="/school-report" element={<SchoolReports />} />
            <Route path="/financial-report" element={<FinancialReport />} />
            <Route path="/parent/reports" element={<ParentReports />} />
            <Route path="/parent-reports" element={<ParentReports />} />
            <Route path="/parent/school-fees" element={<ParentSchoolFees />} />
            <Route path="/parent/school-fees/breakdown" element={<ParentSchoolFeesBreakdown />} />
            <Route path="/parent-school-fees" element={<ParentSchoolFees />} />
            <Route path="/parent/fees" element={<ParentSchoolFees />} />
            <Route path="/parent-fees" element={<ParentSchoolFees />} />
            <Route path="/school-fees" element={<SchoolFees />} />
            <Route path="/school-fees/create" element={<SchoolFeesCreate />} />
            <Route path="/school-fees/edit" element={<SchoolFeesEdit />} />
            <Route path="/school-expenses" element={<SchoolExpenses />} />
            <Route path="/school-expenses/create" element={<SchoolExpensesCreate />} />
            <Route path="/school-expenses/edit" element={<SchoolExpensesEdit />} />
            <Route path="/expense-payments" element={<ExpensesPayments />} />
            <Route path="/expense-payments/create" element={<ExpensesPaymentsCreate />} />
            <Route path="/expense-payments/edit" element={<ExpensesPaymentsEdit />} />
            <Route path="/student-fee-payments" element={<StudentFeePayments />} />
            <Route path="/student-fee-payments/create" element={<StudentFeePaymentsCreate />} />
            <Route path="/student-fee-payments/edit" element={<StudentFeePaymentsEdit />} />
            <Route path="/student-fee-payments/installments" element={<StudentFeePaymentsInstallments />} />
            <Route path="/student-fee-payments/installments/:id" element={<StudentFeePaymentsInstallments />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/announcements/create" element={<AnnouncementsCreate />} />
            <Route path="/announcements/edit" element={<AnnouncementsEdit />} />
            <Route path="/calendar" element={<Calendar />} /> 
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
