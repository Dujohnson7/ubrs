import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import {
  teacherDashboardService,
  TeacherDashboardOverview,
  TeacherApprovalRow,
} from "../../services/teacherDashboardService";
import { CourseAssignmentResponseDto } from "../../services/courseAssignmentService";

const TERMS = ["TERM1", "TERM2", "TERM3"] as const;

function statusBadgeColor(status: string): "success" | "warning" | "error" | "info" | "light" {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") return "success";
  if (s === "SUBMITTED") return "info";
  if (s === "PARTIAL" || s === "DRAFT") return "warning";
  if (s === "REJECTED") return "error";
  return "light";
}

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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState<string>("TERM1");
  const [overview, setOverview] = useState<TeacherDashboardOverview | null>(null);
  const [approvals, setApprovals] = useState<TeacherApprovalRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const ov = await teacherDashboardService.getOverview(user.userId);
        setOverview(ov);
        const yearId = ov.activeAcademicYear?.academicYearId;
        if (yearId) {
          const appr = await teacherDashboardService.getApprovalStatus(ov.assignments || [], yearId, term);
          setApprovals(appr);
        } else {
          setApprovals([]);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.userId, term]);



  const assignments: CourseAssignmentResponseDto[] = overview?.assignments || [];
  const activeCourses = assignments.filter((a) => a.assignmentStatus === "ACTIVE");

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading teacher dashboard...</div>;
  }

  return (
    <>
      <PageMeta title="Ubrs — Teacher Dashboard" description="Your courses, class students, and marks overview." />
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Teacher Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Welcome{user?.names ? `, ${user.names}` : ""}
            </p>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Term</label>
            <select
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              {TERMS.map((t) => (
                <option key={t} value={t}>
                  {t === "TERM1" ? "Term 1" : t === "TERM2" ? "Term 2" : "Term 3"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard label="My Courses" value={overview?.coursesCount ?? activeCourses.length} hint="Assigned courses" />
          <MetricCard
            label="Class Students"
            value={overview?.classTeacherStudentCount ?? 0}
            hint={
              overview?.classTeacherClass
                ? `As class teacher of ${overview.classTeacherClass.name}`
                : "Not assigned as class teacher"
            }
          />
          <MetricCard
            label="Active Academic Year"
            value={overview?.activeAcademicYear?.fiscalYear || "—"}
            hint={overview?.activeAcademicYear?.academicYearStatus || "No active year"}
          />
          <MetricCard
            label="Approval Progress"
            value={
              approvals.length
                ? `${approvals.filter((a) => (a.status || "").toUpperCase() === "APPROVED").length} / ${approvals.length}`
                : "—"
            }
            hint="Approved subjects this term"
          />
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-7">
            <MonthlySalesChart />
          </div>

          <div className="col-span-12 xl:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-4">My Course Assignments</h3>
            <div className="max-h-[320px] overflow-y-auto space-y-2">
              {activeCourses.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No active course assignments.</p>
              ) : (
                activeCourses.map((a) => (
                  <div
                    key={a.courseAssignmentId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5 dark:border-gray-800"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-white/90">{a.courseName}</div>
                      <div className="text-xs text-gray-500">{a.schoolClassName}</div>
                    </div>
                    <Badge color="success">Active</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-4">Marks Approval Status</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Class</th>
                    <th className="px-3 py-2">Students</th>
                    <th className="px-3 py-2">Term</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                        No approval records for your courses this term.
                      </td>
                    </tr>
                  ) : (
                    approvals.map((row) => (
                      <tr key={`${row.classId}-${row.courseId}`} className="border-b border-gray-50 dark:border-gray-800/60">
                        <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-white/90">{row.subject}</td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{row.className}</td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{row.students}</td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{row.term}</td>
                        <td className="px-3 py-2.5">
                          <Badge color={statusBadgeColor(row.status)}>{row.status || "—"}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
