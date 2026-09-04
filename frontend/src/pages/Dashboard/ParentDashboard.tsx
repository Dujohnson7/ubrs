import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import {
  parentDashboardService,
  ParentDashboardOverview,
  ChildPerformance,
} from "../../services/parentDashboardService";

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
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
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
        const ov = await parentDashboardService.getOverview(user.userId);
        setOverview(ov);
        const firstId = ov.children?.[0]?.studentId || "";
        setSelectedStudentId(firstId);

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

  const selected = performance.find((p) => p.child.studentId === selectedStudentId) || performance[0];

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Loading parent dashboard...</div>;
  }

  return (
    <>
      <PageMeta title="Ubrs — Parent Dashboard" description="View your children's classes and marks." />
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">Parent Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome{user?.names ? `, ${user.names}` : ""}
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <MetricCard label="My Children" value={overview?.childrenCount ?? 0} />
          <MetricCard
            label="Active Academic Year"
            value={overview?.activeAcademicYear?.fiscalYear || "—"}
            hint={overview?.activeAcademicYear?.academicYearStatus}
          />
          <MetricCard
            label="Selected Average"
            value={selected?.overallPercentage != null ? `${selected.overallPercentage}%` : "—"}
            hint={selected?.child.studentName}
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-4">Children</h3>
          {!overview?.children?.length ? (
            <p className="text-sm text-gray-500 text-center py-8">No students linked to this parent account.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overview.children.map((child) => {
                const perf = performance.find((p) => p.child.studentId === child.studentId);
                const active = selectedStudentId === child.studentId;
                return (
                  <button
                    key={child.studentId}
                    type="button"
                    onClick={() => setSelectedStudentId(child.studentId)}
                    className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                      active
                        ? "border-brand-500 bg-brand-50/60 dark:bg-brand-500/10"
                        : "border-gray-100 hover:border-gray-300 dark:border-gray-800"
                    }`}
                  >
                    <div className="font-semibold text-gray-800 dark:text-white/90">{child.studentName}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {child.studentCode}</div>
                    <div className="text-xs text-gray-500">
                      Class: {child.schoolClassName || "—"}
                      {child.classLevel ? ` · ${child.classLevel}` : ""}
                    </div>
                    <div className={`mt-2 text-sm font-bold ${pctColor(perf?.overallPercentage ?? null)}`}>
                      {perf?.overallPercentage != null ? `${perf.overallPercentage}% avg` : "No approved marks"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {selected ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white/90">
                Marks — {selected.child.studentName}
              </h3>
              <Badge color="info">{selected.child.schoolClassName || "Class"}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800">
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Term</th>
                    <th className="px-3 py-2">Test</th>
                    <th className="px-3 py-2">Exam</th>
                    <th className="px-3 py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.subjects.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                        No APPROVED grades for this student in the active year.
                      </td>
                    </tr>
                  ) : (
                    selected.subjects.map((s, idx) => (
                      <tr key={`${s.courseCode}-${s.term}-${idx}`} className="border-b border-gray-50 dark:border-gray-800/60">
                        <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-white/90">{s.courseName}</td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">{s.term}</td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                          {s.testMark}/{s.testMax || "—"}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300">
                          {s.examMark}/{s.examMax || "—"}
                        </td>
                        <td className={`px-3 py-2.5 font-semibold ${pctColor(s.percentage)}`}>{s.percentage}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
