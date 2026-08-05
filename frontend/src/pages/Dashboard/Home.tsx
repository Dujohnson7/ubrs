import SchoolMetrics from "../../components/ecommerce/SchoolMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Ubrs — School Dashboard"
        description="Overview of student marks, grade distributions, and marks approval status for Umwana Bright Academy."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* KPI Metrics (spans full width) */}
        <div className="col-span-12">
          <SchoolMetrics />
        </div>

        {/* Average marks by subject + Marks approval radial — same height row */}
        <div className="col-span-12 grid grid-cols-12 gap-4 md:gap-6 items-stretch">
          <div className="col-span-12 xl:col-span-7">
            <MonthlySalesChart />
          </div>
          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>
        </div>

        {/* Marks submission trends (full width) */}
        <div className="col-span-12">
          <StatisticsChart />
        </div>

        {/* Grade distribution */}
        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        {/* Recent mark submissions */}
        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
