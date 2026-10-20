import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import { DownloadIcon } from "../../icons";
import { generateReportPdf } from "../../utils/pdfExport";
import { useAuth } from "../../hooks/useAuth";
import { ERole } from "../../services/authService";
import { resolveSignatory, ResolvedSignatory } from "../../utils/signatureUtils";
import PageSignatureBlock from "../../components/common/PageSignatureBlock";
import {
  financialReportService,
  ExpenseReportProjection,
  SchoolFinancialSummaryProjection,
  StudentFeeCollectionProjection,
  StudentPaymentHistoryProjection,
  ETerm,
  ESchoolLevel,
} from "../../services/financialReportService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { schoolExpenseService, SchoolExpenseResponseDto } from "../../services/schoolExpenseService";
import { schoolClassService, SchoolClassResponseDto } from "../../services/schoolClassService";
import { schoolFeesService, SchoolFeesResponseDto } from "../../services/schoolFeesService";
import { studentService, StudentResponseDto } from "../../services/studentService";

type TabType = "summary" | "collection" | "payments" | "expenses";

const TAB_CONFIG: { key: TabType; label: string; desc: string }[] = [
  { key: "summary", label: "School Financial Summary", desc: "Consolidated fee collection, outstanding balances, and overdue totals." },
  { key: "collection", label: "Student Fee Collection", desc: "Aggregate collection statistics and student enrollment counts per term." },
  { key: "payments", label: "Student Payment History", desc: "Detailed transaction log of all payments made by individual students." },
  { key: "expenses", label: "Expense Report", desc: "Operational expenditures, payment dates, and expense breakdown." },
];

const TERMS = [
  { value: "", label: "All Terms" },
  { value: "TERM1", label: "Term 1" },
  { value: "TERM2", label: "Term 2" },
  { value: "TERM3", label: "Term 3" },
] as const;

const LEVELS = [
  { value: "", label: "All Levels" },
  { value: "PRIMARY", label: "Primary" },
  { value: "NURSERY", label: "Nursery" },
] as const;

const SELECT_CLASS =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const HDR_CLASS = "px-5 py-3.5 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400";
const CEL_CLASS = "px-5 py-4 text-gray-700 text-start text-sm dark:text-gray-300 whitespace-nowrap";

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0 RWF";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatTerm(term?: string | null): string {
  if (!term) return "All Terms";
  const map: Record<string, string> = { TERM1: "Term 1", TERM2: "Term 2", TERM3: "Term 3" };
  return map[term] || term;
}

function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.map(escapeCsv).join(","), ...rows.map((r) => r.map(escapeCsv).join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function FinancialReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [signatory, setSignatory] = useState<ResolvedSignatory | null>(null);

  useEffect(() => {
    resolveSignatory(user, "Finance Officer").then(setSignatory);
  }, [user]);

  // Role Protection: Head Teacher, School Board Manager, Accountant
  useEffect(() => {
    if (
      user &&
      user.role !== ERole.HEADERTEACHER &&
      user.role !== ERole.SCHOOL_BOARD_MANAGER &&
      user.role !== ERole.ACCOUNTANT
    ) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<TabType>("summary");

  // Shared Master Data
  const [academicYears, setAcademicYears] = useState<AcademicYearResponseDto[]>([]);
  const [schoolExpenses, setSchoolExpenses] = useState<SchoolExpenseResponseDto[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClassResponseDto[]>([]);
  const [schoolFees, setSchoolFees] = useState<SchoolFeesResponseDto[]>([]);
  const [students, setStudents] = useState<StudentResponseDto[]>([]);

  // Filter States
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedTerm, setSelectedTerm] = useState<string>("");

  // Payment History Specific Filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedFeeId, setSelectedFeeId] = useState<string>("");
  const [paymentSearch, setPaymentSearch] = useState<string>("");

  // Expense Report Specific Filters
  const [selectedExpenseId, setSelectedExpenseId] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [expenseSearch, setExpenseSearch] = useState<string>("");

  // Report Data States
  const [summaryData, setSummaryData] = useState<SchoolFinancialSummaryProjection[]>([]);
  const [collectionData, setCollectionData] = useState<StudentFeeCollectionProjection[]>([]);
  const [paymentData, setPaymentData] = useState<StudentPaymentHistoryProjection[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseReportProjection[]>([]);

  // Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pagination for Detailed Tables
  const [paymentPage, setPaymentPage] = useState<number>(1);
  const [paymentPageSize, setPaymentPageSize] = useState<number>(10);

  const [expensePage, setExpensePage] = useState<number>(1);
  const [expensePageSize, setExpensePageSize] = useState<number>(10);

  // Load master data once
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [years, expenses, classes, fees, studs] = await Promise.all([
          academicYearService.getAllAcademicYears().catch(() => []),
          schoolExpenseService.getAllSchoolExpenses().catch(() => []),
          schoolClassService.getAllSchoolClasses().catch(() => []),
          schoolFeesService.getAllSchoolFees().catch(() => []),
          studentService.getAllStudents().catch(() => []),
        ]);

        setAcademicYears(years);
        setSchoolExpenses(expenses);
        setSchoolClasses(classes);
        setSchoolFees(fees);
        setStudents(studs);

        const activeYear = years.find((y) => y.academicYearStatus === "ACTIVE") || years[0];
        if (activeYear) {
          setSelectedYearId(activeYear.academicYearId);
        }
      } catch (err) {
        console.error("Error loading master filters:", err);
      }
    }
    loadMasterData();
  }, []);

  // Fetch report data according to current active tab and filters
  const fetchReportData = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === "summary") {
        if (!selectedYearId) {
          setSummaryData([]);
          setLoading(false);
          return;
        }
        const data = await financialReportService.getSchoolFinancialSummary(
          selectedYearId,
          selectedTerm ? (selectedTerm as ETerm) : undefined
        );
        setSummaryData(data || []);
      } else if (activeTab === "collection") {
        if (!selectedYearId) {
          setCollectionData([]);
          setLoading(false);
          return;
        }
        const data = await financialReportService.getStudentFeeCollectionReport(
          selectedYearId,
          selectedTerm ? (selectedTerm as ETerm) : undefined
        );
        setCollectionData(data || []);
      } else if (activeTab === "payments") {
        const data = await financialReportService.getStudentPaymentHistory({
          academicYearId: selectedYearId || undefined,
          term: selectedTerm ? (selectedTerm as ETerm) : undefined,
          studentId: selectedStudentId || undefined,
          studentLevel: selectedLevel ? (selectedLevel as ESchoolLevel) : undefined,
          schoolClassId: selectedClassId || undefined,
          schoolFeesId: selectedFeeId || undefined,
        });
        setPaymentData(data || []);
        setPaymentPage(1);
      } else if (activeTab === "expenses") {
        const data = await financialReportService.getExpenseReport({
          schoolExpenseId: selectedExpenseId || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
        });
        setExpenseData(data || []);
        setExpensePage(1);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch report data:", err);
      setErrorMsg(err instanceof Error ? err.message : "Failed to load financial report data.");
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    selectedYearId,
    selectedTerm,
    selectedStudentId,
    selectedLevel,
    selectedClassId,
    selectedFeeId,
    selectedExpenseId,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Overall KPI aggregates across active views
  const kpis = useMemo(() => {
    const summaryFeesCollected = summaryData.reduce((acc, curr) => acc + (curr.totalFeesCollected || 0), 0);
    const summaryOutstanding = summaryData.reduce((acc, curr) => acc + (curr.totalOutstanding || 0), 0);
    const summaryOverdue = summaryData.reduce((acc, curr) => acc + (curr.totalOverdue || 0), 0);
    const summaryStudents = summaryData.reduce((acc, curr) => acc + (Number(curr.studentCount) || 0), 0);

    const paymentTotal = paymentData.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
    const paymentOverused = paymentData.reduce((acc, curr) => acc + (curr.overpaymentAmountToUse || 0), 0);

    const expenseTotal = expenseData.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    return {
      totalCollected: summaryFeesCollected || paymentTotal,
      totalOutstanding: summaryOutstanding,
      totalOverdue: summaryOverdue,
      totalStudents: summaryStudents,
      totalExpenses: expenseTotal,
      paymentTotal,
      paymentOverused,
      netBalance: (summaryFeesCollected || paymentTotal) - expenseTotal,
    };
  }, [summaryData, paymentData, expenseData]);

  // Filtered payment history records with text search
  const filteredPayments = useMemo(() => {
    if (!paymentSearch.trim()) return paymentData;
    const q = paymentSearch.toLowerCase();
    return paymentData.filter((p) => {
      const studentFullName = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      const code = (p.studentCode || "").toLowerCase();
      const fiscal = (p.fiscalYear || "").toLowerCase();
      return studentFullName.includes(q) || code.includes(q) || fiscal.includes(q);
    });
  }, [paymentData, paymentSearch]);

  // Filtered expense records with text search
  const filteredExpenses = useMemo(() => {
    if (!expenseSearch.trim()) return expenseData;
    const q = expenseSearch.toLowerCase();
    return expenseData.filter((e) => {
      const name = (e.expenseName || "").toLowerCase();
      return name.includes(q);
    });
  }, [expenseData, expenseSearch]);

  // Paginated payments
  const paginatedPayments = useMemo(() => {
    const start = (paymentPage - 1) * paymentPageSize;
    return filteredPayments.slice(start, start + paymentPageSize);
  }, [filteredPayments, paymentPage, paymentPageSize]);

  const totalPaymentPages = Math.ceil(filteredPayments.length / paymentPageSize) || 1;

  // Paginated expenses
  const paginatedExpenses = useMemo(() => {
    const start = (expensePage - 1) * expensePageSize;
    return filteredExpenses.slice(start, start + expensePageSize);
  }, [filteredExpenses, expensePage, expensePageSize]);

  const totalExpensePages = Math.ceil(filteredExpenses.length / expensePageSize) || 1;

  // Selected academic year label
  const selectedYearLabel = useMemo(() => {
    const y = academicYears.find((item) => item.academicYearId === selectedYearId);
    return y ? y.fiscalYear : "Selected Academic Year";
  }, [academicYears, selectedYearId]);

  // Handle PDF Export
  const handleDownloadPdf = () => {
    let title = "Financial Report";
    let headers: string[][] = [];
    let body: (string | number)[][] = [];
    const periodStr = `${formatTerm(selectedTerm)} — ${selectedYearLabel}`;

    if (activeTab === "summary") {
      title = `School Financial Summary Report (${selectedYearLabel})`;
      headers = [["#", "Fiscal Year", "Term", "Student Count", "Total Fees Collected", "Total Outstanding", "Total Overdue"]];
      body = summaryData.map((row, idx) => [
        idx + 1,
        row.fiscalYear || "—",
        formatTerm(row.term),
        Number(row.studentCount) || 0,
        formatCurrency(row.totalFeesCollected),
        formatCurrency(row.totalOutstanding),
        formatCurrency(row.totalOverdue),
      ]);
    } else if (activeTab === "collection") {
      title = `Student Fee Collection Report (${selectedYearLabel})`;
      headers = [["#", "Fiscal Year", "Term", "Students Enrolled", "Total Amount Paid", "Total Outstanding", "Total Overdue"]];
      body = collectionData.map((row, idx) => [
        idx + 1,
        row.fiscalYear || "—",
        formatTerm(row.term),
        Number(row.studentCount) || 0,
        formatCurrency(row.totalAmountPaid),
        formatCurrency(row.totalOutstanding),
        formatCurrency(row.totalOverdue),
      ]);
    } else if (activeTab === "payments") {
      title = `Student Payment History Ledger`;
      headers = [["#", "Student Code", "Student Names", "Fiscal Year", "Term", "Level", "Paid Date", "Amount Paid", "Overpayment Used"]];
      body = filteredPayments.map((p, idx) => [
        idx + 1,
        p.studentCode || "—",
        `${p.firstName || ""} ${p.lastName || ""}`.trim() || "—",
        p.fiscalYear || "—",
        formatTerm(p.term),
        p.studentLevel || "—",
        formatDate(p.paidDate),
        formatCurrency(p.amountPaid),
        formatCurrency(p.overpaymentAmountToUse),
      ]);
    } else if (activeTab === "expenses") {
      title = `School Expense Report`;
      headers = [["#", "Expense Category / Name", "Payment Date", "Amount (RWF)"]];
      body = filteredExpenses.map((e, idx) => [
        idx + 1,
        e.expenseName || "—",
        formatDate(e.expenseDate),
        formatCurrency(e.amount),
      ]);
    }

    generateReportPdf({
      title,
      reportPeriod: periodStr,
      signatory: signatory || undefined,
      headers,
      body,
    });
  };

  // Handle CSV Export
  const handleExportCsv = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (activeTab === "summary") {
      const headers = ["Index", "Fiscal Year", "Term", "Student Count", "Total Fees Collected (RWF)", "Total Outstanding (RWF)", "Total Overdue (RWF)"];
      const rows = summaryData.map((s, i) => [
        i + 1,
        s.fiscalYear,
        formatTerm(s.term),
        Number(s.studentCount) || 0,
        s.totalFeesCollected || 0,
        s.totalOutstanding || 0,
        s.totalOverdue || 0,
      ]);
      exportCsv(`school_financial_summary_${timestamp}.csv`, headers, rows);
    } else if (activeTab === "collection") {
      const headers = ["Index", "Fiscal Year", "Term", "Student Count", "Total Paid (RWF)", "Total Outstanding (RWF)", "Total Overdue (RWF)"];
      const rows = collectionData.map((c, i) => [
        i + 1,
        c.fiscalYear,
        formatTerm(c.term),
        Number(c.studentCount) || 0,
        c.totalAmountPaid || 0,
        c.totalOutstanding || 0,
        c.totalOverdue || 0,
      ]);
      exportCsv(`student_fee_collection_${timestamp}.csv`, headers, rows);
    } else if (activeTab === "payments") {
      const headers = ["Index", "Student Code", "First Name", "Last Name", "Academic Year", "Term", "Level", "Paid Date", "Amount Paid (RWF)", "Overpayment Used (RWF)"];
      const rows = filteredPayments.map((p, i) => [
        i + 1,
        p.studentCode,
        p.firstName,
        p.lastName,
        p.fiscalYear,
        p.term,
        p.studentLevel,
        p.paidDate,
        p.amountPaid,
        p.overpaymentAmountToUse,
      ]);
      exportCsv(`student_payment_history_${timestamp}.csv`, headers, rows);
    } else if (activeTab === "expenses") {
      const headers = ["Index", "Expense Name", "Expense Date", "Amount (RWF)"];
      const rows = filteredExpenses.map((e, i) => [
        i + 1,
        e.expenseName,
        e.expenseDate,
        e.amount,
      ]);
      exportCsv(`expense_report_${timestamp}.csv`, headers, rows);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Financial Report" description="Institutional financial summary, fee collections, payment ledger, and operational expenses." />

      <div className="space-y-6">
        {/* Page Title & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Financial Report
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              School revenue audit, fee collections tracking, payment history, and operational expenditures.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCsv}
              className="h-10 px-4 text-xs font-medium"
              disabled={loading}
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="primary"
              startIcon={<DownloadIcon className="size-4" />}
              onClick={handleDownloadPdf}
              className="h-10 px-4 text-xs font-medium"
              disabled={loading}
            >
              Download PDF Report
            </Button>
          </div>
        </div>

        {/* Global Financial KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Fees Collected */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white p-5 shadow-theme-xs transition-all hover:shadow-theme-md dark:border-emerald-950/40 dark:from-emerald-950/20 dark:via-gray-900 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Total Fees Collected
              </span>
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-100">
              {formatCurrency(kpis.totalCollected)}
            </div> 
          </div>

          {/* Card 2: Total Outstanding */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-white p-5 shadow-theme-xs transition-all hover:shadow-theme-md dark:border-amber-950/40 dark:from-amber-950/20 dark:via-gray-900 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Outstanding Balance
              </span>
              <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-100">
              {formatCurrency(kpis.totalOutstanding)}
            </div> 
          </div>

          {/* Card 3: Overdue Amount */}
          <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-white p-5 shadow-theme-xs transition-all hover:shadow-theme-md dark:border-rose-950/40 dark:from-rose-950/20 dark:via-gray-900 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Total Overdue
              </span>
              <span className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-rose-900 dark:text-rose-100">
              {formatCurrency(kpis.totalOverdue)}
            </div> 
          </div>

          {/* Card 4: Operational Expenses */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-white p-5 shadow-theme-xs transition-all hover:shadow-theme-md dark:border-indigo-950/40 dark:from-indigo-950/20 dark:via-gray-900 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Operational Expenses
              </span>
              <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-indigo-900 dark:text-indigo-100">
              {formatCurrency(kpis.totalExpenses)}
            </div> 
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap gap-1 rounded-2xl border border-gray-200 bg-gray-50/70 p-1.5 dark:border-gray-800 dark:bg-gray-900/60 w-fit max-w-full">
          {TAB_CONFIG.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-white text-brand-600 shadow-theme-xs dark:bg-gray-800 dark:text-brand-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Dynamic Filters Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Filter Parameters
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Refine dataset queries for {TAB_CONFIG.find((t) => t.key === activeTab)?.label}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedTerm("");
                setSelectedStudentId("");
                setSelectedLevel("");
                setSelectedClassId("");
                setSelectedFeeId("");
                setPaymentSearch("");
                setSelectedExpenseId("");
                setFromDate("");
                setToDate("");
                setExpenseSearch("");
              }}
              className="text-xs font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Reset Filters
            </button>
          </div>

          {/* Conditional filter inputs depending on activeTab */}
          {(activeTab === "summary" || activeTab === "collection") && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  Academic Year <span className="text-red-500">*</span>
                </label>
                <select
                  className={SELECT_CLASS}
                  value={selectedYearId}
                  onChange={(e) => setSelectedYearId(e.target.value)}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((y) => (
                    <option key={y.academicYearId} value={y.academicYearId}>
                      {y.fiscalYear} {y.academicYearStatus === "ACTIVE" ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                  School Term
                </label>
                <select
                  className={SELECT_CLASS}
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                >
                  {TERMS.map((t) => (
                    <option key={t.value || "all"} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchReportData}
                  className="h-11 w-full justify-center"
                  disabled={loading || !selectedYearId}
                >
                  {loading ? "Refreshing..." : "Apply Filters"}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Academic Year
                  </label>
                  <select
                    className={SELECT_CLASS}
                    value={selectedYearId}
                    onChange={(e) => setSelectedYearId(e.target.value)}
                  >
                    <option value="">All Academic Years</option>
                    {academicYears.map((y) => (
                      <option key={y.academicYearId} value={y.academicYearId}>
                        {y.fiscalYear}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Term
                  </label>
                  <select
                    className={SELECT_CLASS}
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                  >
                    {TERMS.map((t) => (
                      <option key={t.value || "all"} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Student Level
                  </label>
                  <select
                    className={SELECT_CLASS}
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    {LEVELS.map((l) => (
                      <option key={l.value || "all"} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Class
                  </label>
                  <select
                    className={SELECT_CLASS}
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                  >
                    <option value="">All Classes</option>
                    {schoolClasses.map((c) => (
                      <option key={c.schoolClassId} value={c.schoolClassId}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Student
                  </label>
                  <select
                    className={SELECT_CLASS}
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                  >
                    <option value="">All Students</option>
                    {students.map((s) => (
                      <option key={s.studentId} value={s.studentId}>
                        {s.studentCode} - {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    School Fee
                  </label>
                  <select
                    className={SELECT_CLASS}
                    value={selectedFeeId}
                    onChange={(e) => setSelectedFeeId(e.target.value)}
                  >
                    <option value="">All Fee Structures</option>
                    {schoolFees.map((f) => (
                      <option key={f.schoolFeesId} value={f.schoolFeesId}>
                        {f.fiscalYear} (P: {formatCurrency(f.primaryFees)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Text Search Bar for Payments */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <Input
                    type="text"
                    placeholder="Search by student code or name..."
                    value={paymentSearch}
                    onChange={(e) => {
                      setPaymentSearch(e.target.value);
                      setPaymentPage(1);
                    }}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {filteredPayments.length} matching transaction record(s)
                </div>
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Expense Category
                  </label>
                  <select
                    className={SELECT_CLASS}
                    value={selectedExpenseId}
                    onChange={(e) => setSelectedExpenseId(e.target.value)}
                  >
                    <option value="">All Expense Categories</option>
                    {schoolExpenses.map((exp) => (
                      <option key={exp.schoolExpenseId} value={exp.schoolExpenseId}>
                        {exp.expenseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-11 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-11 text-sm"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchReportData}
                    className="h-11 w-full justify-center"
                    disabled={loading}
                  >
                    {loading ? "Refreshing..." : "Apply Range"}
                  </Button>
                </div>
              </div>

              {/* Text Search Bar for Expenses */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-md">
                  <Input
                    type="text"
                    placeholder="Search by expense title..."
                    value={expenseSearch}
                    onChange={(e) => {
                      setExpenseSearch(e.target.value);
                      setExpensePage(1);
                    }}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Showing {filteredExpenses.length} matching expense record(s)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-16 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="size-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
              Retrieving financial intelligence data...
            </p>
          </div>
        ) : (
          <>
            {/* ==================== TAB 1: SCHOOL FINANCIAL SUMMARY ==================== */}
            {activeTab === "summary" && (
              <ComponentCard
                title={`School Financial Summary  ${selectedYearLabel}`}
                desc="Institutional fee totals aggregated by academic term."
                titleClassName="text-lg font-bold"
              >
                {!selectedYearId ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    Please select an Academic Year to load the financial summary.
                  </div>
                ) : summaryData.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No financial summary records found for {selectedYearLabel}{" "}
                    {selectedTerm ? `(${formatTerm(selectedTerm)})` : ""}.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                      <Table>
                        <TableHeader className="border-b border-gray-100 bg-gray-50/70 dark:border-white/[0.05] dark:bg-gray-800/40">
                          <TableRow>
                            <TableCell isHeader className={HDR_CLASS}>#</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Academic Year</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Term</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Students</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Fees Collected</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Total Outstanding</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Total Overdue</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Collection Rate</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {summaryData.map((row, idx) => {
                            const totalExpected = (row.totalFeesCollected || 0) + (row.totalOutstanding || 0);
                            const collectionRate = totalExpected > 0 ? Math.round(((row.totalFeesCollected || 0) / totalExpected) * 100) : 0;
                            return (
                              <TableRow key={`${row.academicYearId}-${row.term || idx}`} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                                <TableCell className={CEL_CLASS}>{idx + 1}</TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {row.fiscalYear || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <Badge
                                    size="sm"
                                    color={row.term === "TERM1" ? "primary" : row.term === "TERM2" ? "info" : "success"}
                                  >
                                    {formatTerm(row.term)}
                                  </Badge>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="inline-flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                                    <svg className="size-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    {Number(row.studentCount) || 0}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(row.totalFeesCollected)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-medium text-amber-600 dark:text-amber-400">
                                    {formatCurrency(row.totalOutstanding)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-medium text-rose-600 dark:text-rose-400">
                                    {formatCurrency(row.totalOverdue)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <div className="flex items-center gap-2 min-w-[120px]">
                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                      <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          collectionRate >= 80 ? "bg-emerald-500" : collectionRate >= 50 ? "bg-amber-500" : "bg-rose-500"
                                        }`}
                                        style={{ width: `${Math.min(100, collectionRate)}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                      {collectionRate}%
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Summary Total Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-white/[0.05] dark:bg-gray-900/30">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {summaryData.length} term record(s) calculated
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total Collected: </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(summaryData.reduce((acc, c) => acc + (c.totalFeesCollected || 0), 0))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total Outstanding: </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(summaryData.reduce((acc, c) => acc + (c.totalOutstanding || 0), 0))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total Overdue: </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(summaryData.reduce((acc, c) => acc + (c.totalOverdue || 0), 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ComponentCard>
            )}

            {/* ==================== TAB 2: STUDENT FEE COLLECTION ==================== */}
            {activeTab === "collection" && (
              <ComponentCard
                title={`Student Fee Collection — ${selectedYearLabel}`}
                desc="Tracking student fee compliance and payment recovery."
                titleClassName="text-lg font-bold"
              >
                {!selectedYearId ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    Please select an Academic Year to view student fee collections.
                  </div>
                ) : collectionData.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No fee collection records found for {selectedYearLabel}{" "}
                    {selectedTerm ? `(${formatTerm(selectedTerm)})` : ""}.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                      <Table>
                        <TableHeader className="border-b border-gray-100 bg-gray-50/70 dark:border-white/[0.05] dark:bg-gray-800/40">
                          <TableRow>
                            <TableCell isHeader className={HDR_CLASS}>#</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Fiscal Year</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Term</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Student Count</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Amount Paid</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Outstanding</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Overdue</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Status</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {collectionData.map((row, idx) => {
                            const isFullyPaid = (row.totalOutstanding || 0) === 0;
                            return (
                              <TableRow key={`${row.academicYearId}-${row.term || idx}`} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                                <TableCell className={CEL_CLASS}>{idx + 1}</TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {row.fiscalYear || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <Badge
                                    size="sm"
                                    color={row.term === "TERM1" ? "primary" : row.term === "TERM2" ? "info" : "success"}
                                  >
                                    {formatTerm(row.term)}
                                  </Badge>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {Number(row.studentCount) || 0} students
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(row.totalAmountPaid)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-medium text-amber-600 dark:text-amber-400">
                                    {formatCurrency(row.totalOutstanding)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-medium text-rose-600 dark:text-rose-400">
                                    {formatCurrency(row.totalOverdue)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  {isFullyPaid ? (
                                    <Badge size="sm" color="success">Settled</Badge>
                                  ) : (row.totalOverdue || 0) > 0 ? (
                                    <Badge size="sm" color="error">Has Overdue</Badge>
                                  ) : (
                                    <Badge size="sm" color="warning">Pending</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Collection Summary Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 dark:border-white/[0.05] dark:bg-gray-900/30">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {collectionData.length} collection group(s)
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total Paid: </span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(collectionData.reduce((acc, c) => acc + (c.totalAmountPaid || 0), 0))}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Total Remaining: </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(collectionData.reduce((acc, c) => acc + (c.totalOutstanding || 0), 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ComponentCard>
            )}

            {/* ==================== TAB 3: STUDENT PAYMENT HISTORY ==================== */}
            {activeTab === "payments" && (
              <ComponentCard
                title="Student Payment History Ledger"
                desc="Itemized transaction log of all recorded fee installments."
                titleClassName="text-lg font-bold"
              >
                {filteredPayments.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No payment history transactions match the active criteria.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                      <Table>
                        <TableHeader className="border-b border-gray-100 bg-gray-50/70 dark:border-white/[0.05] dark:bg-gray-800/40">
                          <TableRow>
                            <TableCell isHeader className={HDR_CLASS}>#</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Student Code</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Student Names</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Fiscal Year</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Term</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Level</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Paid Date</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Amount Paid</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Overpayment Used</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {paginatedPayments.map((p, idx) => {
                            const globalIdx = (paymentPage - 1) * paymentPageSize + idx + 1;
                            return (
                              <TableRow key={p.paymentDetailId || idx} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                                <TableCell className={CEL_CLASS}>{globalIdx}</TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">
                                    {p.studentCode || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {p.firstName} {p.lastName}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {p.fiscalYear || "—"}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <Badge size="sm" color={p.term === "TERM1" ? "primary" : p.term === "TERM2" ? "info" : "success"}>
                                    {formatTerm(p.term)}
                                  </Badge>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <Badge size="sm" color={p.studentLevel === "PRIMARY" ? "light" : "warning"}>
                                    {p.studentLevel || "—"}
                                  </Badge>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {formatDate(p.paidDate)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(p.amountPaid)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {formatCurrency(p.overpaymentAmountToUse)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Bar */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-3.5 sm:flex-row dark:border-white/[0.05] dark:bg-gray-900/30">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Rows per page:</span>
                        <select
                          className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          value={paymentPageSize}
                          onChange={(e) => {
                            setPaymentPageSize(Number(e.target.value));
                            setPaymentPage(1);
                          }}
                        >
                          {[10, 20, 50, 100].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span>
                          Showing {(paymentPage - 1) * paymentPageSize + 1} to{" "}
                          {Math.min(paymentPage * paymentPageSize, filteredPayments.length)} of{" "}
                          {filteredPayments.length} entries
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          disabled={paymentPage === 1}
                          onClick={() => setPaymentPage((prev) => Math.max(1, prev - 1))}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          Previous
                        </button>
                        <span className="px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                          Page {paymentPage} of {totalPaymentPages}
                        </span>
                        <button
                          disabled={paymentPage >= totalPaymentPages}
                          onClick={() => setPaymentPage((prev) => Math.min(totalPaymentPages, prev + 1))}
                          className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </ComponentCard>
            )}

            {/* ==================== TAB 4: EXPENSE REPORT ==================== */}
            {activeTab === "expenses" && (
              <ComponentCard
                title="School Expense Report"
                desc="Itemized expenditure records and category disbursement ledger."
                titleClassName="text-lg font-bold"
              >
                {filteredExpenses.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">
                    No expense records match the specified date range or search filter.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="max-w-full overflow-x-auto">
                      <Table>
                        <TableHeader className="border-b border-gray-100 bg-gray-50/70 dark:border-white/[0.05] dark:bg-gray-800/40">
                          <TableRow>
                            <TableCell isHeader className={HDR_CLASS}>#</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Expense Category / Title</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Payment Date</TableCell>
                            <TableCell isHeader className={HDR_CLASS}>Amount Paid</TableCell>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                          {paginatedExpenses.map((exp, idx) => {
                            const globalIdx = (expensePage - 1) * expensePageSize + idx + 1;
                            return (
                              <TableRow key={exp.id || idx} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02]">
                                <TableCell className={CEL_CLASS}>{globalIdx}</TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <div className="flex items-center gap-2">
                                    <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                    </span>
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {exp.expenseName || "General Expense"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {formatDate(exp.expenseDate)}
                                  </span>
                                </TableCell>
                                <TableCell className={CEL_CLASS}>
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(exp.amount)}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination and Total Outflow Footer */}
                    <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-3.5 sm:flex-row dark:border-white/[0.05] dark:bg-gray-900/30">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Rows per page:</span>
                        <select
                          className="h-8 rounded-md border border-gray-300 bg-white px-2 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          value={expensePageSize}
                          onChange={(e) => {
                            setExpensePageSize(Number(e.target.value));
                            setExpensePage(1);
                          }}
                        >
                          {[10, 20, 50, 100].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span>
                          Showing {(expensePage - 1) * expensePageSize + 1} to{" "}
                          {Math.min(expensePage * expensePageSize, filteredExpenses.length)} of{" "}
                          {filteredExpenses.length} entries
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Total Outflow: </span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {formatCurrency(filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={expensePage === 1}
                            onClick={() => setExpensePage((prev) => Math.max(1, prev - 1))}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            Previous
                          </button>
                          <span className="px-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                            Page {expensePage} of {totalExpensePages}
                          </span>
                          <button
                            disabled={expensePage >= totalExpensePages}
                            onClick={() => setExpensePage((prev) => Math.min(totalExpensePages, prev + 1))}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-gray-300 px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </ComponentCard>
            )}

            {signatory && (
              <PageSignatureBlock
                name={signatory.name}
                role={signatory.role}
                signatureUrl={signatory.signatureUrl}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}
