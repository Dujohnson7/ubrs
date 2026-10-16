import { useState, useEffect, useMemo } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router";
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
  UserCircleIcon,
  AlertHexaIcon,
} from "../../icons";
import { generateReportPdf } from "../../utils/pdfExport";
import { toast } from "../../utils/toast";

export default function ParentSchoolFeesBreakdown() {
  const { studentId } = useParams<{ studentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const passedRecord = location.state?.item as ParentStudentPaymentHistoryProjection | undefined;

  const [paymentRecords, setPaymentRecords] = useState<StudentFeePaymentsResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFeeRecordId, setSelectedFeeRecordId] = useState<string>("ALL");

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
    const loadStudentFeeDetails = async () => {
      const targetStudentId = studentId || passedRecord?.studentId;
      if (!targetStudentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const records = await studentFeePaymentService.getAllStudentFeePaymentsByStudentId(targetStudentId);
        setPaymentRecords(records || []);

        if (passedRecord?.schoolFeesId && records.some((r) => r.schoolFees?.schoolFeesId === passedRecord.schoolFeesId)) {
          setSelectedFeeRecordId(passedRecord.schoolFeesId);
        } else if (records.length > 0) {
          setSelectedFeeRecordId(records[0].studentFeePaymentsId || "ALL");
        }
      } catch (err) {
        console.error("Failed to load student fee breakdown", err);
        toast.error("Unable to load fee breakdown details.");
        setPaymentRecords([]);
      } finally {
        setLoading(false);
      }
    };

    void loadStudentFeeDetails();
  }, [studentId, passedRecord?.studentId, passedRecord?.schoolFeesId]);

  // Active or selected payment record
  const displayedRecords = useMemo(() => {
    if (selectedFeeRecordId === "ALL") return paymentRecords;
    return paymentRecords.filter(
      (r) => r.studentFeePaymentsId === selectedFeeRecordId || r.schoolFees?.schoolFeesId === selectedFeeRecordId
    );
  }, [paymentRecords, selectedFeeRecordId]);

  // Overall student summary calculations
  const studentSummary = useMemo(() => {
    const studentName = passedRecord
      ? `${passedRecord.firstName || ""} ${passedRecord.lastName || ""}`.trim()
      : paymentRecords[0]?.studentName || "Student";
    const studentCode = passedRecord?.studentCode || paymentRecords[0]?.studentCode || "—";

    let totalPaid = 0;
    let totalRemaining = 0;
    let totalOverdue = 0;
    let totalRequired = 0;

    for (const r of paymentRecords) {
      totalPaid += r.totalAmountPaid || 0;
      totalRemaining += r.remainAmount || 0;
      totalOverdue += r.overDueAmount || 0;
      const targetFee =
        r.studentLevel === "NURSERY"
          ? r.schoolFees?.nurseryFees || 0
          : r.schoolFees?.primaryFees || 0;
      totalRequired += targetFee > 0 ? targetFee : (r.totalAmountPaid || 0) + (r.remainAmount || 0);
    }

    if (paymentRecords.length === 0 && passedRecord) {
      totalPaid = passedRecord.totalAmountPaid || 0;
      totalRemaining = passedRecord.remainAmount || 0;
      totalRequired = totalPaid + totalRemaining;
    }

    const percentage = totalRequired > 0 ? Math.min(100, Math.round((totalPaid / totalRequired) * 100)) : 0;

    return {
      studentName,
      studentCode,
      totalPaid,
      totalRemaining,
      totalOverdue,
      totalRequired,
      percentage,
    };
  }, [paymentRecords, passedRecord]);

  // PDF Export for this student
  const handleExportStatement = () => {
    if (paymentRecords.length === 0 && !passedRecord) {
      toast.error("No fee details to export.");
      return;
    }

    const headers = [["#", "Academic Year", "Term", "Installment Date", "Amount Paid (RWF)", "Status"]];
    const body: (string | number)[][] = [];

    let rowIdx = 1;
    paymentRecords.forEach((record) => {
      const year = record.schoolFees?.fiscalYear || "—";
      const term = formatTermLabel(record.term);
      const status = record.paymentStatus || "—";

      if (record.studentFeePaymentsDetails && record.studentFeePaymentsDetails.length > 0) {
        record.studentFeePaymentsDetails.forEach((inst) => {
          body.push([
            rowIdx++,
            year,
            term,
            formatDate(inst.paidDate),
            formatCurrency(inst.amountPaid),
            status,
          ]);
        });
      } else {
        body.push([
          rowIdx++,
          year,
          term,
          "—",
          formatCurrency(record.totalAmountPaid),
          status,
        ]);
      }
    });

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
                Payment history and installment ledger for {studentSummary.studentName}
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    ID: {studentSummary.studentCode}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Parent: {user?.names || "Guardian"}</span>
                  {passedRecord?.fiscalYear ? (
                    <>
                      <span>•</span>
                      <span>Academic Year: {passedRecord.fiscalYear}</span>
                    </>
                  ) : null}
                  {passedRecord?.term ? (
                    <>
                      <span>•</span>
                      <span>{formatTermLabel(passedRecord.term)}</span>
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
                <div className={`text-sm font-bold mt-0.5 ${studentSummary.totalRemaining > 0 ? "text-red-500 dark:text-red-400" : "text-gray-700 dark:text-gray-300"}`}>
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

        {/* Detailed Fee Payment Blocks */}
        {loading ? (
          <ComponentCard>
            <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
              Loading fee payment records...
            </div>
          </ComponentCard>
        ) : paymentRecords.length === 0 ? (
          <ComponentCard>
            <div className="py-12 text-center">
              <DollarLineIcon className="mx-auto w-10 h-10 text-gray-400 dark:text-gray-600 mb-2" />
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                No installment transactions recorded yet
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Payment history will appear here once installment payments are processed by the school accountant.
              </p>
            </div>
          </ComponentCard>
        ) : (
          <div className="space-y-6">
            {paymentRecords.map((paymentItem, pIdx) => {
              const targetAmount =
                paymentItem.studentLevel === "NURSERY"
                  ? paymentItem.schoolFees?.nurseryFees || 0
                  : paymentItem.schoolFees?.primaryFees || 0;

              return (
                <ComponentCard
                  key={paymentItem.studentFeePaymentsId || pIdx}
                  title={`${paymentItem.schoolFees?.fiscalYear || "Academic Year"} — ${formatTermLabel(paymentItem.term)}`}
                  desc={`Level: ${paymentItem.studentLevel || "Primary"} · School Fee: ${formatCurrency(targetAmount)}`}
                >
                  <div className="space-y-5">
                    {/* Fee Summary Banner */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide block">
                          Term Fee
                        </span>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {formatCurrency(targetAmount || paymentItem.totalAmountPaid + paymentItem.remainAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide block">
                          Amount Paid
                        </span>
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(paymentItem.totalAmountPaid)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide block">
                          Remaining
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            paymentItem.remainAmount > 0
                              ? "text-red-500 dark:text-red-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {formatCurrency(paymentItem.remainAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide block mb-1">
                          Status
                        </span>
                        <Badge
                          color={
                            paymentItem.paymentStatus === "PAID"
                              ? "success"
                              : paymentItem.paymentStatus === "PARTIAL"
                              ? "warning"
                              : "error"
                          }
                        >
                          {paymentItem.paymentStatus}
                        </Badge>
                      </div>
                    </div>

                    {/* Installments Table */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 dark:text-white/90 mb-3 flex items-center gap-2">
                        <span>Installment History</span>
                        <span className="text-xs font-normal text-gray-500">
                          ({paymentItem.studentFeePaymentsDetails?.length || 0} transactions)
                        </span>
                      </h4>

                      {paymentItem.studentFeePaymentsDetails &&
                      paymentItem.studentFeePaymentsDetails.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50/80 dark:bg-gray-800/50">
                                <TableCell isHeader className="w-16">#</TableCell>
                                <TableCell isHeader>Transaction Date</TableCell>
                                <TableCell isHeader>Receipt Reference</TableCell>
                                <TableCell isHeader className="text-right">Amount Paid</TableCell>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paymentItem.studentFeePaymentsDetails.map((inst, instIdx) => (
                                <TableRow key={inst.studentFeePaymentsDetailId || instIdx}>
                                  <TableCell className="text-gray-500 font-medium">
                                    {instIdx + 1}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200">
                                      <CalenderIcon className="w-4 h-4 text-gray-400" />
                                      {formatDate(inst.paidDate)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                      {inst.studentFeePaymentsDetailId ? inst.studentFeePaymentsDetailId.slice(0, 8).toUpperCase() : "INST-" + (instIdx + 1)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-bold text-green-600 dark:text-green-400">
                                      {formatCurrency(inst.amountPaid)}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 italic">
                          No installment records breakdown available for this fee entry.
                        </div>
                      )}
                    </div>
                  </div>
                </ComponentCard>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
