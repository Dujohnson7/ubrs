import { useState, useMemo, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { headerTeacherDashboardService, MarksSubmissionTrends } from "../../services/headerTeacherDashboardService";

type TrendData = {
  approved: number[];
  submitted: number[];
  pending: number[];
  rejected: number[];
};

// Tiny styled <select> wrapper
function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap font-medium">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer focus:ring-2 focus:ring-brand-500/30 transition-all"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function StatisticsChart() {
  const [data, setData] = useState<MarksSubmissionTrends | null>(null);
  const [academicYear, setAcademicYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await headerTeacherDashboardService.getMarksSubmissionTrends();
        setData(result);
        if (result.academicYears.length > 0) {
          setAcademicYear(result.academicYears[0]);
        }
      } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Failed to load marks trends");
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const trendData: TrendData = useMemo(() => {
    if (!data || !academicYear) {
      return {
        approved: [0, 0, 0],
        submitted: [0, 0, 0],
        pending: [0, 0, 0],
        rejected: [0, 0, 0],
      };
    }
    return data.trendsByYear[academicYear] || {
      approved: [0, 0, 0],
      submitted: [0, 0, 0],
      pending: [0, 0, 0],
      rejected: [0, 0, 0],
    };
  }, [data, academicYear]);

  const series = [
    { name: "Approved",  data: trendData.approved },
    { name: "Submitted", data: trendData.submitted },
    { name: "Pending",   data: trendData.pending },
    { name: "Rejected",  data: trendData.rejected },
  ];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
      fontSize: "12px",
    },
    colors: ["#22c55e", "#465FFF", "#f59e0b", "#ef4444"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
      animations: { enabled: true, speed: 400 },
    },
    stroke: { curve: "smooth", width: [3, 3, 3, 3] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.35, opacityTo: 0 },
    },
    markers: {
      size: 6,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 8 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: {
      enabled: true,
      style: { fontSize: "11px", fontFamily: "Outfit, sans-serif", fontWeight: "600" },
      background: { enabled: false },
      formatter: (val: number) => (val === 0 ? "" : `${val}`),
    },
    tooltip: {
      enabled: true,
      y: { formatter: (val: number) => `${val} subject(s)` },
    },
    xaxis: {
      type: "category",
      categories: data?.terms || ["Term 1", "Term 2", "Term 3"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        style: { fontSize: "13px", fontWeight: "600", colors: ["#374151", "#374151", "#374151"] },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: (v: number) => `${v}`,
      },
      title: { text: "No. of subjects", style: { fontSize: "12px", color: "#9CA3AF" } },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Marks Submission Trends
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Subject approval status per term — {academicYear}
          </p>
        </div>

        {/* ── Filter: Academic Year only ── */}
        <div className="flex items-center gap-3 flex-wrap sm:justify-end">
          <FilterSelect
            label="Academic Year"
            value={academicYear}
            options={data?.academicYears || []}
            onChange={setAcademicYear}
          />
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-[310px]">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[310px]">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        ) : (
          <div className="min-w-[400px] xl:min-w-full">
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        )}
      </div>
    </div>
  );
}
