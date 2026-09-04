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
  buildStudentReportsFromGrades,
  printStudentReport,
  printAllClassReports,
  buildMarksheetHTML,
  normalizeReportTerm,
  formatReportTermLabel,
  getReportDisplaySummary,
  isFullYearReport,
} from "./reportPrintUtils";
import { studentReportService } from "../../services/studentReportService";
import { schoolClassService } from "../../services/schoolClassService";
import { academicYearService } from "../../services/academicYearService";

const gradeColor = (pct: number) => {
  if (pct >= 80) return { bg: "#dcfce7", text: "#16a34a" };
  if (pct >= 70) return { bg: "#dbeafe", text: "#2563eb" };
  if (pct >= 60) return { bg: "#e0f7fa", text: "#0891b2" };
  if (pct >= 50) return { bg: "#fef3c7", text: "#d97706" };
  return { bg: "#fee2e2", text: "#dc2626" };
};

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
      <div className="relative w-full max-w-5xl bg-gray-200 shadow-2xl p-4" id="student-report-modal">
        <div className="absolute -top-12 right-4 flex gap-2 print:hidden">
          <button
            id="modal-print-btn"
            onClick={() => onPrint(student)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-xs px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Print
          </button>
          <button onClick={onClose} className="size-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors shadow-sm">
            ✕
          </button>
        </div>
        <div
          className="bg-white shadow-lg overflow-auto"
          style={{ maxHeight: "calc(100vh - 80px)", minHeight: "80vh" }}
          dangerouslySetInnerHTML={{ __html: marksheetHTML }}
        />
      </div>
    </div>
  );
}

export default function ClassStudentReports() {
  const { classId } = useParams<{ classId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateClass = (location.state as { classData?: ClassInfo })?.classData;

  const [classData, setClassData] = useState<ClassInfo | null>(stateClass || null);
  const [students, setStudents] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null);

  const reportTerm = normalizeReportTerm(stateClass?.term || classData?.term);
  const reportTermLabel = formatReportTermLabel(reportTerm);
  const fullYear = isFullYearReport(reportTerm);
  const scoreColLabel = fullYear ? "Annual %" : "Score %";
  const gradeColLabel = fullYear ? "Annual Grade" : "Grade";

  useEffect(() => {
    const load = async () => {
      if (!classId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let info = stateClass;
        let academicYearId = stateClass?.academicYearId;
        const term = normalizeReportTerm(stateClass?.term);

        if (!info) {
          const schoolClass = await schoolClassService.getSchoolClassById(classId);
          info = {
            id: schoolClass.schoolClassId,
            classId: schoolClass.schoolClassId.slice(0, 8).toUpperCase(),
            name: schoolClass.name,
            level: schoolClass.classLevel,
            classLevel: schoolClass.classLevel,
            classTeacher: schoolClass.classTeacherName || "—",
            studentCount: 0,
            academicYear: "",
            term,
          };
        } else {
          info = { ...info, term };
        }

        if (!academicYearId) {
          const active = await academicYearService.getActiveAcademicYear();
          academicYearId = active.academicYearId;
          info = {
            ...info,
            academicYearId: active.academicYearId,
            academicYear: active.fiscalYear,
          };
        }

        setClassData(info);

        const rows = await studentReportService.getStudentGradeReport(academicYearId, classId);
        const reports = buildStudentReportsFromGrades(info, rows, term);
        setStudents(reports);
        setClassData({ ...info, studentCount: reports.length });
      } catch (error) {
        console.error(error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
    // Intentionally depend on classId + key identity fields from navigation state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, stateClass?.academicYearId, stateClass?.name, stateClass?.term]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((s) => {
      if (!q) return true;
      return [s.registrationId, s.studentNames].join(" ").toLowerCase().includes(q);
    });
  }, [students, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading student reports...</div>;
  if (!classData) return <div className="p-10 text-center text-gray-500">Class not found.</div>;

  return (
    <>
      <PageMeta title={`Ubrs — ${classData.name} Reports`} description={`Student reports for ${classData.name}`} />

      <ReportModal student={selectedStudent} onClose={() => setSelectedStudent(null)} onPrint={printStudentReport} />

      <div className="space-y-6">
        <div className="bg-white p-8 border border-gray-200 shadow-sm print:shadow-none print:border-none dark:bg-white/[0.03] dark:border-gray-800">
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="size-20 bg-white flex items-center justify-center border-2 border-gray-800 rounded-lg overflow-hidden">
                <img src="/images/logo/logo.png" alt="School Logo" className="w-full h-full object-contain p-2" />
              </div>
              <div>
                <div className="text-gray-800 dark:text-white text-2xl font-black tracking-widest uppercase">Umwana Bright Academy</div>
                <div className="text-gray-500 text-sm mt-1">Class Master Report Sheet</div>
                <div className="text-gray-800 dark:text-white font-bold mt-2 text-lg">
                  {classData.name} ({classData.classLevel || classData.level})
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Academic Year: {classData.academicYear}</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Report: {reportTermLabel}</div>
              <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Level: {classData.level || classData.classLevel}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">Class Teacher: {classData.classTeacher}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Students with grades: {students.length}</div>
            </div>
          </div>
          <div className="flex justify-end gap-3 print:hidden mb-4">
            <button
              onClick={() => printAllClassReports(classData, students)}
              disabled={students.length === 0}
              className="inline-flex items-center gap-2 bg-brand-600 text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50"
            >
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
          <div className="rounded-3xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 md:grid-cols-1fr items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Students</label>
                <Input placeholder="Search by name or registration ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border-2 border-gray-800 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm print:border-none print:shadow-none">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["#", "Registration ID", "Student Name", "Class", scoreColLabel, gradeColLabel, "Position", "Actions"].map((h) => (
                      <TableCell key={h} isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-10 text-center text-gray-400 text-theme-sm" colSpan={8}>
                        No APPROVED grades found for {classData.academicYear || "this academic year"} ({reportTermLabel}).
                        <div className="mt-2 text-xs">
                          {fullYear
                            ? "Term 3 reports include the full year — approve marks for Term 1, 2, and 3 where available."
                            : `Only ${reportTermLabel} marks are included. Approve that term's marks on Marks Approval first.`}
                          {" "}Also confirm you selected the same academic year used when entering marks.
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginated.map((student, idx) => {
                    const summary = getReportDisplaySummary(student);
                    const col = gradeColor(summary.percentage);
                    return (
                      <TableRow
                        key={student.registrationId}
                        className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <TableCell className="px-5 py-4 text-gray-400 text-start text-theme-sm">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-mono font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {student.registrationId}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="font-semibold text-gray-800 dark:text-white/90 text-sm">{student.studentNames}</div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-300">
                          {student.class}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: col.bg, color: col.text }}>
                            {summary.percentage}%
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="text-xs font-bold text-[#1e3a5f] dark:text-blue-300">{summary.grade}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className="text-xs font-bold text-[#1e3a5f] dark:text-blue-300">{summary.position}</span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1.5">
                            <button
                              id={`view-student-${student.registrationId}`}
                              onClick={() => setSelectedStudent(student)}
                              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100 transition-colors dark:bg-brand-900/30 dark:text-brand-300"
                            >
                              View
                            </button>
                            <button
                              id={`print-student-${student.registrationId}`}
                              onClick={() => printStudentReport(student)}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-300"
                            >
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
