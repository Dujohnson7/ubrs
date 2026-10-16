import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useAuth } from "../../hooks/useAuth";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { parentDashboardService, ParentChildDto } from "../../services/parentDashboardService";
import {
  studentFeePaymentService,
  ParentStudentPaymentHistoryProjection,
  ETerm,
} from "../../services/studentFeePaymentService";
import { EyeIcon, DownloadIcon, CalenderIcon, CheckCircleIcon } from "../../icons";
import { generateReportPdf } from "../../utils/pdfExport";
import { toast } from "../../utils/toast";

export default function ParentSchoolFees() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [history, setHistory] = useState<ParentStudentPaymentHistoryProjection[]>([]);
  const [children, setChildren] = useState<ParentChildDto[]>([]);
  const [years, setYears] = useState<AcademicYearResponseDto[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("ALL");
  const [selectedTerm, setSelectedTerm] = useState<string>("ALL");
  const [selectedChildId, setSelectedChildId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Currency formatter
  const formatCurrency = (amount?: number | null) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatTermLabel = (term?: string) => {
    if (!term) return "—";
    switch (term.toUpperCase()) {
      case "TERM1":
        return "Term 1";
      case "TERM2":
        return "Term 2";
      case "TERM3":
        return "Term 3";
      default:
        return term;
    }
  };

  // Load initial options (years & parent's children)
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }
      try {
        const [yearsList, childrenList] = await Promise.all([
          academicYearService.getAllAcademicYears().catch(() => []),
          parentDashboardService.getChildren(user.userId).catch(() => []),
        ]);
        setYears(yearsList);
        setChildren(childrenList);

        // Default to active academic year if present
        const activeYear = yearsList.find((y) => y.academicYearStatus === "ACTIVE");
        if (activeYear) {
          setSelectedYearId(activeYear.academicYearId);
        }
      } catch (err) {
        console.error("Error loading years/children for parent fees", err);
      }
    };
    void loadInitialData();
  }, [user?.userId]);

  // Load payment history from API whenever parentId, selectedYearId, or selectedTerm changes
  const loadPaymentHistory = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const yearParam = selectedYearId !== "ALL" ? selectedYearId : undefined;
      const termParam = selectedTerm !== "ALL" ? (selectedTerm as ETerm) : undefined;
      const data = await studentFeePaymentService.getParentStudentPaymentHistory(
        user.userId,
        yearParam,
        termParam
      );
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load parent student payment history", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPaymentHistory();
  }, [user?.userId, selectedYearId, selectedTerm]);

  // Client-side filtering for child, search, status
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Child Filter
      if (selectedChildId !== "ALL" && item.studentId !== selectedChildId) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== "ALL" && item.paymentStatus !== selectedStatus) {
        return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const studentFullName = `${item.firstName || ""} ${item.lastName || ""}`.toLowerCase();
        const code = (item.studentCode || "").toLowerCase();
        const fiscal = (item.fiscalYear || "").toLowerCase();
        const term = (item.term || "").toLowerCase();
        if (
          !studentFullName.includes(q) &&
          !code.includes(q) &&
          !fiscal.includes(q) &&
          !term.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [history, selectedChildId, selectedStatus, search]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage, pageSize]);

  // Navigate to dedicated Breakdown page (no ID in URL)
  const handleNavigateToBreakdown = (record: ParentStudentPaymentHistoryProjection) => {
    sessionStorage.setItem("parent_selected_fee_breakdown", JSON.stringify(record));
    navigate("/parent/school-fees/breakdown", {
      state: { item: record, studentId: record.studentId },
    });
  };

  // PDF Statement Export
  const handleExportPdf = () => {
    if (filteredHistory.length === 0) {
      toast.error("No payment history to export.");
      return;
    }

    const headers = [["#", "Student ID", "Student Name", "Academic Year", "Term", "Amount Paid", "Remaining", "Status"]];
    const body = filteredHistory.map((item, index) => [
      index + 1,
      item.studentCode || "—",
      `${item.firstName || ""} ${item.lastName || ""}`.trim() || "—",
      item.fiscalYear || "—",
      formatTermLabel(item.term),
      formatCurrency(item.totalAmountPaid),
      formatCurrency(item.remainAmount),
      item.paymentStatus || "UNPAID",
    ]);

    const activeYearObj = years.find((y) => y.academicYearId === selectedYearId);
    const periodLabel = activeYearObj ? `Academic Year: ${activeYearObj.fiscalYear}` : "All Years";

    generateReportPdf({
      title: "Parent Student School Fees Statement",
      reportPeriod: periodLabel,
      preparedBy: user?.names || "Parent",
      headers,
      body,
    });
  };

  const handleResetFilters = () => {
    setSelectedYearId("ALL");
    setSelectedTerm("ALL");
    setSelectedChildId("ALL");
    setSelectedStatus("ALL");
    setSearch("");
    setPage(1);
  };

  return (
    <>
      <PageMeta
        title="Ubrs — School Fees & Payment History"
        description="View school fee payments and balance history for your children."
      />

      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
              School Fees & Payment History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Review school fees, amounts paid, remaining balances, and payment status for your children.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportPdf}
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2"
              disabled={filteredHistory.length === 0}
            >
              <DownloadIcon className="w-4 h-4" />
              Download Statement
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <ComponentCard title="Filter Payment History">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Student
              </label>
              <Input
                placeholder="Search name or ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Academic Year
              </label>
              <select
                value={selectedYearId}
                onChange={(e) => {
                  setSelectedYearId(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Academic Years</option>
                {years.map((y) => (
                  <option key={y.academicYearId} value={y.academicYearId}>
                    {y.fiscalYear} {y.academicYearStatus === "ACTIVE" ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => {
                  setSelectedTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Terms</option>
                <option value="TERM1">Term 1</option>
                <option value="TERM2">Term 2</option>
                <option value="TERM3">Term 3</option>
              </select>
            </div>

            {/* Child Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Child
              </label>
              <select
                value={selectedChildId}
                onChange={(e) => {
                  setSelectedChildId(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Children</option>
                {children.map((c) => (
                  <option key={c.studentId} value={c.studentId}>
                    {c.studentName} ({c.studentCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Fully Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </div>
          </div>

          {(search || selectedYearId !== "ALL" || selectedTerm !== "ALL" || selectedChildId !== "ALL" || selectedStatus !== "ALL") && (
            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}
        </ComponentCard>

        {/* Payments Table */}
        <ComponentCard title="Student Fee Payments">
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <TableCell isHeader className="w-12 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Student</TableCell>
                  <TableCell isHeader className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Academic Year</TableCell>
                  <TableCell isHeader className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Term</TableCell>
                  <TableCell isHeader className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount Paid</TableCell>
                  <TableCell isHeader className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Remaining Balance</TableCell>
                  <TableCell isHeader className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                        <span>Loading payment records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                      No payment history found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedHistory.map((item, idx) => {
                    const studentFullName = `${item.firstName || ""} ${item.lastName || ""}`.trim();
                    const globalIdx = (currentPage - 1) * pageSize + idx + 1;
                    const isFullyPaid = item.paymentStatus === "PAID" || (item.remainAmount || 0) <= 0;

                    return (
                      <TableRow
                        key={`${item.studentId}-${item.schoolFeesId || idx}-${item.term}`}
                        className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Index */}
                        <TableCell className="text-center text-xs text-gray-400 font-medium">
                          {globalIdx}
                        </TableCell>

                        {/* Student */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-100 dark:border-brand-900/30">
                              {(item.firstName || "S").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                {studentFullName || "Student"}
                              </div>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {item.studentCode || "—"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Academic Year */}
                        <TableCell>
                          <div className="inline-flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200 text-sm">
                            <CalenderIcon className="w-3.5 h-3.5 text-gray-400" />
                            {item.fiscalYear || "—"}
                          </div>
                        </TableCell>

                        {/* Term */}
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50">
                            {formatTermLabel(item.term)}
                          </span>
                        </TableCell>

                        {/* Total Paid */}
                        <TableCell>
                          <span className="font-bold text-green-600 dark:text-green-400 text-sm">
                            {formatCurrency(item.totalAmountPaid)}
                          </span>
                        </TableCell>

                        {/* Remaining Amount */}
                        <TableCell>
                          {isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 rounded-full">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          ) : (
                            <span className="font-bold text-red-500 dark:text-red-400 text-sm">
                              {formatCurrency(item.remainAmount)}
                            </span>
                          )}
                        </TableCell>

                        {/* Payment Status */}
                        <TableCell>
                          <Badge
                            color={
                              item.paymentStatus === "PAID"
                                ? "success"
                                : item.paymentStatus === "PARTIAL"
                                ? "warning"
                                : "error"
                            }
                          >
                            {item.paymentStatus || "UNPAID"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleNavigateToBreakdown(item)}
                            size="sm"
                            variant="outline"
                            className="inline-flex items-center gap-1.5 text-xs font-medium hover:border-brand-500 hover:text-brand-600"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            Fee Breakdown & Installments
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filteredHistory.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Showing {Math.min(filteredHistory.length, (currentPage - 1) * pageSize + 1)} to{" "}
                {Math.min(filteredHistory.length, currentPage * pageSize)} of {filteredHistory.length} records
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-xs text-gray-600 dark:text-gray-300 px-2 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
