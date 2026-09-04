import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { TrashBinIcon, EyeIcon, CheckCircleIcon, PencilIcon } from "../../icons";
import GradesUploadModal from "./GradesUploadModal";
import { gradeService, GradeResponseDto } from "../../services/gradeService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";

export default function Grades() {
  const { user } = useAuth();
  const isAdmin = user?.role === ERole.HEADERTEACHER;
  const isTeacherRole = user?.role === ERole.TEACHER || user?.role === ERole.CLASSTEACHER;

  const [grades, setGrades] = useState<GradeResponseDto[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [gradeTypeFilter, setGradeTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [termFilter, setTermFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const [years, setYears] = useState<AcademicYearResponseDto[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  const fetchGrades = async () => {
    setIsLoading(true);
    try {
      const [gradesData, yearsData] = await Promise.all([
        isTeacherRole && user?.userId
          ? gradeService.getAllGradesByTeacher(user.userId)
          : gradeService.getAllGrades(),
        academicYearService.getAllAcademicYears()
      ]);
      setGrades(gradesData);
      setYears(yearsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, user?.role]);

  const handleDelete = async (gradeId: string) => {
    if (!gradeId) return;
    if (confirm("Are you sure you want to delete this grade batch?")) {
      try {
        await gradeService.deleteGrade(gradeId);
        fetchGrades();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmitGrade = async (gradeId: string) => {
    if (!gradeId) return;
    try {
      await gradeService.submitGrade(gradeId);
      fetchGrades();
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return grades.filter((g) => {
      if (yearFilter !== "All" && g.academicYearId !== yearFilter) return false;
      if (gradeTypeFilter !== "All" && g.gradeType !== gradeTypeFilter) return false;
      if (statusFilter !== "All" && g.submitStatus !== statusFilter) return false;
      if (termFilter !== "All" && g.term !== termFilter) return false;
      if (!q) return true;
      return [g.gradeId, g.courseName, g.courseCode, g.schoolClassName, g.fiscalYear, g.term]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [grades, search, yearFilter, gradeTypeFilter, statusFilter, termFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      SUBMITTED: "bg-success-100 text-success-700 dark:bg-success-900/20 dark:text-success-400",
      APPROVED:  "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
      REJECTED:  "bg-error-100 text-error-700 dark:bg-error-900/20 dark:text-error-400",
      DRAFT:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[status] ?? map.DRAFT}`}>
        {status ?? "DRAFT"}
      </span>
    );
  };

  const selectCls = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

  return (
    <>
      <PageMeta title="Ubrs - Grades" description="Manage grades." />

      <div className="space-y-6">
        <ComponentCard title="Course Grades" titleClassName="text-xl sm:text-2xl">
          {/* Filters */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search</label>
                <Input placeholder="Search..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Academic Year</label>
                <select className={selectCls} value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Years</option>
                  {years.map(y => (
                    <option key={y.academicYearId} value={y.academicYearId}>{y.fiscalYear}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Grade Type</label>
                <select className={selectCls} value={gradeTypeFilter} onChange={(e) => { setGradeTypeFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Types</option>
                  <option value="TEST">Test</option>
                  <option value="EXAM">Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Status</label>
                <select className={selectCls} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Term</label>
                <select className={selectCls} value={termFilter} onChange={(e) => { setTermFilter(e.target.value); setPage(1); }}>
                  <option value="All">All Terms</option>
                  <option value="TERM1">Term 1</option>
                  <option value="TERM2">Term 2</option>
                  <option value="TERM3">Term 3</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                {isAdmin && <Button size="sm" variant="outline" onClick={() => setIsUploadModalOpen(true)}>Upload</Button>}
                {isAdmin && (
                  <Link to="/grades/create">
                    <Button size="sm">Add Grade</Button>
                  </Link>
                )}
                {isTeacherRole && (
                  <Link to="/grades/create">
                    <Button size="sm">Add Grade</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading grades...</div>
              ) : (
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">#</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Course</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Class</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Type</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Term</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Year</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Max Mark</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Students</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Feedback</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.length === 0 ? (
                      <TableRow>
                        <TableCell className="px-5 py-8 text-center text-gray-400 dark:text-gray-600" colSpan={11}>No grade batches found.</TableCell>
                      </TableRow>
                    ) : paginated.map((item, idx) => (
                      <TableRow key={item.gradeId} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="font-medium text-gray-800 dark:text-white/90">{item.courseName}</div>
                          <div className="text-xs text-gray-400">{item.courseCode}</div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.schoolClassName}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.gradeType === "EXAM" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}`}>
                            {item.gradeType}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.term?.replace(/^TERM(\d)$/, "Term $1")}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.fiscalYear}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.maxMark}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.gradeDetails?.length ?? 0}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[140px] truncate">{item.feedback || "—"}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">{statusBadge(item.submitStatus)}</TableCell>
                        <TableCell className="px-5 py-4 text-start text-theme-sm">
                          <div className="flex gap-2 flex-wrap">
                            {item.submitStatus === "DRAFT" && (
                              <>
                                <Button size="sm" variant="outline" startIcon={<CheckCircleIcon className="size-4" />} onClick={() => handleSubmitGrade(item.gradeId)} title="Submit" ariaLabel="Submit" className="!px-3 !py-2 !text-xs rounded-lg !bg-success-100/30 !text-success-700 hover:!bg-success-200">Submit</Button>
                                <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />} onClick={() => navigate("/grades/edit", { state: { grade: item } })} title="Edit" ariaLabel="Edit" className="!px-3 !py-2 !text-xs rounded-lg !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200">Edit</Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" startIcon={<EyeIcon className="size-4" />} onClick={() => navigate("/grades/details", { state: { grade: item } })} title="View" ariaLabel="View" className="!px-3 !py-2 !text-xs rounded-lg !bg-gray-100 text-gray-700 hover:!bg-gray-200 dark:!bg-gray-800 dark:text-gray-300 dark:hover:!bg-gray-700">View</Button>
                            {item.submitStatus === "DRAFT" && isAdmin && (
                              <Button size="sm" variant="outline" startIcon={<TrashBinIcon className="size-4" />} onClick={() => handleDelete(item.gradeId)} title="Delete" ariaLabel="Delete" className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <select className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
              <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{currentPage}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>Next</Button>
            </div>
          </div>
        </ComponentCard>
      </div>

      <GradesUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSuccess={fetchGrades} />
    </>
  );
}
