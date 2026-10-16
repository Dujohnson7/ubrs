import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { schoolExpenseService, SchoolExpenseRequestDto } from "../../services/schoolExpenseService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function SchoolExpensesCreate() {
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
  const [expenseName, setExpenseName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canManageFinance) {
      navigate("/school-expenses");
      return;
    }
  }, [canManageFinance, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!expenseName.trim()) {
      toast.error("Expense name is required");
      return;
    }

    setLoading(true);

    try {
      const schoolExpenseData: SchoolExpenseRequestDto = {
        expenseName: expenseName.trim(),
        expenseStaus: true,
      };

      await schoolExpenseService.registerSchoolExpense(schoolExpenseData);
      navigate("/school-expenses");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create School Expense" description="Create a school expense." />

      <div className="space-y-6">
        <ComponentCard title="Create School Expense" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Expense Name</label>
                <Input value={expenseName} onChange={(e) => setExpenseName(e.target.value)} placeholder="Enter expense name" disabled={loading} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create School Expense"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/school-expenses")} disabled={loading}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
