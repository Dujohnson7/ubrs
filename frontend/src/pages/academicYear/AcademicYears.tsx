import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { academicYearService, AcademicYearResponseDto, EAcademicState } from "../../services/academicYearService";

export default function AcademicYears() {
  const [academicYears, setAcademicYears] = useState<AcademicYearResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EAcademicState | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [academicYearToDelete, setAcademicYearToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleActivate = async (academicYearId: string) => {
    try {
      await academicYearService.activateAcademicYear(academicYearId);
      setAcademicYears((current) =>
        current.map((item) =>
          item.academicYearId === academicYearId ? { ...item, academicYearStatus: "ACTIVE" } : item
        )
      );
    } catch (err) {
      // Error is handled by toast in service
    }
  };

  const handleComplete = async (academicYearId: string) => {
    try {
      await academicYearService.completeAcademicYear(academicYearId);
      setAcademicYears((current) =>
        current.map((item) =>
          item.academicYearId === academicYearId ? { ...item, academicYearStatus: "DONE" } : item
        )
      );
    } catch (err) {
      // Error is handled by toast in service
    }
  };

  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        setLoading(true);
        const data = await academicYearService.getAllAcademicYears();
        setAcademicYears(data);
      } catch (err) {
        // Error is handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    loadAcademicYears();
  }, []);

  const handleDelete = async (academicYearId: string) => {
    setAcademicYearToDelete(academicYearId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!academicYearToDelete) return;

    try {
      await academicYearService.deleteAcademicYear(academicYearToDelete);
      setAcademicYears((current) => current.filter((item) => item.academicYearId !== academicYearToDelete));
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setDeleteDialogOpen(false);
      setAcademicYearToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setAcademicYearToDelete(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return academicYears.filter((a) => {
      const matchesSearch = q ? [a.academicYearId, a.fiscalYear].join(" ").toLowerCase().includes(q) : true;
      const matchesStatus = statusFilter === "ALL" || a.academicYearStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [academicYears, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - Academic Years" description="Manage academic years." />
      

      <div className="space-y-6">
        <ComponentCard title="Academic Years" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Entries</label>
                <Input placeholder="Search academic year id or fiscal year..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} disabled={loading} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Filter by Status</label>
                <select 
                  className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as EAcademicState | "ALL"); setPage(1); }}
                  disabled={loading}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div className="flex justify-end">
                <Link to="/academic-years/create">
                  <Button size="sm">Add Academic Year</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading academic years...</div>
            ) : paginated.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No academic years found</div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        #
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Fiscal Year
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Status
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.map((item, index) => (
                      <TableRow key={item.academicYearId}>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.fiscalYear}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.academicYearStatus === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            item.academicYearStatus === 'DONE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            item.academicYearStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {item.academicYearStatus}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleActivate(item.academicYearId)}
                              disabled={item.academicYearStatus === 'ACTIVE' || item.academicYearStatus === 'DONE' || loading}
                              title="Activate"
                              ariaLabel="Activate"
                              className="!px-3 !py-3 !min-w-0 rounded-full !bg-green-100/20 !text-green-600 hover:!bg-green-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleComplete(item.academicYearId)}
                              disabled={item.academicYearStatus === 'DONE' || loading}
                              title="Complete"
                              ariaLabel="Complete"
                              className="!px-3 !py-3 !min-w-0 rounded-full !bg-blue-100/20 !text-blue-600 hover:!bg-blue-200"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="20 6 9 17 4 12"/></svg>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              startIcon={<PencilIcon className="size-4" />}
                              onClick={() => navigate("/academic-years/edit", { state: { item } })}
                              title="Edit"
                              ariaLabel="Edit"
                              className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              startIcon={<TrashBinIcon className="size-4" />}
                              onClick={() => handleDelete(item.academicYearId)}
                              title="Delete"
                              ariaLabel="Delete"
                              className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="grid gap-4 px-5 py-4 border-t border-gray-100 dark:border-white/[0.05] sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Showing {paginated.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
                </span>
                <select className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} disabled={loading}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="justify-self-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1 || loading}>Previous</Button>
                  <span className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">{currentPage}</span>
                  <Button size="sm" variant="outline" onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount || loading}>Next</Button>
                </div>
              </div>
            </div>
          </div>
        </ComponentCard>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Academic Year"
        message="Are you sure you want to delete this academic year? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
