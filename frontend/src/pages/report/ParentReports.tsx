import { useState, useEffect, useMemo, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useAuth } from "../../hooks/useAuth";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { parentDashboardService, ParentChildDto } from "../../services/parentDashboardService";
import { studentReportService, GradeReportProjection } from "../../services/studentReportService";
import {
  StudentReport,
  ClassInfo,
  buildStudentReportsFromGrades,
  buildMarksheetHTML,
  printStudentReport,
  normalizeReportTerm,
  formatReportTermLabel,
  isFullYearReport,
  gradeColor,
} from "./reportPrintUtils";
import { loadReportSignatories } from "./reportSignatures";
import { toast } from "../../utils/toast";

interface ReportModalProps {
  student: StudentReport | null;
  onClose: () => void;
  onPrint: (s: StudentReport) => void;
}

function ReportModal({ student, onClose, onPrint }: ReportModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!student) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
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
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-gray-200 shadow-2xl p-4 rounded-xl" id="parent-student-report-modal">
        <div className="absolute -top-12 right-4 flex gap-2 print:hidden">
          <button
            id="parent-modal-print-btn"
            onClick={() => onPrint(student)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-xs px-4 py-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Print / Download
          </button>
          <button
            onClick={onClose}
            className="size-8 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors shadow-sm"
          >
            ✕
          </button>
        </div>
        <div
          className="bg-white shadow-lg overflow-auto rounded-lg"
          style={{ maxHeight: "calc(100vh - 80px)", minHeight: "80vh" }}
          dangerouslySetInnerHTML={{ __html: marksheetHTML }}
        />
      </div>
    </div>
  );
}

interface ChildReportCardData {
  child: ParentChildDto;
  report: StudentReport | null;
  rawGrades: GradeReportProjection[];
}

export default function ParentReports() {
  const { user } = useAuth();
  const [children, setChildren] = useState<ParentChildDto[]>([]);
  const [years, setYears] = useState<AcademicYearResponseDto[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("ALL");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("TERM1");
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [reportCards, setReportCards] = useState<ChildReportCardData[]>([]);
  const [selectedModalReport, setSelectedModalReport] = useState<StudentReport | null>(null);

  // Load initial parent children and academic years
  useEffect(() => {
    const init = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [childrenList, yearsList] = await Promise.all([
          parentDashboardService.getChildren(user.userId),
          academicYearService.getAllAcademicYears(),
        ]);
        setChildren(childrenList);
        setYears(yearsList);

        // Select active academic year by default
        const activeYear = yearsList.find((y) => y.academicYearStatus === "ACTIVE");
        const defaultYear = activeYear?.academicYearId || yearsList[0]?.academicYearId || "";
        setSelectedYearId(defaultYear);
      } catch (err) {
        console.error("Failed to load initial data for parent reports", err);
        toast.error("Failed to load your children or academic years");
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, [user?.userId]);

  // Load grade reports whenever selectedYearId or selectedTerm changes
  useEffect(() => {
    const loadReports = async () => {
      if (!user?.userId || !selectedYearId || children.length === 0) {
        setReportCards([]);
        return;
      }

      setLoadingReports(true);
      try {
        const allGrades = await studentReportService.getStudentGradeReportByParent(user.userId, selectedYearId);
        const selectedYearObj = years.find((y) => y.academicYearId === selectedYearId);
        const yearLabel = selectedYearObj?.fiscalYear || "";

        const cards: ChildReportCardData[] = [];
        const classGradesCache = new Map<string, GradeReportProjection[]>();

        for (const child of children) {
          let classGrades: GradeReportProjection[] = [];
          if (child.schoolClassId) {
            if (classGradesCache.has(child.schoolClassId)) {
              classGrades = classGradesCache.get(child.schoolClassId)!;
            } else {
              try {
                classGrades = await studentReportService.getStudentGradeReport(selectedYearId, child.schoolClassId);
                classGradesCache.set(child.schoolClassId, classGrades);
              } catch {
                classGrades = [];
              }
            }
          }

          const fallbackGrades = allGrades.filter((g) => g.studentId === child.studentId);
          const gradesToUse = classGrades.length > 0 ? classGrades : fallbackGrades;

          let report: StudentReport | null = null;
          const childGrades = gradesToUse.filter((g) => g.studentId === child.studentId);

          if (childGrades.length > 0 || classGrades.length > 0) {
            const signatories = await loadReportSignatories(child.schoolClassId || "", "—");
            const classInfo: ClassInfo = {
              id: child.schoolClassId || "",
              classId: (child.schoolClassId || "").slice(0, 8).toUpperCase(),
              name: child.schoolClassName || "—",
              level: child.classLevel || "Primary",
              classLevel: child.classLevel || "Primary",
              classTeacher: signatories.classTeacher || "—",
              classTeacherSignature: signatories.classTeacherSignature,
              headteacher: signatories.headteacher,
              headteacherSignature: signatories.headteacherSignature,
              studentCount: classGrades.length > 0 ? new Set(classGrades.map(g => g.studentId)).size : 1,
              academicYear: yearLabel,
              academicYearId: selectedYearId,
              term: selectedTerm,
            };

            const classReports = buildStudentReportsFromGrades(classInfo, gradesToUse, selectedTerm);
            const foundReport = classReports.find(
              (r) =>
                r.registrationId === child.studentCode ||
                r.studentNames.trim().toLowerCase() === (child.studentName || "").trim().toLowerCase()
            );
            report = foundReport || (classReports.length > 0 && gradesToUse === fallbackGrades ? classReports[0] : null);
          }

          cards.push({
            child,
            report,
            rawGrades: childGrades.length > 0 ? childGrades : fallbackGrades,
          });
        }

        setReportCards(cards);
      } catch (err) {
        console.error("Error generating parent reports:", err);
        toast.error("Unable to load report cards for selected period");
        setReportCards([]);
      } finally {
        setLoadingReports(false);
      }
    };

    void loadReports();
  }, [user?.userId, selectedYearId, selectedTerm, children, years]);

  // Filter report cards by selected child
  const visibleCards = useMemo(() => {
    if (selectedChildId === "ALL") return reportCards;
    return reportCards.filter((c) => c.child.studentId === selectedChildId);
  }, [reportCards, selectedChildId]);

  const reportTermLabel = formatReportTermLabel(normalizeReportTerm(selectedTerm));
  const fullYear = isFullYearReport(normalizeReportTerm(selectedTerm));

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading your children's reports...</div>;
  }

  return (
    <>
      <PageMeta title="Ubrs — Children Reports" description="View and download official student report cards." />

      <ReportModal
        student={selectedModalReport}
        onClose={() => setSelectedModalReport(null)}
        onPrint={printStudentReport}
      />

      <div className="space-y-6">
        <ComponentCard title="Children Report Cards" titleClassName="text-xl sm:text-2xl">
          {/* Filters Bar */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 sm:grid-cols-3 items-end">
              {/* Child Selector */}
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Select Child
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                >
                  <option value="ALL">All Children ({children.length})</option>
                  {children.map((c) => (
                    <option key={c.studentId} value={c.studentId}>
                      {c.studentName} ({c.schoolClassName || "Class N/A"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year Selector */}
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Academic Year
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                >
                  <option value="">Select Academic Year</option>
                  {years.map((y) => (
                    <option key={y.academicYearId} value={y.academicYearId}>
                      {y.fiscalYear} {y.academicYearStatus === "ACTIVE" ? "(Active)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Term Selector */}
              <div>
                <label className="block text-left text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">
                  Term / Period
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  <option value="TERM1">Term 1</option>
                  <option value="TERM2">Term 2</option>
                  <option value="TERM3">Term 3 (Annual / Full Year)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports Content List */}
          {loadingReports ? (
            <div className="p-12 text-center text-gray-500">
              <div className="inline-block size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent mb-2"></div>
              <div>Generating report cards...</div>
            </div>
          ) : visibleCards.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">No children linked to your parent account.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-8">
              {visibleCards.map(({ child, report, rawGrades }) => {
                return (
                  <div
                    key={child.studentId}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
                  >
                    {/* Child Header Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/75 p-6 dark:border-gray-800 dark:bg-gray-900/30">
                      <div className="flex items-center gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 font-bold text-brand-600 text-lg dark:bg-brand-900/30 dark:text-brand-300">
                          {child.studentName ? child.studentName.slice(0, 2).toUpperCase() : "ST"}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{child.studentName}</h3>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Code: <strong className="text-gray-700 dark:text-gray-300">{child.studentCode}</strong></span>
                            <span>•</span>
                            <span>Class: <strong className="text-gray-700 dark:text-gray-300">{child.schoolClassName || "—"}</strong></span>
                            <span>•</span>
                            <span>Level: <strong className="text-gray-700 dark:text-gray-300">{child.classLevel || "—"}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {report ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedModalReport(report)}
                            >
                              View Marksheet
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => printStudentReport(report)}
                            >
                              Print / Download PDF
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                            No approved marks for this period
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Report Details */}
                    {report ? (
                      <div className="p-6">
                        {/* Subject Marks Breakdown Table */}
                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                          <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 dark:border-gray-800 dark:bg-gray-900/60">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                              Subject Marks Breakdown ({reportTermLabel})
                            </h4>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableCell isHeader className="px-5 py-3 text-start text-xs">#</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-start text-xs">Subject</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-center text-xs">Test (EU)</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-center text-xs">Exam (ET)</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-center text-xs">Total</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-center text-xs">Max</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-center text-xs">%</TableCell>
                                <TableCell isHeader className="px-5 py-3 text-center text-xs">Grade</TableCell>
                              </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                              {report.subjects.map((sub, idx) => {
                                const termKey = selectedTerm === "TERM1" ? "term1" : selectedTerm === "TERM2" ? "term2" : "term3";
                                const m = fullYear ? sub.annual : sub[termKey as "term1" | "term2" | "term3"];
                                const maxTot = fullYear ? sub.maxTOT * 3 : sub.maxTOT;
                                const subCol = gradeColor(m.percentage);

                                return (
                                  <TableRow key={sub.subject}>
                                    <TableCell className="px-5 py-3 text-start text-sm text-gray-400">{idx + 1}</TableCell>
                                    <TableCell className="px-5 py-3 text-start text-sm font-medium text-gray-800 dark:text-white">
                                      {sub.subject}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                      {m.eu.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                                      {m.et.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-center text-sm font-bold text-gray-800 dark:text-white">
                                      {m.tot.toFixed(1)}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-center text-sm text-gray-500">
                                      {maxTot}
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-center text-sm font-semibold" style={{ color: subCol.text }}>
                                      {m.percentage.toFixed(1)}%
                                    </TableCell>
                                    <TableCell className="px-5 py-3 text-center text-sm font-bold text-brand-600 dark:text-brand-400">
                                      {m.grade}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        No approved marks recorded for {child.studentName} in {years.find((y) => y.academicYearId === selectedYearId)?.fiscalYear || "this year"} ({reportTermLabel}).
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
