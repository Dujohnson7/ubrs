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
import StudentReports from "./pages/report/StudentReports";
import ClassStudentReports from "./pages/report/ClassStudentReports";
import MarksApproval from "./pages/report/MarksApproval";
import ClassSubjectsApproval from "./pages/report/ClassSubjectsApproval";
import SubjectMarksApproval from "./pages/report/SubjectMarksApproval";
import SchoolReports from "./pages/report/SchoolReports";
import ParentReports from "./pages/report/ParentReports";
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

            {/* UBRS Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/create" element={<UsersCreate />} />
            <Route path="/users/edit" element={<UsersEdit />} />
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
            <Route path="/parent/reports" element={<ParentReports />} />
            <Route path="/parent-reports" element={<ParentReports />} />
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
