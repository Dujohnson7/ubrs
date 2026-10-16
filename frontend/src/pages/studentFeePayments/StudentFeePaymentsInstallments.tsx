import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useSearchParams, useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { toast } from "../../utils/toast";
import {
  ChevronLeftIcon,
  PencilIcon,
  DollarLineIcon,
  CheckCircleIcon,
  CalenderIcon,
  UserIcon,
} from "../../icons";
import {
  studentFeePaymentService,
  StudentFeePaymentsResponseDto,
  EPaymentState,
} from "../../services/studentFeePaymentService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function StudentFeePaymentsInstallments() {
  const { canManageFinance } = useRoleAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const params = useParams<{ id: string }>();

  const itemFromState = location.state?.item as StudentFeePaymentsResponseDto | undefined;
  const paymentId = params.id || searchParams.get("id") || itemFromState?.studentFeePaymentsId;

  const [payment, setPayment] = useState<StudentFeePaymentsResponseDto | null>(() => {
    if (itemFromState) {
      sessionStorage.setItem("selected_payment_installments", JSON.stringify(itemFromState));
      return itemFromState;
    }
    const cached = sessionStorage.getItem("selected_payment_installments");
    return cached ? JSON.parse(cached) : null;
  });

  const [allPayments, setAllPayments] = useState<StudentFeePaymentsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Repay Section State
  const [repayAmount, setRepayAmount] = useState<string>("");
  const [repayDate, setRepayDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [repayLoading, setRepayLoading] = useState(false);

  const loadPaymentDetails = async (id?: string) => {
    const targetId = id || paymentId || payment?.studentFeePaymentsId;
    try {
      setLoading(true);
      if (targetId) {
        const fresh = await studentFeePaymentService.getStudentFeePaymentsById(targetId);
        setPayment(fresh);
        sessionStorage.setItem("selected_payment_installments", JSON.stringify(fresh));
      } else {
        const list = await studentFeePaymentService.getAllStudentFeePayments().catch(() => []);
        setAllPayments(list);
      }
    } catch {
      // Handled in service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPaymentDetails(paymentId);
  }, [paymentId]);

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
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const targetFee = useMemo(() => {
    if (!payment?.schoolFees) return 0;
    return payment.studentLevel === "NURSERY"
      ? payment.schoolFees.nurseryFees || 0
      : payment.schoolFees.primaryFees || 0;
  }, [payment]);

  const percentagePaid = useMemo(() => {
    if (!targetFee || targetFee <= 0) {
      return payment?.paymentStatus === "PAID" ? 100 : 0;
    }
    const ratio = ((payment?.totalAmountPaid || 0) / targetFee) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio)));
  }, [targetFee, payment]);

  const handleQuickRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    const amount = Number(repayAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid installment payment amount greater than zero.");
      return;
    }

    try {
      setRepayLoading(true);
      const updated = await studentFeePaymentService.repayStudentFeePayments(
        payment.studentFeePaymentsId,
        {
          amountPaid: amount,
          paidDate: repayDate,
        }
      );
      setPayment(updated);
      sessionStorage.setItem("selected_payment_installments", JSON.stringify(updated));
      setRepayAmount("");
      toast.success("Installment payment recorded successfully");
    } catch {
      // Handled by service
    } finally {
      setRepayLoading(false);
    }
  };

  const getStatusBadge = (status?: EPaymentState) => {
    switch (status) {
      case "PAID":
        return <Badge color="success">Fully Paid</Badge>;
      case "PARTIAL":
        return <Badge color="warning">Partial Payment</Badge>;
      case "UNPAID":
      default:
        return <Badge color="error">Unpaid</Badge>;
    }
  };

  if (!payment) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <PageMeta
          title="Ubrs - Payment Installments"
          description="View detailed student fee payment installments and payment history."
        />
        <ComponentCard title="Payment Installments" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center space-y-4">
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              No student fee payment record was selected to view installments.
            </p>
            {allPayments.length > 0 && (
              <div className="max-w-md mx-auto text-left pt-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5 font-medium">
                  Select a student payment record:
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none"
                  onChange={(e) => {
                    const found = allPayments.find((p) => p.studentFeePaymentsId === e.target.value);
                    if (found) {
                      setPayment(found);
                      sessionStorage.setItem("selected_payment_installments", JSON.stringify(found));
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- Select student payment --
                  </option>
                  {allPayments.map((p) => (
                    <option key={p.studentFeePaymentsId} value={p.studentFeePaymentsId}>
                      {p.studentName} ({p.studentCode}) - {p.paymentStatus}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="pt-4">
              <Link to="/student-fee-payments">
                <Button size="sm" variant="outline" startIcon={<ChevronLeftIcon className="size-4" />}>
                  Back to Payments List
                </Button>
              </Link>
            </div>
          </div>
        </ComponentCard>
      </div>
    );
  }

  // Calculate running cumulative totals for installments
  const detailsWithCumulative = (payment.studentFeePaymentsDetails || []).map((detail, idx, arr) => {
    const cumulative = arr.slice(0, idx + 1).reduce((sum, d) => sum + (d.amountPaid || 0), 0);
    const sharePercent = targetFee > 0 ? Math.round(((detail.amountPaid || 0) / targetFee) * 100) : 0;
    return {
      ...detail,
      cumulative,
      sharePercent,
    };
  });

  return (
    <>
      <PageMeta
        title={`Ubrs - Payment Installments: ${payment.studentName}`}
        description="Detailed record of student fee installments, timeline, and receipts."
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/student-fee-payments">
            <Button size="sm" variant="outline" startIcon={<ChevronLeftIcon className="size-4" />}>
              Back to Payments List
            </Button>
          </Link>

          {canManageFinance && (
            <div className="flex items-center gap-2">
              <Link
                to="/student-fee-payments/edit"
                state={{ item: payment }}
              >
                <Button size="sm" variant="outline" startIcon={<PencilIcon className="size-4" />}>
                  Edit Fee & Installments
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* 1. Student & Fee Overview Header Card */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-white/[0.03] shadow-xs space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400">
                Tuition Payment Record
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {payment.studentName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 pt-1">
                <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                  <UserIcon className="size-4 text-gray-400" />
                  Code: <span className="font-mono">{payment.studentCode}</span>
                </span>
                <span>•</span>
                <span>Level: <strong className="text-gray-700 dark:text-gray-300">{payment.studentLevel}</strong></span>
                <span>•</span>
                <span>Term: <strong className="text-gray-700 dark:text-gray-300">{payment.term || "Term 1"}</strong></span>
                <span>•</span>
                <span>
                  Academic Year:{" "}
                  <strong className="text-gray-700 dark:text-gray-300">
                    {payment.schoolFees?.fiscalYear || "N/A"}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payment State</span>
              {getStatusBadge(payment.paymentStatus)}
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="rounded-2xl p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800">
              <span className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1">
                Tuition Fee Target
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(targetFee)}
              </span>
            </div>

            <div className="rounded-2xl p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20">
              <span className="block text-xs uppercase tracking-wider font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                Total Paid So Far
              </span>
              <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(payment.totalAmountPaid)}
              </span>
            </div>

            <div className="rounded-2xl p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-500/20">
              <span className="block text-xs uppercase tracking-wider font-medium text-rose-700 dark:text-rose-400 mb-1">
                Remaining Balance
              </span>
              <span className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(payment.remainAmount)}
              </span>
            </div>

            <div className="rounded-2xl p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-gray-800">
              <span className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1">
                Overdue / Credit
              </span>
              <span className="text-lg sm:text-xl font-bold text-gray-700 dark:text-gray-300">
                {formatCurrency(payment.overDueAmount)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-500 dark:text-gray-400">Tuition Fulfillment</span>
              <span className="text-brand-600 dark:text-brand-400">{percentagePaid}% Paid</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${percentagePaid}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Installments History Table Card */}
        <ComponentCard
          title="Payment Installments History"
          titleClassName="text-lg sm:text-xl font-bold"
          desc="Chronological list of all recorded installment payments for this student."
        >
          <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] space-y-6">
            {detailsWithCumulative.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="inline-flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.05] text-gray-400">
                  <DollarLineIcon className="size-6" />
                </div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  No installment payments recorded yet
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Record an installment payment using the form below, or edit the student fee payment to add installment details.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/75 dark:bg-white/[0.03] text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Payment Date</th>
                      <th className="py-3 px-4 text-right">Amount Paid</th>
                      <th className="py-3 px-4 text-right">Cumulative Total</th>
                      <th className="py-3 px-4 text-center">Share</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {detailsWithCumulative.map((detail, index) => (
                      <tr
                        key={detail.studentFeePaymentsDetailId || index}
                        className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition"
                      >
                        <td className="py-3 px-4 text-center text-xs font-semibold text-gray-400">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <CalenderIcon className="size-4 text-gray-400" />
                            <span>{formatDate(detail.paidDate)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-base">
                          {formatCurrency(detail.amountPaid)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-700 dark:text-gray-300">
                          {formatCurrency(detail.cumulative)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300">
                            {detail.sharePercent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircleIcon className="size-3.5" />
                            <span>Recorded</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-bold bg-gray-50/50 dark:bg-white/[0.02]">
                      <td colSpan={2} className="py-3.5 px-4 text-xs uppercase tracking-wider text-gray-900 dark:text-white">
                        Total Installments: ({detailsWithCumulative.length})
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 text-base">
                        {formatCurrency(payment.totalAmountPaid)}
                      </td>
                      <td colSpan={3} className="py-3.5 px-4 text-right text-xs text-gray-500 dark:text-gray-400">
                        Balance Remaining: <strong className="text-red-600 dark:text-red-400 text-sm ml-1">{formatCurrency(payment.remainAmount)}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </ComponentCard>

        {/* 3. Quick Record Installment Form (Inline Repay) */}
        {canManageFinance && payment.remainAmount > 0 && (
          <ComponentCard
            title="Record New Installment Payment"
            titleClassName="text-lg sm:text-xl font-bold"
            desc="Add a payment installment towards the remaining tuition balance."
          >
            <div className="rounded-3xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <form onSubmit={handleQuickRepay} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount Field */}
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
                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[11px] text-gray-400">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setRepayAmount(String(payment.remainAmount))}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950 dark:text-brand-300 transition"
                      >
                        Full Remaining ({formatCurrency(payment.remainAmount)})
                      </button>
                      {payment.remainAmount > 1000 && (
                        <button
                          type="button"
                          onClick={() => setRepayAmount(String(Math.round(payment.remainAmount / 2)))}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-gray-300 transition"
                        >
                          50% ({formatCurrency(Math.round(payment.remainAmount / 2))})
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Date Field */}
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
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={repayLoading}
                    startIcon={<DollarLineIcon className="size-4" />}
                    className="!bg-emerald-600 hover:!bg-emerald-700 !text-white shadow-xs"
                  >
                    {repayLoading ? "Recording Payment..." : "Record Payment Installment"}
                  </Button>
                </div>
              </form>
            </div>
          </ComponentCard>
        )}
      </div>
    </>
  );
}
