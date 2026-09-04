import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { courseAssignmentService, CourseAssignmentRequestDto, EAssignmentState } from "../../services/courseAssignmentService";
import { schoolClassService } from "../../services/schoolClassService";
import { courseService } from "../../services/courseService";
import { userService } from "../../services/userService";
import { toast } from "../../utils/toast";

export default function AssignmentsCreate() {
  const navigate = useNavigate();
  const [teacherId, setTeacherId] = useState("");
  const [schoolClassId, setSchoolClassId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [teachers, setTeachers] = useState<import("../../services/userService").UsersResponseDto[]>([]);
  const [classes, setClasses] = useState<import("../../services/schoolClassService").SchoolClassResponseDto[]>([]);
  const [courses, setCourses] = useState<import("../../services/courseService").CourseResponseDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersData, classesData] = await Promise.all([
          userService.getAllTeachers(),
          schoolClassService.getAllSchoolClasses(),
        ]);
        setTeachers(teachersData);
        setClasses(classesData);
      } catch (err) {
        // Error is handled by toast in service
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      if (!schoolClassId) {
        setCourses([]);
        return;
      }

      try {
        const coursesData = await courseService.getUnassignedCourses(schoolClassId);
        setCourses(coursesData);
      } catch (err) {
        // Error is handled by toast in service
      }
    };

    loadCourses();
  }, [schoolClassId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        assignmentStatus: EAssignmentState.ACTIVE,
        assignmentDate: new Date().toISOString().split("T")[0],
      };

      await courseAssignmentService.registerCourseAssignment(assignmentData);
      navigate("/assignments");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Assignment" description="Create a new assignment." /> 

      <div className="space-y-6">
        <ComponentCard title="Create Assignment" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
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
                {loading ? "Saving..." : "Create Assignment"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/assignments")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
