import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useAuth } from "../../hooks/useAuth";
import {
  studentFeePaymentService,
  StudentFeePaymentsResponseDto,
  ParentStudentPaymentHistoryProjection,
} from "../../services/studentFeePaymentService";
import {
  ChevronLeftIcon,
  DollarLineIcon,
  CheckCircleIcon,
  DownloadIcon,
  CalenderIcon,
} from "../../icons";
import { generateReportPdf } from "../../utils/pdfExport";
import { toast } from "../../utils/toast";

export default function ParentSchoolFeesBreakdown() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const itemFromState = location.state?.item as ParentStudentPaymentHistoryProjection | undefined;
  const passedStudentId = location.state?.studentId || itemFromState?.studentId;

  // Retrieve student record from state or cached in sessionStorage (no ID in URL)
  const [selectedRecord, setSelectedRecord] = useState<ParentStudentPaymentHistoryProjection | null>(() => {
    if (itemFromState) {
      sessionStorage.setItem("parent_selected_fee_breakdown", JSON.stringify(itemFromState));
      return itemFromState;
    }
    const cached = sessionStorage.getItem("parent_selected_fee_breakdown");
    return cached ? JSON.parse(cached) : null;
  });

  const [paymentRecords, setPaymentRecords] = useState<StudentFeePaymentsResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formatCurrency = (amount?: number | null) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
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

  useEffect(() => {
    const targetStudentId = selectedRecord?.studentId || passedStudentId;
    if (!targetStudentId) {
      setLoading(false);
      return;
    }

    const loadStudentFeeDetails = async () => {
      setLoading(true);
      try {
        const records = await studentFeePaymentService.getAllStudentFeePaymentsByStudentId(targetStudentId);
        setPaymentRecords(records || []);
      } catch (err) {
        console.error("Failed to load student fee breakdown", err);
        toast.error("Unable to load fee breakdown details.");
        setPaymentRecords([]);
      } finally {
        setLoading(false);
      }
    };

    void loadStudentFeeDetails();
  }, [selectedRecord?.studentId, passedStudentId]);

  // Overall student summary
  const studentSummary = useMemo(() => {
    const studentName = selectedRecord
      ? `${selectedRecord.firstName || ""} ${selectedRecord.lastName || ""}`.trim()
      : paymentRecords[0]?.studentName || "Student";
    const studentCode = selectedRecord?.studentCode || paymentRecords[0]?.studentCode || "—";

    let totalPaid = 0;
    let totalRemaining = 0;
    let totalRequired = 0;

    for (const r of paymentRecords) {
      totalPaid += r.totalAmountPaid || 0;
      totalRemaining += r.remainAmount || 0;
      const targetFee =
        r.studentLevel === "NURSERY"
          ? r.schoolFees?.nurseryFees || 0
          : r.schoolFees?.primaryFees || 0;
      totalRequired += targetFee > 0 ? targetFee : (r.totalAmountPaid || 0) + (r.remainAmount || 0);
    }

    if (paymentRecords.length === 0 && selectedRecord) {
      totalPaid = selectedRecord.totalAmountPaid || 0;
      totalRemaining = selectedRecord.remainAmount || 0;
      totalRequired = totalPaid + totalRemaining;
    }

    const percentage = totalRequired > 0 ? Math.min(100, Math.round((totalPaid / totalRequired) * 100)) : 0;

    return {
      studentName,
      studentCode,
      totalPaid,
      totalRemaining,
      totalRequired,
      percentage,
    };
  }, [paymentRecords, selectedRecord]);

  // Flat list of all installment transactions
  const allInstallments = useMemo(() => {
    const list: Array<{
      id: string;
      fiscalYear: string;
      term: string;
      paidDate: string;
      amountPaid: number;
      paymentStatus: string;
    }> = [];

    paymentRecords.forEach((item) => {
      const year = item.schoolFees?.fiscalYear || "—";
      const term = formatTermLabel(item.term);
      const status = item.paymentStatus || "—";

      if (item.studentFeePaymentsDetails && item.studentFeePaymentsDetails.length > 0) {
        item.studentFeePaymentsDetails.forEach((inst, iIdx) => {
          list.push({
            id: inst.studentFeePaymentsDetailId || `${item.studentFeePaymentsId}-${iIdx}`,
            fiscalYear: year,
            term,
            paidDate: inst.paidDate,
            amountPaid: inst.amountPaid,
            paymentStatus: status,
          });
        });
      }
    });

    return list;
  }, [paymentRecords]);

  // PDF Export for this student
  const handleExportStatement = () => {
    if (paymentRecords.length === 0 && !selectedRecord) {
      toast.error("No fee details to export.");
      return;
    }

    const headers = [["#", "Academic Year", "Term", "Installment Date", "Amount Paid (RWF)", "Status"]];
    const body: (string | number)[][] = [];

    let rowIdx = 1;
    if (allInstallments.length > 0) {
      allInstallments.forEach((inst) => {
        body.push([
          rowIdx++,
          inst.fiscalYear,
          inst.term,
          formatDate(inst.paidDate),
          formatCurrency(inst.amountPaid),
          inst.paymentStatus,
        ]);
      });
    } else {
      paymentRecords.forEach((record) => {
        body.push([
          rowIdx++,
          record.schoolFees?.fiscalYear || "—",
          formatTermLabel(record.term),
          "—",
          formatCurrency(record.totalAmountPaid),
          record.paymentStatus || "—",
        ]);
      });
    }

    generateReportPdf({
      title: `Fee Breakdown & Installments Statement - ${studentSummary.studentName}`,
      reportPeriod: `Student ID: ${studentSummary.studentCode}`,
      preparedBy: user?.names || "Parent",
      headers,
      body,
    });
  };

  return (
    <>
      <PageMeta
        title={`Ubrs — Fee Breakdown: ${studentSummary.studentName}`}
        description="Detailed view of school fee installments and payment records."
      />

      <div className="space-y-6">
        {/* Top Back Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/parent/school-fees"
              className="inline-flex size-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
                Fee Breakdown & Installments
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Installment ledger and fee settlement records for {studentSummary.studentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportStatement}
              variant="outline"
              size="sm"
              className="inline-flex items-center gap-2"
            >
              <DownloadIcon className="w-4 h-4" />
              Download Statement
            </Button>
          </div>
        </div>

        {/* Student Profile & Overview Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 flex items-center justify-center text-xl font-bold border border-brand-100 dark:border-brand-900/40">
                {studentSummary.studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {studentSummary.studentName}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    ID: {studentSummary.studentCode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Parent: {user?.names || "Guardian"}</span>
                  {selectedRecord?.fiscalYear ? (
                    <>
                      <span>•</span>
                      <span>Academic Year: {selectedRecord.fiscalYear}</span>
                    </>
                  ) : null}
                  {selectedRecord?.term ? (
                    <>
                      <span>•</span>
                      <span>{formatTermLabel(selectedRecord.term)}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:border-l md:border-gray-100 md:dark:border-gray-800 md:pl-6">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Total Paid</span>
                <div className="text-sm font-bold text-green-600 dark:text-green-400 mt-0.5">
                  {formatCurrency(studentSummary.totalPaid)}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Remaining</span>
                <div
                  className={`text-sm font-bold mt-0.5 ${
                    studentSummary.totalRemaining > 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {formatCurrency(studentSummary.totalRemaining)}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 p-3 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Paid Ratio</span>
                <div className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                  {studentSummary.percentage}%
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-gray-600 dark:text-gray-300">Overall Fee Settlement Progress</span>
              <span className="text-brand-600 dark:text-brand-400 font-bold">{studentSummary.percentage}% Cleared</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  studentSummary.percentage >= 100
                    ? "bg-green-500"
                    : studentSummary.percentage >= 50
                    ? "bg-brand-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${studentSummary.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Table 1: School Fee Terms Summary */}
        <ComponentCard title="Fee Terms Summary">
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <TableCell isHeader className="w-12 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Academic Year</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Term</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">School Level</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Required Fee</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Total Paid</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Remaining</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                      Loading fee summary...
                    </TableCell>
                  </TableRow>
                ) : paymentRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                      No fee payment records found for this student.
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentRecords.map((item, idx) => {
                    const targetAmount =
                      item.studentLevel === "NURSERY"
                        ? item.schoolFees?.nurseryFees || 0
                        : item.schoolFees?.primaryFees || 0;
                    const isFullyPaid = item.paymentStatus === "PAID" || (item.remainAmount || 0) <= 0;

                    return (
                      <TableRow key={item.studentFeePaymentsId || idx} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02]">
                        <TableCell className="text-center text-xs text-gray-400 font-medium">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400"> 
                            {item.schoolFees?.fiscalYear || "—"} 
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                           {formatTermLabel(item.term)}  
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                           {item.studentLevel || "Primary"} 
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                            {formatCurrency(targetAmount || item.totalAmountPaid + item.remainAmount)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400"> 
                            {formatCurrency(item.totalAmountPaid)} 
                        </TableCell> 
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              Settled
                            </span>
                          ) : (
                            <span className="font-bold text-red-500 dark:text-red-400 text-sm">
                              {formatCurrency(item.remainAmount)}
                            </span>
                          )}
                        </TableCell>
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
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>

        {/* Table 2: Installment Transactions Ledger Table */}
        <ComponentCard title="Installment Payment Ledger">
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <TableCell isHeader className="w-12 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">#</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Academic Year & Term</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Payment Date</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Receipt / Transaction Ref</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Amount Paid</TableCell>
                  <TableCell  isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
                      Loading installments...
                    </TableCell>
                  </TableRow>
                ) : allInstallments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
                      <DollarLineIcon className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        No installment transactions recorded yet
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Once installment payments are received and recorded by the accountant, they will appear in this ledger.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  allInstallments.map((inst, idx) => (
                    <TableRow key={inst.id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02]">
                      <TableCell className="text-center text-xs text-gray-400 font-medium">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <div className="font-semibold text-gray-900 dark:text-white text-xs">
                          {inst.fiscalYear} • {inst.term}
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">  
                          {formatDate(inst.paidDate)} 
                      </TableCell>
                      <TableCell  className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400"> 
                          {inst.id.slice(0, 8).toUpperCase()} 
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400"> 
                          {formatCurrency(inst.amountPaid)} 
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        <Badge
                          color={
                            inst.paymentStatus === "PAID"
                              ? "success"
                              : inst.paymentStatus === "PARTIAL"
                              ? "warning"
                              : "error"
                          }
                        >
                          {inst.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
