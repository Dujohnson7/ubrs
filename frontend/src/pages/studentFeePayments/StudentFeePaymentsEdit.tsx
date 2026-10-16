import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import { toast } from "../../utils/toast";
import {
  PlusIcon,
  TrashBinIcon,
  DollarLineIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  AlertIcon,
} from "../../icons";
import {
  studentFeePaymentService,
  StudentFeePaymentsResponseDto,
  ETerm,
  ESchoolLevel,
  StudentFeePaymentsRequestDto,
  StudentFeePaymentsDetailRequestDto,
} from "../../services/studentFeePaymentService";
import { schoolFeesService, SchoolFeesResponseDto } from "../../services/schoolFeesService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

interface EditableDetailRow {
  tempId: string;
  studentFeePaymentsDetailId?: string;
  amountPaid: string | number;
  paidDate: string;
}

export default function StudentFeePaymentsEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { canManageFinance } = useRoleAccess();

  useEffect(() => {
    if (!canManageFinance) {
      navigate("/student-fee-payments");
      return;
    }
  }, [canManageFinance, navigate]);

  const itemFromState = location.state?.item as StudentFeePaymentsResponseDto | undefined;
  const queryId = searchParams.get("id");

  const [payment, setPayment] = useState<StudentFeePaymentsResponseDto | null>(() => {
    if (itemFromState) {
      sessionStorage.setItem("edit_student_fee_payment", JSON.stringify(itemFromState));
      return itemFromState;
    }
    const cached = sessionStorage.getItem("edit_student_fee_payment");
    return cached ? JSON.parse(cached) : null;
  });

  const [allPayments, setAllPayments] = useState<StudentFeePaymentsResponseDto[]>([]);
  const [schoolFeesList, setSchoolFeesList] = useState<SchoolFeesResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [term, setTerm] = useState<ETerm>("TERM1");
  const [schoolFeesId, setSchoolFeesId] = useState<string>("");
  const [studentLevel, setStudentLevel] = useState<ESchoolLevel>("PRIMARY");
  const [details, setDetails] = useState<EditableDetailRow[]>([]);

  // Format date helper for input YYYY-MM-DD
  const formatForDateInput = (val?: string): string => {
    if (!val) return new Date().toISOString().split("T")[0];
    if (val.includes("T")) return val.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    try {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
      }
    } catch {
      // fallback
    }
    return new Date().toISOString().split("T")[0];
  };

  const populateForm = (p: StudentFeePaymentsResponseDto) => {
    setPayment(p);
    sessionStorage.setItem("edit_student_fee_payment", JSON.stringify(p));

    setTerm(p.term || (p as any).term || "TERM1");
    setSchoolFeesId(p.schoolFees?.schoolFeesId || "");
    setStudentLevel(p.studentLevel || "PRIMARY");

    if (p.studentFeePaymentsDetails && p.studentFeePaymentsDetails.length > 0) {
      setDetails(
        p.studentFeePaymentsDetails.map((d) => ({
          tempId: d.studentFeePaymentsDetailId || crypto.randomUUID(),
          studentFeePaymentsDetailId: d.studentFeePaymentsDetailId,
          amountPaid: d.amountPaid,
          paidDate: formatForDateInput(d.paidDate),
        }))
      );
    } else {
      setDetails([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const [feesData, allPaymentsData] = await Promise.all([
          schoolFeesService.getAllSchoolFees().catch(() => []),
          studentFeePaymentService.getAllStudentFeePayments().catch(() => []),
        ]);
        setSchoolFeesList(feesData);
        setAllPayments(allPaymentsData);

        const targetId = queryId || itemFromState?.studentFeePaymentsId || payment?.studentFeePaymentsId;

        if (targetId) {
          try {
            const freshPayment = await studentFeePaymentService.getStudentFeePaymentsById(targetId);
            populateForm(freshPayment);
          } catch {
            if (payment) {
              populateForm(payment);
            }
          }
        } else if (payment) {
          populateForm(payment);
        }
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [queryId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Find target fee based on current selection
  const selectedSchoolFee = useMemo(() => {
    return schoolFeesList.find((f) => f.schoolFeesId === schoolFeesId) || payment?.schoolFees;
  }, [schoolFeesList, schoolFeesId, payment]);

  const targetTuitionFee = useMemo(() => {
    if (!selectedSchoolFee) return 0;
    return studentLevel === "NURSERY"
      ? selectedSchoolFee.nurseryFees || 0
      : selectedSchoolFee.primaryFees || 0;
  }, [selectedSchoolFee, studentLevel]);

  // Calculations
  const originalPaidAmount = useMemo(() => {
    if (!payment) return 0;
    if (payment.studentFeePaymentsDetails && payment.studentFeePaymentsDetails.length > 0) {
      return payment.studentFeePaymentsDetails.reduce((sum, d) => sum + (d.amountPaid || 0), 0);
    }
    return payment.totalAmountPaid || 0;
  }, [payment]);

  const newTotalPaidAmount = useMemo(() => {
    return details.reduce((sum, d) => {
      const val = Number(d.amountPaid);
      return sum + (isNaN(val) || val <= 0 ? 0 : val);
    }, 0);
  }, [details]);

  const balanceDifference = useMemo(() => {
    return newTotalPaidAmount - originalPaidAmount;
  }, [newTotalPaidAmount, originalPaidAmount]);

  const projectedRemaining = useMemo(() => {
    if (targetTuitionFee > 0) {
      return Math.max(0, targetTuitionFee - newTotalPaidAmount);
    }
    return Math.max(0, (payment?.remainAmount || 0) - balanceDifference);
  }, [targetTuitionFee, newTotalPaidAmount, payment, balanceDifference]);

  // Detail Row Handlers
  const handleAddDetail = () => {
    setDetails((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        amountPaid: "",
        paidDate: new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const handleRemoveDetail = (tempId: string) => {
    setDetails((prev) => prev.filter((d) => d.tempId !== tempId));
  };

  const handleDetailChange = (
    tempId: string,
    field: "amountPaid" | "paidDate",
    value: string | number
  ) => {
    setDetails((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    // Validate detail rows
    for (let i = 0; i < details.length; i++) {
      const d = details[i];
      const amt = Number(d.amountPaid);
      if (isNaN(amt) || amt <= 0) {
        toast.error(`Installment #${i + 1} has an invalid or zero amount. Please correct or remove it.`);
        return;
      }
      if (!d.paidDate) {
        toast.error(`Installment #${i + 1} requires a valid payment date.`);
        return;
      }
    }

    const payloadDetails: StudentFeePaymentsDetailRequestDto[] = details
      .filter((d) => Number(d.amountPaid) > 0)
      .map((d) => ({
        amountPaid: Number(d.amountPaid),
        paidDate: d.paidDate,
      }));

    const dto: StudentFeePaymentsRequestDto = {
      studentId: payment.studentId,
      schoolFeesId: schoolFeesId || payment.schoolFees?.schoolFeesId,
      term: term,
      studentLevel: studentLevel,
      studentFeePaymentsDetails: payloadDetails,
    };

    try {
      setSubmitting(true);
      const updated = await studentFeePaymentService.updateStudentFeePayments(
        payment.studentFeePaymentsId,
        dto
      );
      sessionStorage.setItem("edit_student_fee_payment", JSON.stringify(updated));
      toast.success("Student fee payment and installments updated successfully");
      navigate("/student-fee-payments");
    } catch {
      // Handled by toast in service
    } finally {
      setSubmitting(false);
    }
  };

  if (!payment) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <PageMeta
          title="Ubrs - Edit Student Fee Payment"
          description="Update student fee billing schedule and term."
        />
        <ComponentCard title="Edit Student Fee Payment" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/[0.03] text-center space-y-4">
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">
              No student fee payment record is currently selected for editing.
            </p>
            {allPayments.length > 0 && (
              <div className="max-w-md mx-auto text-left pt-2">
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5 font-medium">
                  Select a record to edit:
                </label>
                <select
                  className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none"
                  onChange={(e) => {
                    const found = allPayments.find((p) => p.studentFeePaymentsId === e.target.value);
                    if (found) populateForm(found);
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

  return (
    <>
      <PageMeta
        title="Ubrs - Edit Student Fee Payment"
        description="Update student fee billing schedule, term, and payment installment details."
      />

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/student-fee-payments">
            <Button size="sm" variant="outline" startIcon={<ChevronLeftIcon className="size-4" />}>
              Back to Payments
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/student-fee-payments/installments" state={{ item: payment }}>
              <Button size="sm" variant="outline">
                View Installments Page →
              </Button>
            </Link>
          </div>
        </div>

        <ComponentCard title="Edit Student Fee Payment" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Loading student payment data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Student Summary Banner */}
                <div className="rounded-2xl p-5 bg-gradient-to-r from-gray-50 to-gray-100/60 dark:from-white/[0.04] dark:to-white/[0.02] border border-gray-200/80 dark:border-gray-700/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block uppercase font-medium tracking-wider">
                        Student Account
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {payment.studentName}{" "}
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          ({payment.studentCode})
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Status:</span>
                      <Badge
                        color={
                          payment.paymentStatus === "PAID"
                            ? "success"
                            : payment.paymentStatus === "PARTIAL"
                            ? "warning"
                            : "error"
                        }
                      >
                        {payment.paymentStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-200/70 dark:border-gray-700/70 text-xs">
                    <div>
                      <span className="text-gray-500 block">Tuition Target:</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatCurrency(targetTuitionFee)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Currently Recorded:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(originalPaidAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Remaining Due:</span>
                      <span className="font-bold text-red-600 dark:text-red-400 text-sm">
                        {formatCurrency(payment.remainAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Overdue / Credit:</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
                        {formatCurrency(payment.overDueAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Core Billing Settings */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                    Fee Schedule & Term
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Academic Term */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                        Academic Term *
                      </label>
                      <select
                        value={term}
                        onChange={(e) => setTerm(e.target.value as ETerm)}
                        required
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="TERM1">Term 1</option>
                        <option value="TERM2">Term 2</option>
                        <option value="TERM3">Term 3</option>
                      </select>
                    </div>

                    {/* Academic Year / School Fees */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                        Fee Schedule *
                      </label>
                      <select
                        value={schoolFeesId}
                        onChange={(e) => setSchoolFeesId(e.target.value)}
                        required
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        {schoolFeesList.map((sf) => (
                          <option key={sf.schoolFeesId} value={sf.schoolFeesId}>
                            {sf.fiscalYear} (P: {formatCurrency(sf.primaryFees)}, N: {formatCurrency(sf.nurseryFees)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* School Level */}
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                        School Level *
                      </label>
                      <select
                        value={studentLevel}
                        onChange={(e) => setStudentLevel(e.target.value as ESchoolLevel)}
                        required
                        className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="PRIMARY">Primary</option>
                        <option value="NURSERY">Nursery</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. StudentFeePaymentsDetail Fields (Installments Section) */}
                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          Payment Installments (StudentFeePaymentsDetail)
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                          {details.length} {details.length === 1 ? "entry" : "entries"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Adjust amount paid and payment dates. Empty or removed installments will automatically adjust school balances.
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddDetail}
                      startIcon={<PlusIcon className="size-4" />}
                      className="!bg-emerald-600 hover:!bg-emerald-700 !text-white shadow-xs"
                    >
                      Add Installment
                    </Button>
                  </div>

                  {/* Installments Table / Form Rows */}
                  {details.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-8 text-center space-y-3">
                      <div className="inline-flex size-10 items-center justify-center rounded-full bg-gray-100 dark:bg-white/[0.05] text-gray-400">
                        <DollarLineIcon className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        No installments currently listed for this payment.
                      </p>
                      <p className="text-xs text-gray-400">
                        Click "Add Installment" above to record a payment installment towards this student's fee.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddDetail}
                        startIcon={<PlusIcon className="size-4" />}
                      >
                        Add First Installment
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900/40">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/75 dark:bg-white/[0.03] text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              <th className="py-3 px-4 w-12 text-center">#</th>
                              <th className="py-3 px-4 min-w-[200px]">Amount Paid (RWF) *</th>
                              <th className="py-3 px-4 min-w-[200px]">Payment Date *</th>
                              <th className="py-3 px-4 w-20 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {details.map((detail, index) => (
                              <tr
                                key={detail.tempId}
                                className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition"
                              >
                                <td className="py-3 px-4 text-center text-xs font-semibold text-gray-400">
                                  {index + 1}
                                </td>

                                {/* Amount Paid Field */}
                                <td className="py-3 px-4">
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none">
                                      RWF
                                    </span>
                                    <input
                                      type="number"
                                      min="0.01"
                                      step="any"
                                      required
                                      placeholder="e.g. 25000"
                                      value={detail.amountPaid}
                                      onChange={(e) =>
                                        handleDetailChange(detail.tempId, "amountPaid", e.target.value)
                                      }
                                      className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-12 pr-3 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                    />
                                  </div>
                                </td>

                                {/* Payment Date Field */}
                                <td className="py-3 px-4">
                                  <input
                                    type="date"
                                    required
                                    value={detail.paidDate}
                                    onChange={(e) =>
                                      handleDetailChange(detail.tempId, "paidDate", e.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                                  />
                                </td>

                                {/* Delete Row Action */}
                                <td className="py-3 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDetail(detail.tempId)}
                                    title="Remove this installment"
                                    className="inline-flex size-9 items-center justify-center rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                                  >
                                    <TrashBinIcon className="size-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 4. Real-time Financial Impact Preview */}
                  <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-500/[0.05] via-transparent to-emerald-500/[0.05] p-5 space-y-3 dark:border-brand-500/30">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                      <CheckCircleIcon className="size-4 text-brand-600 dark:text-brand-400" />
                      <span>Live Financial Impact Preview</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      {/* Total New Paid */}
                      <div className="rounded-xl p-3 bg-white/70 dark:bg-white/[0.03] border border-gray-200/60 dark:border-gray-700/60">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                          New Total Installments Paid:
                        </span>
                        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(newTotalPaidAmount)}
                        </span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          Was: {formatCurrency(originalPaidAmount)}
                        </span>
                      </div>

                      {/* School Balance Difference */}
                      <div className="rounded-xl p-3 bg-white/70 dark:bg-white/[0.03] border border-gray-200/60 dark:border-gray-700/60">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                          School Balance Adjustment:
                        </span>
                        {balanceDifference > 0 ? (
                          <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                            + {formatCurrency(balanceDifference)} (Credit)
                          </span>
                        ) : balanceDifference < 0 ? (
                          <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                            - {formatCurrency(Math.abs(balanceDifference))} (Debit)
                          </span>
                        ) : (
                          <span className="text-base font-bold text-gray-600 dark:text-gray-400">
                            No net change
                          </span>
                        )}
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          Adjusts school treasury automatically
                        </span>
                      </div>

                      {/* Projected Remaining Balance */}
                      <div className="rounded-xl p-3 bg-white/70 dark:bg-white/[0.03] border border-gray-200/60 dark:border-gray-700/60">
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                          Projected Remaining Due:
                        </span>
                        <span
                          className={`text-base font-bold ${
                            projectedRemaining === 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(projectedRemaining)}
                        </span>
                        <span className="block text-[11px] text-gray-400 mt-0.5">
                          {projectedRemaining === 0 ? "Tuition will be Fully Paid" : "Partial balance remaining"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Link to="/student-fee-payments">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>

                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Saving Changes..." : "Update Fee Payment & Installments"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
