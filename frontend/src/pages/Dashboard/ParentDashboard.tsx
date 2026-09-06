import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import {
  parentDashboardService,
  ParentDashboardOverview,
  ChildPerformance,
} from "../../services/parentDashboardService";
import { studentReportService } from "../../services/studentReportService";
import { buildStudentReportsFromGrades, printStudentReport, ClassInfo } from "../report/reportPrintUtils";
import { loadReportSignatories } from "../report/reportSignatures";
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

export default function ParentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<ParentDashboardOverview | null>(null);
  const [performance, setPerformance] = useState<ChildPerformance[]>([]);
  const [error, setError] = useState("");
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

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
          const perf = await parentDashboardService.getChildrenPerformance(
            ov.children,
            ov.activeAcademicYear.academicYearId
          );
          setPerformance(perf);
        } else {
          setPerformance([]);
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



  const handleDownloadReport = async (child: any) => {
    if (!child.schoolClassId || !overview?.activeAcademicYear?.academicYearId) {
      toast.error("Unable to download report: Missing class or academic year information");
      return;
    }

    setDownloadingReport(child.studentId);
    try {
      // Get grade data for the whole class to compute accurate rank and position
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
        studentGrades = classGrades.filter(g => g.studentId === child.studentId);
      } else {
        const parentGrades = await studentReportService.getStudentGradeReportByParent(
          user?.userId || "",
          overview.activeAcademicYear.academicYearId
        );
        studentGrades = parentGrades.filter(g => g.studentId === child.studentId);
      }

      if (studentGrades.length === 0) {
        toast.error("No grade data available for this student");
        return;
      }

      // Build class info for report generation
      const classInfo: ClassInfo = {
        id: child.schoolClassId,
        classId: child.schoolClassId.slice(0, 8).toUpperCase(),
        name: child.schoolClassName || "Unknown Class",
        level: child.classLevel || "Primary",
        classLevel: child.classLevel || "Primary",
        classTeacher: "—",
        studentCount: classGrades.length > 0 ? new Set(classGrades.map(g => g.studentId)).size : 1,
        academicYear: overview.activeAcademicYear.fiscalYear,
        academicYearId: overview.activeAcademicYear.academicYearId,
      };

      // Load signatories
      const signatories = await loadReportSignatories(child.schoolClassId, classInfo.classTeacher);
      classInfo.classTeacher = signatories.classTeacher || classInfo.classTeacher;
      classInfo.classTeacherSignature = signatories.classTeacherSignature;
      classInfo.headteacher = signatories.headteacher;
      classInfo.headteacherSignature = signatories.headteacherSignature;

      // Use class grades if available so position ranking is calculated among classmates
      const gradesToUse = classGrades.length > 0 ? classGrades : studentGrades;

      // Build student reports
      const studentReports = buildStudentReportsFromGrades(classInfo, gradesToUse, "TERM3");

      const targetReport = studentReports.find(
        r =>
          r.registrationId === child.studentCode ||
          r.studentNames.trim().toLowerCase() === (child.studentName || "").trim().toLowerCase()
      ) || studentReports[0];

      if (!targetReport) {
        toast.error("Unable to generate student report");
        return;
      }

      // Print the report
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

  return (
    <>
      <PageMeta title="Ubrs — Parent Dashboard" description="View your children's classes and marks." />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Parent Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome{user?.names ? `, ${user.names}` : ""}
            </p>
          </div> 
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          <MetricCard label="My Children" value={overview?.childrenCount ?? 0} />
          <MetricCard
            label="Active Academic Year"
            value={overview?.activeAcademicYear?.fiscalYear || "—"}
            hint={overview?.activeAcademicYear?.academicYearStatus}
          />
        </div>



        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-4">My Child Report</h3>
          {!overview?.children?.length ? (
            <p className="text-sm text-gray-500 text-center py-8">No students linked to this parent account.</p>
          ) : (
            <div className="space-y-3">
              {overview.children.map((child) => {
                const perf = performance.find((p) => p.child.studentId === child.studentId);
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
                    >
                      {isDownloading ? "Downloading..." : "Download Report"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
