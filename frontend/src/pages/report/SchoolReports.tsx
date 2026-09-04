import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import { DownloadIcon } from "../../icons";
import { generateReportPdf } from "../../utils/pdfExport";
import {
  schoolReportService,
  ClassPerformanceProjection,
  SubjectPerformanceProjection,
  PromotionRetentionProjection,
} from "../../services/schoolReportService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { schoolClassService, SchoolClassResponseDto } from "../../services/schoolClassService";
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";

type TabType = "class" | "subject" | "promotion";

const TAB_LABELS: { key: TabType; label: string }[] = [
  { key: "class", label: "Class Performance" },
  { key: "subject", label: "Subject Performance" },
  { key: "promotion", label: "Promotion & Retention" },
];

const TERMS = [
  { value: "", label: "All Terms" },
  { value: "TERM1", label: "Term 1" },
  { value: "TERM2", label: "Term 2" },
  { value: "TERM3", label: "Term 3" },
] as const;

const SEL =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatTerm(term?: string | null): string {
  if (!term) return "—";
  const map: Record<string, string> = { TERM1: "Term 1", TERM2: "Term 2", TERM3: "Term 3" };
  return map[term] || term;
}

function ScoreBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color = pct >= 80 ? "bg-success-500" : pct >= 60 ? "bg-warning-500" : "bg-error-500";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 h-2 overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${pct >= 80 ? "text-success-600" : pct >= 60 ? "text-warning-600" : "text-error-600"}`}>
        {Math.round(score)}
      </span>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const cls =
    grade === "A"
      ? "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400"
      : grade === "B"
        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
        : "bg-warning-100 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{grade || "—"}</span>;
}

export default function SchoolReports() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only HEADERTEACHER may access School Reports
  useEffect(() => {
    if (user && user.role !== ERole.HEADERTEACHER) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<TabType>("class");
  const [academicYearId, setAcademicYearId] = useState("");
  const [term, setTerm] = useState("");
  const [classId, setClassId] = useState("");

  const [years, setYears] = useState<AcademicYearResponseDto[]>([]);
  const [classes, setClasses] = useState<SchoolClassResponseDto[]>([]);

  const [classPerf, setClassPerf] = useState<ClassPerformanceProjection[]>([]);
  const [subjectPerf, setSubjectPerf] = useState<SubjectPerformanceProjection[]>([]);
  const [promotion, setPromotion] = useState<PromotionRetentionProjection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [yearsData, classesData] = await Promise.all([
          academicYearService.getAllAcademicYears(),
          schoolClassService.getAllSchoolClasses(),
        ]);
        setYears(yearsData);
        setClasses(classesData);

        const active = yearsData.find((y) => y.academicYearStatus === "ACTIVE");
        if (active) setAcademicYearId(active.academicYearId);
      } catch (error) {
        console.error(error);
      }
    };
    void loadFilters();
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const filters = {
        academicYearId: academicYearId || undefined,
        term: term || undefined,
        classId: classId || undefined,
      };

      if (activeTab === "class") {
        const data = await schoolReportService.getClassPerformance(filters);
        setClassPerf(data);
      } else if (activeTab === "subject") {
        // Backend subject query requires academicYearId + term; when "All Terms", fetch each term.
        if (!academicYearId) {
          setSubjectPerf([]);
        } else if (term) {
          const data = await schoolReportService.getSubjectPerformance(filters);
          setSubjectPerf(data);
        } else {
          const results = await Promise.all(
            (["TERM1", "TERM2", "TERM3"] as const).map((t) =>
              schoolReportService.getSubjectPerformance({
                academicYearId,
                term: t,
                classId: classId || undefined,
              })
            )
          );
          setSubjectPerf(results.flat());
        }
      } else {
        if (!academicYearId) {
          setPromotion([]);
        } else {
          const data = await schoolReportService.getPromotionRetention({
            academicYearId,
            classId: classId || undefined,
          });
          setPromotion(data);
        }
      }
    } catch (error) {
      console.error(error);
      if (activeTab === "class") setClassPerf([]);
      else if (activeTab === "subject") setSubjectPerf([]);
      else setPromotion([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, academicYearId, term, classId]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const selectedYearLabel = years.find((y) => y.academicYearId === academicYearId)?.fiscalYear;
  const selectedTermLabel = TERMS.find((t) => t.value === term)?.label || "All Terms";
  const selectedClassLabel = classes.find((c) => c.schoolClassId === classId)?.name;

  const handleDownloadPdf = () => {
    let title = "School Report";
    let headers: string[][] = [];
    let body: (string | number)[][] = [];
    const periodStr = `${selectedTermLabel} - ${selectedYearLabel || "All Years"}`;

    switch (activeTab) {
      case "class":
        title = "Class Performance Report";
        headers = [["#", "Class", "Students", "Avg Score", "Pass Rate (%)", "Failing", "Top Grade", "Term", "Year"]];
        body = classPerf.map((c, i) => [
          i + 1,
          c.className,
          toNumber(c.students),
          toNumber(c.avgScore),
          toNumber(c.passingRate),
          toNumber(c.failing),
          c.topGrade,
          formatTerm(c.term),
          c.year,
        ]);
        break;
      case "subject":
        title = "Subject Performance Report";
        headers = [["#", "Subject", "Class", "Enrolled", "Avg Score", "Pass Rate (%)", "Highest", "Lowest", "Term", "Year"]];
        body = subjectPerf.map((s, i) => [
          i + 1,
          s.subject,
          s.className,
          toNumber(s.enrolled),
          toNumber(s.avgScore),
          toNumber(s.passRate),
          toNumber(s.highest),
          toNumber(s.lowest),
          formatTerm(s.term),
          s.year,
        ]);
        break;
      case "promotion":
        title = "Promotion & Retention Report";
        headers = [["#", "Class", "Academic Year", "Total", "Promoted", "Repeated", "Transferred", "Promotion Rate (%)"]];
        body = promotion.map((p, i) => [
          i + 1,
          p.className,
          p.academicYear,
          toNumber(p.totalStudents),
          toNumber(p.promoted),
          toNumber(p.repeated),
          toNumber(p.transferred),
          Math.round(toNumber(p.promotionRate)),
        ]);
        break;
    }

    generateReportPdf({
      title,
      reportPeriod: periodStr,
      preparedBy: "Head Teacher",
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">School Report</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive academic performance and operational insights.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] items-end">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Academic Year</label>
              <select className={SEL} value={academicYearId} onChange={(e) => setAcademicYearId(e.target.value)}>
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y.academicYearId} value={y.academicYearId}>
                    {y.fiscalYear}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Term</label>
              <select
                className={SEL}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={activeTab === "promotion"}
              >
                {TERMS.map((t) => (
                  <option key={t.value || "all"} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Class</label>
              <select className={SEL} value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.schoolClassId} value={c.schoolClassId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                startIcon={<DownloadIcon className="size-4" />}
                onClick={handleDownloadPdf}
                className="h-11 px-6"
                disabled={loading}
              >
                Download Report
              </Button>
            </div>
          </div>
          {(activeTab === "subject" || activeTab === "promotion") && !academicYearId && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              Select an academic year to load {activeTab === "subject" ? "subject performance" : "promotion & retention"} data.
            </p>
          )}
        </div>

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

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading report data...</div>
        ) : (
          <>
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
                        {classPerf.map((c, i) => (
                          <TableRow key={`${c.classId}-${c.term}-${c.year}`}>
                            <TableCell className={cel}>{i + 1}</TableCell>
                            <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{c.className}</TableCell>
                            <TableCell className={cel}>{toNumber(c.students)}</TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={toNumber(c.avgScore)} /></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={toNumber(c.passingRate)} /></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{toNumber(c.failing)}</span></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm"><GradeBadge grade={c.topGrade} /></TableCell>
                            <TableCell className={cel}>{formatTerm(c.term)}</TableCell>
                            <TableCell className={cel}>{c.year}</TableCell>
                          </TableRow>
                        ))}
                        {classPerf.length === 0 && (
                          <TableRow><TableCell className="px-5 py-8 text-center text-gray-400" colSpan={9}>No records found.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </ComponentCard>
            )}

            {activeTab === "subject" && (
              <ComponentCard title="Subject Performance Summary" titleClassName="text-xl sm:text-2xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  View how each subject performs across different classes and periods
                  {selectedClassLabel ? ` for ${selectedClassLabel}` : ""}.
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
                        {subjectPerf.map((s, i) => (
                          <TableRow key={`${s.courseId}-${s.classId}-${s.term}-${s.year}`}>
                            <TableCell className={cel}>{i + 1}</TableCell>
                            <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{s.subject}</TableCell>
                            <TableCell className={cel}>{s.className}</TableCell>
                            <TableCell className={cel}>{toNumber(s.enrolled)}</TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={toNumber(s.avgScore)} /></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]"><ScoreBar score={toNumber(s.passRate)} /></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-success-600 font-semibold">{toNumber(s.highest)}</span></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{toNumber(s.lowest)}</span></TableCell>
                            <TableCell className={cel}>{formatTerm(s.term)}</TableCell>
                            <TableCell className={cel}>{s.year}</TableCell>
                          </TableRow>
                        ))}
                        {subjectPerf.length === 0 && (
                          <TableRow><TableCell className="px-5 py-8 text-center text-gray-400" colSpan={10}>No records found.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </ComponentCard>
            )}

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
                        {promotion.map((p, i) => (
                          <TableRow key={`${p.classId}-${p.academicYearId}`}>
                            <TableCell className={cel}>{i + 1}</TableCell>
                            <TableCell className="px-5 py-4 font-medium text-gray-800 text-start text-theme-sm dark:text-white/90">{p.className}</TableCell>
                            <TableCell className={cel}>{p.academicYear}</TableCell>
                            <TableCell className={cel}>{toNumber(p.totalStudents)}</TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-success-600 font-semibold">{toNumber(p.promoted)}</span></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-error-600 font-semibold">{toNumber(p.repeated)}</span></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm"><span className="text-warning-600 font-semibold">{toNumber(p.transferred)}</span></TableCell>
                            <TableCell className="px-5 py-4 text-start text-theme-sm min-w-[140px]">
                              <ScoreBar score={toNumber(p.promotionRate)} />
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
          </>
        )}
      </div>
    </>
  );
}
