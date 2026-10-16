import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { schoolFeesService, SchoolFeesResponseDto } from "../../services/schoolFeesService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function SchoolFees() {
  const { canManageFinance } = useRoleAccess();
  const [schoolFees, setSchoolFees] = useState<SchoolFeesResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchoolFees = async () => {
      try {
        setLoading(true);
        const data = await schoolFeesService.getAllSchoolFees();
        setSchoolFees(data);
      } catch (err) {
        // Error is handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    loadSchoolFees();
  }, []);

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await schoolFeesService.deleteSchoolFees(itemToDelete);
      setSchoolFees((current) => current.filter((item) => item.schoolFeesId !== itemToDelete));
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return schoolFees.filter((a) => {
      return q ? [a.fiscalYear, String(a.nurseryFees), String(a.primaryFees)].join(" ").toLowerCase().includes(q) : true;
    });
  }, [schoolFees, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <>
      <PageMeta title="Ubrs - School Fees" description="Manage school fees." />

      <div className="space-y-6">
        <ComponentCard title="School Fees" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Entries</label>
                <Input placeholder="Search by fiscal year or fees amount..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} disabled={loading} />
              </div>
              {canManageFinance && (
                <div className="flex justify-end">
                  <Link to="/school-fees/create">
                    <Button size="sm">Add School Fees</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading school fees...</div>
            ) : paginated.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No school fees found</div>
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
                        Nursery Fees
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Primary Fees
                      </TableCell>
                      {canManageFinance && (
                        <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-theme-xs dark:text-gray-400">
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.map((item, index) => (
                      <TableRow key={item.schoolFeesId}>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.fiscalYear}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {formatCurrency(item.nurseryFees)}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {formatCurrency(item.primaryFees)}
                          </span>
                        </TableCell>
                        {canManageFinance && (
                          <TableCell className="px-5 py-4 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<PencilIcon className="size-4" />}
                                onClick={() => navigate("/school-fees/edit", { state: { item } })}
                                title="Edit"
                                ariaLabel="Edit"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<TrashBinIcon className="size-4" />}
                                onClick={() => handleDelete(item.schoolFeesId)}
                                title="Delete"
                                ariaLabel="Delete"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-error-100/20 !text-error-600 hover:!bg-error-200"
                              />
                            </div>
                          </TableCell>
                        )}
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
        title="Delete School Fees"
        message="Are you sure you want to delete this school fees entry? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
