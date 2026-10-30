import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  parentDashboardService,
  ParentDashboardOverview,
  ChildPerformance,
  ParentChildDto,
} from "../../services/parentDashboardService";
import { studentReportService, GradeReportProjection } from "../../services/studentReportService";
import { midTermReportService, MidTermReportProjection } from "../../services/midTermReportService";
import { buildStudentReportsFromGrades, printStudentReport, ClassInfo } from "../report/reportPrintUtils";
import { loadReportSignatories } from "../report/reportSignatures";
import { studentFeePaymentService } from "../../services/studentFeePaymentService";
import { DollarLineIcon } from "../../icons";
import { toast } from "../../utils/toast";

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</span>
      <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{value}</h4>
      {hint ? <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}
    </div>
  );
}

function pctColor(pct: number | null) {
  if (pct == null) return "text-gray-500";
  if (pct >= 70) return "text-green-600";
  if (pct >= 50) return "text-amber-600";
  return "text-red-600";
}

interface ChildMidTermPerf {
  child: ParentChildDto;
  records: MidTermReportProjection[];
  totalMark: number;
  totalMax: number;
  percentage: number | null;
  coursesCount: number;
  isBelow60: boolean;
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ParentDashboardOverview | null>(null);
  const [performance, setPerformance] = useState<ChildPerformance[]>([]);
  const [midTermReports, setMidTermReports] = useState<MidTermReportProjection[]>([]);
  const [error, setError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [feePaidMap, setFeePaidMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const ov = await parentDashboardService.getOverview(user.userId);
        setOverview(ov);

        if (ov.activeAcademicYear?.academicYearId && ov.children?.length) {
          const [perf, midTerms] = await Promise.all([
            parentDashboardService.getChildrenPerformance(
              ov.children,
              ov.activeAcademicYear.academicYearId
            ),
            midTermReportService
              .getMidTermReportByParent(user.userId, ov.activeAcademicYear.academicYearId)
              .catch(() => [] as MidTermReportProjection[]),
          ]);
          setPerformance(perf);
          setMidTermReports(midTerms || []);
        } else {
          setPerformance([]);
          setMidTermReports([]);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load parent dashboard");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.userId]);

  // Check fee status
  useEffect(() => {
    if (!overview?.children?.length || !overview?.activeAcademicYear?.academicYearId) return;
    const fetchFee = async () => {
      const map: Record<string, boolean> = {};
      await Promise.all(
        overview.children.map(async (c) => {
          try {
            const paid = await studentFeePaymentService.isStudentPayFees(
              c.studentId,
              "TERM1" as any,
              overview.activeAcademicYear!.academicYearId
            );
            map[c.studentId] = paid;
          } catch {
            map[c.studentId] = false;
          }
        })
      );
      setFeePaidMap(map);
    };
    void fetchFee();
  }, [overview?.children, overview?.activeAcademicYear]);

  // Compute mid-term performance per child
  const midTermPerformance: ChildMidTermPerf[] = useMemo(() => {
    if (!overview?.children) return [];
    return overview.children.map((child) => {
      const records = midTermReports.filter(
        (r) =>
          r.studentId === child.studentId ||
          (r.studentCode && r.studentCode.trim().toLowerCase() === child.studentCode?.trim().toLowerCase())
      );

      let totalMark = 0;
      let totalMax = 0;
      let gradedCount = 0;

      for (const r of records) {
        if (r.midTermMark != null) {
          totalMark += r.midTermMark;
          gradedCount += 1;
        }
        if (r.midTermMaxMark != null) {
          totalMax += r.midTermMaxMark;
        }
      }

      const percentage =
        totalMax > 0 && gradedCount > 0 ? Math.round((totalMark / totalMax) * 1000) / 10 : null;
      const isBelow60 = percentage != null && percentage < 60;

      return {
        child,
        records,
        totalMark,
        totalMax,
        percentage,
        coursesCount: records.length,
        isBelow60,
      };
    });
  }, [overview?.children, midTermReports]);

  const activeMidTermPerformance = useMemo(() => {
    return midTermPerformance.filter(
      (m) => m.records.length > 0 && m.records.some((r) => r.midTermMark != null)
    );
  }, [midTermPerformance]);

  const activeStudentReports = useMemo(() => {
    if (!overview?.children) return [];
    return overview.children
      .map((child) => {
        const perf = performance.find((p) => p.child.studentId === child.studentId);
        return { child, perf };
      })
      .filter(({ perf }) => perf && perf.overallPercentage != null && perf.subjects.length > 0);
  }, [overview?.children, performance]);

  const handleDownloadReport = async (child: any) => {
    if (!child.schoolClassId || !overview?.activeAcademicYear?.academicYearId) {
      toast.error("Unable to download report: Missing class or academic year information");
      return;
    }

    setDownloadingReport(child.studentId);
    try {
      let classGrades: GradeReportProjection[] = [];
      try {
        classGrades = await studentReportService.getStudentGradeReport(
          overview.activeAcademicYear.academicYearId,
          child.schoolClassId
        );
      } catch {
        classGrades = [];
      }

      let studentGrades: GradeReportProjection[] = [];
      if (classGrades.length > 0) {
        studentGrades = classGrades.filter((g) => g.studentId === child.studentId);
      } else {
        const parentGrades = await studentReportService.getStudentGradeReportByParent(
          user?.userId || "",
          overview.activeAcademicYear.academicYearId
        );
        studentGrades = parentGrades.filter((g) => g.studentId === child.studentId);
      }

      if (studentGrades.length === 0) {
        toast.error("No grade data available for this student");
        return;
      }

      const classInfo: ClassInfo = {
        id: child.schoolClassId,
        classId: child.schoolClassId.slice(0, 8).toUpperCase(),
        name: child.schoolClassName || "Unknown Class",
        level: child.classLevel || "Primary",
        classLevel: child.classLevel || "Primary",
        classTeacher: "—",
        studentCount: classGrades.length > 0 ? new Set(classGrades.map((g) => g.studentId)).size : 1,
        academicYear: overview.activeAcademicYear.fiscalYear,
        academicYearId: overview.activeAcademicYear.academicYearId,
      };

      const signatories = await loadReportSignatories(child.schoolClassId, classInfo.classTeacher);
      classInfo.classTeacher = signatories.classTeacher || classInfo.classTeacher;
      classInfo.classTeacherSignature = signatories.classTeacherSignature;
      classInfo.headteacher = signatories.headteacher;
      classInfo.headteacherSignature = signatories.headteacherSignature;

      const gradesToUse = classGrades.length > 0 ? classGrades : studentGrades;
      const studentReports = buildStudentReportsFromGrades(classInfo, gradesToUse, "TERM3");

      const targetReport =
        studentReports.find(
          (r) =>
            r.registrationId === child.studentCode ||
            r.studentNames.trim().toLowerCase() === (child.studentName || "").trim().toLowerCase()
        ) || studentReports[0];

      if (!targetReport) {
        toast.error("Unable to generate student report");
        return;
      }

      await printStudentReport(targetReport);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast.error("Failed to download report");
    } finally {
      setDownloadingReport(null);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading parent dashboard...</div>;
  }

  const alertCount = activeMidTermPerformance.filter((m) => m.isBelow60).length;

  return (
    <>
      <PageMeta title="Ubrs — Parent Dashboard" description="View your children's classes, reports, and mid-term marks." />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Parent Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome{user?.names ? `, ${user.names}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/parent/mid-term-reports">
              <Button size="sm" variant="outline" className="text-xs">
                Mid-Term Reports
              </Button>
            </Link>
            <Link to="/parent/reports">
              <Button size="sm" variant="outline" className="text-xs">
                Student Reports
              </Button>
            </Link>
            <Link to="/parent/school-fees">
              <Button size="sm" variant="outline" className="inline-flex items-center gap-2 text-xs">
                <DollarLineIcon className="w-4 h-4" />
                School Fees
              </Button>
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard label="My Children" value={overview?.childrenCount ?? 0} />
          <MetricCard
            label="Active Academic Year"
            value={overview?.activeAcademicYear?.fiscalYear || "—"}
            hint={overview?.activeAcademicYear?.academicYearStatus}
          />
          <MetricCard
            label="Mid-Term Evaluated"
            value={activeMidTermPerformance.length}
            hint="Children with marks"
          />
          <MetricCard
            label="Academic Alerts"
            value={alertCount}
            hint={alertCount > 0 ? "Parent action required (< 60%)" : "All on track"}
          />
        </div>

        {/* Mid-Term Assessments Section */}
        {activeMidTermPerformance.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6"></p>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white/90">Children Mid-Term Evaluations</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Current evaluation marks for the this academic year
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeMidTermPerformance.map(({ child, percentage, totalMark, totalMax, isBelow60, coursesCount }) => {
                return (
                  <div
                    key={child.studentId}
                    className="rounded-xl border border-gray-100 p-4 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/20"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                          <span>{child.studentName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                            {child.schoolClassName || "—"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {child.studentCode} · Level: {child.classLevel || "—"}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-base font-bold ${pctColor(percentage)}`}>
                            {percentage != null ? `${percentage}%` : "—"}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {totalMark.toFixed(1)} / {totalMax} 
                          </div>
                        </div>
                        <Link to="/parent/mid-term-reports">
                          <Button size="sm" variant="outline" className="text-xs">
                            View Report
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Notice if mid-term marks below 60% */}
                    {isBelow60 && (
                      <div className="mt-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 text-xs font-semibold flex items-center gap-2.5">
                        <span className="text-base">⚠️</span>
                        <span>
                          Dear Parent, your child's mid-term score is ({percentage}%). Please we need you at school to discuss on this matter.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular End-of-Term Reports Section */}
        {activeStudentReports.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Marks will be published soon.</p>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-4">Official Student Report</h3>
            <div className="space-y-3">
              {activeStudentReports.map(({ child, perf }) => {
                const isDownloading = downloadingReport === child.studentId;
                return (
                  <div
                    key={child.studentId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 px-4 py-3 dark:border-gray-800"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 dark:text-white/90">{child.studentName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {child.studentCode} · Class: {child.schoolClassName || "—"}
                        {child.classLevel ? ` · ${child.classLevel}` : ""}
                      </div>
                      <div className={`mt-2 text-sm font-bold ${pctColor(perf?.overallPercentage ?? null)}`}>
                        {perf?.overallPercentage != null ? `${perf.overallPercentage}% avg` : "No approved marks"}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownloadReport(child)}
                      disabled={isDownloading || !child.schoolClassId}
                      size="sm"
                      variant="outline"
                      hidden={!feePaidMap[child.studentId]}
                    >
                      {isDownloading ? "Downloading..." : "Download Report"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
