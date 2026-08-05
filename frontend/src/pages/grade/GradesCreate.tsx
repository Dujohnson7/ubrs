import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

export default function GradesCreate() {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [term, setTerm] = useState("");
  const [gradeType, setGradeType] = useState("");
  const [maxMarks, setMaxMarks] = useState<string>("");
    const [classId, setClassId] = useState("");
    const [students, setStudents] = useState<Array<{ id: string; name: string; marks: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const max = Number(maxMarks) || 0;
    for (const s of students) {
      const m = Number(s.marks);
      if (isNaN(m) || m < 0 || (max > 0 && m > max)) {
        alert(`Please enter valid marks for ${s.name} (0-${max || 'no limit'})`);
        return;
      }
    }

    setLoading(true);
    const payload = {
      courseId,
      academicYearId,
      term,
      maxMarks: max,
      classId,
      students: students.map((s) => ({ id: s.id, marks: Number(s.marks) })),
    };
    console.log("Submitting grades payload:", payload);
    setTimeout(() => {
      setLoading(false);
      navigate("/grades");
    }, 500);
  };

  useEffect(() => {
    // Populate students when a class is selected. Replace with real data fetch later.
    if (!classId) {
      setStudents([]);
      return;
    }

    const sampleStudents = [
      { id: "s1", name: "Alice Johnson", marks: "" },
      { id: "s2", name: "Bob Smith", marks: "" },
      { id: "s3", name: "Charlie Brown", marks: "" },
    ];
    setStudents(sampleStudents);
  }, [classId]);

  return (
    <>
      <PageMeta title="Ubrs - Create Grade" description="Create a new grade." />

      <div className="space-y-6">
        <ComponentCard title="Create Grade" titleClassName="text-xl sm:text-2xl" className="max-w-4xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="p-4 border rounded-md bg-white dark:bg-gray-900">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Course</label>
                      <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                        <option value="">Select course</option>
                        <option value="c1">Mathematics</option>
                        <option value="c2">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Academic Year</label>
                      <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
                        <option value="">Select academic year</option>
                        <option value="ay1">2023/2024</option>
                        <option value="ay2">2022/2023</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Term</label>
                      <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={term} onChange={(e) => setTerm(e.target.value)}>
                        <option value="">Select term</option>
                        <option value="term1">Term 1</option>
                        <option value="term2">Term 2</option>
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Max Marks</label>
                      <Input type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} placeholder="Enter maximum marks" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Class</label>
                      <select className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={classId} onChange={(e) => setClassId(e.target.value)}>
                        <option value="">Select class</option>
                        <option value="cl1">Class A</option>
                        <option value="cl2">Class B</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md bg-white dark:bg-gray-900">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Students</label>
                  <div className="mt-2">
                    {students.length === 0 ? (
                      <div className="text-sm text-gray-500">Select a class to load students.</div>
                    ) : (
                      <div className="space-y-2">
                        {students.map((s) => (
                          <div key={s.id} className="flex items-center gap-3">
                            <div className="w-1/2 text-sm">{s.name}</div>
                            <div className="w-1/2">
                              <Input type="number" value={s.marks} onChange={(e) => setStudents((prev) => prev.map((p) => (p.id === s.id ? { ...p, marks: e.target.value } : p)))} placeholder={`Enter marks (max ${maxMarks || 'no limit'})`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Grade"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/grades")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
