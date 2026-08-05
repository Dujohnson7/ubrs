import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

type GradeItem = {
  id: string;
  gradeId: string;
  studentName: string;
  courseName: string;
  score: number;
  grade: string;
  comment: string;
};

export default function GradesEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<GradeItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gradeId, setGradeId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [score, setScore] = useState("");
  const [grade, setGrade] = useState("A");
  const [gradeType, setGradeType] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: GradeItem } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("gradeEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/grades");
      return;
    }

    sessionStorage.setItem("gradeEditItem", JSON.stringify(stored));
    setItem(stored);
    setGradeId(stored.gradeId);
    setStudentName(stored.studentName);
    setCourseName(stored.courseName);
    setScore(String(stored.score));
    setGrade(stored.grade);
    setComment(stored.comment);
  }, [location.state, navigate]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/grades");
    }, 500);
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Grade" description="Edit a grade." /> 

      <div className="space-y-6">
        <ComponentCard title="Edit Grade" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                {/* Grade ID is system-managed; removed from edit form */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Student</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={studentName} onChange={(e) => setStudentName(e.target.value)}>
                    <option value="">Select student</option>
                    <option>Alice Johnson</option>
                    <option>Bob Smith</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={courseName} onChange={(e) => setCourseName(e.target.value)}>
                    <option value="">Select course</option>
                    <option>Mathematics</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Grade Type</label>
                  <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={gradeType} onChange={(e) => setGradeType(e.target.value)}>
                    <option value="">Select grade type</option>
                    <option value="exam">Exam</option>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Score</label>
                  <Input type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="Enter score" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Grade</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Comment</label>
                  <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter comment" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/grades")}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading grade...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
