import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import { toast } from "../../utils/toast";
import { studentService, StudentResponseDto } from "../../services/studentService";
import { schoolFeesService, SchoolFeesResponseDto } from "../../services/schoolFeesService";
import { schoolClassService, SchoolClassResponseDto } from "../../services/schoolClassService";
import {
  studentFeePaymentService,
  ETerm,
  ESchoolLevel,
  StudentFeePaymentsRequestDto,
} from "../../services/studentFeePaymentService";
import { useRoleAccess } from "../../hooks/useRoleAccess";

// ── Searchable Student Combobox ─────────────────────────────────────────────
interface StudentComboboxProps {
  students: StudentResponseDto[];
  selectedStudentId: string;
  onSelect: (studentId: string) => void;
}

function StudentCombobox({ students, selectedStudentId, onSelect }: StudentComboboxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedStudent = useMemo(
    () => students.find((s) => s.studentId === selectedStudentId),
    [students, selectedStudentId],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return students;
    return students.filter((st) => {
      const haystack = `${st.firstName} ${st.lastName} ${st.studentCode} ${st.schoolClassName || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [students, query]);

   useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

   useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleSelect = useCallback(
    (st: StudentResponseDto) => {
      onSelect(st.studentId);
      setQuery("");
      setIsOpen(false);
      setHighlightIndex(-1);
    },
    [onSelect],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      e.preventDefault();
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          handleSelect(filtered[highlightIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  const displayValue = isOpen
    ? query
    : selectedStudent
      ? `${selectedStudent.firstName} ${selectedStudent.lastName} (${selectedStudent.studentCode})`
      : "";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder="Type to search students by name, code, or class..."
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-lg border border-gray-200 bg-white dark:bg-gray-800 pl-3 pr-9 text-sm text-gray-800 dark:text-white dark:border-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20 transition-shadow"
          autoComplete="off"
        />
        {/* Chevron icon */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setIsOpen((prev) => !prev);
            if (!isOpen) {
              setQuery("");
              inputRef.current?.focus();
            }
          }}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg
            className={`size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 py-1 text-sm"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-3 text-gray-400 dark:text-gray-500 text-center select-none">
              No students match &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((st, idx) => {
              const isSelected = st.studentId === selectedStudentId;
              const isHighlighted = idx === highlightIndex;
              return (
                <li
                  key={st.studentId}
                  onClick={() => handleSelect(st)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`cursor-pointer px-3 py-2.5 flex items-center justify-between gap-2 transition-colors ${
                    isHighlighted
                      ? "bg-brand-50 dark:bg-brand-950/40"
                      : ""
                  } ${isSelected ? "font-semibold text-brand-700 dark:text-brand-300" : "text-gray-800 dark:text-gray-200"}`}
                >
                  <div className="min-w-0">
                    <span className="block truncate">
                      {st.firstName} {st.lastName}
                      <span className="ml-1.5 text-gray-400 dark:text-gray-500 font-normal">
                        ({st.studentCode})
                      </span>
                    </span>
                    <span className="block text-xs text-gray-400 dark:text-gray-500 truncate">
                      {st.schoolClassName || "No Class"}
                    </span>
                  </div>
                  {isSelected && (
                    <svg className="size-4 shrink-0 text-brand-600 dark:text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

// ── Main Create Component ───────────────────────────────────────────────────
export default function StudentFeePaymentsCreate() {
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
  const [students, setStudents] = useState<StudentResponseDto[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClassResponseDto[]>([]);

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
        const [studentsData, feesData, classesData] = await Promise.all([
          studentService.getAllStudents().catch(() => []),
          schoolFeesService.getAllSchoolFees().catch(() => []),
          schoolClassService.getAllSchoolClasses().catch(() => []),
        ]);
        setStudents(studentsData);
        setSchoolFeesList(feesData);
        setSchoolClasses(classesData);

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

  // Derive selected student & school fee explicitly with useMemo
  const selectedStudent = useMemo(
    () => students.find((s) => s.studentId === studentId) ?? null,
    [students, studentId],
  );

  const selectedSchoolFee = useMemo(
    () => schoolFeesList.find((f) => f.schoolFeesId === schoolFeesId) ?? null,
    [schoolFeesList, schoolFeesId],
  );

  // Determine school level from the selected student's actual class record
  const inferredLevel: ESchoolLevel = useMemo(() => {
    if (!selectedStudent) return "PRIMARY";
    const studentClass = schoolClasses.find(
      (sc) => sc.schoolClassId === selectedStudent.schoolClassId,
    );
    if (studentClass) return studentClass.classLevel;
    // Fallback: guess from class name if class record not found
    const className = selectedStudent.schoolClassName?.toUpperCase() || "";
    if (className.includes("NURSERY")) return "NURSERY";
    return "PRIMARY";
  }, [selectedStudent, schoolClasses]);

  const targetFee = useMemo(() => {
    if (!selectedSchoolFee) return 0;
    return inferredLevel === "NURSERY"
      ? selectedSchoolFee.nurseryFees
      : selectedSchoolFee.primaryFees;
  }, [selectedSchoolFee, inferredLevel]);

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
                {/* Student Searchable Combobox */}
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 font-medium">
                    Student *
                  </label>
                  <StudentCombobox
                    students={students}
                    selectedStudentId={studentId}
                    onSelect={setStudentId}
                  />
                </div>

                {/* Selected Student Information Card — keyed by studentId so it always re-mounts */}
                {selectedStudent && (
                  <div
                    key={studentId}
                    className="rounded-2xl p-4 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-[fadeIn_0.2s_ease-out]"
                  >
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
                    If the student is making an initial payment right now, enter the amount below.
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
