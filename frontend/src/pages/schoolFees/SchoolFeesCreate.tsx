import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { schoolFeesService, SchoolFeesRequestDto } from "../../services/schoolFeesService";
import { academicYearService, AcademicYearResponseDto } from "../../services/academicYearService";
import { toast } from "../../utils/toast";
import { useRoleAccess } from "../../hooks/useRoleAccess";

export default function SchoolFeesCreate() {
  const navigate = useNavigate();
  const { canManageFinance } = useRoleAccess();
  const [academicYearId, setAcademicYearId] = useState("");
  const [nurseryFees, setNurseryFees] = useState("");
  const [primaryFees, setPrimaryFees] = useState("");
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYearResponseDto[]>([]);

  useEffect(() => {
    if (!canManageFinance) {
      navigate("/school-fees");
      return;
    }
  }, [canManageFinance, navigate]);

  useEffect(() => {
    const loadAcademicYears = async () => {
      try {
        const data = await academicYearService.getAllAcademicYears();
        setAcademicYears(data);
      } catch (err) {
        // Error is handled by toast in service
      }
    };
    loadAcademicYears();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!academicYearId) {
      toast.error("Academic year is required");
      return;
    }
    if (!nurseryFees.trim() || isNaN(Number(nurseryFees))) {
      toast.error("Valid nursery fees amount is required");
      return;
    }
    if (!primaryFees.trim() || isNaN(Number(primaryFees))) {
      toast.error("Valid primary fees amount is required");
      return;
    }

    setLoading(true);

    try {
      const schoolFeesData: SchoolFeesRequestDto = {
        academicYearId,
        nurseryFees: Number(nurseryFees),
        primaryFees: Number(primaryFees),
      };

      await schoolFeesService.registerSchoolFees(schoolFeesData);
      navigate("/school-fees");
    } catch (err) {
      // Error is handled by toast in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Ubrs - Create School Fees" description="Create school fees." />

      <div className="space-y-6">
        <ComponentCard title="Create School Fees" titleClassName="text-xl sm:text-2xl" className="max-w-3xl mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Academic Year</label>
                <select
                  className="h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 w-full"
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((ay) => (
                    <option key={ay.academicYearId} value={ay.academicYearId}>
                      {ay.fiscalYear}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Nursery Fees</label>
                <Input type="number" value={nurseryFees} onChange={(e) => setNurseryFees(e.target.value)} placeholder="Enter nursery fees amount" disabled={loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1.5">Primary Fees</label>
                <Input type="number" value={primaryFees} onChange={(e) => setPrimaryFees(e.target.value)} placeholder="Enter primary fees amount" disabled={loading} />
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="sm" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create School Fees"}
              </Button>
              <Button size="sm" variant="outline" type="button" onClick={() => navigate("/school-fees")} disabled={loading}>Cancel</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
