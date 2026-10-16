import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { toast } from "../../utils/toast";
import { studentService, StudentResponseDto } from "../../services/studentService";
import { schoolFeesService, SchoolFeesResponseDto } from "../../services/schoolFeesService";
import {
  studentFeePaymentService,
  ETerm,
  ESchoolLevel,
  StudentFeePaymentsRequestDto,
} from "../../services/studentFeePaymentService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function StudentFeePaymentsCreate() {
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
  const [students, setStudents] = useState<StudentResponseDto[]>([]);

  useEffect(() => {
    if (!canManageFinance) {
      navigate("/student-fee-payments");
      return;
    }
  }, [canManageFinance, navigate]);
  const [schoolFeesList, setSchoolFeesList] = useState<SchoolFeesResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [studentId, setStudentId] = useState("");
  const [schoolFeesId, setSchoolFeesId] = useState("");
  const [term, setTerm] = useState<ETerm>("TERM1");
  const [initialAmount, setInitialAmount] = useState<string>("0");
  const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const loadDependencies = async () => {
      try {
        setLoading(true);
        const [studentsData, feesData] = await Promise.all([
          studentService.getAllStudents().catch(() => []),
          schoolFeesService.getAllSchoolFees().catch(() => []),
        ]);
        setStudents(studentsData);
        setSchoolFeesList(feesData);

        if (studentsData.length > 0) {
          setStudentId(studentsData[0].studentId);
        }
        if (feesData.length > 0) {
          setSchoolFeesId(feesData[0].schoolFeesId);
        }
      } catch {
        // Handled in services
      } finally {
        setLoading(false);
      }
    };

    void loadDependencies();
  }, []);

  const selectedStudent = students.find((s) => s.studentId === studentId);
  const selectedSchoolFee = schoolFeesList.find((f) => f.schoolFeesId === schoolFeesId);

  // Determine school level from class name or default to PRIMARY
  const inferredLevel: ESchoolLevel =
    selectedStudent?.schoolClassName?.toUpperCase().includes("NURSERY") ? "NURSERY" : "PRIMARY";

  const targetFee = selectedSchoolFee
    ? inferredLevel === "NURSERY"
      ? selectedSchoolFee.nurseryFees
      : selectedSchoolFee.primaryFees
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      toast.error("Please select a student");
      return;
    }
    if (!schoolFeesId) {
      toast.error("Please select an academic year fee");
      return;
    }

    const initialPaid = Number(initialAmount) || 0;

    const dto: StudentFeePaymentsRequestDto = {
      studentId,
      schoolFeesId,
      term,
      studentLevel: inferredLevel,
      studentFeePaymentsDetails:
        initialPaid > 0
          ? [
              {
                amountPaid: initialPaid,
                paidDate: paidDate,
              },
            ]
          : [],
    };

    try {
      setSubmitting(true);
      await studentFeePaymentService.registerStudentFeePayments(dto);
      navigate("/student-fee-payments");
    } catch {
      // Error handled by toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Ubrs - Register Student Fee Payment"
        description="Register a student fee billing record and initial payment."
      />

      <div className="space-y-6 max-w-3xl mx-auto">
        <ComponentCard title="Register Student Fee Payment" titleClassName="text-xl sm:text-2xl">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Loading students and fee schedules...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Selector */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    Student *
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {students.map((st) => (
                      <option key={st.studentId} value={st.studentId}>
                        {st.firstName} {st.lastName} ({st.studentCode}) — {st.schoolClassName || "No Class"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Student Information Card */}
                {selectedStudent && (
                  <div className="rounded-2xl p-4 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block">Class & Inferred Level:</span>
                      <span className="font-semibold text-brand-900 dark:text-brand-300 text-sm">
                        {selectedStudent.schoolClassName || "—"} ({inferredLevel})
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block">Tuition Fee for this Level:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                        {formatCurrency(targetFee)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Academic Year / School Fees & Term */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">
                      Academic Year / Fee Schedule *
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

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">
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
                </div>

                {/* Initial Payment Section */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    Initial Installment (Optional)
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    If the student or parent is making an initial payment right now, enter the amount below.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                        Initial Amount Paid (RWF)
                      </label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={initialAmount}
                        onChange={(e) => setInitialAmount(e.target.value)}
                        min={0}
                        step="any"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                        Payment Date
                      </label>
                      <Input
                        type="date"
                        value={paidDate}
                        onChange={(e) => setPaidDate(e.target.value)}
                        disabled={Number(initialAmount) <= 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <Link to="/student-fee-payments">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Registering..." : "Register Payment"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
