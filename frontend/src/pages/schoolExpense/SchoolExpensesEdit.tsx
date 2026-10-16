import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { schoolExpenseService, SchoolExpenseResponseDto, SchoolExpenseRequestDto } from "../../services/schoolExpenseService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function SchoolExpensesEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
  const [item, setItem] = useState<SchoolExpenseResponseDto | null>(null);

  useEffect(() => {
    if (!canManageFinance) {
      navigate("/school-expenses");
      return;
    }
  }, [canManageFinance, navigate]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseStaus, setExpenseStaus] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: SchoolExpenseResponseDto } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("schoolExpenseEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/school-expenses");
      return;
    }

    sessionStorage.setItem("schoolExpenseEditItem", JSON.stringify(stored));
    setItem(stored);
    setExpenseName(stored.expenseName);
    setExpenseStaus(stored.expenseStaus);
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    if (!expenseName.trim()) {
      toast.error("Expense name is required");
      return;
    }

    setLoading(true);

    try {
      const schoolExpenseData: SchoolExpenseRequestDto = {
        expenseName: expenseName.trim(),
        expenseStaus,
      };

      await schoolExpenseService.updateSchoolExpense(item.schoolExpenseId, schoolExpenseData);
      navigate("/school-expenses");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit School Expense" description="Edit a school expense." />

      <div className="space-y-6">
        <ComponentCard title="Edit School Expense" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Expense Name</label>
                  <Input value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="Enter expense name" disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Status</label>
                  <select
                    className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                    value={expenseStaus ? "true" : "false"}
                    onChange={(e) => setExpenseStaus(e.target.value === "true")}
                    disabled={loading}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/school-expenses")} disabled={loading}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading school expense...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
