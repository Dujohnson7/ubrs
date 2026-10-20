import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { PencilIcon, TrashBinIcon, DownloadIcon } from "../../icons";
import { expensesPaymentsService, ExpensesPaymentsResponseDto } from "../../services/expensesPaymentsService";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import { generateReportPdf } from "../../utils/pdfExport";
import { toast } from "../../utils/toast";
import { resolveSignatory, ResolvedSignatory } from "../../utils/signatureUtils";
import PageSignatureBlock from "../../components/common/PageSignatureBlock";

export default function ExpensesPayments() {
  const { canManageFinance, user } = useRoleAccess();
  const [signatory, setSignatory] = useState<ResolvedSignatory | null>(null);
  const [expensesPayments, setExpensesPayments] = useState<ExpensesPaymentsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expenseNameFilter, setExpenseNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  // Unique expense names for the dropdown
  const expenseNames = useMemo(() => {
    const names = Array.from(new Set(expensesPayments.map((e) => e.expenseName).filter(Boolean)));
    return names.sort();
  }, [expensesPayments]);

  useEffect(() => {
    resolveSignatory(user, "Finance Officer").then(setSignatory);
    const loadExpensesPayments = async () => {
      try {
        setLoading(true);
        const data = await expensesPaymentsService.getAllExpensesPayments();
        setExpensesPayments(data);
      } catch (err) {
        // Error is handled by toast in service
      } finally {
        setLoading(false);
      }
    };

    loadExpensesPayments();
  }, [user]);

  const handleDelete = async (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await expensesPaymentsService.deleteExpensesPayment(itemToDelete);
      setExpensesPayments((current) => current.filter((item) => item.expensesPaymentsId !== itemToDelete));
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
    return expensesPayments.filter((a) => {
      if (q && ![a.expenseName, String(a.amount), a.expenseDate].join(" ").toLowerCase().includes(q)) return false;
      if (expenseNameFilter && a.expenseName !== expenseNameFilter) return false;
      if (dateFrom) {
        const recDate = new Date(a.expenseDate);
        const from   = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (recDate < from) return false;
      }
      if (dateTo) {
        const recDate = new Date(a.expenseDate);
        const to     = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (recDate > to) return false;
      }
      return true;
    });
  }, [expensesPayments, search, expenseNameFilter, dateFrom, dateTo]);

  const hasActiveFilters = search || expenseNameFilter || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch("");
    setExpenseNameFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "RWF", minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const handleDownloadReport = () => {
    if (filtered.length === 0) {
      toast.error("No expense payment records available to download.");
      return;
    }

    const periodParts: string[] = [];
    if (dateFrom && dateTo) {
      periodParts.push(`From ${formatDate(dateFrom)} to ${formatDate(dateTo)}`);
    } else if (dateFrom) {
      periodParts.push(`From ${formatDate(dateFrom)}`);
    } else if (dateTo) {
      periodParts.push(`Up to ${formatDate(dateTo)}`);
    } else {
      periodParts.push("All Dates");
    }

    if (expenseNameFilter) {
      periodParts.push(`Expense: ${expenseNameFilter}`);
    }
    if (search) {
      periodParts.push(`Search: "${search}"`);
    }

    const headers = [
      ["#", "Expense Name", "Expense Date", "Amount (RWF)"]
    ];

    const body: (string | number)[][] = filtered.map((item, idx) => [
      idx + 1,
      item.expenseName || "—",
      formatDate(item.expenseDate),
      formatCurrency(item.amount),
    ]);

    const totalAmount = filtered.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    body.push(["", "TOTAL", "", formatCurrency(totalAmount)]);

    generateReportPdf({
      title: "EXPENSE PAYMENTS REPORT",
      reportPeriod: periodParts.join(" · "),
      signatory: signatory || undefined,
      headers,
      body,
    });
  };

  const handleDownloadSingleExpense = (item: ExpensesPaymentsResponseDto) => {
    generateReportPdf({
      title: "EXPENSE PAYMENT VOUCHER",
      reportPeriod: formatDate(item.expenseDate),
      signatory: signatory || undefined,
      headers: [["Field", "Details"]],
      body: [
        ["Payment Reference", item.expensesPaymentsId],
        ["Expense Name", item.expenseName || "—"],
        ["Expense Date", formatDate(item.expenseDate)],
        ["Amount Paid", formatCurrency(item.amount)],
      ],
    });
  };

  return (
    <>
      <PageMeta title="Ubrs - Expense Payments" description="Manage expense payments." />

      <div className="space-y-6">
        <ComponentCard title="Expense Payments" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] items-end">
              {/* Search */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Search</label>
                <Input placeholder="Search amount or date..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} disabled={loading} />
              </div>
              {/* Expense Name Filter */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Expense Name</label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={expenseNameFilter}
                  onChange={(e) => { setExpenseNameFilter(e.target.value); setPage(1); }}
                  disabled={loading}
                >
                  <option value="">All Expenses</option>
                  {expenseNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              {/* Date From */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Date From</label>
                <input
                  type="date"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  disabled={loading}
                />
              </div>
              {/* Date To */}
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-2">Date To</label>
                <input
                  type="date"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  disabled={loading}
                />
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 justify-end flex-wrap">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="h-11 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 px-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Clear
                  </button>
                )}
                {/* Download Document Button */}
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="h-11 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 transition shadow-xs"
                  title="Download expense payments report as PDF"
                >
                  <DownloadIcon className="size-4" />
                  <span>Download Document</span>
                </button>
                {canManageFinance && (
                  <Link to="/expense-payments/create">
                    <Button size="sm" className="h-11">Add Expense Payment</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            {loading ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading expense payments...</div>
            ) : paginated.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">No expense payments found</div>
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
                        Amount
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                        Expense Date
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
                      <TableRow key={item.expensesPaymentsId}>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{item.expenseName}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            {formatCurrency(item.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">{formatDate(item.expenseDate)}</TableCell>
                        {canManageFinance && (
                          <TableCell className="px-5 py-4 text-gray-500 text-end text-theme-sm dark:text-gray-400">
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<DownloadIcon className="size-4" />}
                                onClick={() => handleDownloadSingleExpense(item)}
                                title="Download Voucher Document"
                                ariaLabel="Download Voucher Document"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-purple-100/20 !text-purple-600 hover:!bg-purple-200"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<PencilIcon className="size-4" />}
                                onClick={() => navigate("/expense-payments/edit", { state: { item } })}
                                title="Edit"
                                ariaLabel="Edit"
                                className="!px-3 !py-3 !min-w-0 rounded-full !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                startIcon={<TrashBinIcon className="size-4" />}
                                onClick={() => handleDelete(item.expensesPaymentsId)}
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

            {signatory && (
              <PageSignatureBlock
                name={signatory.name}
                role={signatory.role}
                signatureUrl={signatory.signatureUrl}
              />
            )}
          </div>
        </ComponentCard>
      </div>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Expense Payment"
        message="Are you sure you want to delete this expense payment? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
