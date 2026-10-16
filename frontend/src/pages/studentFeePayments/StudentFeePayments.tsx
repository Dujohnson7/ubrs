import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import { PencilIcon, TrashBinIcon, DollarLineIcon, EyeIcon, DownloadIcon } from "../../icons";
import { generateReportPdf } from "../../utils/pdfExport";
import {
  studentFeePaymentService,
  StudentFeePaymentsResponseDto,
  ETerm,
  EPaymentState,
  ESchoolLevel,
} from "../../services/studentFeePaymentService";
import { schoolFeesService, SchoolFeesResponseDto } from "../../services/schoolFeesService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function StudentFeePayments() {
  const { canManageFinance } = useRoleAccess();
  const [payments, setPayments] = useState<StudentFeePaymentsResponseDto[]>([]);
  const [schoolFeesList, setSchoolFeesList] = useState<SchoolFeesResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedTerm, setSelectedTerm] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Repay Modal state
  const [repayModalOpen, setRepayModalOpen] = useState(false);
  const [selectedPaymentForRepay, setSelectedPaymentForRepay] = useState<StudentFeePaymentsResponseDto | null>(null);
  const [repayAmount, setRepayAmount] = useState<string>("");
  const [repayDate, setRepayDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [repayLoading, setRepayLoading] = useState(false);


  // Validate / Initialize Fees Modal state
  const [validateModalOpen, setValidateModalOpen] = useState(false);
  const [validateSchoolFeesId, setValidateSchoolFeesId] = useState<string>("");
  const [validateTerm, setValidateTerm] = useState<ETerm>("TERM1");
  const [validateLoading, setValidateLoading] = useState(false);

  // Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importSchoolFeesId, setImportSchoolFeesId] = useState<string>("");
  const [importTerm, setImportTerm] = useState<ETerm>("TERM1");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feePaymentsData, schoolFeesData] = await Promise.all([
        studentFeePaymentService.getAllStudentFeePayments().catch(() => []),
        schoolFeesService.getAllSchoolFees().catch(() => []),
      ]);
      setPayments(feePaymentsData);
      setSchoolFeesList(schoolFeesData);
      if (schoolFeesData.length > 0) {
        setValidateSchoolFeesId(schoolFeesData[0].schoolFeesId);
        setImportSchoolFeesId(schoolFeesData[0].schoolFeesId);
      }
    } catch {
      // Error is handled in services
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  // Formatters
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let totalCollected = 0;
    let totalRemaining = 0;
    let totalOverdue = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    for (const p of payments) {
      totalCollected += p.totalAmountPaid || 0;
      totalRemaining += p.remainAmount || 0;
      totalOverdue += p.overDueAmount || 0;
      if (p.paymentStatus === "PAID") paidCount++;
      else if (p.paymentStatus === "PARTIAL") partialCount++;
      else unpaidCount++;
    }

    return {
      totalCollected,
      totalRemaining,
      totalOverdue,
      totalRecords: payments.length,
      paidCount,
      partialCount,
      unpaidCount,
    };
  }, [payments]);

  // Extract unique academic years from fees and payments
  const academicYears = useMemo(() => {
    const set = new Set<string>();
    schoolFeesList.forEach((sf) => {
      if (sf.fiscalYear) set.add(sf.fiscalYear);
    });
    payments.forEach((p) => {
      if (p.schoolFees?.fiscalYear) set.add(p.schoolFees.fiscalYear);
    });
    return Array.from(set).sort().reverse();
  }, [schoolFeesList, payments]);

  // Filtering
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return payments.filter((item) => {
      // Status filter
      if (selectedStatus !== "ALL" && item.paymentStatus !== selectedStatus) {
        return false;
      }
      // Academic Year filter
      if (selectedYear !== "ALL") {
        const itemYear = item.schoolFees?.fiscalYear || "";
        if (itemYear !== selectedYear) {
          return false;
        }
      }
      // Term filter
      if (selectedTerm !== "ALL") {
        const rawTerm = (item as any).term || (item as any).academicTerm || (item as any).termName || "TERM1";
        const normalized = rawTerm.toString().toUpperCase().replace(/[\s_-]/g, "");
        const target = selectedTerm.toUpperCase().replace(/[\s_-]/g, "");
        if (normalized !== target) {
          return false;
        }
      }
      // Level filter
      if (selectedLevel !== "ALL" && item.studentLevel !== selectedLevel) {
        return false;
      }
      // Search query
      if (q) {
        const matches = [
          item.studentName,
          item.studentCode,
          item.studentLevel,
          item.schoolFees?.fiscalYear,
          (item as any).term,
          item.paymentStatus,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matches.includes(q);
      }
      return true;
    });
  }, [payments, search, selectedStatus, selectedYear, selectedTerm, selectedLevel]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Actions
  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await studentFeePaymentService.deleteStudentFeePayments(itemToDelete);
      setPayments((current) => current.filter((item) => item.studentFeePaymentsId !== itemToDelete));
    } catch {
      // Error handled by service toast
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleOpenRepay = (item: StudentFeePaymentsResponseDto) => {
    setSelectedPaymentForRepay(item);
    setRepayAmount(item.remainAmount > 0 ? String(item.remainAmount) : "");
    setRepayDate(new Date().toISOString().split("T")[0]);
    setRepayModalOpen(true);
  };

  const submitRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPaymentForRepay) return;
    const amount = Number(repayAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payment amount greater than zero");
      return;
    }

    try {
      setRepayLoading(true);
      const updated = await studentFeePaymentService.repayStudentFeePayments(
        selectedPaymentForRepay.studentFeePaymentsId,
        {
          amountPaid: amount,
          paidDate: repayDate,
        }
      );
      setPayments((curr) =>
        curr.map((p) => (p.studentFeePaymentsId === updated.studentFeePaymentsId ? updated : p))
      );
      setRepayModalOpen(false);
      setSelectedPaymentForRepay(null);
    } catch {
      // Error handled by toast
    } finally {
      setRepayLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (filtered.length === 0) {
      toast.error("No student fee payment records available to download.");
      return;
    }

    const periodParts: string[] = [];
    if (selectedYear !== "ALL") {
      periodParts.push(selectedYear);
    } else {
      periodParts.push("All Academic Years");
    }

    if (selectedTerm !== "ALL") {
      periodParts.push(
        selectedTerm === "TERM1" ? "Term 1" : selectedTerm === "TERM2" ? "Term 2" : "Term 3"
      );
    }

    if (selectedLevel !== "ALL") {
      periodParts.push(selectedLevel);
    }

    const headers = [
      [
        "#",
        "Student Name",
        "Student Code",
        "Level",
        "Academic Year",
        "Term",
        "Total Paid (RWF)",
        "Remaining (RWF)",
        "Status",
      ],
    ];

    const body = filtered.map((item, idx) => [
      idx + 1,
      item.studentName || "—",
      item.studentCode || "—",
      item.studentLevel || "—",
      item.schoolFees?.fiscalYear || "—",
      (item as any).term || "TERM1",
      (item.totalAmountPaid || 0).toLocaleString(),
      (item.remainAmount || 0).toLocaleString(),
      item.paymentStatus || "UNPAID",
    ]);

    generateReportPdf({
      title: "STUDENT FEE PAYMENTS REPORT",
      reportPeriod: periodParts.join(" · "),
      preparedBy: "Head Teacher",
      headers,
      body,
    });
  };

  const handleValidateFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSchoolFeesId) {
      toast.error("Please select a school fee record");
      return;
    }
    try {
      setValidateLoading(true);
      await studentFeePaymentService.validateStudentFeePayments(validateSchoolFeesId, validateTerm);
      setValidateModalOpen(false);
      void loadData();
    } catch {
      // Error handled by toast
    } finally {
      setValidateLoading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importSchoolFeesId) {
      toast.error("Please select a school fee record");
      return;
    }
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }
    try {
      setImportLoading(true);
      await studentFeePaymentService.importStudentFeePayments(importSchoolFeesId, importTerm, importFile);
      setImportModalOpen(false);
      setImportFile(null);
      void loadData();
    } catch {
      // Error handled by toast
    } finally {
      setImportLoading(false);
    }
  };

  const getStatusBadge = (status: EPaymentState) => {
    switch (status) {
      case "PAID":
        return <Badge color="success">Fully Paid</Badge>;
      case "PARTIAL":
        return <Badge color="warning">Partial</Badge>;
      case "UNPAID":
      default:
        return <Badge color="error">Unpaid</Badge>;
    }
  };

  return (
    <>
      <PageMeta
        title="Ubrs - Student Fee Payments"
        description="Comprehensive management of student fee billings, installment payments, receipts, and validation."
      />

      <div className="space-y-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
          {/* Card 1: Total Collected */}
          <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.08] via-emerald-500/[0.02] to-white p-5 dark:border-emerald-500/30 dark:bg-emerald-950/20 dark:to-white/[0.02] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Total Collected
              </span>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <DollarLineIcon className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white tabular-nums tracking-tight">
                {formatCurrency(stats.totalCollected)}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                From {stats.paidCount + stats.partialCount} contributing students
              </p>
            </div>
          </div>

          {/* Card 2: Total Remaining */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.02] to-white p-5 dark:border-amber-500/30 dark:bg-amber-950/20 dark:to-white/[0.02] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Pending Receivables
              </span>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-extrabold text-2xl text-amber-800 dark:text-amber-300 tabular-nums tracking-tight">
                {formatCurrency(stats.totalRemaining)}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Across {stats.partialCount + stats.unpaidCount} unpaid/partial accounts
              </p>
            </div>
          </div>

          {/* Card 3: Fully Paid Rate */}
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/[0.08] via-blue-500/[0.02] to-white p-5 dark:border-blue-500/30 dark:bg-blue-950/20 dark:to-white/[0.02] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Completion Rate
              </span>
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-extrabold text-2xl text-blue-800 dark:text-blue-300 tabular-nums tracking-tight">
                {stats.totalRecords > 0 ? Math.round((stats.paidCount / stats.totalRecords) * 100) : 0}%
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {stats.paidCount} of {stats.totalRecords} students cleared
              </p>
            </div>
          </div>

          {/* Card 4: Accounts Status Breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Payment Breakdown
            </span>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 text-center p-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40">
                <span className="text-[10px] uppercase font-bold text-green-700 dark:text-green-400 block">Paid</span>
                <span className="text-base font-bold text-green-800 dark:text-green-300">{stats.paidCount}</span>
              </div>
              <div className="flex-1 text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">Partial</span>
                <span className="text-base font-bold text-amber-800 dark:text-amber-300">{stats.partialCount}</span>
              </div>
              <div className="flex-1 text-center p-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40">
                <span className="text-[10px] uppercase font-bold text-red-700 dark:text-red-400 block">Unpaid</span>
                <span className="text-base font-bold text-red-800 dark:text-red-300">{stats.unpaidCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content ComponentCard */}
        <ComponentCard title="Student Fee Payments" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-6">
            {/* Filter & Actions Pane */}
            <div className="rounded-2xl border border-gray-200/80 bg-gray-50/60 p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.02] space-y-4">
              {/* Row 1: Search and Filters Grid */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-end">
                {/* Search */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                    Search Student / Code
                  </label>
                  <Input
                    placeholder="Search name, code..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    disabled={loading}
                  />
                </div>

                {/* Academic Year Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                    Academic Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="ALL">All Academic Years</option>
                    {academicYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                    Academic Term
                  </label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => {
                      setSelectedTerm(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="ALL">All Terms</option>
                    <option value="TERM1">Term 1</option>
                    <option value="TERM2">Term 2</option>
                    <option value="TERM3">Term 3</option>
                  </select>
                </div>

                {/* Payment Status Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                    Payment Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="ALL">All Statuses ({payments.length})</option>
                    <option value="PAID">Fully Paid ({stats.paidCount})</option>
                    <option value="PARTIAL">Partial ({stats.partialCount})</option>
                    <option value="UNPAID">Unpaid ({stats.unpaidCount})</option>
                  </select>
                </div>

                {/* School Level Filter */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                    School Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setPage(1);
                    }}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="PRIMARY">Primary</option>
                    <option value="NURSERY">Nursery</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Action Buttons Bar on Filter Pane */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Showing <strong className="text-gray-800 dark:text-gray-200">{filtered.length}</strong> of{" "}
                    <strong>{payments.length}</strong> records
                  </span>
                  {(selectedYear !== "ALL" || selectedTerm !== "ALL" || selectedStatus !== "ALL" || selectedLevel !== "ALL" || search) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSelectedYear("ALL");
                        setSelectedTerm("ALL");
                        setSelectedStatus("ALL");
                        setSelectedLevel("ALL");
                        setPage(1);
                      }}
                      className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium ml-2 underline underline-offset-2"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Buttons on filter pane */}
                <div className="flex flex-wrap items-center gap-2">
                  {canManageFinance && (
                    <>
                      {/* Generate / Validate Records Button */}
                      <button
                        type="button"
                        onClick={() => setValidateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 transition shadow-xs"
                        title="Initialize fee billing records for all enrolled students"
                      >
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Generate / Validate Records</span>
                      </button>

                      {/* Import Excel Button */}
                      <button
                        type="button"
                        onClick={() => setImportModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800/50 transition shadow-xs"
                        title="Import student fee payments from spreadsheet"
                      >
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>Import Excel</span>
                      </button>
                    </>
                  )}

                  {/* Download Document Button */}
                  <button
                    type="button"
                    onClick={handleDownloadReport}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 transition shadow-xs"
                    title="Download fee payments report as PDF"
                  >
                    <DownloadIcon className="size-3.5" />
                    <span>Download Document</span>
                  </button>

                  {canManageFinance && (
                    /* Register Fee Payment Button */
                    <Link to="/student-fee-payments/create">
                      <Button size="sm" className="!py-2 !px-3 text-xs shadow-xs">
                        <span className="text-base leading-none mr-1">+</span> Register Fee Payment
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Table Area */}
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Loading student fee payments...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-base font-medium">No fee payment records found.</p>
                <p className="text-xs text-gray-400 mt-1">
                  Click "Generate / Validate Records" to initialize billing records for enrolled students, or register one manually.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-gray-500">
                        #
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-gray-500">
                        Student
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-gray-500">
                        Level
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-gray-500">
                        Academic Year & Term
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-gray-500">
                        Total Paid
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-gray-500">
                        Remaining
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-start text-theme-xs font-semibold text-gray-500">
                        Status
                      </TableCell>
                      <TableCell isHeader className="px-4 py-3 text-center text-theme-xs font-semibold text-gray-500">
                        History
                      </TableCell>
                      {canManageFinance && (
                        <TableCell isHeader className="px-4 py-3 text-end text-theme-xs font-semibold text-gray-500">
                          Actions
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {paginated.map((item, index) => {
                      const detailsCount = item.studentFeePaymentsDetails?.length || 0;
                      return (
                        <TableRow key={item.studentFeePaymentsId} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                          <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {(currentPage - 1) * pageSize + index + 1}
                          </TableCell>

                          {/* Student */}
                          <TableCell className="px-4 py-3 text-start text-theme-sm">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {item.studentName || "Student"}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                                {item.studentCode || "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Level */}
                          <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-600 dark:text-gray-300">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                item.studentLevel === "PRIMARY"
                                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  : "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                              }`}
                            >
                              {item.studentLevel || "—"}
                            </span>
                          </TableCell>

                          {/* Academic Year & Term */}
                          <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <span>{item.schoolFees?.fiscalYear || "—"}</span>
                              <span className="text-gray-400">·</span>
                              <span className="text-xs font-medium text-brand-600 dark:text-brand-400">
                                {(item as any).term || "TERM1"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Total Paid */}
                          <TableCell className="px-4 py-3 text-start text-theme-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(item.totalAmountPaid)}
                          </TableCell>

                          {/* Remaining */}
                          <TableCell className="px-4 py-3 text-start text-theme-sm">
                            <span
                              className={`font-semibold ${
                                item.remainAmount > 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              {formatCurrency(item.remainAmount)}
                            </span>
                            {item.overDueAmount > 0 && (
                              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                                Overdue/Credit: {formatCurrency(item.overDueAmount)}
                              </span>
                            )}
                          </TableCell>

                          {/* Status Badge */}
                          <TableCell className="px-4 py-3 text-start text-theme-sm">
                            {getStatusBadge(item.paymentStatus)}
                          </TableCell>

                          {/* Installments History */}
                          <TableCell className="px-4 py-3 text-center text-theme-sm">
                            <button
                              onClick={() =>
                                navigate("/student-fee-payments/installments", {
                                  state: { item },
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-gray-300 transition"
                              title="View installment history"
                            >
                              <EyeIcon className="size-3.5" />
                              <span>{detailsCount} pay{detailsCount === 1 ? "" : "s"}</span>
                            </button>
                          </TableCell>

                          {/* Actions */}
                          {canManageFinance && (
                            <TableCell className="px-4 py-3 text-end text-theme-sm">
                              <div className="flex flex-wrap gap-1.5 justify-end items-center">
                                {/* Quick Repay / Add Payment button */}
                                {item.remainAmount > 0 && (
                                  <button
                                    onClick={() => handleOpenRepay(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition"
                                    title="Record payment installment"
                                  >
                                    <DollarLineIcon className="size-3.5" />
                                    <span>Pay</span>
                                  </button>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  startIcon={<PencilIcon className="size-3.5" />}
                                  onClick={() =>
                                    navigate("/student-fee-payments/edit", {
                                      state: { item },
                                    })
                                  }
                                  title="Edit"
                                  ariaLabel="Edit"
                                  className="!px-2.5 !py-2 !min-w-0 rounded-lg !bg-brand-100/20 !text-brand-600 hover:!bg-brand-200"
                                />

                                <Button
                                  size="sm"
                                  variant="outline"
                                  startIcon={<TrashBinIcon className="size-3.5" />}
                                  onClick={() => handleDelete(item.studentFeePaymentsId)}
                                  title="Delete"
                                  ariaLabel="Delete"
                                  className="!px-2.5 !py-2 !min-w-0 rounded-lg !bg-error-100/20 !text-error-600 hover:!bg-error-200"
                                />
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination Controls */}
            {filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Rows per page:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of{" "}
                    {filtered.length} entries
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                    Previous
                  </Button>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Page {currentPage} of {pageCount}
                  </span>
                  <Button size="sm" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage((p) => Math.min(p + 1, pageCount))}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ComponentCard>
      </div>

      {/* MODAL 1: Record Installment Payment (Repay) */}
      <Modal isOpen={repayModalOpen} onClose={() => setRepayModalOpen(false)} className="max-w-md p-6">
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record Fee Payment</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Add installment towards student's tuition
              </p>
            </div>
          </div>

          {selectedPaymentForRepay && (
            <form onSubmit={submitRepay} className="space-y-4 mt-4">
              <div className="rounded-xl p-3 bg-gray-50 dark:bg-white/[0.04] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedPaymentForRepay.studentName} ({selectedPaymentForRepay.studentCode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Balance:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(selectedPaymentForRepay.remainAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Already Paid:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(selectedPaymentForRepay.totalAmountPaid)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Payment Amount (RWF) *
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 25000"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  min="0.01"
                  step="any"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                  Payment Date *
                </label>
                <Input
                  type="date"
                  value={repayDate}
                  onChange={(e) => setRepayDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setRepayModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={repayLoading}>
                  {repayLoading ? "Saving..." : "Record Payment"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>


      {/* MODAL 3: Validate / Generate Student Fees */}
      <Modal isOpen={validateModalOpen} onClose={() => setValidateModalOpen(false)} className="max-w-md p-6">
        <div className="p-6">
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Generate / Validate Fees</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Initializes fee billing records for all active students enrolled in nursery and primary classes.
            </p>
          </div>

          <form onSubmit={handleValidateFees} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                Academic Year / School Fee *
              </label>
              <select
                value={validateSchoolFeesId}
                onChange={(e) => setValidateSchoolFeesId(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {schoolFeesList.map((sf) => (
                  <option key={sf.schoolFeesId} value={sf.schoolFeesId}>
                    {sf.fiscalYear} (Nursery: {formatCurrency(sf.nurseryFees)}, Primary: {formatCurrency(sf.primaryFees)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                Academic Term *
              </label>
              <select
                value={validateTerm}
                onChange={(e) => setValidateTerm(e.target.value as ETerm)}
                required
                className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="TERM1">Term 1</option>
                <option value="TERM2">Term 2</option>
                <option value="TERM3">Term 3</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setValidateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={validateLoading}>
                {validateLoading ? "Generating..." : "Generate Records"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL 4: Import Student Fee Payments */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} className="max-w-md p-6">
        <div className="p-6">
          <div className="pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import Fee Payments</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload an Excel (.xlsx / .csv) file to import payments in bulk.
            </p>
          </div>

          <form onSubmit={handleImport} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                Academic Year / School Fee *
              </label>
              <select
                value={importSchoolFeesId}
                onChange={(e) => setImportSchoolFeesId(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {schoolFeesList.map((sf) => (
                  <option key={sf.schoolFeesId} value={sf.schoolFeesId}>
                    {sf.fiscalYear}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                Academic Term *
              </label>
              <select
                value={importTerm}
                onChange={(e) => setImportTerm(e.target.value as ETerm)}
                required
                className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="TERM1">Term 1</option>
                <option value="TERM2">Term 2</option>
                <option value="TERM3">Term 3</option>
              </select>
            </div>

            <div className="rounded-xl p-3 bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-900/30 text-xs space-y-1.5">
              <span className="font-semibold text-brand-900 dark:text-brand-300 block">
                Required Excel Header Columns:
              </span>
              <p className="text-gray-600 dark:text-gray-400">
                The first row of your spreadsheet must contain these exact columns:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold text-brand-700 dark:text-brand-300">studentcode</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold text-brand-700 dark:text-brand-300">amountpaid</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-semibold text-brand-700 dark:text-brand-300">paiddate</span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                Select File (.xlsx, .xls, .csv) *
              </label>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                required
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-950/40 dark:file:text-brand-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setImportModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={importLoading}>
                {importLoading ? "Importing..." : "Upload & Import"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Fee Payment Record"
        message="Are you sure you want to delete this student fee payment record? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
        confirmText="Delete"
      />
    </>
  );
}
