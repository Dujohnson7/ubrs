import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { courseAssignmentService, CourseAssignmentResponseDto, CourseAssignmentRequestDto } from "../../services/courseAssignmentService";
import { schoolClassService } from "../../services/schoolClassService";
import { courseService } from "../../services/courseService";
import { userService } from "../../services/userService";
import { toast } from "../../utils/toast";

export default function AssignmentsEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<CourseAssignmentResponseDto | null>(null);
  const [teacherId, setTeacherId] = useState("");
  const [schoolClassId, setSchoolClassId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teachers, setTeachers] = useState<import("../../services/userService").UsersResponseDto[]>([]);
  const [classes, setClasses] = useState<import("../../services/schoolClassService").SchoolClassResponseDto[]>([]);
  const [courses, setCourses] = useState<import("../../services/courseService").CourseResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: CourseAssignmentResponseDto } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("assignmentEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/assignments");
      return;
    }

    sessionStorage.setItem("assignmentEditItem", JSON.stringify(stored));
    setItem(stored);
    setTeacherId(stored.teacherId);
    setSchoolClassId(stored.schoolClassId);
    setCourseId(stored.courseId);
  }, [location.state, navigate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersData, classesData, coursesData] = await Promise.all([
          userService.getAllUsers(),
          schoolClassService.getAllSchoolClasses(),
          courseService.getAllCourses(),
        ]);
        setTeachers(teachersData);
        setClasses(classesData);
        setCourses(coursesData);
      } catch (err) {
        // Error is handled by toast in service
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    if (!teacherId || !schoolClassId || !courseId) {
      toast.error("Teacher, class, and course are required");
      return;
    }

    setLoading(true);

    try {
      const assignmentData: CourseAssignmentRequestDto = {
        teacherId,
        schoolClassId,
        courseId,
        assignmentStatus: item.assignmentStatus,
        assignmentDate: item.assignmentDate,
      };

      await courseAssignmentService.updateCourseAssignment(item.courseAssignmentId, assignmentData);
      navigate("/assignments");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Assignment" description="Edit an assignment." /> 
      <div className="space-y-6">
        <ComponentCard title="Edit Assignment" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <Label>Teacher</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.userId} value={teacher.userId}>{teacher.names}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Class</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={schoolClassId} onChange={(e) => setSchoolClassId(e.target.value)}>
                    <option value="">Select class</option>
                    {classes.map((cls) => (
                      <option key={cls.schoolClassId} value={cls.schoolClassId}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Course</Label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.courseId} value={course.courseId}>{course.courseName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/assignments")}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading assignment...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
