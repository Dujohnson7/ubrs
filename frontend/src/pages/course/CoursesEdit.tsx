import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { courseService, CourseResponseDto, CourseRequestDto, ESchoolLevel } from "../../services/courseService";
import { toast } from "../../utils/toast";

export default function CoursesEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<CourseResponseDto | null>(null);
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseHours, setCourseHours] = useState(0);
  const [courseLevel, setCourseLevel] = useState<ESchoolLevel>("PRIMARY");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: CourseResponseDto } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("courseEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/courses");
      return;
    }

    sessionStorage.setItem("courseEditItem", JSON.stringify(stored));
    setItem(stored);
    setCourseCode(stored.courseCode);
    setCourseName(stored.courseName);
    setCourseHours(stored.courseHours);
    setCourseLevel(stored.courseLevel);
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    if (!courseCode.trim() || !courseName.trim()) {
      toast.error("Course code and name are required");
      return;
    }

    if (courseHours <= 0) {
      toast.error("Course hours must be greater than 0");
      return;
    }

    setLoading(true);

    try {
      const courseData: CourseRequestDto = {
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        courseHours,
        courseLevel,
      };

      await courseService.updateCourse(item.courseId, courseData);
      navigate("/courses");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Course" description="Edit a course." />
      <PageBreadcrumb pageTitle="Edit Course" />

      <div className="space-y-6">
        <ComponentCard title="Edit Course" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                {/* Course ID is system-managed; not editable here */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course Name</label>
                  <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Enter course name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course Hours</label>
                  <Input type="number" value={courseHours} onChange={(e) => setCourseHours(Number(e.target.value))} placeholder="Enter hour count" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course Code</label>
                  <Input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="Enter course code" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course Level</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value as ESchoolLevel)}
                  >
                    <option value="PRIMARY">Primary</option>
                    <option value="NURSERY">Nursery</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/courses")}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading course...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
