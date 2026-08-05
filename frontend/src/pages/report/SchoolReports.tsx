import { useState, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { DownloadIcon } from "../../icons";
import { generateReportPdf } from "../../utils/pdfExport";

// ── Sample Data ──────────────────────────────────────────────────────────────

const sampleStudentPerf = [
  { id: "1", studentName: "John Doe", class: "Blue House", totalCourses: 5, avgScore: 88, highestScore: 97, lowestScore: 73, grade: "A", passedCourses: 5, term: "Term 1", year: "AY2025" },
  { id: "2", studentName: "Jane Smith", class: "Red House", totalCourses: 5, avgScore: 76, highestScore: 88, lowestScore: 61, grade: "B", passedCourses: 5, term: "Term 1", year: "AY2025" },
  { id: "3", studentName: "Mike Johnson", class: "Blue House", totalCourses: 5, avgScore: 64, highestScore: 80, lowestScore: 45, grade: "C", passedCourses: 4, term: "Term 2", year: "AY2025" },
  { id: "4", studentName: "Sarah Lee", class: "Green House", totalCourses: 5, avgScore: 91, highestScore: 99, lowestScore: 82, grade: "A", passedCourses: 5, term: "Term 2", year: "AY2025" },
];

const sampleClassPerf = [
  { id: "1", class: "Blue House", totalStudents: 30, averageScore: 83, passingRate: 95, topGrade: "A", failingStudents: 2, term: "Term 1", year: "AY2025" },
  { id: "2", class: "Red House", totalStudents: 28, averageScore: 76, passingRate: 89, topGrade: "B", failingStudents: 3, term: "Term 1", year: "AY2025" },
  { id: "3", class: "Green House", totalStudents: 25, averageScore: 71, passingRate: 84, topGrade: "B", failingStudents: 4, term: "Term 2", year: "AY2025" },
];

const sampleSubjectPerf = [
  { id: "1", subject: "Mathematics", class: "Blue House", enrolled: 30, avgScore: 82, passRate: 93, highestScore: 99, lowestScore: 40, term: "Term 1", year: "AY2025" },
  { id: "2", subject: "Science", class: "Red House", enrolled: 28, avgScore: 74, passRate: 87, highestScore: 95, lowestScore: 38, term: "Term 1", year: "AY2025" },
  { id: "3", subject: "English", class: "Blue House", enrolled: 30, avgScore: 79, passRate: 91, highestScore: 98, lowestScore: 50, term: "Term 2", year: "AY2025" },
];

const sampleAttendance = [
  { id: "1", class: "Blue House", totalStudents: 30, avgAttendance: 94, perfect: 8, frequent: 18, irregular: 4, term: "Term 1", year: "AY2025" },
  { id: "2", class: "Red House", totalStudents: 28, avgAttendance: 87, perfect: 5, frequent: 17, irregular: 6, term: "Term 1", year: "AY2025" },
];

const samplePromotion = [
  { id: "1", class: "Blue House", academicYear: "AY2025", totalStudents: 30, promoted: 27, repeated: 2, transferred: 1, term: "Term 3", year: "AY2025" },
  { id: "2", class: "Red House", academicYear: "AY2025", totalStudents: 28, promoted: 25, repeated: 3, transferred: 0, term: "Term 3", year: "AY2025" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type TabType = "student" | "class" | "subject" | "attendance" | "promotion";

const TAB_LABELS: { key: TabType; label: string }[] = [
  { key: "student", label: "Student Performance" },
  { key: "class", label: "Class Performance" },
  { key: "subject", label: "Subject Performance" },
  { key: "attendance", label: "Attendance Summary" },
  { key: "promotion", label: "Promotion & Retention" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const SEL = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color = pct >= 80 ? "bg-success-500" : pct >= 60 ? "bg-warning-500" : "bg-error-500";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 h-2 overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${pct >= 80 ? "text-success-600" : pct >= 60 ? "text-warning-600" : "text-error-600"}`}>{score}</span>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const cls =
    grade === "A" ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400" :
    grade === "B" ? "bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400" :
    "bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{grade}</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SchoolReports() {
  const [activeTab, setActiveTab] = useState<TabType>("student");
  const [academicYearFilter, setAcademicYearFilter] = useState("All Years");
  const [termFilter, setTermFilter] = useState("All Terms");
  const [classFilter, setClassFilter] = useState("All Classes");

  const applyFilters = <T extends { year?: string; term?: string; class?: string }>(data: T[]) =>
    data.filter((r) => {
      if (academicYearFilter !== "All Years" && r.year && r.year !== academicYearFilter) return false;
      if (termFilter !== "All Terms" && r.term && r.term !== termFilter) return false;
      if (classFilter !== "All Classes" && r.class && r.class !== classFilter) return false;
      return true;
    });

  const students = useMemo(() => applyFilters(sampleStudentPerf), [academicYearFilter, termFilter, classFilter]);
  const classes = useMemo(() => applyFilters(sampleClassPerf), [academicYearFilter, termFilter, classFilter]);
  const subjects = useMemo(() => applyFilters(sampleSubjectPerf), [academicYearFilter, termFilter, classFilter]);
  const attendance = useMemo(() => applyFilters(sampleAttendance), [academicYearFilter, termFilter, classFilter]);
  const promotion = useMemo(() => applyFilters(samplePromotion as any), [academicYearFilter, termFilter, classFilter]);

  const handleDownloadPdf = () => {
    let title = "School Report";
    let headers: string[][] = [];
    let body: (string | number)[][] = [];

    const periodStr = `${termFilter !== "All Terms" ? termFilter : "All Terms"} - ${academicYearFilter !== "All Years" ? academicYearFilter : "All Years"}`;

    switch (activeTab) {
      case "student":
        title = "Student Performance Report";
        headers = [["#", "Student", "Class", "Avg Score", "Highest", "Lowest", "Passed", "Grade", "Term", "Year"]];
        body = students.map((s) => [s.id, s.studentName, s.class, s.avgScore, s.highestScore, s.lowestScore, `${s.passedCourses}/${s.totalCourses}`, s.grade, s.term, s.year]);
        break;
      case "class":
        title = "Class Performance Report";
        headers = [["#", "Class", "Students", "Avg Score", "Pass Rate (%)", "Failing", "Top Grade", "Term", "Year"]];
        body = classes.map((c) => [c.id, c.class, c.totalStudents, c.averageScore, c.passingRate, c.failingStudents, c.topGrade, c.term, c.year]);
        break;
      case "subject":
        title = "Subject Performance Report";
        headers = [["#", "Subject", "Class", "Enrolled", "Avg Score", "Pass Rate (%)", "Highest", "Lowest", "Term", "Year"]];
        body = subjects.map((s) => [s.id, s.subject, s.class, s.enrolled, s.avgScore, s.passRate, s.highestScore, s.lowestScore, s.term, s.year]);
        break;
      case "attendance":
        title = "Attendance Summary Report";
        headers = [["#", "Class", "Students", "Avg Attendance (%)", "Perfect", "Frequent", "Irregular", "Term", "Year"]];
        body = attendance.map((a) => [a.id, a.class, a.totalStudents, a.avgAttendance, a.perfect, a.frequent, a.irregular, a.term, a.year]);
        break;
      case "promotion":
        title = "Promotion & Retention Report";
        headers = [["#", "Class", "Academic Year", "Total", "Promoted", "Repeated", "Transferred", "Promotion Rate (%)"]];
        body = promotion.map((p: any) => [p.id, p.class, p.academicYear, p.totalStudents, p.promoted, p.repeated, p.transferred, Math.round((p.promoted / p.totalStudents) * 100)]);
        break;
    }

    generateReportPdf({
      title,
      reportPeriod: periodStr,
      preparedBy: "Head Teacher", // Could be dynamic from auth context
      headers,
      body,
    });
  };

  const hdr = "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400";
  const cel = "px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400";

  return (
    <>
      <PageMeta title="Ubrs - School Report" description="Comprehensive school performance reports." />

      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">School Report</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive academic performance and operational insights.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] items-end">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Academic Year</label>
              <select className={SEL} value={academicYearFilter} onChange={(e) => setAcademicYearFilter(e.target.value)}>
                <option>All Years</option>
                <option>AY2025</option>
                <option>AY2024</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Term</label>
              <select className={SEL} value={termFilter} onChange={(e) => setTermFilter(e.target.value)}>
                <option>All Terms</option>
                <option>Term 1</option>
                <option>Term 2</option>
                <option>Term 3</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Class</label>
              <select className={SEL} value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option>All Classes</option>
                <option>Blue House</option>
                <option>Red House</option>
                <option>Green House</option>
              </select>
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                startIcon={<DownloadIcon className="size-4" />}
                onClick={handleDownloadPdf}
                className="h-11 px-6"
              >
                Download Report
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800 w-fit max-w-full">
          {TAB_LABELS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-white text-brand-600 shadow dark:bg-gray-700 dark:text-brand-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Student Performance ── */}
        {activeTab === "student" && (
          <ComponentCard title="Student Performance Summary" titleClassName="text-xl sm:text-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Each row shows a student's overall academic performance across all courses for the selected period.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className={hdr}>#</TableCell>
                      <TableCell isHeader className={hdr}>Student</TableCell>
                      <TableCell isHeader className={hdr}>Class</TableCell>
                      <TableCell isHeader className={hdr}>Avg Score</TableCell>
                      <TableCell isHeader className={hdr}>Highest</TableCell>
                      <TableCell isHeader className={hdr}>Lowest</TableCell>
                      <TableCell isHeader className={hdr}>Passed</TableCell>
                      <TableCell isHeader className={hdr}>Grade</TableCell>
                      <TableCell isHeader className={hdr}>Term</TableCell>
                      <TableCell isHeader className={hdr}>Year</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className={cel}>{s.id}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{s.studentName}</TableCell>
                        <TableCell className={cel}>{s.class}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={s.avgScore} /></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-success-600 font-semibold">{s.highestScore}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{s.lowestScore}</span></TableCell>
                        <TableCell className={cel}>{s.passedCourses}/{s.totalCourses}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><GradeBadge grade={s.grade} /></TableCell>
                        <TableCell className={cel}>{s.term}</TableCell>
                        <TableCell className={cel}>{s.year}</TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow><TableCell className="px-5 py-8 text-center text-gray-400" colSpan={10}>No records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* ── Class Performance ── */}
        {activeTab === "class" && (
          <ComponentCard title="Class Performance Summary" titleClassName="text-xl sm:text-2xl">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className={hdr}>#</TableCell>
                      <TableCell isHeader className={hdr}>Class</TableCell>
                      <TableCell isHeader className={hdr}>Students</TableCell>
                      <TableCell isHeader className={hdr}>Avg Score</TableCell>
                      <TableCell isHeader className={hdr}>Passing Rate</TableCell>
                      <TableCell isHeader className={hdr}>Failing</TableCell>
                      <TableCell isHeader className={hdr}>Top Grade</TableCell>
                      <TableCell isHeader className={hdr}>Term</TableCell>
                      <TableCell isHeader className={hdr}>Year</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {classes.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className={cel}>{c.id}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{c.class}</TableCell>
                        <TableCell className={cel}>{c.totalStudents}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={c.averageScore} /></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={c.passingRate} /></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{c.failingStudents}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><GradeBadge grade={c.topGrade} /></TableCell>
                        <TableCell className={cel}>{c.term}</TableCell>
                        <TableCell className={cel}>{c.year}</TableCell>
                      </TableRow>
                    ))}
                    {classes.length === 0 && (
                      <TableRow><TableCell className="px-5 py-8 text-center text-gray-400" colSpan={9}>No records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* ── Subject Performance ── */}
        {activeTab === "subject" && (
          <ComponentCard title="Subject Performance Summary" titleClassName="text-xl sm:text-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              View how each subject performs across different classes and periods.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className={hdr}>#</TableCell>
                      <TableCell isHeader className={hdr}>Subject</TableCell>
                      <TableCell isHeader className={hdr}>Class</TableCell>
                      <TableCell isHeader className={hdr}>Enrolled</TableCell>
                      <TableCell isHeader className={hdr}>Avg Score</TableCell>
                      <TableCell isHeader className={hdr}>Pass Rate (%)</TableCell>
                      <TableCell isHeader className={hdr}>Highest</TableCell>
                      <TableCell isHeader className={hdr}>Lowest</TableCell>
                      <TableCell isHeader className={hdr}>Term</TableCell>
                      <TableCell isHeader className={hdr}>Year</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {subjects.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className={cel}>{s.id}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{s.subject}</TableCell>
                        <TableCell className={cel}>{s.class}</TableCell>
                        <TableCell className={cel}>{s.enrolled}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={s.avgScore} /></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={s.passRate} /></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-success-600 font-semibold">{s.highestScore}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{s.lowestScore}</span></TableCell>
                        <TableCell className={cel}>{s.term}</TableCell>
                        <TableCell className={cel}>{s.year}</TableCell>
                      </TableRow>
                    ))}
                    {subjects.length === 0 && (
                      <TableRow><TableCell className="px-5 py-8 text-center text-gray-400" colSpan={10}>No records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* ── Attendance Summary ── */}
        {activeTab === "attendance" && (
          <ComponentCard title="Attendance Summary" titleClassName="text-xl sm:text-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Breakdown of student attendance rates per class and term.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className={hdr}>#</TableCell>
                      <TableCell isHeader className={hdr}>Class</TableCell>
                      <TableCell isHeader className={hdr}>Students</TableCell>
                      <TableCell isHeader className={hdr}>Avg Attendance (%)</TableCell>
                      <TableCell isHeader className={hdr}>Perfect (100%)</TableCell>
                      <TableCell isHeader className={hdr}>Frequent (≥80%)</TableCell>
                      <TableCell isHeader className={hdr}>Irregular (&lt;80%)</TableCell>
                      <TableCell isHeader className={hdr}>Term</TableCell>
                      <TableCell isHeader className={hdr}>Year</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {attendance.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className={cel}>{a.id}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{a.class}</TableCell>
                        <TableCell className={cel}>{a.totalStudents}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={a.avgAttendance} /></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-success-600 font-semibold">{a.perfect}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-brand-600 font-semibold">{a.frequent}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{a.irregular}</span></TableCell>
                        <TableCell className={cel}>{a.term}</TableCell>
                        <TableCell className={cel}>{a.year}</TableCell>
                      </TableRow>
                    ))}
                    {attendance.length === 0 && (
                      <TableRow><TableCell className="px-5 py-8 text-center text-gray-400" colSpan={9}>No records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        )}

        {/* ── Promotion & Retention ── */}
        {activeTab === "promotion" && (
          <ComponentCard title="Promotion & Retention Report" titleClassName="text-xl sm:text-2xl">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              End-of-year promotion, retention, and transfer statistics per class.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className={hdr}>#</TableCell>
                      <TableCell isHeader className={hdr}>Class</TableCell>
                      <TableCell isHeader className={hdr}>Academic Year</TableCell>
                      <TableCell isHeader className={hdr}>Total Students</TableCell>
                      <TableCell isHeader className={hdr}>Promoted</TableCell>
                      <TableCell isHeader className={hdr}>Repeated</TableCell>
                      <TableCell isHeader className={hdr}>Transferred</TableCell>
                      <TableCell isHeader className={hdr}>Promotion Rate</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {promotion.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className={cel}>{p.id}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{p.class}</TableCell>
                        <TableCell className={cel}>{p.academicYear}</TableCell>
                        <TableCell className={cel}>{p.totalStudents}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-success-600 font-semibold">{p.promoted}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{p.repeated}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-warning-600 font-semibold">{p.transferred}</span></TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]">
                          <ScoreBar score={Math.round((p.promoted / p.totalStudents) * 100)} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {promotion.length === 0 && (
                      <TableRow><TableCell className="px-5 py-8 text-center text-gray-400" colSpan={8}>No records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
}
