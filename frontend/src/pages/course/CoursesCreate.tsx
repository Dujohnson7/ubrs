import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";

export default function CoursesCreate() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [courseId, setCourseId] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseHour, setCourseHour] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseLevel, setCourseLevel] = useState("Primary");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/courses");
    }, 500);
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Course" description="Create a new course." />
      <PageBreadcrumb pageTitle="Create Course" />

      <div className="space-y-6">
        <ComponentCard title="Create Course" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              {/* Course ID is system-managed; removed from create form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course Name</label>
                <Input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Enter course name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course Hour</label>
                <Input type="number" value={courseHour} onChange={(e) => setCourseHour(e.target.value)} placeholder="Enter hour count" />
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
                  onChange={(e) => setCourseLevel(e.target.value)}
                >
                  <option value="Primary">Primary</option>
                  <option value="Nursery">Nursery</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Course"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/courses")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
