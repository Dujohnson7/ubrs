import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon } from "../../icons";
import { schoolExpenseService, SchoolExpenseResponseDto } from "../../services/schoolExpenseService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function SchoolExpenses() {
  const { canManageFinance } = useRoleAccess();
  const [schoolExpenses, setSchoolExpenses] = useState<SchoolExpenseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSchoolExpenses = async () => {
      try {
        setLoading(true);
        const data = await schoolExpenseService.getAllSchoolExpenses();
        setSchoolExpenses(data);
      } catch (err) {
        // Error is handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    loadSchoolExpenses();
  }, []);

  const handleActivate = async (id: string) => {
    try {
      await schoolExpenseService.activateSchoolExpense(id);
      setSchoolExpenses((current) =>
        current.map((item) =>
          item.schoolExpenseId === id ? { ...item, expenseStaus: true } : item
        )
      );
    } catch (err) {
      // Error is handled by toast in service
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await schoolExpenseService.deactivateSchoolExpense(id);
      setSchoolExpenses((current) =>
        current.map((item) =>
          item.schoolExpenseId === id ? { ...item, expenseStaus: false } : item
        )
      );
    } catch (err) {
      // Error is handled by toast in service
    }
  };

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await schoolExpenseService.deleteSchoolExpense(itemToDelete);
      setSchoolExpenses((current) => current.filter((item) => item.schoolExpenseId !== itemToDelete));
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
    return schoolExpenses.filter((a) => {
      const matchesSearch = q ? a.expenseName.toLowerCase().includes(q) : true;
      const matchesStatus = statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && a.expenseStaus) ||
        (statusFilter === "INACTIVE" && !a.expenseStaus);
      return matchesSearch && matchesStatus;
    });
  }, [schoolExpenses, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <PageMeta title="Ubrs - School Expenses" description="Manage school expenses." />

      <div className="space-y-6">
        <ComponentCard title="School Expenses" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[2fr_1fr_auto] items-end">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search Entries</label>
                <Input placeholder="Search by expense name..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} disabled={loading} />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Filter by Status</label>
                <select
                  className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE"); setPage(1); }}
                  disabled={loading}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              {canManageFinance && (
                <div className="flex justify-end">
                  <Link to="/school-expenses/create">
                    <Button size="sm">Add School Expense</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading school expenses...</div>
            ) : paginated.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No school expenses found</div>
            ) : (
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        #
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Expense Name
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Status
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
                      <TableRow key={item.schoolExpenseId}>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.expenseName}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.expenseStaus
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {item.expenseStaus ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        {canManageFinance && (
                          <TableCell className="px-5 py-4 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                            <div className="flex flex-wrap gap-2 justify-end">
                              {item.expenseStaus ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeactivate(item.schoolExpenseId)}
                                  disabled={loading}
                                  title="Deactivate"
                                  ariaLabel="Deactivate"
                                  className="!px-3 !py-3 !min-w-0 rounded-full !bg-yellow-100/20 !text-yellow-600 hover:!bg-yellow-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleActivate(item.schoolExpenseId)}
                                  disabled={loading}
                                  title="Activate"
                                  ariaLabel="Activate"
                                  className="!px-3 !py-3 !min-w-0 rounded-full !bg-green-100/20 !text-green-600 hover:!bg-green-200"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<PencilIcon className="size-4" />}
                                onClick={() => navigate("/school-expenses/edit", { state: { item } })}
                                title="Edit"
                                ariaLabel="Edit"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<TrashBinIcon className="size-4" />}
                                onClick={() => handleDelete(item.schoolExpenseId)}
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
        title="Delete School Expense"
        message="Are you sure you want to delete this school expense? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
