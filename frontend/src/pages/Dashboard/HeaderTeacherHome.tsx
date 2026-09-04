import { useEffect, useState } from "react";
import SchoolMetrics from "../../components/ecommerce/SchoolMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import {
  headerTeacherDashboardService,
  HeaderTeacherMetrics,
} from "../../services/headerTeacherDashboardService";

/** School / head-teacher overview dashboard — live HeaderTeacherDashboard APIs. */
export default function HeaderTeacherHome() {
  const [metrics, setMetrics] = useState<HeaderTeacherMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await headerTeacherDashboardService.getDashboardMetrics();
        setMetrics(data);
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <>
      <PageMeta
        title="Ubrs — School Dashboard"
        description="Overview of student marks, grade distributions, and marks approval status for Umwana Bright Academy."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {error ? (
          <div className="col-span-12 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="col-span-12">
          <SchoolMetrics metrics={metrics} loading={loading} />
        </div>

        <div className="col-span-12 grid grid-cols-12 gap-4 md:gap-6 items-stretch">
          <div className="col-span-12 xl:col-span-7">
            <MonthlySalesChart />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget metrics={metrics} loading={loading} />
          </div>
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12">
          <DemographicCard />
        </div>
 
      </div>
    </>
  );
}
