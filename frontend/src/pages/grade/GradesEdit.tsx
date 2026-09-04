import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { gradeService, GradeResponseDto, GradeRequestDto, GradeDetailsRequestDto, GradeType } from "../../services/gradeService";

type StudentRow = { studentId: string; name: string; mark: string };

export default function GradesEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [original, setOriginal] = useState<GradeResponseDto | null>(null);

  const [term, setTerm] = useState("");
  const [gradeType, setGradeType] = useState<GradeType | "">("");
  const [maxMark, setMaxMark] = useState("");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { grade?: GradeResponseDto } | null;
    const grade = state?.grade ?? (() => {
      const stored = sessionStorage.getItem("gradeEditItem");
      return stored ? JSON.parse(stored) as GradeResponseDto : null;
    })();

    if (!grade) {
      navigate("/grades");
      return;
    }

    sessionStorage.setItem("gradeEditItem", JSON.stringify(grade));
    setOriginal(grade);
    setTerm(grade.term ?? "");
    setGradeType((grade.gradeType as GradeType) ?? "");
    setMaxMark(String(grade.maxMark ?? ""));
    setStudents(
      (grade.gradeDetails ?? []).map(d => ({
        studentId: d.studentId,
        name: d.studentName,
        mark: String(d.mark),
      }))
    );
  }, [location.state, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!original || !gradeType) return;
    const max = Number(maxMark);
    for (const s of students) {
      const m = Number(s.mark);
      if (s.mark === "" || isNaN(m) || m < 0 || (max > 0 && m > max)) {
        alert(`Please enter valid marks for ${s.name} (0–${max || "∞"}).`);
        return;
      }
    }

    setLoading(true);
    const payload: GradeRequestDto = {
      academicYearId: original.academicYearId,
      term,
      schoolClassId: original.schoolClassId,
      courseId: original.courseId,
      gradeType: gradeType as GradeType,
      maxMark: max,
      gradeDetails: students.map<GradeDetailsRequestDto>(s => ({
        studentId: s.studentId,
        mark: Number(s.mark),
      })),
    };

    try {
      await gradeService.updateGrade(original.gradeId, payload);
      navigate("/grades");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectCls = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta title="Ubrs - Edit Grade" description="Edit grade batch." />

      <div className="space-y-6">
        <ComponentCard title="Edit Grade" titleClassName="text-xl sm:text-2xl" className="max-w-4xl mx-auto">
          {original ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Read-only info banner */}
              <div className="p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-sm text-brand-800 dark:text-brand-300 grid sm:grid-cols-3 gap-2">
                <div><span className="font-semibold">Course:</span> {original.courseName} </div>
                <div><span className="font-semibold">Class:</span> {original.schoolClassName}</div>
                <div><span className="font-semibold">Year:</span> {original.fiscalYear}</div>
              </div>

              {/* Editable config */}
              <div className="p-5 border border-gray-200 rounded-xl bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Grade Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Term</label>
                    <select className={selectCls} value={term} onChange={(e) => setTerm(e.target.value)}>
                      <option value="TERM1">Term 1</option>
                      <option value="TERM2">Term 2</option>
                      <option value="TERM3">Term 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Grade Type</label>
                    <select className={selectCls} value={gradeType} onChange={(e) => setGradeType(e.target.value as GradeType)}>
                      <option value="TEST">Test</option>
                      <option value="EXAM">Exam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Max Mark</label>
                    <Input type="number" value={maxMark} onChange={(e) => setMaxMark(e.target.value)} placeholder="e.g. 100" />
                  </div>
                </div>
              </div>

              {/* Student marks */}
              <div className="p-5 border border-gray-200 rounded-xl bg-white dark:border-gray-700 dark:bg-gray-900/40">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                  Student Marks
                  <span className="ml-2 text-xs font-normal text-gray-400">({students.length} students)</span>
                </h3>
                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">No students in this grade batch.</p>
                ) : (
                  <div className="space-y-3">
                    {students.map((s) => (
                      <div key={s.studentId} className="flex items-center gap-4">
                        <div className="flex-1 text-sm font-medium text-gray-800 dark:text-white/90">{s.name}</div>
                        <div className="w-48">
                          <Input
                            type="number"
                            value={s.mark}
                            onChange={(e) =>
                              setStudents(prev =>
                                prev.map(p => p.studentId === s.studentId ? { ...p, mark: e.target.value } : p)
                              )
                            }
                            placeholder={`0–${maxMark || "max"}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
