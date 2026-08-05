import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";

type AcademicYear = {
  id: string;
  academicYearId: string;
  fiscalYear: string;
};

export default function AcademicYearsEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<AcademicYear | null>(null);
  const [academicYearId, setAcademicYearId] = useState("");
  const [fiscalYear, setFiscalYear] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: AcademicYear } | null;
    const stored = state?.item ?? (() => {
      const storedValue = sessionStorage.getItem("academicYearEditItem");
      return storedValue ? JSON.parse(storedValue) : null;
    })();

    if (!stored) {
      navigate("/academic-years");
      return;
    }

    sessionStorage.setItem("academicYearEditItem", JSON.stringify(stored));
    setItem(stored);
    setAcademicYearId(stored.academicYearId);
    setFiscalYear(stored.fiscalYear);
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/academic-years");
    }, 500);
  };

  return (
    <>
      <PageMeta title="Ubrs - Edit Academic Year" description="Edit an academic year." />
       

      <div className="space-y-6">
        <ComponentCard title="Edit Academic Year" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          {item ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Academic Year ID</label>
                  <div className="p-2 mt-1 rounded bg-gray-50 dark:bg-gray-800 text-sm">{academicYearId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Fiscal Year</label>
                  <Input value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} placeholder="Enter fiscal year" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/academic-years")}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading academic year...</div>
          )}
        </ComponentCard>
      </div>
    </>
  );
}
