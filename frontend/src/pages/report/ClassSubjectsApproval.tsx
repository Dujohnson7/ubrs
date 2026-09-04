import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { ApprovalStatus, STATUS_CFG, normalizeApprovalStatus } from "./approvalData";
import { gradeService, ClassGradeDetailProjection } from "../../services/gradeService";
import { academicYearService } from "../../services/academicYearService";
import { toast } from "../../utils/toast";

type SubjectRow = ClassGradeDetailProjection & { status: ApprovalStatus };

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className={`size-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function ClassSubjectsApproval() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { classId?: string, academicYearId?: string, term?: string, className?: string } | null;
  const classId = state?.classId;

  const [data, setData] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingCourseId, setActingCourseId] = useState<string | null>(null);
  const [resolvedYearId, setResolvedYearId] = useState<string | undefined>(state?.academicYearId);

  const refreshData = useCallback(async () => {
    if (!classId || !state?.term) {
      setLoading(false);
      return;
    }
    try {
      let currentYearId = state.academicYearId;
      if (!currentYearId) {
        const activeYear = await academicYearService.getActiveAcademicYear();
        currentYearId = activeYear.academicYearId;
      }
      setResolvedYearId(currentYearId);

      const details = await gradeService.getClassGradeDetails(classId, currentYearId, state.term);
      setData(details.map((d) => ({ ...d, status: normalizeApprovalStatus(d.status) })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [classId, state?.academicYearId, state?.term]);

  useEffect(() => {
    setLoading(true);
    void refreshData();
  }, [refreshData]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assessmentFilter, setAssessmentFilter] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return data.filter((s) => {
      if (search && !s.subject?.toLowerCase().includes(search.toLowerCase()) && !s.teacher?.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "All" && s.status !== statusFilter.toLowerCase()) return false;
      if (assessmentFilter === "Pending Test" && s.test !== null && s.test !== undefined) return false;
      if (assessmentFilter === "Pending Exam" && s.exam !== null && s.exam !== undefined) return false;
      return true;
    });
  }, [data, search, statusFilter, assessmentFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const stats = {
    total: data.length,
    approved: data.filter((s) => s.status === "approved").length,
    submitted: data.filter((s) => s.status === "submitted").length,
    rejected: data.filter((s) => s.status === "rejected").length,
    pending: data.filter((s) => s.status === "pending").length,
  };

  const getSubmittedGradeIds = async (courseId: string) => {
    if (!classId || !state?.term || !resolvedYearId) {
      throw new Error("Missing class context");
    }
    const grades = await gradeService.getAllByAcademicYearAndTermAndSchoolClassAndCourse(
      resolvedYearId,
      state.term,
      classId,
      courseId
    );
    return grades
      .filter((g) => normalizeApprovalStatus(g.submitStatus) === "submitted")
      .map((g) => g.gradeId);
  };

  const handleApproveSubject = async (courseId: string) => {
    setActingCourseId(courseId);
    try {
      const gradeIds = await getSubmittedGradeIds(courseId);
      if (gradeIds.length === 0) {
        toast.error("No submitted grades to approve for this subject");
        return;
      }
      await Promise.all(gradeIds.map((id) => gradeService.approveGrade(id)));
      await refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setActingCourseId(null);
    }
  };

  const handleRejectSubject = async (courseId: string) => {
    const feedback = window.prompt("Rejection reason:");
    if (!feedback?.trim()) return;

    setActingCourseId(courseId);
    try {
      const gradeIds = await getSubmittedGradeIds(courseId);
      if (gradeIds.length === 0) {
        toast.error("No submitted grades to reject for this subject");
        return;
      }
      await Promise.all(gradeIds.map((id) => gradeService.rejectGrade(id, feedback.trim())));
      await refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setActingCourseId(null);
    }
  };

  const handleBulkApprove = async () => {
    const submitted = data.filter((s) => s.status === "submitted");
    if (submitted.length === 0) return;
    setActingCourseId("bulk");
    try {
      for (const subject of submitted) {
        const gradeIds = await getSubmittedGradeIds(subject.courseId);
        await Promise.all(gradeIds.map((id) => gradeService.approveGrade(id)));
      }
      await refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setActingCourseId(null);
    }
  };

  const className = state?.className || "Class";

  return (
    <>
      <PageMeta title={`Ubrs — ${className} Marks Approval`} description={`Review subject marks for ${className}`} />
      <PageBreadcrumb pageTitle={`${className} Subjects`} />

      <div className="space-y-6">
        {/* Overall summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Approved",  val: stats.approved,  bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-400" },
            { label: "Submitted", val: stats.submitted, bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400" },
            { label: "Pending",   val: stats.pending,   bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400" },
            { label: "Rejected",  val: stats.rejected,  bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-400" },
          ].map(({ label, val, bg, border, text }) => (
            <div key={label} className={`rounded-xl border ${border} ${bg} p-4 text-center`}>
              <div className={`text-3xl font-black ${text}`}>{val}</div>
              <div className={`text-[10px] uppercase tracking-wider mt-1 font-bold ${text} opacity-80`}>{label}</div>
            </div>
          ))}
        </div>

        <ComponentCard title="Subject Reviews" titleClassName="text-xl sm:text-2xl">
          {/* Filters & Bulk Actions in one panel */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] mb-5">
            <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
              <div className="grid gap-4 md:grid-cols-3 flex-1 w-full">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold mb-1.5">Search Subject / Teacher</label>
                  <Input placeholder="e.g. Mathematics, Mr. Alain..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold mb-1.5">Status</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  >
                    {["All","Pending","Submitted","Approved","Rejected"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.1em] text-gray-500 font-bold mb-1.5">Assessment Progress</label>
                  <select
                    className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    value={assessmentFilter} onChange={(e) => { setAssessmentFilter(e.target.value); setPage(1); }}
                  >
                    {["All", "Pending Test", "Pending Exam"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Approve All Submitted Button in filter panel */}
              <div className="w-full md:w-auto">
                <button
                  onClick={handleBulkApprove}
                  disabled={stats.submitted === 0 || actingCourseId !== null}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-6 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {actingCourseId === "bulk" ? "Approving..." : `Approve All Submitted (${stats.submitted})`}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.05]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["#","Subject","Teacher","Students","Test Score","Exam Score","Submitted At","Status","Action"].map((h) => (
                      <TableCell key={h} isHeader className="px-4 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-10 text-center text-gray-400" colSpan={10}>No subjects found.</TableCell>
                    </TableRow>
                  ) : paginated.map((s, idx) => {
                    return (
                      <TableRow key={s.courseId} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-4 py-3.5 text-gray-400 text-xs">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{s.subject}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">{s.teacher}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3.5 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">{s.students}</TableCell>
                        <TableCell className="px-4 py-3.5 font-semibold text-gray-700 dark:text-gray-300">{s.test ?? "-"}</TableCell>
                        <TableCell className="px-4 py-3.5 font-semibold text-gray-700 dark:text-gray-300">{s.exam ?? "-"}</TableCell>
                        <TableCell className="px-4 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </TableCell>
                        <TableCell className="px-4 py-3.5"><StatusBadge status={s.status} /></TableCell>
                        <TableCell className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              id={`view-marks-${s.courseId}`}
                              onClick={() => navigate(`/marks-approval/details/studentGrade`, {
                                state: {
                                  ...state,
                                  academicYearId: resolvedYearId || state?.academicYearId,
                                  subjectId: s.courseId,
                                  courseName: s.subject,
                                  teacherName: s.teacher,
                                  status: s.status,
                                },
                              })}
                              className="inline-flex items-center justify-center size-8 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400"
                              title="View Details"
                            >
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button
                              disabled={s.status !== "submitted" || actingCourseId !== null}
                              onClick={() => handleApproveSubject(s.courseId)}
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actingCourseId === s.courseId ? "..." : "Approve"}
                            </button>
                            <button
                              disabled={s.status !== "submitted" || actingCourseId !== null}
                              onClick={() => handleRejectSubject(s.courseId)}
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Reject
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
          <div className="grid gap-4 px-4 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
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
