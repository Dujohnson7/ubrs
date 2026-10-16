import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { expensesPaymentsService, ExpensesPaymentsResponseDto, ExpensesPaymentsRequestDto } from "../../services/expensesPaymentsService";
import { schoolExpenseService, SchoolExpenseResponseDto } from "../../services/schoolExpenseService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function ExpensesPaymentsEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
  const [item, setItem] = useState<ExpensesPaymentsResponseDto | null>(null);
  const [schoolExpenseId, setSchoolExpenseId] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [schoolExpenses, setSchoolExpenses] = useState<SchoolExpenseResponseDto[]>([]);

  useEffect(() => {
    if (!canManageFinance) {
      navigate("/expense-payments");
      return;
    }
  }, [canManageFinance, navigate]);

  useEffect(() => {
    const loadSchoolExpenses = async () => {
      try {
        const data = await schoolExpenseService.getAllSchoolExpenses();
        setSchoolExpenses(data);
      } catch (err) {
        // Error is handled by toast in service
      }
    };
    loadSchoolExpenses();
  }, []);

  useEffect(() => {
    const state = location.state as { item?: ExpensesPaymentsResponseDto } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("expensesPaymentsEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/expense-payments");
      return;
    }

    sessionStorage.setItem("expensesPaymentsEditItem", JSON.stringify(stored));
    setItem(stored);
    setSchoolExpenseId(stored.schoolExpenseId);
    setAmount(String(stored.amount));
    setExpenseDate(stored.expenseDate);
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    if (!schoolExpenseId) {
      toast.error("School expense is required");
      return;
    }
    if (!amount.trim() || isNaN(Number(amount))) {
      toast.error("Valid amount is required");
      return;
    }
    if (!expenseDate) {
      toast.error("Expense date is required");
      return;
    }

    setLoading(true);

    try {
      const paymentData: ExpensesPaymentsRequestDto = {
        schoolExpenseId,
        amount: Number(amount),
        expenseDate,
      };

      await expensesPaymentsService.updateExpensesPayment(item.expensesPaymentsId, paymentData);
      navigate("/expense-payments");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Expense Payment" description="Edit an expense payment." />

      <div className="space-y-6">
        <ComponentCard title="Edit Expense Payment" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">School Expense</label>
                  <select
                    className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                    value={schoolExpenseId}
                    onChange={(e) => setSchoolExpenseId(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select School Expense</option>
                    {schoolExpenses.map((se) => (
                      <option key={se.schoolExpenseId} value={se.schoolExpenseId}>
                        {se.expenseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Amount</label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Expense Date</label>
                  <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/expense-payments")} disabled={loading}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading expense payment...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
