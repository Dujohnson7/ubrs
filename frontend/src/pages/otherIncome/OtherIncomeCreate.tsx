import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { otherIncomeService, OtherIncomeRequestDto } from "../../services/otherIncomeService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function OtherIncomeCreate() {
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [incomeDate, setIncomeDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!canManageFinance) {
      navigate("/other-income");
      return;
    }
  }, [canManageFinance, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim()) {
      toast.error("Income name is required");
      return;
    }
    if (!amount.trim() || isNaN(Number(amount))) {
      toast.error("Valid amount is required");
      return;
    }
    if (!incomeDate) {
      toast.error("Date is required");
      return;
    }

    setLoading(true);

    try {
      const incomeData: OtherIncomeRequestDto = {
        description,
        amount: Number(amount),
        incomeDate,
      };

      await otherIncomeService.registerOtherIncome(incomeData);
      navigate("/other-income");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Other Income" description="Create an other income entry." />

      <div className="space-y-6">
        <ComponentCard title="Create Other Income" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Description</label>
                <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Amount</label>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Date</label>
                <Input type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} disabled={loading} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Other Income"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/other-income")} disabled={loading}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
