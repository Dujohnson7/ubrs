import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

export default function AcademicYearsCreate() {
  const navigate = useNavigate();
  const [fiscalYear, setFiscalYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/academic-years");
    }, 500);
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Academic Year" description="Create an academic year." />
       

      <div className="space-y-6">
        <ComponentCard title="Create Academic Year" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              {/* Academic Year ID is system-managed and not editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Fiscal Year</label>
                <Input value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} placeholder="Enter fiscal year" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Academic Year"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/academic-years")}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
