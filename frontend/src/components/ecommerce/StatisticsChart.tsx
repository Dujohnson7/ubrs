import { useState, useMemo } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// ------------------------------------------------------------------
// Demo data keyed by academicYear
// Each value has 3 data points → one per term (Term 1, Term 2, Term 3)
// In production these would come from an API call.
// ------------------------------------------------------------------
type TrendData = {
  approved: number[];  // [T1, T2, T3]
  submitted: number[];
  pending: number[];
  rejected: number[];
};

const TREND_DATA: Record<string, TrendData> = {
  "2023-2024": {
    approved:  [12, 15, 18],
    submitted: [14, 17, 20],
    pending:   [22, 14,  8],
    rejected:  [ 2,  3,  2],
  },
  "2024-2025": {
    approved:  [10, 14, 19],
    submitted: [13, 16, 21],
    pending:   [24, 16,  9],
    rejected:  [ 1,  2,  3],
  },
  "2025-2026": {
    approved:  [ 8, 11,  0],
    submitted: [10, 13,  0],
    pending:   [26, 19,  0],
    rejected:  [ 2,  2,  0],
  },
};

const ACADEMIC_YEARS = Object.keys(TREND_DATA).sort((a, b) => b.localeCompare(a));
const TERMS = ["Term 1", "Term 2", "Term 3"];

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
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);

  const data: TrendData = useMemo(() => {
    return (
      TREND_DATA[academicYear] ?? {
        approved:  [0, 0, 0],
        submitted: [0, 0, 0],
        pending:   [0, 0, 0],
        rejected:  [0, 0, 0],
      }
    );
  }, [academicYear]);

  const series = [
    { name: "Approved",  data: data.approved },
    { name: "Submitted", data: data.submitted },
    { name: "Pending",   data: data.pending },
    { name: "Rejected",  data: data.rejected },
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
      categories: TERMS,
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
            options={ACADEMIC_YEARS}
            onChange={setAcademicYear}
          />
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[400px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
