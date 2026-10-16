import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { expensesPaymentsService, ExpensesPaymentsRequestDto } from "../../services/expensesPaymentsService";
import { schoolExpenseService, SchoolExpenseResponseDto } from "../../services/schoolExpenseService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function ExpensesPaymentsCreate() {
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
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
        const data = await schoolExpenseService.getAllActiveSchoolExpenses();
        setSchoolExpenses(data);
      } catch (err) {
        // Error is handled by toast in service
      }
    };
    loadSchoolExpenses();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

      await expensesPaymentsService.registerExpensesPayment(paymentData);
      navigate("/expense-payments");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Expense Payment" description="Create an expense payment." />

      <div className="space-y-6">
        <ComponentCard title="Create Expense Payment" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
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
                {loading ? "Creating..." : "Create Expense Payment"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/expense-payments")} disabled={loading}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
