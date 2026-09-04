import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { academicYearService, AcademicYearResponseDto, AcademicYearRequestDto, EAcademicState } from "../../services/academicYearService";
import { toast } from "../../utils/toast";

export default function AcademicYearsEdit() {
  const location = useLocation();
  const navigate = useNavigate();
  const [item, setItem] = useState<AcademicYearResponseDto | null>(null);
  const [fiscalYear, setFiscalYear] = useState("");
  const [eAcademicStatus, setEAcademicStatus] = useState<EAcademicState>("PENDING");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { item?: AcademicYearResponseDto } | null;
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
    setFiscalYear(stored.fiscalYear);
    setEAcademicStatus(stored.academicYearStatus);
  }, [location.state, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!item) return;

    if (!fiscalYear.trim()) {
      toast.error("Fiscal year is required");
      return;
    }

    setLoading(true);

    try {
      const academicYearData: AcademicYearRequestDto = {
        fiscalYear: fiscalYear.trim(),
        eAcademicStatus,
      };

      await academicYearService.updateAcademicYear(item.academicYearId, academicYearData);
      navigate("/academic-years");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Fiscal Year</label>
                  <Input value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} placeholder="Enter fiscal year" disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Academic Status</label>
                  <select
                    className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                    value={eAcademicStatus}
                    onChange={(e) => setEAcademicStatus(e.target.value as EAcademicState)}
                    disabled={loading}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="sm" type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" type="button" onClick={() => navigate("/academic-years")} disabled={loading}>Cancel</Button>
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
