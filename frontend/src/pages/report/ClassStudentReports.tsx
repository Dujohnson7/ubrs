import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import {
  ClassInfo,
  StudentReport,
  getStudentsByClass,
  printStudentReport,
  printAllClassReports,
  buildMarksheetHTML,
} from "./reportPrintUtils";

// ─────────────────── Grade helpers ───────────────────
const gradeColor = (pct: number) => {
  if (pct >= 80) return { bg: "#dcfce7", text: "#16a34a", border: "#86efac" };
  if (pct >= 70) return { bg: "#dbeafe", text: "#2563eb", border: "#93c5fd" };
  if (pct >= 60) return { bg: "#e0f7fa", text: "#0891b2", border: "#67e8f9" };
  if (pct >= 50) return { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" };
  return { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" };
};

const gradeLabel = (pct: number) => {
  if (pct >= 80) return "A1";
  if (pct >= 70) return "B2";
  if (pct >= 60) return "B3";
  if (pct >= 50) return "C4";
  return "D";
};

// ─────────────────── Modal Component ───────────────────
interface ReportModalProps {
  student: StudentReport | null;
  onClose: () => void;
  onPrint: (s: StudentReport) => void;
}

function ReportModal({ student, onClose, onPrint }: ReportModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!student) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [student, onClose]);

  if (!student) return null;

  const marksheetHTML = buildMarksheetHTML(student);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="relative w-full max-w-3xl bg-gray-200 shadow-2xl p-4" id="student-report-modal">

        {/* ── Floating Action Buttons (Outside paper) ── */}
        <div className="absolute -top-12 right-4 flex gap-2 print:hidden">
          <button
            id="modal-print-btn"
            onClick={() => onPrint(student)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-xs px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button onClick={onClose} className="size-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors shadow-sm">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── MARKSHEET BODY (using same HTML as print) ── */}
        <div 
          className="bg-white shadow-lg overflow-auto"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
          dangerouslySetInnerHTML={{ __html: marksheetHTML }}
        />
      </div>
    </div>
  );
}

// ─────────────────── Default class data ───────────────────
const defaultClasses: ClassInfo[] = [
  { id: "1", classId: "C101", name: "Primary 1A", classLevel: "Primary 1", classTeacher: "Ms. Grace Uwimana", studentCount: 10, term: "Term 1", academicYear: "2025 - 2026" },
  { id: "2", classId: "C102", name: "Primary 1B", classLevel: "Primary 1", classTeacher: "Mr. Jean Bosco", studentCount: 10, term: "Term 1", academicYear: "2025 - 2026" },
  { id: "3", classId: "C201", name: "Primary 2A", classLevel: "Primary 2", classTeacher: "Mrs. Aline Mukamana", studentCount: 10, term: "Term 1", academicYear: "2025 - 2026" },
  { id: "4", classId: "C301", name: "Primary 3A", classLevel: "Primary 3", classTeacher: "Mr. Patrick Nkurunziza", studentCount: 10, term: "Term 1", academicYear: "2025 - 2026" },
  { id: "5", classId: "N101", name: "Nursery A", classLevel: "Nursery", classTeacher: "Ms. Claudette Ingabire", studentCount: 4, term: "Term 1", academicYear: "2025 - 2026" },
];

// ─────────────────── Main Page ───────────────────
export default function ClassStudentReports() {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const classData: ClassInfo = (location.state as { classData: ClassInfo })?.classData
    || defaultClasses.find((c) => c.id === classId)
    || defaultClasses[0];

  const students: StudentReport[] = getStudentsByClass(classData);

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      if (genderFilter !== "All" && s.gender !== genderFilter) return false;
      if (!q) return true;
      return [s.studentCode, s.firstName, s.middleName, s.lastName].join(" ").toLowerCase().includes(q);
    });
  }, [students, search, genderFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title={`Ubrs — ${classData.name} Reports`} description={`Student reports for ${classData.name}`} /> 

      <ReportModal student={selectedStudent} onClose={() => setSelectedStudent(null)} onPrint={printStudentReport} />

      <div className="space-y-6">
        {/* Printed Document Header */}
        <div className="bg-white p-8 border border-gray-200 shadow-sm print:shadow-none print:border-none">
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="size-20 bg-white flex items-center justify-center border-2 border-gray-800 rounded-lg overflow-hidden">
                <img src="/assets/logo.png" alt="School Logo" className="w-full h-full object-contain p-2" />
              </div>
              <div>
                <div className="text-gray-800 text-2xl font-black tracking-widest uppercase">Umwana Bright Academy</div>
                <div className="text-gray-500 text-sm mt-1">Class Master Report Sheet</div>
                <div className="text-gray-800 font-bold mt-2 text-lg">{classData.name} ({classData.classLevel})</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800">Academic Year: {classData.academicYear}</div>
              <div className="text-sm font-bold text-gray-800">Term: {classData.term}</div>
              <div className="text-sm text-gray-600 mt-2">Class Teacher: {classData.classTeacher}</div>
              <div className="text-sm text-gray-600">Total Students: {students.length}</div>
            </div>
          </div>
          <div className="flex justify-end gap-3 print:hidden mb-4">
            <button
              onClick={() => printAllClassReports(classData)}
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Master Sheet
            </button>
            <button
              onClick={() => navigate("/student-reports")}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>

        <ComponentCard title="Students" titleClassName="text-xl sm:text-2xl">
          {/* Filters */}
          <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 md:grid-cols-[2fr_1fr] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Students</label>
                <Input placeholder="Search by name or code..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Gender</label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={genderFilter}
                  onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                >
                  <option>All</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border-2 border-gray-800 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm print:border-none print:shadow-none">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["#","Code","Student Name","Gender","Total Marks","Percentage","Rank","Attendance","Actions"].map((h) => (
                      <TableCell key={h} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-10 text-center text-gray-400 text-theme-sm" colSpan={9}>No students found.</TableCell>
                    </TableRow>
                  ) : paginated.map((student, idx) => {
                    const col = gradeColor(student.percentage);
                    const grade = gradeLabel(student.percentage);
                    return (
                      <TableRow
                        key={student.id}
                        className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <TableCell className="px-5 py-4 text-gray-400 text-start text-theme-sm">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-mono font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {student.studentCode}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="size-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
                              style={{ background: student.gender === "Female" ? "linear-gradient(135deg,#ec4899,#a855f7)" : "linear-gradient(135deg,#3b82f6,#1e3a5f)" }}
                            >
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800 dark:text-white/90 text-sm">{student.firstName} {student.lastName}</div>
                              <div className="text-xs text-gray-400">{student.middleName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${student.gender === "Female" ? "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300" : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                            {student.gender === "Female" ? "♀" : "♂"} {student.gender}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 font-semibold text-gray-700 text-start text-theme-sm dark:text-gray-200">
                          {student.totalMarks}<span className="text-gray-400 font-normal text-xs">/{student.totalOutOf}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: col.bg, color: col.text }}>
                              {student.percentage}%
                            </span>
                            <span className="text-[10px] text-gray-400">{grade}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="text-xs font-bold text-[#1e3a5f] dark:text-blue-300">#{student.rank}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400 text-xs">
                          {student.attendanceDays}/{student.totalDays}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex gap-1.5">
                            <button
                              id={`view-student-${student.id}`}
                              onClick={() => setSelectedStudent(student)}
                              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100 transition-colors dark:bg-brand-900/30 dark:text-brand-300"
                            >
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              View
                            </button>
                            <button
                              id={`print-student-${student.id}`}
                              onClick={() => printStudentReport(student)}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-300"
                            >
                              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                              Print
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} – {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <select className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                {[5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="justify-self-center flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 text-sm">{currentPage}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
