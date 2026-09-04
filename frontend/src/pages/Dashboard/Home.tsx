import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";
import HeaderTeacherHome from "./HeaderTeacherHome";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./ParentDashboard";
 
export default function Home() {
  const { user } = useAuth();
  const role = user?.role;

  if (role === ERole.PARENT) {
    return <ParentDashboard />;
  }

  if (role === ERole.TEACHER || role === ERole.CLASSTEACHER) {
    return <TeacherDashboard />;
  }

  return <HeaderTeacherHome />;
}
