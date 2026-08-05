import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

type AssignmentItem = {
  id: string;
  assignmentId: string;
  studentName: string;
  className: string;
  courseName: string;
  assignedDate: string;
  dueDate: string;
  status: string;
};

export default function AssignmentsEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<AssignmentItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [assignmentId, setAssignmentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Open");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: AssignmentItem } | null;
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
    setAssignmentId(stored.assignmentId);
    setStudentName(stored.studentName);
    setClassName(stored.className);
    setCourseName(stored.courseName);
    setAssignedDate(stored.assignedDate);
    setDueDate(stored.dueDate);
    setStatus(stored.status);
  }, [location.state, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/assignments");
    }, 500);
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Assignment" description="Edit an assignment." /> 

      <div className="space-y-6">
        <ComponentCard title="Edit Assignment" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                {/* Assignment ID is system-managed; removed from form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Teacher</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={studentName} onChange={(e) => setStudentName(e.target.value)}>
                    <option value="">Select teacher</option>
                    <option>Ms. Grace</option>
                    <option>Mr. John</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Class Name</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={className} onChange={(e) => setClassName(e.target.value)}>
                    <option value="">Select class</option>
                    <option>Blue House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course Name</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
                    <option value="">Select course</option>
                    <option>Mathematics</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Assigned Date</label>
                  <Input type="date" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Due Date</label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Status</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
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
