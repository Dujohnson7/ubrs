import { useState } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { academicYearService, AcademicYearRequestDto } from "../../services/academicYearService";
import { toast } from "../../utils/toast";

export default function AcademicYearsCreate() {
  const navigate = useNavigate();
  const [fiscalYear, setFiscalYear] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fiscalYear.trim()) {
      toast.error("Fiscal year is required");
      return;
    }

    setLoading(true);

    try {
      const academicYearData: AcademicYearRequestDto = {
        fiscalYear: fiscalYear.trim(),
        eAcademicStatus: "PENDING",
      };

      await academicYearService.registerAcademicYear(academicYearData);
      navigate("/academic-years");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create Academic Year" description="Create an academic year." />
       

      <div className="space-y-6">
        <ComponentCard title="Create Academic Year" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Fiscal Year</label>
                <Input value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} placeholder="Enter fiscal year" disabled={loading} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Academic Year"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/academic-years")} disabled={loading}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
